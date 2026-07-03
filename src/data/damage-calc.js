var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// scripts/.cache/upstream/damage-calc/calc/src/util.ts
function toID(text) {
  const lcase = ("" + text).toLowerCase();
  if (lcase === "flab\xE9b\xE9") {
    return "flabebe";
  }
  return lcase.replace(/[^a-z0-9]+/g, "");
}
function error(err, msg) {
  if (err) {
    throw new Error(msg);
  } else {
    console.log(msg);
  }
}
function assignWithout(a, b, exclude) {
  for (const key in b) {
    if (Object.prototype.hasOwnProperty.call(b, key) && !exclude.has(key)) {
      a[key] = b[key];
    }
  }
}
var class2Type = {
  "[object Boolean]": "boolean",
  "[object Number]": "number",
  "[object String]": "string",
  "[object Function]": "function",
  "[object Array]": "array",
  "[object Date]": "date",
  "[object RegExp]": "regexp",
  "[object Object]": "object",
  "[object Error]": "error"
};
var coreToString = class2Type.toString;
var coreHasOwn = class2Type.hasOwnProperty;
function isFunction(obj) {
  return getType(obj) === "function";
}
function isWindow(obj) {
  return obj != null && obj === obj.window;
}
function getType(obj) {
  if (obj == null) {
    return String(obj);
  }
  return typeof obj === "object" || typeof obj === "function" ? class2Type[coreToString.call(obj)] || "object" : typeof obj;
}
function isPlainObject(obj) {
  if (getType(obj) !== "object" || obj.nodeType || isWindow(obj)) {
    return false;
  }
  try {
    if (obj.constructor && !coreHasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
}
function extend(...args) {
  let options, name, src, copy, copyIsArray, clone;
  let target = args[0] || {};
  let i = 1;
  let deep = false;
  const length = args.length;
  if (typeof target === "boolean") {
    deep = target;
    target = args[1] || {};
    i = 2;
  }
  if (typeof target !== "object" && !isFunction(target)) {
    target = {};
  }
  if (length === i) {
    target = this;
    --i;
  }
  for (; i < length; i++) {
    if ((options = args[i]) != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];
        if (target === copy) {
          continue;
        }
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && Array.isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          }
          target[name] = extend(deep, clone, copy);
        } else if (copy !== void 0) {
          target[name] = copy;
        }
      }
    }
  }
  return target;
}

// scripts/.cache/upstream/damage-calc/calc/src/items.ts
function getItemBoostType(item) {
  switch (item) {
    case "Draco Plate":
    case "Dragon Fang":
      return "Dragon";
    case "Dread Plate":
    case "Black Glasses":
      return "Dark";
    case "Earth Plate":
    case "Soft Sand":
      return "Ground";
    case "Fist Plate":
    case "Black Belt":
      return "Fighting";
    case "Flame Plate":
    case "Charcoal":
      return "Fire";
    case "Icicle Plate":
    case "Never-Melt Ice":
      return "Ice";
    case "Insect Plate":
    case "Silver Powder":
      return "Bug";
    case "Iron Plate":
    case "Metal Coat":
      return "Steel";
    case "Meadow Plate":
    case "Rose Incense":
    case "Miracle Seed":
      return "Grass";
    case "Mind Plate":
    case "Odd Incense":
    case "Twisted Spoon":
      return "Psychic";
    case "Fairy Feather":
    case "Pixie Plate":
      return "Fairy";
    case "Sky Plate":
    case "Sharp Beak":
      return "Flying";
    case "Splash Plate":
    case "Sea Incense":
    case "Wave Incense":
    case "Mystic Water":
      return "Water";
    case "Spooky Plate":
    case "Spell Tag":
      return "Ghost";
    case "Stone Plate":
    case "Rock Incense":
    case "Hard Stone":
      return "Rock";
    case "Toxic Plate":
    case "Poison Barb":
      return "Poison";
    case "Zap Plate":
    case "Magnet":
      return "Electric";
    case "Silk Scarf":
    case "Pink Bow":
    case "Polkadot Bow":
      return "Normal";
    default:
      return void 0;
  }
}
function getBerryResistType(berry) {
  switch (berry) {
    case "Chilan Berry":
      return "Normal";
    case "Occa Berry":
      return "Fire";
    case "Passho Berry":
      return "Water";
    case "Wacan Berry":
      return "Electric";
    case "Rindo Berry":
      return "Grass";
    case "Yache Berry":
      return "Ice";
    case "Chople Berry":
      return "Fighting";
    case "Kebia Berry":
      return "Poison";
    case "Shuca Berry":
      return "Ground";
    case "Coba Berry":
      return "Flying";
    case "Payapa Berry":
      return "Psychic";
    case "Tanga Berry":
      return "Bug";
    case "Charti Berry":
      return "Rock";
    case "Kasib Berry":
      return "Ghost";
    case "Haban Berry":
      return "Dragon";
    case "Colbur Berry":
      return "Dark";
    case "Babiri Berry":
      return "Steel";
    case "Roseli Berry":
      return "Fairy";
    default:
      return void 0;
  }
}
var FLING_120 = /* @__PURE__ */ new Set([
  "TR24",
  "TR28",
  "TR34",
  "TR39",
  "TR53",
  "TR55",
  "TR64",
  "TR66",
  "TR72",
  "TR73"
]);
var FLING_100 = /* @__PURE__ */ new Set([
  "Hard Stone",
  "Room Service",
  "Claw Fossil",
  "Dome Fossil",
  "Helix Fossil",
  "Old Amber",
  "Root Fossil",
  "Armor Fossil",
  "Old Amber",
  "Fossilized Bird",
  "Fossilized Dino",
  "Fossilized Drake",
  "Fossilized Fish",
  "Plume Fossil",
  "Jaw Fossil",
  "Cover Fossil",
  "Sail Fossil",
  "Rare Bone",
  "Skull Fossil",
  "TR10",
  "TR31",
  "TR75"
]);
var FLING_90 = /* @__PURE__ */ new Set([
  "Deep Sea Tooth",
  "Thick Club",
  "TR02",
  "TR04",
  "TR05",
  "TR08",
  "TR11",
  "TR22",
  "TR35",
  "TR42",
  "TR45",
  "TR50",
  "TR61",
  "TR65",
  "TR67",
  "TR86",
  "TR90",
  "TR96"
]);
var FLING_85 = /* @__PURE__ */ new Set(["TR01", "TR41", "TR62", "TR93", "TR97", "TR98"]);
var FLING_80 = /* @__PURE__ */ new Set([
  "Assault Vest",
  "Blunder Policy",
  "Chipped Pot",
  "Cracked Pot",
  "Heavy-Duty Boots",
  "Weakness Policy",
  "Quick Claw",
  "Dawn Stone",
  "Dusk Stone",
  "Electirizer",
  "Magmarizer",
  "Oval Stone",
  "Protector",
  "Sachet",
  "Whipped Dream",
  "Razor Claw",
  "Shiny Stone",
  "TR16",
  "TR18",
  "TR19",
  "TR25",
  "TR32",
  "TR33",
  "TR47",
  "TR56",
  "TR57",
  "TR58",
  "TR59",
  "TR60",
  "TR63",
  "TR69",
  "TR70",
  "TR74",
  "TR84",
  "TR87",
  "TR92",
  "TR95",
  "TR99"
]);
var FLING_70 = /* @__PURE__ */ new Set([
  "Poison Barb",
  "Dragon Fang",
  "Power Anklet",
  "Power Band",
  "Power Belt",
  "Power Bracer",
  "Power Lens",
  "Power Weight"
]);
var FLING_60 = /* @__PURE__ */ new Set([
  "Adamant Orb",
  "Damp Rock",
  "Heat Rock",
  "Leek",
  "Lustrous Orb",
  "Macho Brace",
  "Rocky Helmet",
  "Stick",
  "Utility Umbrella",
  "Terrain Extender"
]);
var FLING_30 = /* @__PURE__ */ new Set([
  "Absorb Bulb",
  "Black Belt",
  "Black Sludge",
  "Black Glasses",
  "Cell Battery",
  "Charcoal",
  "Deep Sea Scale",
  "Flame Orb",
  "King's Rock",
  "Life Orb",
  "Light Ball",
  "Light Clay",
  "Magnet",
  "Metal Coat",
  "Miracle Seed",
  "Mystic Water",
  "Never-Melt Ice",
  "Razor Fang",
  "Scope Lens",
  "Soul Dew",
  "Spell Tag",
  "Sweet Apple",
  "Tart Apple",
  "Throat Spray",
  "Toxic Orb",
  "Twisted Spoon",
  "Dragon Scale",
  "Energy Powder",
  "Fire Stone",
  "Leaf Stone",
  "Moon Stone",
  "Sun Stone",
  "Thunder Stone",
  "Up-Grade",
  "Water Stone",
  "Berry Juice",
  "Black Sludge",
  "Prism Scale",
  "Ice Stone",
  "Gold Bottle Cap",
  "Luminous Moss",
  "Eject Button",
  "Snowball",
  "Bottle Cap"
]);
var FLING_10 = /* @__PURE__ */ new Set([
  "Air Balloon",
  "Berry Sweet",
  "Choice Band",
  "Choice Scarf",
  "Choice Specs",
  "Clover Sweet",
  "Destiny Knot",
  "Electric Seed",
  "Expert Belt",
  "Flower Sweet",
  "Focus Band",
  "Focus Sash",
  "Full Incense",
  "Grassy Seed",
  "Lagging Tail",
  "Lax Incense",
  "Leftovers",
  "Love Sweet",
  "Mental Herb",
  "Metal Powder",
  "Mint Berry",
  "Miracle Berry",
  "Misty Seed",
  "Muscle Band",
  "Power Herb",
  "Psychic Seed",
  "Odd Incense",
  "Quick Powder",
  "Reaper Cloth",
  "Red Card",
  "Ribbon Sweet",
  "Ring Target",
  "Rock Incense",
  "Rose Incense",
  "Sea Incense",
  "Shed Shell",
  "Silk Scarf",
  "Silver Powder",
  "Smooth Rock",
  "Soft Sand",
  "Soothe Bell",
  "Star Sweet",
  "Strawberry Sweet",
  "Wave Incense",
  "White Herb",
  "Wide Lens",
  "Wise Glasses",
  "Zoom Lens",
  "Silver Powder",
  "Power Herb",
  "TR00",
  "TR07",
  "TR12",
  "TR13",
  "TR14",
  "TR17",
  "TR20",
  "TR21",
  "TR23",
  "TR26",
  "TR27",
  "TR29",
  "TR30",
  "TR37",
  "TR38",
  "TR40",
  "TR44",
  "TR46",
  "TR48",
  "TR49",
  "TR51",
  "TR52",
  "TR54",
  "TR68",
  "TR76",
  "TR77",
  "TR79",
  "TR80",
  "TR83",
  "TR85",
  "TR88",
  "TR91"
]);
function getFlingPower(item, gen = 9) {
  if (!item) return 0;
  if (item === "Big Nugget" && gen <= 7) return 30;
  if (["Big Nugget", "Iron Ball", "TR43", "TR71"].includes(item)) return 130;
  if (FLING_120.has(item)) return 85;
  if (["TR03", "TR06", "TR09", "TR15", "TR89"].includes(item)) return 110;
  if (FLING_100.has(item)) return 100;
  if (["TR36", "TR78", "TR81", "TR94"].includes(item)) return 95;
  if (item.includes("Plate") || FLING_90.has(item)) return 90;
  if (FLING_85.has(item)) return 85;
  if (FLING_80.has(item)) return 80;
  if (FLING_70.has(item)) return 70;
  if (FLING_60.has(item)) return 60;
  if (["Eject Pack", "Sharp Beak", "Dubious Disc"].includes(item)) return 50;
  if (["Icy Rock", "Eviolite", "Lucky Punch"].includes(item)) return 40;
  if (FLING_30.has(item)) return 30;
  if (["TR82", "Pretty Feather"].includes(item)) return 20;
  if (item.includes("Berry") || FLING_10.has(item)) return 10;
  return 0;
}

