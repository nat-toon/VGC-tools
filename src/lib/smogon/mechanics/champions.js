import { toID } from "../util.js";
import { getItemBoostType, getBerryResistType } from "../items.js";
import { isGrounded } from "./util.js";

const TRAPPING = [
  "Bind",
  "Clamp",
  "Fire Spin",
  "Infestation",
  "Magma Storm",
  "Sand Tomb",
  "Thunder Cage",
  "Whirlpool",
  "Wrap",
  "G-Max Sandblast",
  "G-Max Centiferno",
];

function checkAirLock(pokemon, field) {
  if (pokemon.hasAbility("Air Lock", "Cloud Nine")) {
    field.weather = undefined;
  }
}

function checkForecast(pokemon, weather) {
  if (pokemon.named("Castform")) {
    if (weather === "Rain" || weather === "Heavy Rain") {
      pokemon.types = ["Water"];
    } else if (weather === "Sun" || weather === "Harsh Sunshine") {
      pokemon.types = ["Fire"];
    } else if (weather === "Hail" || weather === "Snow") {
      pokemon.types = ["Ice"];
    } else {
      pokemon.types = ["Normal"];
    }
  }
}

function checkIntimidate(attacker, defender) {
  if (attacker.hasAbility("Intimidate")) {
    defender.boosts.atk = Math.max(-6, (defender.boosts.atk || 0) - 1);
  }
}

function checkStatBoosts(pokemon) {
  if (pokemon.hasItem("Choice Band")) pokemon.boosts.atk = Math.min(6, (pokemon.boosts.atk || 0) + 1);
  if (pokemon.hasItem("Choice Specs")) pokemon.boosts.spa = Math.min(6, (pokemon.boosts.spa || 0) + 1);
  if (pokemon.hasItem("Assault Vest")) pokemon.boosts.spd = Math.min(6, (pokemon.boosts.spd || 0) + 1);
}

function getModifiedStat(stat, boosts) {
  const b = boosts || 0;
  if (b > 0) return Math.floor((stat * (2 + b)) / 2);
  if (b < 0) return Math.floor((stat * 2) / (2 - b));
  return stat;
}

function getDamageRolls(baseDamage) {
  const misses = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const result = [];
  for (let i = 85; i <= 100; i++) {
    result.push(Math.floor((baseDamage * i) / 100));
  }
  return result;
}