// scripts/.cache/upstream/damage-calc/calc/src/stats.ts
var Stats = new class {
  displayStat(stat) {
    switch (stat) {
      case "hp":
        return "HP";
      case "atk":
        return "Atk";
      case "def":
        return "Def";
      case "spa":
        return "SpA";
      case "spd":
        return "SpD";
      case "spe":
        return "Spe";
      case "spc":
        return "Spc";
      default:
        throw new Error(`unknown stat ${stat}`);
    }
  }
  shortForm(stat) {
    switch (stat) {
      case "hp":
        return "hp";
      case "atk":
        return "at";
      case "def":
        return "df";
      case "spa":
        return "sa";
      case "spd":
        return "sd";
      case "spe":
        return "sp";
      case "spc":
        return "sl";
    }
  }
  getHPDV(ivs) {
    return this.IVToDV(ivs.atk) % 2 * 8 + this.IVToDV(ivs.def) % 2 * 4 + this.IVToDV(ivs.spe) % 2 * 2 + this.IVToDV(ivs.spc) % 2;
  }
  IVToDV(iv) {
    return Math.floor(iv / 2);
  }
  DVToIV(dv) {
    return dv * 2;
  }
  EVToStatEXP(ev) {
    return (ev - 1) * (ev - 1) + 1;
  }
  StatEXPToEv(statexp) {
    return Math.floor((Math.sqrt(statexp - 1) + 1) / 4) * 4;
  }
  DVsToIVs(dvs) {
    const ivs = {};
    let dv;
    for (dv in dvs) {
      ivs[dv] = Stats.DVToIV(dvs[dv]);
    }
    return ivs;
  }
  calcStat(gen, stat, base, iv, ev, level, nature) {
    if (gen.num < 0 || gen.num > 9) throw new Error(`Invalid generation ${gen.num}`);
    if (gen.num === 0) return this.calcStatChampions(gen.natures, stat, base, ev, nature);
    if (gen.num < 3) return this.calcStatRBY(stat, base, iv, ev, level);
    return this.calcStatADV(gen.natures, stat, base, iv, ev, level, nature);
  }
  calcStatChampions(natures, stat, base, sp, nature) {
    if (stat === "hp") {
      return base === 1 ? base : base + sp + 75;
    }
    let mods = [void 0, void 0];
    if (nature) {
      const nat = natures.get(toID(nature));
      mods = [nat?.plus, nat?.minus];
    }
    const n = mods[0] === stat && mods[1] === stat ? 1 : mods[0] === stat ? 1.1 : mods[1] === stat ? 0.9 : 1;
    return Math.floor(n * (base + sp + 20));
  }
  calcStatADV(natures, stat, base, iv, ev, level, nature) {
    if (stat === "hp") {
      return base === 1 ? base : Math.floor((base * 2 + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
    } else {
      let mods = [void 0, void 0];
      if (nature) {
        const nat = natures.get(toID(nature));
        mods = [nat?.plus, nat?.minus];
      }
      const n = mods[0] === stat && mods[1] === stat ? 1 : mods[0] === stat ? 1.1 : mods[1] === stat ? 0.9 : 1;
      return Math.floor((Math.floor((base * 2 + iv + Math.floor(ev / 4)) * level / 100) + 5) * n);
    }
  }
  calcStatRBY(stat, base, iv, ev, level) {
    return this.calcStatRBYFromDV(stat, base, this.IVToDV(iv), this.EVToStatEXP(ev), level);
  }
  calcStatRBYFromDV(stat, base, dv, statexp, level) {
    if (stat === "hp") {
      return Math.floor(((base + dv) * 2 + Math.floor((Math.sqrt(statexp - 1) + 1) / 4)) * level / 100) + level + 10;
    } else {
      return Math.floor(((base + dv) * 2 + Math.floor((Math.sqrt(statexp - 1) + 1) / 4)) * level / 100) + 5;
    }
  }
  getHiddenPowerIVs(gen, hpType) {
    const hp = HP[hpType];
    if (!hp) return void 0;
    return gen.num === 2 ? Stats.DVsToIVs(hp.dvs) : hp.ivs;
  }
  getHiddenPower(gen, ivs) {
    const tr = (num, bits = 0) => {
      if (bits) return (num >>> 0) % 2 ** bits;
      return num >>> 0;
    };
    const stats = { hp: 31, atk: 31, def: 31, spe: 31, spa: 31, spd: 31 };
    if (gen.num <= 2) {
      const atkDV = tr(ivs.atk / 2);
      const defDV = tr(ivs.def / 2);
      const speDV = tr(ivs.spe / 2);
      const spcDV = tr(ivs.spa / 2);
      return {
        type: HP_TYPES[4 * (atkDV % 4) + defDV % 4],
        power: tr(
          (5 * ((spcDV >> 3) + 2 * (speDV >> 3) + 4 * (defDV >> 3) + 8 * (atkDV >> 3)) + spcDV % 4) / 2 + 31
        )
      };
    } else {
      let hpTypeX = 0;
      let hpPowerX = 0;
      let i = 1;
      for (const s in stats) {
        hpTypeX += i * (ivs[s] % 2);
        hpPowerX += i * (tr(ivs[s] / 2) % 2);
        i *= 2;
      }
      return {
        type: HP_TYPES[tr(hpTypeX * 15 / 63)],
        // After Gen 6, Hidden Power is always 60 base power
        power: gen.num && gen.num < 6 ? tr(hpPowerX * 40 / 63) + 30 : 60
      };
    }
  }
}();

// scripts/.cache/upstream/damage-calc/calc/src/mechanics/util.ts
var EV_ITEMS = [
  "Macho Brace",
  "Power Anklet",
  "Power Band",
  "Power Belt",
  "Power Bracer",
  "Power Lens",
  "Power Weight"
];
function isGrounded(pokemon, field) {
  return field.isGravity || pokemon.hasItem("Iron Ball") || !pokemon.hasType("Flying") && !pokemon.hasAbility("Levitate", "Eelevate") && !pokemon.hasItem("Air Balloon");
}
function getModifiedStat(stat, mod, gen) {
  if (gen && gen.num < 3) {
    if (mod >= 0) {
      const pastGenBoostTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
      stat = Math.floor(stat * pastGenBoostTable[mod]);
    } else {
      const numerators = [100, 66, 50, 40, 33, 28, 25];
      stat = Math.floor(stat * numerators[-mod] / 100);
    }
    return Math.min(999, Math.max(1, stat));
  }
  const numerator = 0;
  const denominator = 1;
  const modernGenBoostTable = [
    [2, 8],
    [2, 7],
    [2, 6],
    [2, 5],
    [2, 4],
    [2, 3],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 2]
  ];
  stat = OF16(stat * modernGenBoostTable[6 + mod][numerator]);
  stat = Math.floor(stat / modernGenBoostTable[6 + mod][denominator]);
  return stat;
}
function computeFinalStats(gen, attacker, defender, field, ...stats) {
  const sides = [[attacker, field.attackerSide], [defender, field.defenderSide]];
  for (const [pokemon, side] of sides) {
    for (const stat of stats) {
      if (stat === "spe") {
        pokemon.stats.spe = getFinalSpeed(gen, pokemon, field, side);
      } else {
        pokemon.stats[stat] = getModifiedStat(pokemon.rawStats[stat], pokemon.boosts[stat], gen);
      }
    }
  }
}
function getFinalSpeed(gen, pokemon, field, side) {
  const weather = field.weather || "";
  const terrain = field.terrain;
  let speed = getModifiedStat(pokemon.rawStats.spe, pokemon.boosts.spe, gen);
  const speedMods = [];
  if (side.isTailwind) speedMods.push(8192);
  if (pokemon.hasAbility("Unburden") && pokemon.abilityOn || pokemon.hasAbility("Chlorophyll") && weather.includes("Sun") || pokemon.hasAbility("Sand Rush") && weather === "Sand" || pokemon.hasAbility("Swift Swim") && weather.includes("Rain") || pokemon.hasAbility("Slush Rush") && ["Hail", "Snow"].includes(weather) || pokemon.hasAbility("Surge Surfer") && terrain === "Electric") {
    speedMods.push(8192);
  } else if (pokemon.hasAbility("Quick Feet") && pokemon.status) {
    speedMods.push(6144);
  } else if (pokemon.hasAbility("Slow Start") && pokemon.abilityOn) {
    speedMods.push(2048);
  } else if (isQPActive(pokemon, field) && getQPBoostedStat(pokemon, gen) === "spe") {
    speedMods.push(6144);
  }
  if (!(pokemon.hasAbility("Unburden") && pokemon.abilityOn)) {
    if (pokemon.hasItem("Choice Scarf")) {
      speedMods.push(6144);
    } else if (pokemon.hasItem("Iron Ball", ...EV_ITEMS)) {
      speedMods.push(2048);
    } else if (pokemon.hasItem("Quick Powder") && pokemon.named("Ditto")) {
      speedMods.push(8192);
    }
  }
  speed = OF32(pokeRound(speed * chainMods(speedMods, 410, 131172) / 4096));
  if (pokemon.hasStatus("par") && !pokemon.hasAbility("Quick Feet")) {
    speed = Math.floor(OF32(speed * (gen.num >= 7 || gen.num === 0 ? 50 : 25)) / 100);
  }
  speed = Math.min(gen.num <= 2 ? 999 : 1e4, speed);
  return Math.max(0, speed);
}
function getMoveEffectiveness(gen, move, type, isGhostRevealed, isGravity, isRingTarget) {
  if (isGhostRevealed && type === "Ghost" && move.hasType("Normal", "Fighting")) {
    return 1;
  } else if (isGravity && type === "Flying" && move.hasType("Ground")) {
    return 1;
  } else if (move.named("Freeze-Dry") && type === "Water") {
    return 2;
  } else if (move.named("Nihil Light") && type === "Fairy") {
    return 1;
  } else {
    let effectiveness = gen.types.get(toID(move.type)).effectiveness[type];
    if (effectiveness === 0 && isRingTarget) {
      effectiveness = 1;
    }
    if (move.named("Flying Press")) {
      effectiveness *= gen.types.get("flying").effectiveness[type];
    }
    return effectiveness;
  }
}
function checkForecast(pokemon, weather) {
  if (pokemon.hasAbility("Forecast") && pokemon.named("Castform")) {
    switch (weather) {
      case "Sun":
      case "Harsh Sunshine":
        pokemon.types = ["Fire"];
        break;
      case "Rain":
      case "Heavy Rain":
        pokemon.types = ["Water"];
        break;
      case "Hail":
      case "Snow":
        pokemon.types = ["Ice"];
        break;
      default:
        pokemon.types = ["Normal"];
    }
  }
}
function checkItem(pokemon, magicRoomActive) {
  if (pokemon.gen.num === 4 && pokemon.hasItem("Iron Ball")) return;
  if (pokemon.hasAbility("Klutz") && !EV_ITEMS.includes(pokemon.item) || magicRoomActive) {
    pokemon.disabledItem = pokemon.item;
    pokemon.item = "";
  }
}
function checkRawStatChanges(pokemon, powerTrickActive, wonderRoomActive) {
  if (powerTrickActive) {
    [pokemon.rawStats.atk, pokemon.rawStats.def] = [pokemon.rawStats.def, pokemon.rawStats.atk];
  }
  if (wonderRoomActive) {
    [pokemon.rawStats.def, pokemon.rawStats.spd] = [pokemon.rawStats.spd, pokemon.rawStats.def];
  }
}
function checkIntimidate(gen, source, target) {
  const blocked = target.hasAbility("Clear Body", "White Smoke", "Hyper Cutter", "Full Metal Body") || // More abilities now block Intimidate in Gen 8+ (DaWoblefet, Cloudy Mistral)
  gen.num >= 8 && target.hasAbility("Inner Focus", "Own Tempo", "Oblivious", "Scrappy") || target.hasItem("Clear Amulet");
  if (source.hasAbility("Intimidate") && source.abilityOn && !blocked) {
    if (target.hasAbility("Contrary", "Defiant", "Guard Dog")) {
      target.boosts.atk = Math.min(6, target.boosts.atk + 1);
    } else if (target.hasAbility("Simple")) {
      target.boosts.atk = Math.max(-6, target.boosts.atk - 2);
    } else {
      target.boosts.atk = Math.max(-6, target.boosts.atk - 1);
    }
    if (target.hasAbility("Competitive")) {
      target.boosts.spa = Math.min(6, target.boosts.spa + 2);
    }
  }
}
function checkInfiltrator(pokemon, affectedSide) {
  if (pokemon.hasAbility("Infiltrator")) {
    affectedSide.isReflect = false;
    affectedSide.isLightScreen = false;
    affectedSide.isAuroraVeil = false;
  }
}
function checkMultihitBoost(gen, attacker, defender, move, field, desc, attackerUsedItem = false, defenderUsedItem = false) {
  if (move.named("Gyro Ball", "Electro Ball") && defender.hasAbility("Gooey", "Tangling Hair")) {
    if (attacker.hasItem("White Herb") && !attackerUsedItem) {
      desc.attackerItem = attacker.item;
      attackerUsedItem = true;
    } else {
      attacker.boosts.spe = Math.max(attacker.boosts.spe - 1, -6);
      attacker.stats.spe = getFinalSpeed(gen, attacker, field, field.attackerSide);
      desc.defenderAbility = defender.ability;
    }
  } else if (move.named("Power-Up Punch")) {
    attacker.boosts.atk = Math.min(attacker.boosts.atk + 1, 6);
    attacker.stats.atk = getModifiedStat(attacker.rawStats.atk, attacker.boosts.atk, gen);
  }
  const atkSimple = attacker.hasAbility("Simple") ? 2 : 1;
  const defSimple = defender.hasAbility("Simple") ? 2 : 1;
  if (!defenderUsedItem && (defender.hasItem("Luminous Moss") && move.hasType("Water")) || defender.hasItem("Maranga Berry") && move.category === "Special" || defender.hasItem("Kee Berry") && move.category === "Physical") {
    const defStat = defender.hasItem("Kee Berry") ? "def" : "spd";
    if (attacker.hasAbility("Unaware")) {
      desc.attackerAbility = attacker.ability;
    } else {
      if (defender.hasAbility("Contrary")) {
        desc.defenderAbility = defender.ability;
        if (defender.hasItem("White Herb") && !defenderUsedItem) {
          desc.defenderItem = defender.item;
          defenderUsedItem = true;
        } else {
          defender.boosts[defStat] = Math.max(-6, defender.boosts[defStat] - defSimple);
        }
      } else {
        defender.boosts[defStat] = Math.min(6, defender.boosts[defStat] + defSimple);
      }
      if (defSimple === 2) desc.defenderAbility = defender.ability;
      defender.stats[defStat] = getModifiedStat(
        defender.rawStats[defStat],
        defender.boosts[defStat],
        gen
      );
      desc.defenderItem = defender.item;
      defenderUsedItem = true;
    }
  }
  if (defender.hasAbility("Seed Sower")) {
    field.terrain = "Grassy";
  }
  if (defender.hasAbility("Sand Spit")) {
    field.weather = "Sand";
  }
  if (defender.hasAbility("Stamina")) {
    if (attacker.hasAbility("Unaware")) {
      desc.attackerAbility = attacker.ability;
    } else {
      defender.boosts.def = Math.min(defender.boosts.def + 1, 6);
      defender.stats.def = getModifiedStat(defender.rawStats.def, defender.boosts.def, gen);
      desc.defenderAbility = defender.ability;
    }
  } else if (defender.hasAbility("Water Compaction") && move.hasType("Water")) {
    if (attacker.hasAbility("Unaware")) {
      desc.attackerAbility = attacker.ability;
    } else {
      defender.boosts.def = Math.min(defender.boosts.def + 2, 6);
      defender.stats.def = getModifiedStat(defender.rawStats.def, defender.boosts.def, gen);
      desc.defenderAbility = defender.ability;
    }
  } else if (defender.hasAbility("Weak Armor")) {
    if (attacker.hasAbility("Unaware")) {
      desc.attackerAbility = attacker.ability;
    } else {
      if (defender.hasItem("White Herb") && !defenderUsedItem && defender.boosts.def === 0) {
        desc.defenderItem = defender.item;
        defenderUsedItem = true;
      } else {
        defender.boosts.def = Math.max(defender.boosts.def - 1, -6);
        defender.stats.def = getModifiedStat(defender.rawStats.def, defender.boosts.def, gen);
      }
      desc.defenderAbility = defender.ability;
    }
    defender.boosts.spe = Math.min(defender.boosts.spe + 2, 6);
    defender.stats.spe = getFinalSpeed(gen, defender, field, field.defenderSide);
  }
  if (move.dropsStats) {
    if (attacker.hasAbility("Unaware")) {
      desc.attackerAbility = attacker.ability;
    } else {
      const stat = move.category === "Special" ? "spa" : "atk";
      let boosts = attacker.boosts[stat];
      if (attacker.hasAbility("Contrary")) {
        boosts = Math.min(6, boosts + move.dropsStats);
        desc.attackerAbility = attacker.ability;
      } else {
        boosts = Math.max(-6, boosts - move.dropsStats * atkSimple);
      }
      if (atkSimple === 2) desc.attackerAbility = attacker.ability;
      if (attacker.hasItem("White Herb") && attacker.boosts[stat] < 0 && !attackerUsedItem) {
        boosts += move.dropsStats * atkSimple;
        desc.attackerItem = attacker.item;
        attackerUsedItem = true;
      }
      attacker.boosts[stat] = boosts;
      attacker.stats[stat] = getModifiedStat(attacker.rawStats[stat], defender.boosts[stat], gen);
    }
  }
  if (defender.hasAbility("Mummy", "Wandering Spirit", "Lingering Aroma") && move.flags.contact) {
    const oldAttackerAbility = attacker.ability;
    attacker.ability = defender.ability;
    if (desc.attackerAbility) {
      desc.defenderAbility = defender.ability;
    }
    if (defender.hasAbility("Wandering Spirit")) {
      defender.ability = oldAttackerAbility;
    }
  }
  return [attackerUsedItem, defenderUsedItem];
}
function chainMods(mods, lowerBound, upperBound) {
  let M = 4096;
  for (const mod of mods) {
    if (mod !== 4096) {
      M = M * mod + 2048 >> 12;
    }
  }
  return Math.max(Math.min(M, upperBound), lowerBound);
}
function getBaseDamage(level, basePower, attack, defense) {
  return Math.floor(
    OF32(
      Math.floor(
        OF32(OF32(Math.floor(2 * level / 5 + 2) * basePower) * attack) / defense
      ) / 50 + 2
    )
  );
}
function getQPBoostedStat(pokemon, gen) {
  if (pokemon.boostedStat && pokemon.boostedStat !== "auto") {
    return pokemon.boostedStat;
  }
  let bestStat = "atk";
  for (const stat of ["def", "spa", "spd", "spe"]) {
    if (
      // proto/quark ignore boosts when considering their boost
      getModifiedStat(pokemon.rawStats[stat], pokemon.boosts[stat], gen) > getModifiedStat(pokemon.rawStats[bestStat], pokemon.boosts[bestStat], gen)
    ) {
      bestStat = stat;
    }
  }
  return bestStat;
}
function isQPActive(pokemon, field) {
  if (!pokemon.boostedStat) {
    return false;
  }
  const weather = field.weather || "";
  const terrain = field.terrain;
  return pokemon.hasAbility("Protosynthesis") && (weather.includes("Sun") || pokemon.hasItem("Booster Energy")) || pokemon.hasAbility("Quark Drive") && (terrain === "Electric" || pokemon.hasItem("Booster Energy")) || pokemon.boostedStat !== "auto";
}
function getFinalDamage(baseAmount, i, effectiveness, isBurned, stabMod, finalMod, protect) {
  let damageAmount = Math.floor(OF32(baseAmount * (85 + i)) / 100);
  if (stabMod !== 4096) damageAmount = OF32(damageAmount * stabMod) / 4096;
  damageAmount = Math.floor(OF32(pokeRound(damageAmount) * effectiveness));
  if (isBurned) damageAmount = Math.floor(damageAmount / 2);
  if (protect) damageAmount = pokeRound(OF32(damageAmount * 1024) / 4096);
  return OF16(pokeRound(Math.max(1, OF32(damageAmount * finalMod) / 4096)));
}
function getShellSideArmCategory(source, target, wonderRoomActive) {
  let physicalDamage = source.stats.atk / target.stats.def;
  let specialDamage = source.stats.spa / target.stats.spd;
  if (wonderRoomActive) {
    physicalDamage = source.stats.atk / target.stats.spd;
    specialDamage = source.stats.spa / target.stats.def;
  }
  return physicalDamage > specialDamage ? "Physical" : "Special";
}
function getWeight(pokemon, desc, role) {
  let weightHG = pokemon.weightkg * 10;
  const abilityFactor = pokemon.hasAbility("Heavy Metal") ? 2 : pokemon.hasAbility("Light Metal") ? 0.5 : 1;
  if (abilityFactor !== 1) {
    weightHG = Math.max(Math.trunc(weightHG * abilityFactor), 1);
    desc[`${role}Ability`] = pokemon.ability;
  }
  if (pokemon.hasItem("Float Stone")) {
    weightHG = Math.max(Math.trunc(weightHG * 0.5), 1);
    desc[`${role}Item`] = pokemon.item;
  }
  return weightHG / 10;
}
function getStabMod(pokemon, move, desc) {
  let stabMod = 4096;
  if (pokemon.hasOriginalType(move.type)) {
    stabMod += 2048;
  } else if (pokemon.hasAbility("Protean", "Libero") && !pokemon.teraType) {
    stabMod += 2048;
    desc.attackerAbility = pokemon.ability;
  }
  const teraType = pokemon.teraType;
  if (teraType === move.type && teraType !== "Stellar") {
    stabMod += 2048;
    desc.attackerTera = teraType;
  }
  if (pokemon.hasAbility("Adaptability") && pokemon.hasType(move.type)) {
    stabMod += teraType && pokemon.hasOriginalType(teraType) ? 1024 : 2048;
    desc.attackerAbility = pokemon.ability;
  }
  return stabMod;
}
function countBoosts(gen, boosts) {
  let sum = 0;
  const STATS2 = gen.num === 1 ? ["atk", "def", "spa", "spe"] : ["atk", "def", "spa", "spd", "spe"];
  for (const stat of STATS2) {
    const boost = boosts[stat];
    if (boost && boost > 0) sum += boost;
  }
  return sum;
}
function getStatDescriptionText(gen, pokemon, stat, powerTrickActive, wonderRoomActive) {
  const initialStat = stat;
  if (wonderRoomActive) {
    if (stat === "def") {
      stat = "spd";
    } else if (stat === "spd") {
      stat = "def";
    }
  }
  if (powerTrickActive) {
    if (stat === "atk") {
      stat = "def";
    } else if (stat === "def") {
      stat = "atk";
    }
  }
  const nature = gen.natures.get(toID(pokemon.nature));
  let desc = pokemon.evs[stat] + (stat === "hp" || nature.plus === nature.minus ? "" : nature.plus === stat ? "+" : nature.minus === stat ? "-" : "") + " " + Stats.displayStat(initialStat);
  if (stat !== initialStat) {
    desc = desc + " (" + Stats.displayStat(stat) + ")";
  }
  const iv = pokemon.ivs[stat];
  if (iv !== 31) desc += ` ${iv} IVs`;
  return desc;
}
function handleFixedDamageMoves(attacker, move) {
  if (move.named("Seismic Toss", "Night Shade")) {
    return attacker.level;
  } else if (move.named("Dragon Rage")) {
    return 40;
  } else if (move.named("Sonic Boom")) {
    return 20;
  }
  return 0;
}
function pokeRound(num) {
  return num % 1 > 0.5 ? Math.ceil(num) : Math.floor(num);
}
function OF16(n) {
  return n > 65535 ? n % 65536 : n;
}
function OF32(n) {
  return n > 4294967295 ? n % 4294967296 : n;
}

// scripts/.cache/upstream/damage-calc/calc/src/desc.ts
function display(gen, attacker, defender, move, field, damage, rawDesc, notation = "%", err = true) {
  const [min, max] = damageRange(damage);
  const minDisplay = toDisplay(notation, min, defender.maxHP());
  const maxDisplay = toDisplay(notation, max, defender.maxHP());
  const desc = buildDescription(rawDesc, attacker, defender);
  const damageText = `${min}-${max} (${minDisplay} - ${maxDisplay}${notation})`;
  if (move.category === "Status" && !move.named("Nature Power")) return `${desc}: ${damageText}`;
  const koChanceText = getKOChance(gen, attacker, defender, move, field, damage, err).text;
  return koChanceText ? `${desc}: ${damageText} -- ${koChanceText}` : `${desc}: ${damageText}`;
}
function displayMove(gen, attacker, defender, move, damage, notation = "%") {
  const [min, max] = damageRange(damage);
  const minDisplay = toDisplay(notation, min, defender.maxHP());
  const maxDisplay = toDisplay(notation, max, defender.maxHP());
  const recoveryText = getRecovery(gen, attacker, defender, move, damage, notation).text;
  const recoilText = getRecoil(gen, attacker, defender, move, damage, notation).text;
  return `${minDisplay} - ${maxDisplay}${notation}${recoveryText && ` (${recoveryText})`}${recoilText && ` (${recoilText})`}`;
}
function getRecovery(gen, attacker, defender, move, damage, notation = "%") {
  const [minDamage, maxDamage] = damageRange(damage);
  let minD;
  let maxD;
  if (move.timesUsed && move.timesUsed > 1) {
    [minD, maxD] = multiDamageRange(damage);
  } else {
    minD = [minDamage];
    maxD = [maxDamage];
  }
  const recovery = [0, 0];
  let text = "";
  const ignoresShellBell = gen.num === 3 && move.named("Doom Desire", "Future Sight");
  if (attacker.hasItem("Shell Bell") && !ignoresShellBell) {
    for (let i = 0; i < minD.length; i++) {
      recovery[0] += minD[i] > 0 ? Math.max(Math.round(minD[i] / 8), 1) : 0;
      recovery[1] += maxD[i] > 0 ? Math.max(Math.round(maxD[i] / 8), 1) : 0;
    }
    const maxHealing = Math.round(defender.curHP() / 8);
    recovery[0] = Math.min(recovery[0], maxHealing);
    recovery[1] = Math.min(recovery[1], maxHealing);
  }
  if (move.named("G-Max Finale")) {
    recovery[0] += Math.round(attacker.maxHP() / 6);
    recovery[1] += Math.round(attacker.maxHP() / 6);
  }
  if (move.named("Pain Split")) {
    const average = Math.floor((attacker.curHP() + defender.curHP()) / 2);
    recovery[0] = recovery[1] = average - attacker.curHP();
  }
  if (move.drain) {
    if (attacker.hasAbility("Parental Bond") || move.hits > 1) {
      [minD, maxD] = multiDamageRange(damage);
    }
    const percentHealed = move.drain[0] / move.drain[1];
    const attackerHasBigRoot = attacker.hasItem("Big Root");
    let maxDrain = Math.round(defender.curHP() * percentHealed);
    if (attackerHasBigRoot) maxDrain = Math.trunc(maxDrain * 5324 / 4096);
    for (let i = 0; i < minD.length; i++) {
      const range = [minD[i], maxD[i]];
      for (const j in recovery) {
        let drained = Math.max(Math.round(range[j] * percentHealed), 1);
        if (attackerHasBigRoot) drained = Math.trunc(drained * 5324 / 4096);
        recovery[j] += Math.min(drained, maxDrain);
      }
    }
  }
  if (recovery[1] === 0) return { recovery, text };
  const minHealthRecovered = toDisplay(notation, recovery[0], attacker.maxHP());
  const maxHealthRecovered = toDisplay(notation, recovery[1], attacker.maxHP());
  const change = recovery[0] > 0 ? "recovered" : "lost";
  text = `${minHealthRecovered} - ${maxHealthRecovered}${notation} ${change}`;
  return { recovery, text };
}
function getRecoil(gen, attacker, defender, move, damage, notation = "%") {
  const [min, max] = damageRange(damage);
  let recoil = [0, 0];
  let text = "";
  const damageOverflow = min > defender.curHP() || max > defender.curHP();
  if (move.recoil) {
    const mod = move.recoil[0] / move.recoil[1] * 100;
    let minRecoilDamage, maxRecoilDamage;
    if (damageOverflow) {
      minRecoilDamage = toDisplay(notation, defender.curHP() * mod, attacker.maxHP(), 100);
      maxRecoilDamage = toDisplay(notation, defender.curHP() * mod, attacker.maxHP(), 100);
    } else {
      minRecoilDamage = toDisplay(
        notation,
        Math.min(min, defender.curHP()) * mod,
        attacker.maxHP(),
        100
      );
      maxRecoilDamage = toDisplay(
        notation,
        Math.min(max, defender.curHP()) * mod,
        attacker.maxHP(),
        100
      );
    }
    if (!attacker.hasAbility("Rock Head")) {
      recoil = [minRecoilDamage, maxRecoilDamage];
      text = `${minRecoilDamage} - ${maxRecoilDamage}${notation} recoil damage`;
    }
  } else if (move.hasCrashDamage) {
    const genMultiplier = gen.num === 2 ? 12.5 : gen.num === 0 || gen.num >= 3 ? 50 : 1;
    let minRecoilDamage, maxRecoilDamage;
    if (damageOverflow && gen.num !== 2) {
      minRecoilDamage = toDisplay(notation, defender.curHP() * genMultiplier, attacker.maxHP(), 100);
      maxRecoilDamage = toDisplay(notation, defender.curHP() * genMultiplier, attacker.maxHP(), 100);
    } else {
      minRecoilDamage = toDisplay(
        notation,
        Math.min(min, defender.maxHP()) * genMultiplier,
        attacker.maxHP(),
        100
      );
      maxRecoilDamage = toDisplay(
        notation,
        Math.min(max, defender.maxHP()) * genMultiplier,
        attacker.maxHP(),
        100
      );
    }
    recoil = [minRecoilDamage, maxRecoilDamage];
    switch (gen.num) {
      case 1:
        recoil = toDisplay(notation, 1, attacker.maxHP());
        text = "1hp damage on miss";
        break;
      case 2:
      case 3:
      case 4:
        if (defender.hasType("Ghost")) {
          if (gen.num === 4) {
            const gen4CrashDamage = Math.floor(defender.maxHP() * 0.5 / attacker.maxHP() * 100);
            recoil = notation === "%" ? gen4CrashDamage : Math.floor(gen4CrashDamage / 100 * 48);
            text = `${gen4CrashDamage}% crash damage`;
          } else {
            recoil = 0;
            text = "no crash damage on Ghost types";
          }
        } else {
          text = `${minRecoilDamage} - ${maxRecoilDamage}${notation} crash damage on miss`;
        }
        break;
      default:
        recoil = notation === "%" ? 24 : 50;
        text = "50% crash damage";
    }
  } else if (move.struggleRecoil) {
    recoil = notation === "%" ? 12 : 25;
    text = "25% struggle damage";
    if (gen.num === 4) text += " (rounded down)";
  } else if (move.mindBlownRecoil) {
    recoil = notation === "%" ? 24 : 50;
    text = "50% recoil damage";
  }
  return { recoil, text };
}
function getKOChance(gen, attacker, defender, move, field, damageObj, err = true) {
  const [damage, approximate] = combine(damageObj);
  if (isNaN(damage[0])) {
    error(err, "damage[0] must be a number.");
    return { chance: 0, n: 0, text: "" };
  }
  if (damage[damage.length - 1] === 0) {
    error(err, "damage[damage.length - 1] === 0.");
    return { chance: 0, n: 0, text: "" };
  }
  if (move.timesUsed === void 0) move.timesUsed = 1;
  if (move.timesUsedWithMetronome === void 0) move.timesUsedWithMetronome = 1;
  if (damage[0] >= defender.maxHP() && move.timesUsed === 1 && move.timesUsedWithMetronome === 1) {
    return { chance: 1, n: 1, text: "guaranteed OHKO" };
  }
  const hazards = getHazards(gen, defender, field.defenderSide);
  const eot = getEndOfTurn(gen, attacker, defender, move, field);
  const toxicCounter = defender.hasStatus("tox") && !defender.hasAbility("Magic Guard", "Poison Heal") ? defender.toxicCounter : 0;
  const qualifier = approximate ? "approx. " : "";
  const hazardsText = hazards.texts.length > 0 ? " after " + serializeText(hazards.texts) : "";
  const afterText = hazards.texts.length > 0 || eot.texts.length > 0 ? " after " + serializeText(hazards.texts.concat(eot.texts)) : "";
  const afterTextNoHazards = eot.texts.length > 0 ? " after " + serializeText(eot.texts) : "";
  function roundChance(chance) {
    return Math.max(Math.min(Math.round(chance * 1e3), 999), 1) / 10;
  }
  function KOChance(chanceWithoutEot, chanceWithEot, n, multipleTurns = false) {
    const KOTurnText = n === 1 ? "OHKO" : multipleTurns ? `KO in ${n} turns` : `${n}HKO`;
    let text = qualifier;
    let chance = void 0;
    if (chanceWithoutEot === void 0 || chanceWithEot === void 0) {
      text += `possible ${KOTurnText}`;
    } else if (chanceWithoutEot + chanceWithEot === 0) {
      chance = 0;
      text += "not a KO";
    } else if (chanceWithoutEot === 1) {
      chance = chanceWithoutEot;
      text = "guaranteed ";
      text += `OHKO${hazardsText}`;
    } else if (chanceWithoutEot > 0) {
      chance = chanceWithEot;
      if (chanceWithEot === 1) {
        text += `${roundChance(chanceWithoutEot)}% chance to ${KOTurnText}${hazardsText} (guaranteed ${KOTurnText}${afterTextNoHazards})`;
      } else if (chanceWithEot > chanceWithoutEot) {
        text += `${roundChance(chanceWithoutEot)}% chance to ${KOTurnText}${hazardsText} (${qualifier}${roundChance(chanceWithEot)}% chance to ${KOTurnText}${afterTextNoHazards})`;
      } else if (chanceWithoutEot > 0) {
        text += `${roundChance(chanceWithoutEot)}% chance to ${KOTurnText}${hazardsText}`;
      }
    } else if (chanceWithoutEot === 0) {
      chance = chanceWithEot;
      if (chanceWithEot === 1) {
        text = "guaranteed ";
        text += `${KOTurnText}${afterText}`;
      } else if (chanceWithEot > 0) {
        text += `${roundChance(chanceWithEot)}% chance to ${KOTurnText}${afterText}`;
      }
    }
    return { chance, n, text };
  }
  if (move.timesUsed === 1 && move.timesUsedWithMetronome === 1 || move.isZ) {
    const chance = computeKOChance(
      damage,
      defender.curHP() - hazards.damage,
      0,
      1,
      1,
      defender.maxHP(),
      0
    );
    const chanceWithEot = computeKOChance(
      damage,
      defender.curHP() - hazards.damage,
      eot.damage,
      1,
      1,
      defender.maxHP(),
      toxicCounter
    );
    if (chance + chanceWithEot > 0) return KOChance(chance, chanceWithEot, 1);
    for (let i = 2; i <= 4; i++) {
      const chance2 = computeKOChance(
        damage,
        defender.curHP() - hazards.damage,
        eot.damage,
        i,
        1,
        defender.maxHP(),
        toxicCounter
      );
      if (chance2 > 0) return KOChance(0, chance2, i);
    }
    for (let i = 5; i <= 9; i++) {
      if (predictTotal(damage[0], eot.damage, i, 1, toxicCounter, defender.maxHP()) >= defender.curHP() - hazards.damage) {
        return KOChance(0, 1, i);
      } else if (predictTotal(damage[damage.length - 1], eot.damage, i, 1, toxicCounter, defender.maxHP()) >= defender.curHP() - hazards.damage) {
        return KOChance(void 0, void 0, i);
      }
    }
  } else {
    const chance = computeKOChance(
      damage,
      defender.maxHP() - hazards.damage,
      eot.damage,
      move.hits || 1,
      move.timesUsed || 1,
      defender.maxHP(),
      toxicCounter
    );
    if (chance > 0) return KOChance(0, chance, move.timesUsed, chance === 1);
    if (predictTotal(
      damage[0],
      eot.damage,
      1,
      move.timesUsed,
      toxicCounter,
      defender.maxHP()
    ) >= defender.curHP() - hazards.damage) {
      return KOChance(0, 1, move.timesUsed, true);
    } else if (predictTotal(
      damage[damage.length - 1],
      eot.damage,
      1,
      move.timesUsed,
      toxicCounter,
      defender.maxHP()
    ) >= defender.curHP() - hazards.damage) {
      return KOChance(void 0, void 0, move.timesUsed, true);
    }
    return KOChance(0, 0, move.timesUsed);
  }
  return { chance: 0, n: 0, text: "" };
}
function combine(damage) {
  if (typeof damage === "number") return [[damage], false];
  if (damage.length >= 16 && typeof damage[0] === "number") {
    return [damage, false];
  }
  if (typeof damage[0] === "number" && typeof damage[1] === "number") {
    return [[damage[0] + damage[1]], false];
  }
  function reduce(dist, scaleValue) {
    const new_length = dist.length / scaleValue;
    const reduced = [];
    reduced[0] = dist[0];
    reduced[new_length - 1] = dist[dist.length - 1];
    for (let i = 1; i < new_length - 1; i++) {
      reduced[i] = dist[Math.round(i * scaleValue + scaleValue / 2)];
    }
    return reduced;
  }
  function combineTwo(dist1, dist2) {
    const combined = dist1.flatMap((val1) => dist2.map((val2) => val1 + val2)).sort((a, b) => a - b);
    return combined;
  }
  function combineDistributions(dists) {
    let combined = [0];
    const numRolls = dists[0].length;
    const numAccuracy = numRolls === 16 && dists.length === 3 ? 3 : 2;
    let approximate = false;
    for (let i = 0; i < dists.length; i++) {
      const distribution = dists[i];
      combined = combineTwo(combined, distribution);
      if (i >= numAccuracy) {
        combined = reduce(combined, distribution.length);
        approximate = true;
      }
    }
    return [combined, approximate];
  }
  const d = damage;
  return combineDistributions(d);
}
var TRAPPING = [
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
  "G-Max Centiferno"
];
function getHazards(gen, defender, defenderSide) {
  let damage = 0;
  const texts = [];
  if (defender.hasItem("Heavy-Duty Boots")) {
    return { damage, texts };
  }
  if (defenderSide.isSR && !defender.hasAbility("Magic Guard", "Mountaineer")) {
    const rockType = gen.types.get("rock");
    const effectiveness = defender.teraType && defender.teraType !== "Stellar" ? rockType.effectiveness[defender.teraType] : rockType.effectiveness[defender.types[0]] * (defender.types[1] ? rockType.effectiveness[defender.types[1]] : 1);
    damage += Math.floor(effectiveness * defender.maxHP() / 8);
    texts.push("Stealth Rock");
  }
  if (defenderSide.steelsurge && !defender.hasAbility("Magic Guard", "Mountaineer")) {
    const steelType = gen.types.get("steel");
    const effectiveness = defender.teraType && defender.teraType !== "Stellar" ? steelType.effectiveness[defender.teraType] : steelType.effectiveness[defender.types[0]] * (defender.types[1] ? steelType.effectiveness[defender.types[1]] : 1);
    damage += Math.floor(effectiveness * defender.maxHP() / 8);
    texts.push("Steelsurge");
  }
  if (!defender.hasType("Flying") && !defender.hasAbility("Magic Guard", "Levitate", "Eelevate") && !defender.hasItem("Air Balloon")) {
    if (defenderSide.spikes === 1) {
      damage += Math.floor(defender.maxHP() / 8);
      if (gen.num === 2) {
        texts.push("Spikes");
      } else {
        texts.push("1 layer of Spikes");
      }
    } else if (defenderSide.spikes === 2) {
      damage += Math.floor(defender.maxHP() / 6);
      texts.push("2 layers of Spikes");
    } else if (defenderSide.spikes === 3) {
      damage += Math.floor(defender.maxHP() / 4);
      texts.push("3 layers of Spikes");
    }
  }
  if (isNaN(damage)) {
    damage = 0;
  }
  return { damage, texts };
}
function getEndOfTurn(gen, attacker, defender, move, field) {
  let damage = 0;
  const texts = [];
  const loseItem = move.named("Knock Off") && !defender.hasAbility("Sticky Hold");
  const healBlock = move.named("Psychic Noise") && !// suppression conditions
  (attacker.hasAbility("Sheer Force") || defender.hasItem("Covert Cloak") || defender.hasAbility("Shield Dust", "Aroma Veil"));
  if (field.hasWeather("Sun", "Harsh Sunshine")) {
    if (defender.hasAbility("Dry Skin", "Solar Power")) {
      damage -= Math.floor(defender.maxHP() / 8);
      texts.push(defender.ability + " damage");
    }
  } else if (field.hasWeather("Rain", "Heavy Rain") && !healBlock) {
    if (defender.hasAbility("Dry Skin")) {
      damage += Math.floor(defender.maxHP() / 8);
      texts.push("Dry Skin recovery");
    } else if (defender.hasAbility("Rain Dish")) {
      damage += Math.floor(defender.maxHP() / 16);
      texts.push("Rain Dish recovery");
    }
  } else if (field.hasWeather("Sand")) {
    if (!defender.hasType("Rock", "Ground", "Steel") && !defender.hasAbility("Magic Guard", "Overcoat", "Sand Force", "Sand Rush", "Sand Veil") && !defender.hasItem("Safety Goggles")) {
      damage -= Math.floor(defender.maxHP() / (gen.num === 2 ? 8 : 16));
      texts.push("sandstorm damage");
    }
  } else if (field.hasWeather("Hail", "Snow")) {
    if (defender.hasAbility("Ice Body") && !healBlock) {
      damage += Math.floor(defender.maxHP() / 16);
      texts.push("Ice Body recovery");
    } else if (!defender.hasType("Ice") && !defender.hasAbility("Magic Guard", "Overcoat", "Snow Cloak") && !defender.hasItem("Safety Goggles") && field.hasWeather("Hail")) {
      damage -= Math.floor(defender.maxHP() / 16);
      texts.push("hail damage");
    }
  }
  if (defender.hasItem("Leftovers") && !loseItem && !healBlock) {
    damage += Math.floor(defender.maxHP() / 16);
    texts.push("Leftovers recovery");
  } else if (defender.hasItem("Black Sludge") && !loseItem) {
    if (defender.hasType("Poison")) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 16);
        texts.push("Black Sludge recovery");
      }
    } else if (!defender.hasAbility("Magic Guard", "Klutz")) {
      damage -= Math.floor(defender.maxHP() / 8);
      texts.push("Black Sludge damage");
    }
  } else if (defender.hasItem("Sticky Barb") && !loseItem && !defender.hasAbility("Magic Guard", "Klutz")) {
    damage -= Math.floor(defender.maxHP() / 8);
    texts.push("Sticky Barb damage");
  }
  if (field.defenderSide.isSeeded) {
    if (!defender.hasAbility("Magic Guard")) {
      damage -= Math.floor(defender.maxHP() / (gen.num === 0 || gen.num >= 2 ? 8 : 16));
      texts.push("Leech Seed damage");
    }
  }
  if (field.attackerSide.isSeeded && !attacker.hasAbility("Magic Guard")) {
    let recovery = Math.floor(attacker.maxHP() / (gen.num === 0 || gen.num >= 2 ? 8 : 16));
    if (defender.hasItem("Big Root")) recovery = Math.trunc(recovery * 5324 / 4096);
    if (attacker.hasAbility("Liquid Ooze")) {
      damage -= recovery;
      texts.push("Liquid Ooze damage");
    } else if (!healBlock) {
      damage += recovery;
      texts.push("Leech Seed recovery");
    }
  }
  if (field.hasTerrain("Grassy")) {
    if (isGrounded(defender, field) && !healBlock) {
      damage += Math.floor(defender.maxHP() / 16);
      texts.push("Grassy Terrain recovery");
    }
  }
  if (defender.hasStatus("psn")) {
    if (defender.hasAbility("Poison Heal")) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 8);
        texts.push("Poison Heal");
      }
    } else if (!defender.hasAbility("Magic Guard")) {
      damage -= Math.floor(defender.maxHP() / (gen.num === 1 ? 16 : 8));
      texts.push("poison damage");
    }
  } else if (defender.hasStatus("tox")) {
    if (defender.hasAbility("Poison Heal")) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 8);
        texts.push("Poison Heal");
      }
    } else if (!defender.hasAbility("Magic Guard")) {
      texts.push("toxic damage");
    }
  } else if (defender.hasStatus("brn")) {
    if (defender.hasAbility("Heatproof")) {
      damage -= Math.floor(defender.maxHP() / (gen.num === 0 || gen.num > 6 ? 32 : 16));
      texts.push("reduced burn damage");
    } else if (!defender.hasAbility("Magic Guard")) {
      damage -= Math.floor(defender.maxHP() / (gen.num < 2 || gen.num > 6 ? 16 : 8));
      texts.push("burn damage");
    }
  } else if ((defender.hasStatus("slp") || defender.hasAbility("Comatose")) && attacker.hasAbility("Bad Dreams") && !defender.hasAbility("Magic Guard")) {
    damage -= Math.floor(defender.maxHP() / 8);
    texts.push("Bad Dreams");
  }
  if (!defender.hasAbility("Magic Guard") && TRAPPING.includes(move.name) && (gen.num === 0 || gen.num > 1)) {
    if (attacker.hasItem("Binding Band")) {
      damage -= gen.num > 5 ? Math.floor(defender.maxHP() / 6) : Math.floor(defender.maxHP() / 8);
      texts.push("trapping damage");
    } else {
      damage -= gen.num > 5 ? Math.floor(defender.maxHP() / 8) : Math.floor(defender.maxHP() / 16);
      texts.push("trapping damage");
    }
  }
  if (field.defenderSide.isSaltCured && !defender.hasAbility("Magic Guard")) {
    const isWaterOrSteel = defender.hasType("Water", "Steel");
    const divisor = gen.num === 0 ? isWaterOrSteel ? 8 : 16 : isWaterOrSteel ? 4 : 8;
    damage -= Math.floor(defender.maxHP() / divisor);
    texts.push("Salt Cure");
  }
  if (!defender.hasType("Fire") && !defender.hasAbility("Magic Guard") && move.named("Fire Pledge (Grass Pledge Boosted)", "Grass Pledge (Fire Pledge Boosted)")) {
    damage -= Math.floor(defender.maxHP() / 8);
    texts.push("Sea of Fire damage");
  }
  if (!defender.hasAbility("Magic Guard") && !defender.hasType("Grass") && (field.defenderSide.vinelash || move.named("G-Max Vine Lash"))) {
    damage -= Math.floor(defender.maxHP() / 6);
    texts.push("Vine Lash damage");
  }
  if (!defender.hasAbility("Magic Guard") && !defender.hasType("Fire") && (field.defenderSide.wildfire || move.named("G-Max Wildfire"))) {
    damage -= Math.floor(defender.maxHP() / 6);
    texts.push("Wildfire damage");
  }
  if (!defender.hasAbility("Magic Guard") && !defender.hasType("Water") && (field.defenderSide.cannonade || move.named("G-Max Cannonade"))) {
    damage -= Math.floor(defender.maxHP() / 6);
    texts.push("Cannonade damage");
  }
  if (!defender.hasAbility("Magic Guard") && !defender.hasType("Rock") && (field.defenderSide.volcalith || move.named("G-Max Volcalith"))) {
    damage -= Math.floor(defender.maxHP() / 6);
    texts.push("Volcalith damage");
  }
  return { damage, texts };
}
function computeKOChance(damage, hp, eot, hits, timesUsed, maxHP, toxicCounter) {
  let toxicDamage = 0;
  if (toxicCounter > 0) {
    toxicDamage = Math.floor(toxicCounter * maxHP / 16);
    toxicCounter++;
  }
  const n = damage.length;
  if (hits === 1) {
    if (eot - toxicDamage > 0) {
      eot = 0;
      toxicDamage = 0;
    }
    for (let i = 0; i < n; i++) {
      if (damage[n - 1] - eot + toxicDamage < hp) return 0;
      if (damage[i] - eot + toxicDamage >= hp) {
        return (n - i) / n;
      }
    }
  }
  let sum = 0;
  let lastc = 0;
  for (let i = 0; i < n; i++) {
    let c;
    if (i === 0 || damage[i] !== damage[i - 1]) {
      c = computeKOChance(
        damage,
        hp - damage[i] + eot - toxicDamage,
        eot,
        hits - 1,
        timesUsed,
        maxHP,
        toxicCounter
      );
    } else {
      c = lastc;
    }
    if (c === 1) {
      sum += n - i;
      break;
    } else {
      sum += c;
    }
    lastc = c;
  }
  return sum / n;
}
function predictTotal(damage, eot, hits, timesUsed, toxicCounter, maxHP) {
  let toxicDamage = 0;
  let lastTurnEot = eot;
  if (toxicCounter > 0) {
    for (let i = 0; i < hits - 1; i++) {
      toxicDamage += Math.floor((toxicCounter + i) * maxHP / 16);
    }
    lastTurnEot -= Math.floor((toxicCounter + (hits - 1)) * maxHP / 16);
  }
  let total = 0;
  if (hits > 1 && timesUsed === 1) {
    total = damage * hits - eot * (hits - 1) + toxicDamage;
  } else {
    total = damage - eot * (hits - 1) + toxicDamage;
  }
  if (lastTurnEot < 0) total -= lastTurnEot;
  return total;
}
function buildDescription(description, attacker, defender) {
  const [attackerLevel, defenderLevel] = getDescriptionLevels(attacker, defender);
  let output = "";
  if (description.attackBoost) {
    if (description.attackBoost > 0) {
      output += "+";
    }
    output += description.attackBoost + " ";
  }
  output = appendIfSet(output, attackerLevel);
  output = appendIfSet(output, description.attackEVs);
  output = appendIfSet(output, description.attackerItem);
  output = appendIfSet(output, description.attackerAbility);
  output = appendIfSet(output, description.rivalry);
  if (description.isBurned) {
    output += "burned ";
  }
  if (description.alliesFainted) {
    output += Math.min(5, description.alliesFainted) + ` ${description.alliesFainted === 1 ? "ally" : "allies"} fainted `;
  }
  if (description.attackerTera) {
    output += `Tera ${description.attackerTera} `;
  }
  if (description.isStellarFirstUse) {
    output += "(First Use) ";
  }
  if (description.isBeadsOfRuin) {
    output += "Beads of Ruin ";
  }
  if (description.isSwordOfRuin) {
    output += "Sword of Ruin ";
  }
  output += description.attackerName + " ";
  if (description.isHelpingHand) {
    output += "Helping Hand ";
  }
  if (description.isFlowerGiftAttacker) {
    output += "with an ally's Flower Gift ";
  }
  if (description.isPowerTrickAttacker) {
    output += "with Power Trick ";
  }
  if (description.isSteelySpiritAttacker) {
    output += "with an ally's Steely Spirit ";
  }
  if (description.isBattery) {
    output += "Battery boosted ";
  }
  if (description.isPowerSpot) {
    output += "Power Spot boosted ";
  }
  if (description.isSwitching) {
    output += "switching boosted ";
  }
  output += description.moveName + " ";
  if (description.moveBP && description.moveType) {
    output += "(" + description.moveBP + " BP " + description.moveType + ") ";
  } else if (description.moveBP) {
    output += "(" + description.moveBP + " BP) ";
  } else if (description.moveType) {
    output += "(" + description.moveType + ") ";
  }
  if (description.hits) {
    output += "(" + description.hits + " hits) ";
  }
  output = appendIfSet(output, description.moveTurns);
  output += "vs. ";
  if (description.defenseBoost) {
    if (description.defenseBoost > 0) {
      output += "+";
    }
    output += description.defenseBoost + " ";
  }
  output = appendIfSet(output, defenderLevel);
  output = appendIfSet(output, description.HPEVs);
  if (description.defenseEVs) {
    output += "/ " + description.defenseEVs + " ";
  }
  output = appendIfSet(output, description.defenderItem);
  output = appendIfSet(output, description.defenderAbility);
  if (description.isTabletsOfRuin) {
    output += "Tablets of Ruin ";
  }
  if (description.isVesselOfRuin) {
    output += "Vessel of Ruin ";
  }
  if (description.isProtected) {
    output += "protected ";
  }
  if (description.isDefenderDynamaxed) {
    output += "Dynamax ";
  }
  if (description.defenderTera) {
    output += `Tera ${description.defenderTera} `;
  }
  output += description.defenderName;
  if (description.weather && description.terrain) {
    output += " in " + description.weather + " and " + description.terrain + " Terrain";
  } else if (description.weather) {
    output += " in " + description.weather;
  } else if (description.terrain) {
    output += " in " + description.terrain + " Terrain";
  }
  if (description.isReflect) {
    output += " through Reflect";
  } else if (description.isLightScreen) {
    output += " through Light Screen";
  }
  if (description.isFlowerGiftDefender) {
    output += " with an ally's Flower Gift";
  }
  if (description.isPowerTrickDefender) {
    output += " with Power Trick";
  }
  if (description.isFriendGuard) {
    output += " with an ally's Friend Guard";
  }
  if (description.isAuroraVeil) {
    output += " with an ally's Aurora Veil";
  }
  if (description.isCritical) {
    output += " on a critical hit";
  }
  if (description.isWonderRoom) {
    output += " in Wonder Room";
  }
  return output;
}
function getDescriptionLevels(attacker, defender) {
  if (attacker.level !== defender.level) {
    return [
      attacker.level === 100 ? "" : `Lvl ${attacker.level}`,
      defender.level === 100 ? "" : `Lvl ${defender.level}`
    ];
  }
  const elide = [100, 50, 5].includes(attacker.level);
  const level = elide ? "" : `Lvl ${attacker.level}`;
  return [level, level];
}
function serializeText(arr) {
  if (arr.length === 0) {
    return "";
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return arr[0] + " and " + arr[1];
  } else {
    let text = "";
    for (let i = 0; i < arr.length - 1; i++) {
      text += arr[i] + ", ";
    }
    return text + "and " + arr[arr.length - 1];
  }
}
function appendIfSet(str, toAppend) {
  return toAppend ? `${str}${toAppend} ` : str;
}
function toDisplay(notation, a, b, f = 1) {
  return notation === "%" ? Math.floor(a * (1e3 / f) / b) / 10 : Math.floor(a * (48 / f) / b);
}

// scripts/.cache/upstream/damage-calc/calc/src/result.ts
var Result = class {
  constructor(gen, attacker, defender, move, field, damage, rawDesc) {
    __publicField(this, "gen");
    __publicField(this, "attacker");
    __publicField(this, "defender");
    __publicField(this, "move");
    __publicField(this, "field");
    __publicField(this, "damage");
    __publicField(this, "rawDesc");
    this.gen = gen;
    this.attacker = attacker;
    this.defender = defender;
    this.move = move;
    this.field = field;
    this.damage = damage;
    this.rawDesc = rawDesc;
  }
  /* get */
  desc() {
    return this.fullDesc();
  }
  range() {
    const [min, max] = damageRange(this.damage);
    return [min, max];
  }
  fullDesc(notation = "%", err = true) {
    return display(
      this.gen,
      this.attacker,
      this.defender,
      this.move,
      this.field,
      this.damage,
      this.rawDesc,
      notation,
      err
    );
  }
  moveDesc(notation = "%") {
    return displayMove(this.gen, this.attacker, this.defender, this.move, this.damage, notation);
  }
  recovery(notation = "%") {
    return getRecovery(this.gen, this.attacker, this.defender, this.move, this.damage, notation);
  }
  recoil(notation = "%") {
    return getRecoil(this.gen, this.attacker, this.defender, this.move, this.damage, notation);
  }
  kochance(err = true) {
    return getKOChance(
      this.gen,
      this.attacker,
      this.defender,
      this.move,
      this.field,
      this.damage,
      err
    );
  }
};
function damageRange(damage) {
  const range = multiDamageRange(damage);
  if (typeof range[0] === "number") return range;
  const d = range;
  const summedRange = [0, 0];
  for (let i = 0; i < d[0].length; i++) {
    summedRange[0] += d[0][i];
    summedRange[1] += d[1][i];
  }
  return summedRange;
}
function multiDamageRange(damage) {
  if (typeof damage === "number") return [damage, damage];
  if (typeof damage[0] !== "number") {
    damage = damage;
    const ranges = [[], []];
    for (const damageList of damage) {
      ranges[0].push(damageList[0]);
      ranges[1].push(damageList[damageList.length - 1]);
    }
    return ranges;
  }
  const d = damage;
  if (d.length < 16) {
    return [d, d];
  }
  return [d[0], d[d.length - 1]];
}