export function calculateChampions(gen, attacker, defender, move, field) {
  const desc = {
    attackerName: attacker.name,
    defenderName: defender.name,
    moveName: move.name,
    moveType: move.type,
    moveBP: move.basePower,
  };

  if (attacker.item) desc.attackerItem = attacker.item;
  if (defender.item) desc.defenderItem = defender.item;
  if (attacker.ability) desc.attackerAbility = attacker.ability;
  if (defender.ability) desc.defenderAbility = defender.ability;

  // Type effectiveness
  const typeChart = gen.types;
  let typeEffectiveness = 1;
  const attackingType = typeChart.get(toID(move.type));
  for (const defType of defender.types) {
    if (attackingType && attackingType.effectiveness) {
      const eff = attackingType.effectiveness[toID(defType)];
      typeEffectiveness *= eff;
    }
  }
  if (typeEffectiveness === 0) {
    return { damage: 0, desc };
  }

  // Weather
  let weatherModified = false;
  if (field.hasWeather("Rain", "Heavy Rain")) {
    if (move.type === "Water") {
      move.basePower = Math.floor(move.basePower * 1.5);
      weatherModified = true;
    }
    if (move.type === "Fire") {
      move.basePower = Math.floor(move.basePower * 0.5);
      weatherModified = true;
    }
  }
  if (field.hasWeather("Sun", "Harsh Sunshine")) {
    if (move.type === "Fire") {
      move.basePower = Math.floor(move.basePower * 1.5);
      weatherModified = true;
    }
    if (move.type === "Water") {
      move.basePower = Math.floor(move.basePower * 0.5);
      weatherModified = true;
    }
  }

  // Terrain
  if (field.hasTerrain("Electric") && move.type === "Electric" && isGrounded(attacker, field)) {
    move.basePower = Math.floor(move.basePower * 1.3);
  }
  if (field.hasTerrain("Grassy") && move.type === "Grass" && isGrounded(attacker, field)) {
    move.basePower = Math.floor(move.basePower * 1.3);
  }
  if (field.hasTerrain("Psychic") && move.type === "Psychic" && isGrounded(attacker, field)) {
    move.basePower = Math.floor(move.basePower * 1.3);
  }
  if (field.hasTerrain("Misty") && move.type === "Dragon" && isGrounded(defender, field)) {
    move.basePower = Math.floor(move.basePower * 0.5);
  }

  // Screens
  const isPhysical = move.category === "Physical";
  if (isPhysical && field.defenderSide.isReflect) {
    move.basePower = Math.floor(move.basePower * 0.5);
  }
  if (!isPhysical && field.defenderSide.isLightScreen) {
    move.basePower = Math.floor(move.basePower * 0.5);
  }

  // Aurora Veil (reduces damage like Reflect + Light Screen combined)
  if (field.defenderSide.isAuroraVeil) {
    move.basePower = Math.floor(move.basePower * 0.6667);
  }

  // Helping Hand
  if (field.attackerSide.isHelpingHand) {
    move.basePower = Math.floor(move.basePower * 1.5);
  }

  // Item boosts
  const itemBoost = getItemBoostType(attacker.item);
  if (itemBoost && move.type === itemBoost) {
    move.basePower = Math.floor(move.basePower * 1.2);
  }

  // Choice items
  if (attacker.hasItem("Choice Band") && isPhysical) {
    move.basePower = Math.floor(move.basePower * 1.5);
  }
  if (attacker.hasItem("Choice Specs") && !isPhysical) {
    move.basePower = Math.floor(move.basePower * 1.5);
  }

  // Life Orb
  if (attacker.hasItem("Life Orb")) {
    move.basePower = Math.floor(move.basePower * 1.3);
  }

  // Berry resist
  const berryResist = getBerryResistType(defender.item);
  if (berryResist && move.type === berryResist) {
    move.basePower = Math.floor(move.basePower * 0.5);
  }

  // Expert Belt
  if (attacker.hasItem("Expert Belt") && typeEffectiveness > 1) {
    move.basePower = Math.floor(move.basePower * 1.2);
  }

  // Muscle Band / Wise Glasses
  if (attacker.hasItem("Muscle Band") && isPhysical) {
    move.basePower = Math.floor(move.basePower * 1.1);
  }
  if (attacker.hasItem("Wise Glasses") && !isPhysical) {
    move.basePower = Math.floor(move.basePower * 1.1);
  }

  // Attack stat
  let atk;
  if (isPhysical) {
    atk = attacker.stats().atk;
    if (attacker.hasAbility("Hustle")) atk = Math.floor(atk * 1.5);
    if (attacker.hasAbility("Guts") && attacker.status) atk = Math.floor(atk * 1.5);
    if (attacker.hasAbility("Pure Power") || attacker.hasAbility("Huge Power")) atk = Math.floor(atk * 2);
  } else {
    atk = attacker.stats().spa;
    if (attacker.hasAbility("Plus") || attacker.hasAbility("Minus")) {
      // Simplified: boost by 1.5 if ally has the other
      atk = Math.floor(atk * 1.5);
    }
  }

  // Defense stat
  let def;
  if (isPhysical) {
    def = defender.stats().def;
    if (defender.hasAbility("Marvel Scale") && defender.status) def = Math.floor(def * 1.5);
    if (defender.hasAbility("Fur Coat")) def = def * 2;
  } else {
    def = defender.stats().spd;
  }

  // Power Trick (swap attacker's Atk and Def)
  if (field.attackerSide.isPowerTrick) {
    const temp = atk;
    atk = def;
    def = temp;
  }

  // Apply boosts
  atk = getModifiedStat(atk, attacker.boosts[isPhysical ? "atk" : "spa"]);
  def = getModifiedStat(def, defender.boosts[isPhysical ? "def" : "spd"]);

  // Critical hit
  let isCritical = false;
  if (move.willCrit) {
    isCritical = true;
  }
  if (attacker.hasAbility("Super Luck")) {
    isCritical = true;
  }
  if (isCritical) {
    if (isPhysical) {
      attacker.boosts.atk = Math.min(6, (attacker.boosts.atk || 0) + 1);
      atk = getModifiedStat(atk, 1);
    } else {
      attacker.boosts.spa = Math.min(6, (attacker.boosts.spa || 0) + 1);
      atk = getModifiedStat(atk, 1);
    }
    def = getModifiedStat(def, 0);
  }

  // Champions base damage formula
  const level = 50;
  const baseDamage = Math.floor((((2 * level) / 5 + 2) * move.basePower * atk) / def / 50 + 2);

  // Modifiers
  let damage = baseDamage;

  // STAB
  let stab = 1;
  if (attacker.hasType(move.type)) {
    stab = 1.5;
    if (attacker.hasAbility("Adaptability")) stab = 2;
    if (attacker.hasAbility("Protean") || attacker.hasAbility("Libero")) stab = 1.5;
  }
  damage = Math.floor(damage * stab);

  // Type effectiveness
  damage = Math.floor(damage * typeEffectiveness);

  // Critical hit
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  // Weather (non-water/fire already applied to BP)
  // Additional weather effects
  if (field.hasWeather("Sand")) {
    if (move.type === "Rock") damage = Math.floor(damage * 1.3);
  }
  if (field.hasWeather("Hail", "Snow")) {
    if (move.type === "Ice") damage = Math.floor(damage * 1.3);
  }

  // Ability damage modifiers
  if (attacker.hasAbility("Blaze") && move.type === "Fire") damage = Math.floor(damage * 1.5);
  if (attacker.hasAbility("Torrent") && move.type === "Water") damage = Math.floor(damage * 1.5);
  if (attacker.hasAbility("Overgrow") && move.type === "Grass") damage = Math.floor(damage * 1.5);
  if (attacker.hasAbility("Swarm") && move.type === "Bug") damage = Math.floor(damage * 1.5);
  if (attacker.hasAbility("Solar Power") && field.hasWeather("Sun", "Harsh Sunshine"))
    damage = Math.floor(damage * 1.5);
  if (attacker.hasAbility("Sheer Force") && move.secondaries) damage = Math.floor(damage * 1.3);
  if (attacker.hasAbility("Iron Fist") && move.flags.punch) damage = Math.floor(damage * 1.3);
  if (attacker.hasAbility("Reckless") && (move.recoil || move.hasCrashDamage)) damage = Math.floor(damage * 1.2);
  if (attacker.hasAbility("Technician") && move.basePower <= 60) damage = Math.floor(damage * 1.5);
  if (attacker.hasAbility("Rivalry")) damage = Math.floor(damage * 1.25);

  // Defender ability modifiers
  if (defender.hasAbility("Solid Rock") || defender.hasAbility("Filter") || defender.hasAbility("Prism Armor")) {
    if (typeEffectiveness > 1) damage = Math.floor(damage * 0.75);
  }
  if (defender.hasAbility("Thick Fat")) {
    if (move.type === "Fire" || move.type === "Ice") damage = Math.floor(damage * 0.5);
  }
  if (defender.hasAbility("Multiscale") && defender.curHP() === defender.maxHP()) {
    damage = Math.floor(damage * 0.5);
  }
  if (defender.hasAbility("Fluffy") && !isPhysical) {
    damage = Math.floor(damage * 2);
  }

  // Friend Guard (reduces damage to 0.75x)
  if (field.defenderSide.isFriendGuard) {
    damage = Math.floor(damage * 0.75);
  }

  // Ruin abilities
  if (attacker.hasAbility("Sword of Ruin")) {
    def = Math.floor(def * 0.75);
  }
  if (attacker.hasAbility("Tablets of Ruin")) {
    atk = Math.floor(atk * 0.75);
  }
  if (defender.hasAbility("Beads of Ruin")) {
    atk = Math.floor(atk * 0.75);
  }
  if (defender.hasAbility("Vessel of Ruin")) {
    atk = Math.floor(atk * 0.75);
  }

  // Burn
  if (attacker.hasStatus("brn") && isPhysical && !attacker.hasAbility("Guts")) {
    damage = Math.floor(damage * 0.5);
  }

  // Generate 16 damage rolls
  const damageRolls = [];
  for (let i = 85; i <= 100; i++) {
    damageRolls.push(Math.floor((damage * i) / 100));
  }

  return {
    damage: damageRolls,
    desc,
  };
}