// scripts/.cache/upstream/damage-calc/calc/src/mechanics/champions.ts
function calculateChampions(gen, attacker, defender, move, field) {
  checkForecast(attacker, field.weather);
  checkForecast(defender, field.weather);
  checkItem(attacker, field.isMagicRoom);
  checkItem(defender, field.isMagicRoom);
  checkRawStatChanges(attacker, field.attackerSide.isPowerTrick, field.isWonderRoom);
  checkRawStatChanges(defender, field.defenderSide.isPowerTrick, field.isWonderRoom);
  computeFinalStats(gen, attacker, defender, field, "def", "spd", "spe");
  checkIntimidate(gen, attacker, defender);
  checkIntimidate(gen, defender, attacker);
  if (move.named("Meteor Beam", "Electro Shot")) {
    attacker.boosts.spa += attacker.hasAbility("Contrary") ? -1 : 1;
    attacker.boosts.spa = Math.min(6, Math.max(-6, attacker.boosts.spa));
  }
  computeFinalStats(gen, attacker, defender, field, "atk", "spa");
  checkInfiltrator(attacker, field.defenderSide);
  checkInfiltrator(defender, field.attackerSide);
  const desc = {
    attackerName: attacker.name,
    moveName: move.name,
    defenderName: defender.name,
    isWonderRoom: field.isWonderRoom
  };
  const result = new Result(gen, attacker, defender, move, field, 0, desc);
  if (move.category === "Status") {
    return result;
  }
  if (move.named("Shell Side Arm") && getShellSideArmCategory(attacker, defender, field.isWonderRoom) === "Physical") {
    move.category = "Physical";
    move.flags.contact = 1;
  }
  const breaksProtect = move.breaksProtect || attacker.hasAbility("Unseen Fist", "Piercing Drill") && move.flags.contact;
  if (field.defenderSide.isProtected && !breaksProtect) {
    desc.isProtected = true;
    return result;
  }
  if (move.name === "Pain Split") {
    const average = Math.floor((attacker.curHP() + defender.curHP()) / 2);
    const damage2 = Math.max(0, defender.curHP() - average);
    result.damage = damage2;
    return result;
  }
  const defenderAbilityIgnored = defender.hasAbility(
    "Armor Tail",
    "Aroma Veil",
    "Battle Armor",
    "Big Pecks",
    "Bulletproof",
    "Clear Body",
    "Contrary",
    "Damp",
    "Disguise",
    "Dry Skin",
    "Earth Eater",
    "Eelevate",
    "Filter",
    "Flash Fire",
    "Flower Veil",
    "Friend Guard",
    "Fur Coat",
    "Heatproof",
    "Heavy Metal",
    "Hyper Cutter",
    "Illuminate",
    "Immunity",
    "Inner Focus",
    "Insomnia",
    "Keen Eye",
    "Leaf Guard",
    "Levitate",
    "Light Metal",
    "Lightning Rod",
    "Limber",
    "Magic Bounce",
    "Magma Armor",
    "Marvel Scale",
    "Mirror Armor",
    "Motor Drive",
    "Multiscale",
    "Oblivious",
    "Overcoat",
    "Own Tempo",
    "Purifying Salt",
    "Queenly Majesty",
    "Sand Veil",
    "Sap Sipper",
    "Shell Armor",
    "Shield Dust",
    "Snow Cloak",
    "Solid Rock",
    "Soundproof",
    "Sticky Hold",
    "Storm Drain",
    "Sturdy",
    "Sweet Veil",
    "Tangled Feet",
    "Telepathy",
    "Thick Fat",
    "Unaware",
    "Vital Spirit",
    "Volt Absorb",
    "Water Absorb",
    "Water Bubble",
    "Water Veil",
    "White Smoke"
  );
  const attackerIgnoresAbility = attacker.hasAbility("Mold Breaker");
  if (defenderAbilityIgnored && attackerIgnoresAbility) {
    if (attackerIgnoresAbility) desc.attackerAbility = attacker.ability;
    defender.ability = "";
  }
  const isCritical = !defender.hasAbility("Shell Armor") && (move.isCrit || attacker.hasAbility("Merciless") && defender.hasStatus("psn", "tox")) && move.timesUsed === 1;
  let type = move.type;
  if (move.originalName === "Weather Ball") {
    const isMegaSol = attacker.hasAbility("Mega Sol");
    type = field.hasWeather("Sun", "Harsh Sunshine") || isMegaSol ? "Fire" : field.hasWeather("Rain", "Heavy Rain") ? "Water" : field.hasWeather("Sand") ? "Rock" : field.hasWeather("Hail", "Snow") ? "Ice" : "Normal";
    isMegaSol ? desc.attackerAbility = attacker.ability : desc.weather = field.weather;
    desc.moveType = type;
  } else if (move.originalName === "Terrain Pulse" && isGrounded(attacker, field)) {
    type = field.hasTerrain("Electric") ? "Electric" : field.hasTerrain("Grassy") ? "Grass" : field.hasTerrain("Misty") ? "Fairy" : field.hasTerrain("Psychic") ? "Psychic" : "Normal";
    desc.terrain = field.terrain;
    if (!(move.named("Nature Power") && attacker.hasAbility("Prankster")) && (defender.types.includes("Dark") || field.hasTerrain("Psychic") && isGrounded(defender, field))) {
      desc.moveType = type;
    }
  } else if (move.named("Aura Wheel")) {
    if (attacker.named("Morpeko")) {
      type = "Electric";
    } else if (attacker.named("Morpeko-Hangry")) {
      type = "Dark";
    }
  } else if (move.named("Raging Bull")) {
    if (attacker.named("Tauros-Paldea-Combat")) {
      type = "Fighting";
    } else if (attacker.named("Tauros-Paldea-Blaze")) {
      type = "Fire";
    } else if (attacker.named("Tauros-Paldea-Aqua")) {
      type = "Water";
    }
    field.defenderSide.isReflect = false;
    field.defenderSide.isLightScreen = false;
    field.defenderSide.isAuroraVeil = false;
  } else if (move.named("Brick Break", "Psychic Fangs")) {
    field.defenderSide.isReflect = false;
    field.defenderSide.isLightScreen = false;
    field.defenderSide.isAuroraVeil = false;
  }
  let hasAteAbilityTypeChange = false;
  let isAerilate = false;
  let isDragonize = false;
  let isPixilate = false;
  let isRefrigerate = false;
  let isLiquidVoice = false;
  const noTypeChange = move.named(
    "Weather Ball",
    "Terrain Pulse",
    "Struggle"
  );
  if (!noTypeChange) {
    const normal = type === "Normal";
    if (isAerilate = attacker.hasAbility("Aerilate") && normal) {
      type = "Flying";
    } else if (isDragonize = attacker.hasAbility("Dragonize") && normal) {
      type = "Dragon";
    } else if (isLiquidVoice = attacker.hasAbility("Liquid Voice") && !!move.flags.sound) {
      type = "Water";
    } else if (isPixilate = attacker.hasAbility("Pixilate") && normal) {
      type = "Fairy";
    } else if (isRefrigerate = attacker.hasAbility("Refrigerate") && normal) {
      type = "Ice";
    }
    if (isAerilate || isDragonize || isPixilate || isRefrigerate) {
      desc.attackerAbility = attacker.ability;
      hasAteAbilityTypeChange = true;
    } else if (isLiquidVoice) {
      desc.attackerAbility = attacker.ability;
    }
  }
  move.type = type;
  const isGhostRevealed = attacker.hasAbility("Scrappy");
  const type1Effectiveness = getMoveEffectiveness(
    gen,
    move,
    defender.types[0],
    isGhostRevealed,
    field.isGravity,
    false
  );
  const type2Effectiveness = defender.types[1] ? getMoveEffectiveness(
    gen,
    move,
    defender.types[1],
    isGhostRevealed,
    field.isGravity,
    false
  ) : 1;
  let typeEffectiveness = type1Effectiveness * type2Effectiveness;
  if (typeEffectiveness === 0 && move.hasType("Ground") && defender.hasItem("Iron Ball") && !defender.hasAbility("Klutz")) {
    typeEffectiveness = 1;
  }
  if (typeEffectiveness === 0) {
    return result;
  }
  if (move.named("Steel Roller") && !field.terrain || move.named("Poltergeist") && !defender.item) {
    return result;
  }
  if (move.hasType("Grass") && defender.hasAbility("Sap Sipper") || move.hasType("Fire") && defender.hasAbility("Flash Fire") || move.hasType("Water") && defender.hasAbility("Dry Skin", "Water Absorb") || move.hasType("Electric") && defender.hasAbility("Lightning Rod", "Motor Drive", "Volt Absorb") || move.hasType("Ground") && !field.isGravity && defender.hasAbility("Levitate", "Eelevate") || move.flags.bullet && defender.hasAbility("Bulletproof") || move.flags.sound && !move.named("Clangorous Soul") && defender.hasAbility("Soundproof") || move.priority > 0 && defender.hasAbility("Queenly Majesty", "Armor Tail") || move.hasType("Ground") && defender.hasAbility("Earth Eater")) {
    desc.defenderAbility = defender.ability;
    return result;
  }
  if (move.priority > 0 && field.hasTerrain("Psychic") && isGrounded(defender, field)) {
    desc.terrain = field.terrain;
    return result;
  }
  desc.HPEVs = getStatDescriptionText(gen, defender, "hp");
  const fixedDamage = handleFixedDamageMoves(attacker, move);
  if (fixedDamage) {
    if (attacker.hasAbility("Parental Bond")) {
      result.damage = [fixedDamage, fixedDamage];
      desc.attackerAbility = attacker.ability;
    } else {
      result.damage = fixedDamage;
    }
    return result;
  }
  if (move.named("Final Gambit")) {
    result.damage = attacker.curHP();
    return result;
  }
  if (move.hits > 1) {
    desc.hits = move.hits;
  }
  const turnOrder = attacker.stats.spe > defender.stats.spe ? "first" : "last";
  const basePower = calculateBasePowerChampions(
    gen,
    attacker,
    defender,
    move,
    field,
    hasAteAbilityTypeChange,
    desc
  );
  if (basePower === 0) {
    return result;
  }
  const attack = calculateAttackChampions(gen, attacker, defender, move, field, desc, isCritical);
  const defense = calculateDefenseChampions(gen, attacker, defender, move, field, desc, isCritical);
  const hitsPhysical = move.overrideDefensiveStat === "def" || move.category === "Physical";
  const defenseStat = hitsPhysical ? "def" : "spd";
  const baseDamage = calculateBaseDamageChampions(
    gen,
    attacker,
    defender,
    basePower,
    attack,
    defense,
    move,
    field,
    desc,
    isCritical
  );
  if (attacker.hasAbility("Gale Wings") && move.hasType("Flying") && attacker.curHP() === attacker.maxHP()) {
    move.priority = 1;
    desc.attackerAbility = attacker.ability;
  }
  let stabMod = getStabMod(attacker, move, desc);
  const applyBurn = attacker.hasStatus("brn") && move.category === "Physical" && !attacker.hasAbility("Guts") && !move.named("Facade");
  desc.isBurned = applyBurn;
  const finalMods = calculateFinalModsChampions(
    gen,
    attacker,
    defender,
    move,
    field,
    desc,
    isCritical,
    typeEffectiveness
  );
  let protect = false;
  if (field.defenderSide.isProtected && (attacker.hasAbility("Unseen Fist", "Piercing Drill") && move.flags.contact)) {
    protect = true;
    desc.isProtected = true;
  }
  const finalMod = chainMods(finalMods, 41, 131072);
  const isSpread = field.gameType !== "Singles" && ["allAdjacent", "allAdjacentFoes"].includes(move.target);
  let childDamage;
  if (attacker.hasAbility("Parental Bond") && move.hits === 1 && !isSpread) {
    const child = attacker.clone();
    child.ability = "Parental Bond (Child)";
    checkMultihitBoost(gen, child, defender, move, field, desc);
    childDamage = calculateChampions(gen, child, defender, move, field).damage;
    desc.attackerAbility = attacker.ability;
  }
  const damage = [];
  for (let i = 0; i < 16; i++) {
    damage[i] = getFinalDamage(baseDamage, i, typeEffectiveness, applyBurn, stabMod, finalMod, protect);
  }
  result.damage = childDamage ? [damage, childDamage] : damage;
  if (move.timesUsed > 1 || move.hits > 1) {
    const origDefBoost = desc.defenseBoost;
    const origAtkBoost = desc.attackBoost;
    let numAttacks = 1;
    if (move.timesUsed > 1) {
      desc.moveTurns = `over ${move.timesUsed} turns`;
      numAttacks = move.timesUsed;
    } else {
      numAttacks = move.hits;
    }
    let usedItems = [false, false];
    const damageMatrix = [damage];
    for (let times = 1; times < numAttacks; times++) {
      usedItems = checkMultihitBoost(
        gen,
        attacker,
        defender,
        move,
        field,
        desc,
        usedItems[0],
        usedItems[1]
      );
      const newAttack = calculateAttackChampions(
        gen,
        attacker,
        defender,
        move,
        field,
        desc,
        isCritical
      );
      const newDefense = calculateDefenseChampions(
        gen,
        attacker,
        defender,
        move,
        field,
        desc,
        isCritical
      );
      hasAteAbilityTypeChange = hasAteAbilityTypeChange && attacker.hasAbility("Aerilate", "Dragonize", "Pixilate", "Refrigerate");
      if (move.timesUsed > 1) {
        stabMod = getStabMod(attacker, move, desc);
      }
      const newBasePower = calculateBasePowerChampions(
        gen,
        attacker,
        defender,
        move,
        field,
        hasAteAbilityTypeChange,
        desc,
        times + 1
      );
      const newBaseDamage = calculateBaseDamageChampions(
        gen,
        attacker,
        defender,
        newBasePower,
        newAttack,
        newDefense,
        move,
        field,
        desc,
        isCritical
      );
      const newFinalMods = calculateFinalModsChampions(
        gen,
        attacker,
        defender,
        move,
        field,
        desc,
        isCritical,
        typeEffectiveness,
        times
      );
      const newFinalMod = chainMods(newFinalMods, 41, 131072);
      const damageArray = [];
      for (let i = 0; i < 16; i++) {
        const newFinalDamage = getFinalDamage(
          newBaseDamage,
          i,
          typeEffectiveness,
          applyBurn,
          stabMod,
          newFinalMod,
          protect
        );
        damageArray[i] = newFinalDamage;
      }
      damageMatrix[times] = damageArray;
    }
    result.damage = damageMatrix;
    desc.defenseBoost = origDefBoost;
    desc.attackBoost = origAtkBoost;
  }
  return result;
}
function calculateBasePowerChampions(gen, attacker, defender, move, field, hasAteAbilityTypeChange, desc, hit = 1) {
  const turnOrder = attacker.stats.spe > defender.stats.spe ? "first" : "last";
  let basePower;
  switch (move.name) {
    case "Payback":
      basePower = move.bp * (turnOrder === "last" ? 2 : 1);
      desc.moveBP = basePower;
      break;
    case "Electro Ball":
      const r = Math.floor(attacker.stats.spe / defender.stats.spe);
      basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : r >= 1 ? 60 : 40;
      if (defender.stats.spe === 0) basePower = 40;
      desc.moveBP = basePower;
      break;
    case "Gyro Ball":
      basePower = Math.min(150, Math.floor(25 * defender.stats.spe / attacker.stats.spe) + 1);
      if (attacker.stats.spe === 0) basePower = 1;
      desc.moveBP = basePower;
      break;
    case "Punishment":
      basePower = Math.min(200, 60 + 20 * countBoosts(gen, defender.boosts));
      desc.moveBP = basePower;
      break;
    case "Low Kick":
    case "Grass Knot":
      const w = getWeight(defender, desc, "defender");
      basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
      desc.moveBP = basePower;
      break;
    case "Hex":
    case "Infernal Parade":
      basePower = move.bp * (defender.status ? 2 : 1);
      desc.moveBP = basePower;
      break;
    case "Heavy Slam":
    case "Heat Crash":
      const wr = getWeight(attacker, desc, "attacker") / getWeight(defender, desc, "defender");
      basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
      desc.moveBP = basePower;
      break;
    case "Stored Power":
    case "Power Trip":
      basePower = 20 + 20 * countBoosts(gen, attacker.boosts);
      desc.moveBP = basePower;
      break;
    case "Acrobatics":
      basePower = move.bp * (!attacker.item ? 2 : 1);
      desc.moveBP = basePower;
      break;
    case "Assurance":
      basePower = move.bp * (defender.hasAbility("Parental Bond (Child)") ? 2 : 1);
      break;
    case "Smelling Salts":
      basePower = move.bp * (defender.hasStatus("par") ? 2 : 1);
      desc.moveBP = basePower;
      break;
    case "Weather Ball":
      basePower = move.bp * (field.weather || attacker.hasAbility("Mega Sol") ? 2 : 1);
      desc.moveBP = basePower;
      break;
    case "Terrain Pulse":
      basePower = move.bp * (isGrounded(attacker, field) && field.terrain ? 2 : 1);
      desc.moveBP = basePower;
      break;
    case "Rising Voltage":
      basePower = move.bp * (isGrounded(defender, field) && field.hasTerrain("Electric") ? 2 : 1);
      desc.moveBP = basePower;
      break;
    case "Fling":
      basePower = getFlingPower(attacker.item, gen.num);
      desc.moveBP = basePower;
      desc.attackerItem = attacker.item;
      break;
    case "Eruption":
    case "Water Spout":
      basePower = Math.max(1, Math.floor(150 * attacker.curHP() / attacker.maxHP()));
      desc.moveBP = basePower;
      break;
    case "Flail":
    case "Reversal":
      const p = Math.floor(48 * attacker.curHP() / attacker.maxHP());
      basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
      desc.moveBP = basePower;
      break;
    // Triple Axel's damage increases after each consecutive hit (20, 40, 60)
    case "Triple Axel":
      basePower = hit * 20;
      desc.moveBP = move.hits === 2 ? 60 : move.hits === 3 ? 120 : 20;
      break;
    case "Hard Press":
      basePower = 100 * Math.floor(defender.curHP() * 4096 / defender.maxHP());
      basePower = Math.floor(Math.floor((100 * basePower + 2048 - 1) / 4096) / 100) || 1;
      desc.moveBP = basePower;
      break;
    default:
      basePower = move.bp;
  }
  if (basePower === 0) {
    return 0;
  }
  const bpMods = calculateBPModsChampions(
    gen,
    attacker,
    defender,
    move,
    field,
    desc,
    basePower,
    hasAteAbilityTypeChange,
    turnOrder,
    hit
  );
  basePower = OF16(Math.max(1, pokeRound(basePower * chainMods(bpMods, 41, 2097152) / 4096)));
  return basePower;
}
function calculateBPModsChampions(gen, attacker, defender, move, field, desc, basePower, hasAteAbilityTypeChange, turnOrder, hit) {
  const bpMods = [];
  const defenderItem = defender.item && defender.item !== "" ? defender.item : defender.disabledItem;
  let resistedKnockOffDamage = !defenderItem;
  if (!resistedKnockOffDamage && defenderItem) {
    const item = gen.items.get(toID(defenderItem));
    resistedKnockOffDamage = !!(item.megaStone && (item.megaStone[defender.name] || Object.values(item.megaStone).includes(defender.name)));
  }
  if (!resistedKnockOffDamage && hit > 1 && !defender.hasAbility("Sticky Hold")) {
    resistedKnockOffDamage = true;
  }
  if (move.named("Facade") && attacker.hasStatus("brn", "par", "psn", "tox") || move.named("Venoshock") && defender.hasStatus("psn", "tox") || move.named("Lash Out") && countBoosts(gen, attacker.boosts) < 0) {
    bpMods.push(8192);
    desc.moveBP = basePower * 2;
  } else if (move.named("Expanding Force") && isGrounded(attacker, field) && field.hasTerrain("Psychic")) {
    move.target = "allAdjacentFoes";
    bpMods.push(6144);
    desc.moveBP = basePower * 1.5;
  } else if (move.named("Knock Off") && !resistedKnockOffDamage || move.named("Misty Explosion") && isGrounded(attacker, field) && field.hasTerrain("Misty") || move.named("Grav Apple") && field.isGravity) {
    bpMods.push(6144);
    desc.moveBP = basePower * 1.5;
  } else if (move.named("Solar Beam", "Solar Blade") && field.hasWeather("Rain", "Sand", "Hail", "Snow") && !attacker.hasAbility("Mega Sol")) {
    bpMods.push(2048);
    desc.moveBP = basePower / 2;
    desc.weather = field.weather;
  }
  if (field.attackerSide.isHelpingHand) {
    bpMods.push(6144);
    desc.isHelpingHand = true;
  }
  const terrainMultiplier = 5325;
  if (isGrounded(attacker, field)) {
    if (field.hasTerrain("Electric") && move.hasType("Electric") || field.hasTerrain("Grassy") && move.hasType("Grass") || field.hasTerrain("Psychic") && move.hasType("Psychic")) {
      bpMods.push(terrainMultiplier);
      desc.terrain = field.terrain;
    }
  }
  if (isGrounded(defender, field)) {
    if (field.hasTerrain("Misty") && move.hasType("Dragon") || field.hasTerrain("Grassy") && move.named("Bulldoze", "Earthquake")) {
      bpMods.push(2048);
      desc.terrain = field.terrain;
    }
  }
  if (attacker.hasAbility("Technician") && basePower <= 60 || attacker.hasAbility("Mega Launcher") && move.flags.pulse || attacker.hasAbility("Strong Jaw") && move.flags.bite || attacker.hasAbility("Sharpness") && move.flags.slicing) {
    bpMods.push(6144);
    desc.attackerAbility = attacker.ability;
  }
  const aura = `${move.type} Aura`;
  const isAttackerAura = attacker.hasAbility(aura);
  const isDefenderAura = defender.hasAbility(aura);
  const isFieldFairyAura = field.isFairyAura && move.type === "Fairy";
  const isFieldDarkAura = field.isDarkAura && move.type === "Dark";
  const auraActive = isAttackerAura || isDefenderAura || isFieldFairyAura || isFieldDarkAura;
  if (auraActive) {
    bpMods.push(5448);
    if (isAttackerAura) desc.attackerAbility = attacker.ability;
    if (isDefenderAura) desc.defenderAbility = defender.ability;
  }
  if (attacker.hasAbility("Sheer Force") && (move.secondaries || move.named("Electro Shot")) || attacker.hasAbility("Sand Force") && field.hasWeather("Sand") && move.hasType("Rock", "Ground", "Steel") || attacker.hasAbility("Analytic") && (turnOrder !== "first" || field.defenderSide.isSwitching === "out" || attacker.abilityOn) || attacker.hasAbility("Tough Claws") && move.flags.contact) {
    bpMods.push(5325);
    desc.attackerAbility = attacker.ability;
  }
  if (attacker.hasAbility("Rivalry") && ![attacker.gender, defender.gender].includes("N")) {
    if (attacker.gender === defender.gender) {
      bpMods.push(5120);
      desc.rivalry = "buffed";
    } else {
      bpMods.push(3072);
      desc.rivalry = "nerfed";
    }
    desc.attackerAbility = attacker.ability;
  }
  if (hasAteAbilityTypeChange) {
    bpMods.push(4915);
  }
  if (attacker.hasAbility("Reckless") && (move.recoil || move.hasCrashDamage) || attacker.hasAbility("Iron Fist") && move.flags.punch) {
    bpMods.push(4915);
    desc.attackerAbility = attacker.ability;
  }
  if (defender.hasAbility("Dry Skin") && move.hasType("Fire")) {
    bpMods.push(5120);
    desc.defenderAbility = defender.ability;
  }
  if (attacker.hasAbility("Supreme Overlord") && attacker.alliesFainted) {
    const powMod = [4096, 4506, 4915, 5325, 5734, 6144];
    bpMods.push(powMod[Math.min(5, attacker.alliesFainted)]);
    desc.attackerAbility = attacker.ability;
    desc.alliesFainted = attacker.alliesFainted;
  }
  if (attacker.item && move.hasType(getItemBoostType(attacker.item))) {
    bpMods.push(4915);
    desc.attackerItem = attacker.item;
  } else if (attacker.hasItem("Muscle Band") && move.category === "Physical" || attacker.hasItem("Wise Glasses") && move.category === "Special") {
    bpMods.push(4505);
    desc.attackerItem = attacker.item;
  }
  return bpMods;
}
function calculateAttackChampions(gen, attacker, defender, move, field, desc, isCritical = false) {
  let attack;
  const attackSource = move.named("Foul Play") ? defender : attacker;
  const attackStat = move.named("Body Press") ? field.isWonderRoom ? "spd" : "def" : move.category === "Special" ? "spa" : "atk";
  desc.attackEVs = move.named("Foul Play") ? getStatDescriptionText(
    gen,
    attackSource,
    attackStat,
    field.defenderSide.isPowerTrick
  ) : getStatDescriptionText(
    gen,
    attackSource,
    attackStat,
    field.attackerSide.isPowerTrick,
    field.isWonderRoom
  );
  if (field.attackerSide.isPowerTrick) {
    if (move.category === "Physical" && !move.named("Foul Play") || move.named("Body Press")) {
      desc.isPowerTrickAttacker = true;
    }
  }
  const boosts = attackSource.boosts[attackStat];
  if (boosts === 0 || isCritical && boosts < 0) {
    attack = attackSource.rawStats[attackStat];
  } else if (defender.hasAbility("Unaware")) {
    attack = attackSource.rawStats[attackStat];
    desc.defenderAbility = defender.ability;
  } else {
    attack = getModifiedStat(attackSource.rawStats[attackStat], boosts);
    desc.attackBoost = boosts;
  }
  if (attacker.hasAbility("Hustle") && move.category === "Physical") {
    attack = pokeRound(attack * 3 / 2);
    desc.attackerAbility = attacker.ability;
  }
  const atMods = calculateAtModsChampions(gen, attacker, defender, move, field, desc);
  attack = OF16(Math.max(1, pokeRound(attack * chainMods(atMods, 410, 131072) / 4096)));
  return attack;
}
function calculateAtModsChampions(gen, attacker, defender, move, field, desc) {
  const atMods = [];
  if (attacker.hasAbility("Solar Power") && field.hasWeather("Sun") && move.category === "Special") {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
    desc.weather = field.weather;
  } else if (attacker.hasAbility("Guts") && attacker.status && move.category === "Physical" || attacker.curHP() <= attacker.maxHP() / 3 && (attacker.hasAbility("Overgrow") && move.hasType("Grass") || attacker.hasAbility("Blaze") && move.hasType("Fire") || attacker.hasAbility("Torrent") && move.hasType("Water") || attacker.hasAbility("Swarm") && move.hasType("Bug")) || move.category === "Special" && attacker.abilityOn && attacker.hasAbility("Plus", "Minus")) {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility("Flash Fire") && attacker.abilityOn && move.hasType("Fire")) {
    atMods.push(6144);
    desc.attackerAbility = "Flash Fire";
  } else if (attacker.hasAbility("Fire Mane") && move.hasType("Fire")) {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility("Water Bubble") && move.hasType("Water") || attacker.hasAbility("Huge Power", "Pure Power") && move.category === "Physical") {
    atMods.push(8192);
    desc.attackerAbility = attacker.ability;
  }
  if (defender.hasAbility("Thick Fat") && move.hasType("Fire", "Ice") || defender.hasAbility("Water Bubble") && move.hasType("Fire") || defender.hasAbility("Purifying Salt") && move.hasType("Ghost")) {
    atMods.push(2048);
    desc.defenderAbility = defender.ability;
  }
  if (defender.hasAbility("Heatproof") && move.hasType("Fire")) {
    atMods.push(2048);
    desc.defenderAbility = defender.ability;
  }
  if (attacker.hasItem("Light Ball") && attacker.name.includes("Pikachu")) {
    atMods.push(8192);
    desc.attackerItem = attacker.item;
  }
  return atMods;
}
function calculateDefenseChampions(gen, attacker, defender, move, field, desc, isCritical = false) {
  let defense;
  const hitsPhysical = move.overrideDefensiveStat === "def" || move.category === "Physical";
  const defenseStat = hitsPhysical ? "def" : "spd";
  desc.defenseEVs = getStatDescriptionText(
    gen,
    defender,
    defenseStat,
    field.defenderSide.isPowerTrick,
    field.isWonderRoom
  );
  if (field.defenderSide.isPowerTrick && field.isWonderRoom !== hitsPhysical) {
    desc.isPowerTrickDefender = true;
  }
  const boosts = defender.boosts[defenseStat];
  if (boosts === 0 || isCritical && boosts > 0 || move.ignoreDefensive) {
    defense = defender.rawStats[defenseStat];
  } else if (attacker.hasAbility("Unaware")) {
    defense = defender.rawStats[defenseStat];
    desc.attackerAbility = attacker.ability;
  } else {
    defense = getModifiedStat(defender.rawStats[defenseStat], boosts);
    desc.defenseBoost = boosts;
  }
  if (!attacker.hasAbility("Mega Sol")) {
    if (field.hasWeather("Sand") && defender.hasType("Rock") && !hitsPhysical) {
      defense = pokeRound(defense * 3 / 2);
      desc.weather = field.weather;
    }
    if (field.hasWeather("Snow") && defender.hasType("Ice") && hitsPhysical) {
      defense = pokeRound(defense * 3 / 2);
      desc.weather = field.weather;
    }
  }
  const dfMods = calculateDfModsChampions(
    gen,
    attacker,
    defender,
    move,
    field,
    desc,
    isCritical,
    hitsPhysical
  );
  return OF16(Math.max(1, pokeRound(defense * chainMods(dfMods, 410, 131072) / 4096)));
}
function calculateDfModsChampions(gen, attacker, defender, move, field, desc, isCritical = false, hitsPhysical = false) {
  const dfMods = [];
  if (defender.hasAbility("Marvel Scale") && defender.status && hitsPhysical) {
    dfMods.push(6144);
    desc.defenderAbility = defender.ability;
  } else if (defender.hasAbility("Fur Coat") && hitsPhysical) {
    dfMods.push(8192);
    desc.defenderAbility = defender.ability;
  }
  return dfMods;
}
function calculateBaseDamageChampions(gen, attacker, defender, basePower, attack, defense, move, field, desc, isCritical = false) {
  let baseDamage = getBaseDamage(attacker.level, basePower, attack, defense);
  const isSpread = field.gameType !== "Singles" && ["allAdjacent", "allAdjacentFoes"].includes(move.target);
  if (isSpread) {
    baseDamage = pokeRound(OF32(baseDamage * 3072) / 4096);
  }
  if (attacker.hasAbility("Parental Bond (Child)")) {
    baseDamage = pokeRound(OF32(baseDamage * 1024) / 4096);
  }
  const isMegaSol = attacker.hasAbility("Mega Sol");
  if ((field.hasWeather("Sun") || isMegaSol) && move.hasType("Fire") || field.hasWeather("Rain") && !isMegaSol && move.hasType("Water")) {
    baseDamage = pokeRound(OF32(baseDamage * 6144) / 4096);
    isMegaSol ? desc.attackerAbility = attacker.ability : desc.weather = field.weather;
  } else if ((field.hasWeather("Sun") || isMegaSol) && move.hasType("Water") || field.hasWeather("Rain") && move.hasType("Fire")) {
    baseDamage = pokeRound(OF32(baseDamage * 2048) / 4096);
    isMegaSol ? desc.attackerAbility = attacker.ability : desc.weather = field.weather;
  }
  if (isCritical) {
    baseDamage = Math.floor(OF32(baseDamage * 1.5));
    desc.isCritical = isCritical;
  }
  return baseDamage;
}
function calculateFinalModsChampions(gen, attacker, defender, move, field, desc, isCritical = false, typeEffectiveness, hitCount = 0) {
  const finalMods = [];
  if (field.defenderSide.isReflect && move.category === "Physical" && !isCritical && !field.defenderSide.isAuroraVeil) {
    finalMods.push(field.gameType !== "Singles" ? 2732 : 2048);
    desc.isReflect = true;
  } else if (field.defenderSide.isLightScreen && move.category === "Special" && !isCritical && !field.defenderSide.isAuroraVeil) {
    finalMods.push(field.gameType !== "Singles" ? 2732 : 2048);
    desc.isLightScreen = true;
  }
  if (field.defenderSide.isAuroraVeil && !isCritical) {
    finalMods.push(field.gameType !== "Singles" ? 2732 : 2048);
    desc.isAuroraVeil = true;
  }
  if (attacker.hasAbility("Sniper") && isCritical) {
    finalMods.push(6144);
    desc.attackerAbility = attacker.ability;
  }
  if (defender.hasAbility("Multiscale") && defender.curHP() === defender.maxHP() && hitCount === 0 && (!field.defenderSide.isSR && (!field.defenderSide.spikes || defender.hasType("Flying"))) && !attacker.hasAbility("Parental Bond (Child)")) {
    finalMods.push(2048);
    desc.defenderAbility = defender.ability;
  }
  if (defender.hasAbility("Solid Rock", "Filter") && typeEffectiveness > 1) {
    finalMods.push(3072);
    desc.defenderAbility = defender.ability;
  }
  if (field.defenderSide.isFriendGuard) {
    finalMods.push(3072);
    desc.isFriendGuard = true;
  }
  if (attacker.hasItem("Expert Belt") && typeEffectiveness > 1) {
    finalMods.push(4915);
    desc.attackerItem = attacker.item;
  } else if (attacker.hasItem("Life Orb")) {
    finalMods.push(5324);
    desc.attackerItem = attacker.item;
  } else if (attacker.hasItem("Metronome") && move.timesUsedWithMetronome >= 1) {
    const timesUsedWithMetronome = Math.floor(move.timesUsedWithMetronome);
    if (timesUsedWithMetronome <= 4) {
      finalMods.push(4096 + timesUsedWithMetronome * 819);
    } else {
      finalMods.push(8192);
    }
    desc.attackerItem = attacker.item;
  }
  if (move.hasType(getBerryResistType(defender.item)) && (typeEffectiveness > 1 || move.hasType("Normal")) && hitCount === 0 && !attacker.hasAbility("Unnerve")) {
    if (defender.hasAbility("Ripen")) {
      finalMods.push(1024);
    } else {
      finalMods.push(2048);
    }
    desc.defenderItem = defender.item;
  }
  return finalMods;
}

// scripts/.cache/upstream/damage-calc/calc/src/pokemon.ts
var STATS = ["hp", "atk", "def", "spa", "spd", "spe"];
var SPC = /* @__PURE__ */ new Set(["spc"]);
var Pokemon = class _Pokemon {
  constructor(gen, name, options = {}) {
    __publicField(this, "gen");
    __publicField(this, "name");
    __publicField(this, "species");
    __publicField(this, "types");
    __publicField(this, "weightkg");
    __publicField(this, "level");
    __publicField(this, "gender");
    __publicField(this, "ability");
    __publicField(this, "abilityOn");
    __publicField(this, "isDynamaxed");
    __publicField(this, "dynamaxLevel");
    __publicField(this, "alliesFainted");
    __publicField(this, "boostedStat");
    __publicField(this, "item");
    __publicField(this, "disabledItem");
    __publicField(this, "teraType");
    __publicField(this, "nature");
    __publicField(this, "ivs");
    __publicField(this, "evs");
    __publicField(this, "boosts");
    __publicField(this, "rawStats");
    __publicField(this, "stats");
    __publicField(this, "originalCurHP");
    __publicField(this, "status");
    __publicField(this, "toxicCounter");
    __publicField(this, "moves");
    this.species = extend(true, {}, gen.species.get(toID(name)), options.overrides);
    this.gen = gen;
    this.name = options.name || name;
    this.types = this.species.types;
    this.weightkg = this.species.weightkg;
    this.level = gen.num === 0 ? 50 : options.level || 100;
    this.gender = options.gender || this.species.gender || "M";
    this.ability = options.ability || this.species.abilities?.[0] || void 0;
    this.abilityOn = !!options.abilityOn;
    this.isDynamaxed = !!options.isDynamaxed;
    this.dynamaxLevel = this.isDynamaxed ? options.dynamaxLevel === void 0 ? 10 : options.dynamaxLevel : void 0;
    this.alliesFainted = options.alliesFainted;
    this.boostedStat = options.boostedStat;
    this.teraType = options.teraType;
    this.item = options.item;
    this.nature = options.nature || "Serious";
    this.ivs = _Pokemon.withDefault(gen, gen.num === 0 ? {} : options.ivs, 31);
    this.evs = _Pokemon.withDefault(gen, options.evs, gen.num === 0 || gen.num >= 3 ? 0 : 252);
    this.boosts = _Pokemon.withDefault(gen, options.boosts, 0, false);
    if (this.weightkg === 0 && !this.isDynamaxed && this.species.baseSpecies) {
      this.weightkg = gen.species.get(toID(this.species.baseSpecies)).weightkg;
    }
    if (gen.num > 0 && gen.num < 3) {
      this.ivs.hp = Stats.DVToIV(
        Stats.getHPDV({
          atk: this.ivs.atk,
          def: this.ivs.def,
          spe: this.ivs.spe,
          spc: this.ivs.spa
        })
      );
    }
    this.rawStats = {};
    this.stats = {};
    for (const stat of STATS) {
      const val = this.calcStat(gen, stat);
      this.rawStats[stat] = val;
      this.stats[stat] = val;
    }
    const curHP = options.curHP || options.originalCurHP;
    this.originalCurHP = curHP && curHP <= this.rawStats.hp ? curHP : this.rawStats.hp;
    this.status = options.status || "";
    this.toxicCounter = options.toxicCounter || 0;
    this.moves = options.moves || [];
  }
  maxHP(original = false) {
    if (!original && this.isDynamaxed && this.species.baseStats.hp !== 1) {
      return Math.floor(this.rawStats.hp * (150 + 5 * this.dynamaxLevel) / 100);
    }
    return this.rawStats.hp;
  }
  curHP(original = false) {
    if (!original && this.isDynamaxed && this.species.baseStats.hp !== 1) {
      return Math.ceil(this.originalCurHP * (150 + 5 * this.dynamaxLevel) / 100);
    }
    return this.originalCurHP;
  }
  hasAbility(...abilities) {
    return !!(this.ability && abilities.includes(this.ability));
  }
  hasItem(...items) {
    return !!(this.item && items.includes(this.item));
  }
  hasStatus(...statuses) {
    return !!(this.status && statuses.includes(this.status));
  }
  hasType(...types) {
    for (const type of types) {
      if (this.teraType && this.teraType !== "Stellar" ? this.teraType === type : this.types.includes(type)) {
        return true;
      }
    }
    return false;
  }
  /** Ignores Tera type */
  hasOriginalType(...types) {
    for (const type of types) {
      if (this.types.includes(type)) return true;
    }
    return false;
  }
  named(...names) {
    return names.includes(this.name);
  }
  clone() {
    return new _Pokemon(this.gen, this.name, {
      level: this.level,
      ability: this.ability,
      abilityOn: this.abilityOn,
      isDynamaxed: this.isDynamaxed,
      dynamaxLevel: this.dynamaxLevel,
      alliesFainted: this.alliesFainted,
      boostedStat: this.boostedStat,
      item: this.item,
      gender: this.gender,
      nature: this.nature,
      ivs: extend(true, {}, this.ivs),
      evs: extend(true, {}, this.evs),
      boosts: extend(true, {}, this.boosts),
      originalCurHP: this.originalCurHP,
      status: this.status,
      teraType: this.teraType,
      toxicCounter: this.toxicCounter,
      moves: this.moves.slice(),
      overrides: this.species
    });
  }
  calcStat(gen, stat) {
    return Stats.calcStat(
      gen,
      stat,
      this.species.baseStats[stat],
      this.ivs[stat],
      this.evs[stat],
      this.level,
      this.nature
    );
  }
  static getForme(gen, speciesName, item, moveName) {
    const species = gen.species.get(toID(speciesName));
    if (!species?.otherFormes) {
      return speciesName;
    }
    let i = 0;
    if (item && (item.includes("ite") && !item.includes("ite Y") || speciesName === "Groudon" && item === "Red Orb" || speciesName === "Kyogre" && item === "Blue Orb") || moveName && speciesName === "Meloetta" && moveName === "Relic Song" || speciesName === "Rayquaza" && moveName === "Dragon Ascent") {
      i = 1;
    } else if (item?.includes("ite Y")) {
      i = 2;
    }
    return i ? species.otherFormes[i - 1] : species.name;
  }
  static withDefault(gen, current, val, match = true) {
    const cur = {};
    if (current) {
      assignWithout(cur, current, SPC);
      if (current.spc !== void 0) {
        cur.spa = current.spc;
        cur.spd = current.spc;
      }
      if (match && gen.num > 0 && gen.num <= 2 && current.spa !== current.spd) {
        throw new Error("Special Attack and Special Defense must match in Gen 1 and Gen 2");
      }
    }
    return { hp: val, atk: val, def: val, spa: val, spd: val, spe: val, ...cur };
  }
};

// scripts/.cache/upstream/damage-calc/calc/src/move.ts
var Move = class _Move {
  constructor(gen, name, options = {}) {
    __publicField(this, "gen");
    __publicField(this, "name");
    __publicField(this, "originalName");
    __publicField(this, "ability");
    __publicField(this, "item");
    __publicField(this, "species");
    __publicField(this, "overrides");
    __publicField(this, "hits");
    __publicField(this, "timesUsed");
    __publicField(this, "timesUsedWithMetronome");
    __publicField(this, "bp");
    __publicField(this, "type");
    __publicField(this, "category");
    __publicField(this, "flags");
    __publicField(this, "secondaries");
    __publicField(this, "target");
    __publicField(this, "recoil");
    __publicField(this, "hasCrashDamage");
    __publicField(this, "mindBlownRecoil");
    __publicField(this, "struggleRecoil");
    __publicField(this, "isCrit");
    __publicField(this, "isStellarFirstUse");
    __publicField(this, "drain");
    __publicField(this, "priority");
    __publicField(this, "dropsStats");
    __publicField(this, "ignoreDefensive");
    __publicField(this, "overrideOffensiveStat");
    __publicField(this, "overrideDefensiveStat");
    __publicField(this, "overrideOffensivePokemon");
    __publicField(this, "overrideDefensivePokemon");
    __publicField(this, "breaksProtect");
    __publicField(this, "isZ");
    __publicField(this, "isMax");
    __publicField(this, "multiaccuracy");
    name = options.name || name;
    this.originalName = name;
    let data = extend(true, { name }, gen.moves.get(toID(name)), options.overrides);
    this.hits = 1;
    if (options.useMax && data.maxMove) {
      const maxMoveName = getMaxMoveName(
        data.type,
        data.name,
        options.species,
        !!(data.category === "Status"),
        options.ability
      );
      const maxMove = gen.moves.get(toID(maxMoveName));
      const maxPower = () => {
        if (["G-Max Drum Solo", "G-Max Fire Ball", "G-Max Hydrosnipe"].includes(maxMoveName)) {
          return 160;
        }
        if (maxMove.basePower === 10 || maxMoveName === "Max Flare") {
          return data.maxMove.basePower;
        }
        return maxMove.basePower;
      };
      data = extend(true, {}, maxMove, {
        name: maxMoveName,
        basePower: maxPower(),
        category: data.category
      });
    }
    if (options.useZ && data.zMove?.basePower) {
      const zMoveName = getZMoveName(data.name, data.type, options.item);
      const zMove = gen.moves.get(toID(zMoveName));
      data = extend(true, {}, zMove, {
        name: zMoveName,
        basePower: zMove.basePower === 1 ? data.zMove.basePower : zMove.basePower,
        category: data.category
      });
    } else {
      if (data.multihit) {
        if (data.multiaccuracy && typeof data.multihit === "number") {
          this.hits = options.hits || data.multihit;
        } else {
          if (typeof data.multihit === "number") {
            this.hits = data.multihit;
          } else if (options.hits) {
            this.hits = options.hits;
          } else {
            this.hits = options.ability === "Skill Link" ? data.multihit[1] : data.multihit[0] + 1;
          }
        }
      }
      this.timesUsedWithMetronome = options.timesUsedWithMetronome;
    }
    this.gen = gen;
    this.name = data.name;
    this.ability = options.ability;
    this.item = options.item;
    this.overrides = options.overrides;
    this.species = options.species;
    this.bp = data.basePower;
    const typelessDamage = (gen.num === 0 || gen.num >= 2) && data.id === "struggle" || gen.num > 0 && gen.num <= 4 && ["futuresight", "doomdesire"].includes(data.id);
    this.type = typelessDamage ? "???" : data.type;
    this.category = data.category || "Status";
    const stat = this.category === "Special" ? "spa" : "atk";
    if (data.self?.boosts && data.self.boosts[stat] && data.self.boosts[stat] < 0) {
      this.dropsStats = Math.abs(data.self.boosts[stat]);
    }
    this.timesUsed = options.timesUsed || 1;
    this.secondaries = data.secondaries;
    this.target = data.target || "any";
    this.recoil = data.recoil;
    this.hasCrashDamage = !!data.hasCrashDamage;
    this.mindBlownRecoil = !!data.mindBlownRecoil;
    this.struggleRecoil = !!data.struggleRecoil;
    this.isCrit = !!options.isCrit || !!data.willCrit || // These don't *always* crit (255/256 chance), but for the purposes of the calc they do
    gen.num === 1 && ["crabhammer", "razorleaf", "slash", "karate chop"].includes(data.id);
    this.isStellarFirstUse = !!options.isStellarFirstUse;
    this.drain = data.drain;
    this.flags = data.flags;
    this.priority = data.priority || 0;
    this.ignoreDefensive = !!data.ignoreDefensive;
    this.overrideOffensiveStat = data.overrideOffensiveStat;
    this.overrideDefensiveStat = data.overrideDefensiveStat;
    this.overrideOffensivePokemon = data.overrideOffensivePokemon;
    this.overrideDefensivePokemon = data.overrideDefensivePokemon;
    this.breaksProtect = !!data.breaksProtect;
    this.isZ = !!data.isZ;
    this.isMax = !!data.isMax;
    this.multiaccuracy = !!data.multiaccuracy;
    if (!this.bp) {
      if (["return", "frustration", "pikapapow", "veeveevolley"].includes(data.id)) {
        this.bp = 102;
      }
    }
  }
  named(...names) {
    return names.includes(this.name);
  }
  hasType(...types) {
    return types.includes(this.type);
  }
  clone() {
    return new _Move(this.gen, this.originalName, {
      ability: this.ability,
      item: this.item,
      species: this.species,
      isCrit: this.isCrit,
      isStellarFirstUse: this.isStellarFirstUse,
      hits: this.hits,
      timesUsed: this.timesUsed,
      timesUsedWithMetronome: this.timesUsedWithMetronome,
      overrides: this.overrides
    });
  }
};
// scripts/.cache/upstream/damage-calc/calc/src/field.ts
var Field = class _Field {
  constructor(field = {}) {
    __publicField(this, "gameType");
    __publicField(this, "weather");
    __publicField(this, "terrain");
    __publicField(this, "isMagicRoom");
    __publicField(this, "isWonderRoom");
    __publicField(this, "isGravity");
    __publicField(this, "isAuraBreak");
    __publicField(this, "isFairyAura");
    __publicField(this, "isDarkAura");
    __publicField(this, "isBeadsOfRuin");
    __publicField(this, "isSwordOfRuin");
    __publicField(this, "isTabletsOfRuin");
    __publicField(this, "isVesselOfRuin");
    __publicField(this, "attackerSide");
    __publicField(this, "defenderSide");
    this.gameType = field.gameType || "Singles";
    this.terrain = field.terrain;
    this.weather = field.weather;
    this.isMagicRoom = !!field.isMagicRoom;
    this.isWonderRoom = !!field.isWonderRoom;
    this.isGravity = !!field.isGravity;
    this.isAuraBreak = field.isAuraBreak || false;
    this.isFairyAura = field.isFairyAura || false;
    this.isDarkAura = field.isDarkAura || false;
    this.isBeadsOfRuin = field.isBeadsOfRuin || false;
    this.isSwordOfRuin = field.isSwordOfRuin || false;
    this.isTabletsOfRuin = field.isTabletsOfRuin || false;
    this.isVesselOfRuin = field.isVesselOfRuin || false;
    this.attackerSide = new Side(field.attackerSide || {});
    this.defenderSide = new Side(field.defenderSide || {});
  }
  hasWeather(...weathers) {
    return !!(this.weather && weathers.includes(this.weather));
  }
  hasTerrain(...terrains) {
    return !!(this.terrain && terrains.includes(this.terrain));
  }
  swap() {
    [this.attackerSide, this.defenderSide] = [this.defenderSide, this.attackerSide];
    return this;
  }
  clone() {
    return new _Field({
      gameType: this.gameType,
      weather: this.weather,
      terrain: this.terrain,
      isMagicRoom: this.isMagicRoom,
      isWonderRoom: this.isWonderRoom,
      isGravity: this.isGravity,
      attackerSide: this.attackerSide,
      defenderSide: this.defenderSide,
      isAuraBreak: this.isAuraBreak,
      isDarkAura: this.isDarkAura,
      isFairyAura: this.isFairyAura,
      isBeadsOfRuin: this.isBeadsOfRuin,
      isSwordOfRuin: this.isSwordOfRuin,
      isTabletsOfRuin: this.isTabletsOfRuin,
      isVesselOfRuin: this.isVesselOfRuin
    });
  }
};
var Side = class _Side {
  constructor(side = {}) {
    __publicField(this, "spikes");
    __publicField(this, "steelsurge");
    __publicField(this, "vinelash");
    __publicField(this, "wildfire");
    __publicField(this, "cannonade");
    __publicField(this, "volcalith");
    __publicField(this, "isSR");
    __publicField(this, "isReflect");
    __publicField(this, "isLightScreen");
    __publicField(this, "isProtected");
    __publicField(this, "isSeeded");
    __publicField(this, "isSaltCured");
    __publicField(this, "isForesight");
    __publicField(this, "isTailwind");
    __publicField(this, "isHelpingHand");
    __publicField(this, "isFlowerGift");
    __publicField(this, "isPowerTrick");
    __publicField(this, "isFriendGuard");
    __publicField(this, "isAuroraVeil");
    __publicField(this, "isBattery");
    __publicField(this, "isPowerSpot");
    __publicField(this, "isSteelySpirit");
    __publicField(this, "isSwitching");
    this.spikes = side.spikes || 0;
    this.steelsurge = !!side.steelsurge;
    this.vinelash = !!side.vinelash;
    this.wildfire = !!side.wildfire;
    this.cannonade = !!side.cannonade;
    this.volcalith = !!side.volcalith;
    this.isSR = !!side.isSR;
    this.isReflect = !!side.isReflect;
    this.isLightScreen = !!side.isLightScreen;
    this.isProtected = !!side.isProtected;
    this.isSeeded = !!side.isSeeded;
    this.isSaltCured = !!side.isSaltCured;
    this.isForesight = !!side.isForesight;
    this.isTailwind = !!side.isTailwind;
    this.isHelpingHand = !!side.isHelpingHand;
    this.isFlowerGift = !!side.isFlowerGift;
    this.isPowerTrick = !!side.isPowerTrick;
    this.isFriendGuard = !!side.isFriendGuard;
    this.isAuroraVeil = !!side.isAuroraVeil;
    this.isBattery = !!side.isBattery;
    this.isPowerSpot = !!side.isPowerSpot;
    this.isSteelySpirit = !!side.isSteelySpirit;
    this.isSwitching = side.isSwitching;
  }
  clone() {
    return new _Side(this);
  }
};
export {
  Field,
  Move,
  Pokemon,
  Result,
  Side,
  calculateChampions
};
