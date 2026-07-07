/**
 * Damage Calculator library.
 *
 * Wraps the compiled NCP-VGC-Damage-Calculator engine.
 * All data (species, moves, abilities, items) comes from the project's own data.
 * The adapter converts our data format into the format expected by the NCP calculator.
 */

let calcModule = null;
let calcPromise = null;

async function loadCalc() {
  if (calcModule) return calcModule;
  if (calcPromise) return calcPromise;

  calcPromise = (async () => {
    try {
      calcModule = await import("../data/damage-calc.js");
      return calcModule;
    } catch (err) {
      console.error("Failed to load damage calculator:", err);
      calcPromise = null;
      throw err;
    }
  })();

  return calcPromise;
}

function toID(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Stat index constants (matching NCP calculator)
const AT = 0,
  DF = 1,
  SA = 2,
  SD = 3,
  SP = 4;
const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];

// --- Inline type chart (Champions = SS/SM/XY) ---
const TYPE_CHART = {
  Normal: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 0.5,
    Ghost: 0,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
  },
  Fire: {
    Normal: 1,
    Fire: 0.5,
    Water: 0.5,
    Electric: 1,
    Grass: 2,
    Ice: 2,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 2,
    Rock: 0.5,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 2,
    Fairy: 1,
  },
  Water: {
    Normal: 1,
    Fire: 2,
    Water: 0.5,
    Electric: 1,
    Grass: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 2,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 2,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
  },
  Electric: {
    Normal: 1,
    Fire: 1,
    Water: 2,
    Electric: 0.5,
    Grass: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 0,
    Flying: 2,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
  },
  Grass: {
    Normal: 1,
    Fire: 0.5,
    Water: 2,
    Electric: 1,
    Grass: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 0.5,
    Ground: 2,
    Flying: 0.5,
    Psychic: 1,
    Bug: 0.5,
    Rock: 2,
    Ghost: 1,
    Dragon: 0.5,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
  },
  Ice: {
    Normal: 1,
    Fire: 0.5,
    Water: 0.5,
    Electric: 1,
    Grass: 2,
    Ice: 0.5,
    Fighting: 1,
    Poison: 1,
    Ground: 2,
    Flying: 2,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
  },
  Fighting: {
    Normal: 2,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 2,
    Fighting: 1,
    Poison: 0.5,
    Ground: 1,
    Flying: 0.5,
    Psychic: 0.5,
    Bug: 0.5,
    Rock: 2,
    Ghost: 0,
    Dragon: 1,
    Dark: 2,
    Steel: 2,
    Fairy: 0.5,
  },
  Poison: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 2,
    Ice: 1,
    Fighting: 1,
    Poison: 0.5,
    Ground: 0.5,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 0.5,
    Ghost: 0.5,
    Dragon: 1,
    Dark: 1,
    Steel: 0,
    Fairy: 2,
  },
  Ground: {
    Normal: 1,
    Fire: 2,
    Water: 1,
    Electric: 2,
    Grass: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 2,
    Ground: 1,
    Flying: 0,
    Psychic: 1,
    Bug: 0.5,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 2,
    Fairy: 1,
  },
  Flying: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 0.5,
    Grass: 2,
    Ice: 1,
    Fighting: 2,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 2,
    Rock: 0.5,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
  },
  Psychic: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 2,
    Poison: 2,
    Ground: 1,
    Flying: 1,
    Psychic: 0.5,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 0,
    Steel: 0.5,
    Fairy: 1,
  },
  Bug: {
    Normal: 1,
    Fire: 0.5,
    Water: 1,
    Electric: 1,
    Grass: 2,
    Ice: 1,
    Fighting: 0.5,
    Poison: 0.5,
    Ground: 1,
    Flying: 0.5,
    Psychic: 2,
    Bug: 1,
    Rock: 1,
    Ghost: 0.5,
    Dragon: 1,
    Dark: 2,
    Steel: 0.5,
    Fairy: 0.5,
  },
  Rock: {
    Normal: 1,
    Fire: 2,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 2,
    Fighting: 0.5,
    Poison: 1,
    Ground: 0.5,
    Flying: 2,
    Psychic: 1,
    Bug: 2,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
  },
  Ghost: {
    Normal: 0,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 2,
    Bug: 1,
    Rock: 1,
    Ghost: 2,
    Dragon: 1,
    Dark: 0.5,
    Steel: 1,
    Fairy: 1,
  },
  Dragon: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 1,
    Steel: 0.5,
    Fairy: 0,
  },
  Dark: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 0.5,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 2,
    Bug: 1,
    Rock: 1,
    Ghost: 2,
    Dragon: 1,
    Dark: 0.5,
    Steel: 0.5,
    Fairy: 0.5,
  },
  Steel: {
    Normal: 1,
    Fire: 0.5,
    Water: 0.5,
    Electric: 0.5,
    Grass: 1,
    Ice: 2,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 2,
  },
  Fairy: {
    Normal: 1,
    Fire: 0.5,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 2,
    Poison: 0.5,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 2,
    Steel: 0.5,
    Fairy: 1,
  },
};

// --- Inline natures ---
const NATURES_DATA = {
  Adamant: ["atk", "spa"],
  Bashful: ["spa", "spa"],
  Bold: ["def", "atk"],
  Brave: ["atk", "spe"],
  Calm: ["spd", "atk"],
  Careful: ["spd", "spa"],
  Docile: ["def", "def"],
  Gentle: ["spd", "def"],
  Hardy: ["atk", "atk"],
  Hasty: ["spe", "def"],
  Impish: ["def", "spa"],
  Jolly: ["spe", "spa"],
  Lax: ["def", "spd"],
  Lonely: ["atk", "def"],
  Mild: ["spa", "def"],
  Modest: ["spa", "atk"],
  Naive: ["spe", "spd"],
  Naughty: ["atk", "spd"],
  Quiet: ["spa", "spe"],
  Quirky: ["spd", "spd"],
  Rash: ["spa", "spd"],
  Relaxed: ["def", "spe"],
  Sassy: ["spd", "spe"],
  Serious: ["spe", "spe"],
  Timid: ["spe", "atk"],
};

// --- Adapter classes ---

class SpeciesAdapter {
  constructor(pokedex) {
    this._map = {};
    for (const id in pokedex) {
      const d = pokedex[id];
      const name = d.na || d.n;
      const types = (d.t || []).map(capitalize);
      const bs = d.bs || {};
      this._map[id] = {
        kind: "Species",
        id,
        name,
        types,
        baseStats: {
          hp: bs.hp || 0,
          atk: bs.atk || 0,
          def: bs.def || 0,
          spa: bs.spa || 0,
          spd: bs.spd || 0,
          spe: bs.spe || 0,
        },
        weightkg: d.weightkg || 0,
        gender: d.gender,
        nfe: d.nfe,
        abilities: d.a && d.a.length ? { 0: d.a[0].name } : undefined,
        baseSpecies: d.bsp || undefined,
        otherFormes: d.otherFormes,
      };
    }
  }

  get(id) {
    return this._map[id];
  }

  *[Symbol.iterator]() {
    for (const id in this._map) {
      yield this._map[id];
    }
  }
}

class MovesAdapter {
  constructor(moves) {
    this._map = {};
    for (const id in moves) {
      const d = moves[id];
      const flags = {};
      // Map project flags to NCP calculator MoveFlags
      if (d.flags) {
        if (d.flags.contact) flags.contact = 1;
        if (d.flags.bite) flags.bite = 1;
        if (d.flags.sound) flags.sound = 1;
        if (d.flags.punch) flags.punch = 1;
        if (d.flags.bullet) flags.bullet = 1;
        if (d.flags.pulse) flags.pulse = 1;
        if (d.flags.slicing) flags.slicing = 1;
        if (d.flags.wind) flags.wind = 1;
      }
      this._map[id] = {
        kind: "Move",
        id,
        name: d.name,
        basePower: d.basePower || 0,
        type: d.type,
        category: d.category,
        flags,
        target: d.target,
        priority: d.priority || 0,
        secondaries: d.secondaries,
        recoil: d.recoil,
        drain: d.drain,
        multihit: d.multihit,
        willCrit: d.willCrit,
        hasCrashDamage: d.hasCrashDamage,
        mindBlownRecoil: d.mindBlownRecoil,
        struggleRecoil: d.struggleRecoil,
        self: d.self,
        ignoreDefensive: d.ignoreDefensive,
        overrideOffensiveStat: d.overrideOffensiveStat,
        overrideDefensiveStat: d.overrideDefensiveStat,
        overrideOffensivePokemon: d.overrideOffensivePokemon,
        overrideDefensivePokemon: d.overrideDefensivePokemon,
        breaksProtect: d.breaksProtect,
        isZ: d.isZ,
        isMax: d.isMax,
        multiaccuracy: d.multiaccuracy,
      };
    }
  }

  get(id) {
    return this._map[id];
  }

  *[Symbol.iterator]() {
    for (const id in this._map) {
      yield this._map[id];
    }
  }
}

class AbilitiesAdapter {
  constructor(abilities) {
    this._map = {};
    for (const id in abilities) {
      const d = abilities[id];
      this._map[id] = {
        kind: "Ability",
        id,
        name: d.name,
      };
    }
  }

  get(id) {
    return this._map[id];
  }

  *[Symbol.iterator]() {
    for (const id in this._map) {
      yield this._map[id];
    }
  }
}

class ItemsAdapter {
  constructor(items) {
    this._map = {};
    for (const id in items) {
      const d = items[id];
      this._map[id] = {
        kind: "Item",
        id,
        name: d.name,
        megaStone: d.megaStone,
        isBerry: d.isBerry,
        naturalGift: d.naturalGift,
      };
    }
  }

  get(id) {
    return this._map[id];
  }

  *[Symbol.iterator]() {
    for (const id in this._map) {
      yield this._map[id];
    }
  }
}

class TypesAdapter {
  constructor() {
    this._map = {};
    for (const name in TYPE_CHART) {
      const id = toID(name);
      this._map[id] = {
        kind: "Type",
        id,
        name,
        effectiveness: TYPE_CHART[name],
      };
    }
  }

  get(id) {
    return this._map[id];
  }

  *[Symbol.iterator]() {
    for (const id in this._map) {
      yield this._map[id];
    }
  }
}

class NaturesAdapter {
  constructor() {
    this._map = {};
    for (const name in NATURES_DATA) {
      const [plus, minus] = NATURES_DATA[name];
      const id = toID(name);
      this._map[id] = {
        kind: "Nature",
        id,
        name,
        plus: plus !== minus ? plus : undefined,
        minus: plus !== minus ? minus : undefined,
      };
    }
  }

  get(id) {
    return this._map[id];
  }

  *[Symbol.iterator]() {
    for (const id in this._map) {
      yield this._map[id];
    }
  }
}

// --- Generation adapter ---

class Generation {
  constructor(pokedex, moves, abilities, items) {
    this.num = 0;
    this.species = new SpeciesAdapter(pokedex);
    this.moves = new MovesAdapter(moves);
    this.abilities = new AbilitiesAdapter(abilities);
    this.items = new ItemsAdapter(items);
    this.types = new TypesAdapter();
    this.natures = new NaturesAdapter();
  }
}

// --- NCP Calculator Data Conversion ---

function convertToNcpPokemon(pokemon, speciesData, gen) {
  /**
   * Converts our Pokemon format to the NCP calculator's Pokemon object format.
   * NCP expects:
   *   name, type1, type2, ability, item, level, nature,
   *   rawStats: [hp, atk, def, spa, spd, spe],
   *   stats: [hp, atk, def, spa, spd, spe],
   *   boosts: [0,0,0,0,0,0],
   *   moves: [{name, ...}, ...],
   *   curHP, maxHP, HPEVs, HPSPs, HPraw, HPIVs,
   *   tera_type, isTerastalize, isDynamax, gmax_factor,
   *   status, weight, gender, isTransformed, highestStat, paradoxAbilityBoost
   */
  if (!speciesData) return null;

  const name = speciesData.name;
  const types = speciesData.types || [];
  const bs = speciesData.baseStats || {};

  // Calculate stats at level 50
  const level = pokemon.level || 50;
  const sp = pokemon.sp || {};
  const nature = pokemon.nature || "Serious";
  const [plusStat, minusStat] = NATURES_DATA[nature] || ["", ""];

  const calcStat = (statName, base, sp) => {
    const spVal = sp || 0;
    let stat = Math.floor(Math.floor(((2 * base + 31) * level) / 100) + 5 + spVal);
    if (statName === "hp") stat += level + 5;
    if (plusStat === statName) stat = Math.floor(stat * 1.1);
    else if (minusStat === statName) stat = Math.floor(stat * 0.9);
    return stat;
  };

  const hpBase = bs.hp || 0;
  const hp = calcStat("hp", hpBase, sp.hp || 0);
  const atk = calcStat("atk", bs.atk || 0, sp.atk || 0);
  const def = calcStat("def", bs.def || 0, sp.def || 0);
  const spa = calcStat("spa", bs.spa || 0, sp.spa || 0);
  const spd = calcStat("spd", bs.spd || 0, sp.spd || 0);
  const spe = calcStat("spe", bs.spe || 0, sp.spe || 0);

  // NCP expects 5-element [atk, def, spa, spd, spe] (no HP — AT=0, DF=1, SA=2, SD=3, SP=4)
  const rawStats = [atk, def, spa, spd, spe];
  const boosts = [0, 0, 0, 0, 0];

  // Apply boosts if provided
  if (pokemon.boosts) {
    const boostMap = { atk: 0, def: 1, spa: 2, spd: 3, spe: 4 };
    for (const [stat, val] of Object.entries(pokemon.boosts)) {
      if (boostMap[stat] !== undefined) boosts[boostMap[stat]] = val;
    }
  }

  // Compute stats with boosts applied (NCP engine reads stats for damage formula)
  const stats = rawStats.map((base, i) => {
    const mod = boosts[i];
    if (mod > 0) return Math.floor(base * (2 + mod) / 2);
    if (mod < 0) return Math.floor(base * 2 / (2 - mod));
    return base;
  });

  // Resolve item name
  const itemName = pokemon.item || "";

  // Resolve ability name
  const abilityName = pokemon.ability || "";

  return {
    name: name,
    type1: types[0] || "Normal",
    type2: types[1] || "",
    ability: abilityName,
    item: itemName,
    level: level,
    nature: nature,
    rawStats: rawStats,
    stats: stats,
    boosts: boosts,
    sps: [sp.atk || 0, sp.def || 0, sp.spa || 0, sp.spd || 0, sp.spe || 0],
    evs: [0, 0, 0, 0, 0],
    ivs: [31, 31, 31, 31, 31],
    HPEVs: 0,
    HPIVs: 31,
    HPSPs: sp.hp || 0,
    HPraw: hp,
    curHP: pokemon.curHP ?? hp,
    maxHP: hp,
    moves: [], // Will be filled in with actual moves
    tera_type: pokemon.teraType || "Normal",
    isTerastalize: !!pokemon.teraType,
    isDynamax: false,
    gmax_factor: false,
    status: pokemon.status || "Healthy",
    weight: speciesData.weightkg || 0,
    gender: speciesData.gender || "",
    isTransformed: false,
    abilityOn: pokemon.abilityOn || false,
    highestStat: -1,
    paradoxAbilityBoost: false,
    hasType: function (...typesToCheck) {
      return typesToCheck.includes(this.type1) || typesToCheck.includes(this.type2);
    },
  };
}

function convertToNcpMove(moveData, attacker) {
  /**
   * Converts our Move format to the NCP calculator's Move object format.
   * NCP expects:
   *   name, bp, type, category, makesContact, isSpread, isSound, isPunch,
   *   isBullet, isPulse, isSlicing, isWind, isHealing, isPriority,
   *   isZ, isSignatureZ, isMax, isCrit, hits, isOHKO,
   *   usedOppMoveIndex, plusEffects, isPlusMove, isPledge, combinePledge,
   *   isIgnoreMode, ignoresScreens, ignoresFriendGuard, dealsPhysicalDamage,
   *   zp, hitRange, name, bp, type, category
   */
  if (!moveData) return null;

  return {
    name: moveData.name,
    bp: moveData.basePower || 0,
    type: moveData.type || "Normal",
    category: moveData.category || "Status",
    makesContact: moveData.flags && moveData.flags.contact ? true : false,
    isSpread: moveData.target && ["allAdjacentFoes", "allAdjacent"].includes(moveData.target),
    isSound: moveData.flags && moveData.flags.sound ? true : false,
    isPunch: moveData.flags && moveData.flags.punch ? true : false,
    isBullet: moveData.flags && moveData.flags.bullet ? true : false,
    isPulse: moveData.flags && moveData.flags.pulse ? true : false,
    isSlicing: moveData.flags && moveData.flags.slicing ? true : false,
    isWind: moveData.flags && moveData.flags.wind ? true : false,
    isHealing: moveData.drain ? true : false,
    isPriority: (moveData.priority || 0) > 0,
    isZ: moveData.isZ || false,
    isSignatureZ: false,
    isMax: moveData.isMax || false,
    isCrit: moveData.willCrit || false,
    hits: moveData.multihit || 1,
    isOHKO: false,
    usedOppMoveIndex: 0,
    plusEffects: null,
    isPlusMove: false,
    isPledge: false,
    combinePledge: "",
    isIgnoreMode: false,
    ignoresScreens: false,
    ignoresFriendGuard: false,
    dealsPhysicalDamage: false,
    zp: 0,
    hitRange: 1,
    recoil: moveData.recoil,
    drain: moveData.drain,
    multihit: moveData.multihit,
    hasCrashDamage: moveData.hasCrashDamage,
    mindBlownRecoil: moveData.mindBlownRecoil,
    struggleRecoil: moveData.struggleRecoil,
    secondaries: moveData.secondaries,
    self: moveData.self,
    ignoreDefensive: moveData.ignoreDefensive,
    overrideOffensiveStat: moveData.overrideOffensiveStat,
    overrideDefensiveStat: moveData.overrideDefensiveStat,
    overrideOffensivePokemon: moveData.overrideOffensivePokemon,
    overrideDefensivePokemon: moveData.overrideDefensivePokemon,
    breaksProtect: moveData.breaksProtect,
    target: moveData.target,
    priority: moveData.priority || 0,
    flags: moveData.flags || {},
  };
}

function convertToNcpField(fieldOptions) {
  /**
   * Converts our field options to the NCP calculator's Field object format.
   * NCP expects a Field object with methods like getSide(), getWeather(), etc.
   */
  const weather = fieldOptions.weather || "";
  const terrain = fieldOptions.terrain || "";

  const attackerSide = fieldOptions.attackerSide || {};
  const defenderSide = fieldOptions.defenderSide || {};

  return {
    weather: weather,
    terrain: terrain,
    isGravity: fieldOptions.isGravity || false,
    isMagicRoom: fieldOptions.isMagicRoom || false,
    isWonderRoom: fieldOptions.isWonderRoom || false,
    isForesight: false,
    isProtect: false,
    isSeaFire: false,
    isGMaxField: false,
    isSaltCure: false,
    isSR: defenderSide.isSR || false,
    spikes: defenderSide.spikes || 0,
    isSteelsurge: defenderSide.isSteelsurge || false,
    gameType: fieldOptions.gameType || "Singles",
    getSide: function (slot) {
      const side = slot === 0 ? attackerSide : defenderSide;
      return {
        isReflect: side.isReflect || false,
        isLightScreen: side.isLightScreen || false,
        isAuroraVeil: side.isAuroraVeil || false,
        isTailwind: side.isTailwind || false,
        isFriendGuard: side.isFriendGuard || false,
        isHelpingHand: side.isHelpingHand || false,
        isPowerSpot: side.isPowerSpot || false,
        isBattery: side.isBattery || false,
        isSteelySpirit: side.isSteelySpirit || false,
        isFlowerGift: side.isFlowerGift || false,
      };
    },
    getWeather: function () {
      return weather;
    },
    getTerrain: function () {
      return terrain;
    },
    getNeutralGas: function () {
      return false;
    },
    getTailwind: function (slot) {
      const side = slot === 0 ? attackerSide : defenderSide;
      return side.isTailwind || false;
    },
    getSwamp: function (slot) {
      return false;
    },
    clearWeather: function () {
      this.weather = "";
    },
  };
}

// --- Data loading ---

let genPromise = null;

async function getGen() {
  if (genPromise) return genPromise;

  genPromise = (async () => {
    const [pokedex, moves, abilitiesMod, itemsMod] = await Promise.all([
      fetch("/pokedex.json").then((r) => r.json()),
      fetch("/moves.json").then((r) => r.json()),
      import("../data/abilities.js"),
      import("../data/items.js"),
    ]);

    return new Generation(pokedex, moves, abilitiesMod.ENTRIES, itemsMod.ENTRIES);
  })();

  return genPromise;
}

// --- Main calculation function ---

export async function calculateDamage(attacker, defender, moveName, fieldOptions = {}, defenderSlot = 1) {
  if (!attacker.name || !defender.name || !moveName) return null;

  const calc = await loadCalc();
  const g = await getGen();

  const atkId = toID(attacker.name);
  const defId = toID(defender.name);
  if (!g.species.get(atkId)) throw new Error(`Unknown Pokemon: ${attacker.name}`);
  if (!g.species.get(defId)) throw new Error(`Unknown Pokemon: ${defender.name}`);

  // Resolve item IDs (lowercase) to display names (NCP expects e.g. "Life Orb" not "lifeorb")
  const resolveItemName = (item) => {
    if (!item) return "";
    const obj = g.items.get(toID(item));
    return obj ? obj.name : item;
  };

  // Build resolved side objects with item names NCP can match
  const resolvedAttacker = {
    ...attacker,
    item: resolveItemName(attacker.item),
  };
  const resolvedDefender = {
    ...defender,
    item: resolveItemName(defender.item),
  };

  const atkSpecies = g.species.get(atkId);
  const defSpecies = g.species.get(defId);
  const moveData = g.moves.get(toID(moveName));

  const ncpAttacker = convertToNcpPokemon(resolvedAttacker, atkSpecies);
  const ncpDefender = convertToNcpPokemon(resolvedDefender, defSpecies);
  const ncpMove = convertToNcpMove(moveData, ncpAttacker);
  const ncpField = convertToNcpField(fieldOptions);

  if (!ncpAttacker || !ncpDefender || !ncpMove) {
    throw new Error(`Failed to convert data for calculation`);
  }

  // Set up the attacker's moves (NCP expects moves array on the Pokemon)
  ncpAttacker.moves = [ncpMove];

  // GET_DAMAGE_SV's 4th param is the defender's side object (from field.getSide()).
  // Merge the defender's side properties onto the full field so the engine can
  // read both full-field props (weather, terrain, isGravity) and side props
  // (isReflect, isLightScreen, isHelpingHand, etc.) from one object.
  // defenderSlot 0 = attackerSide (Left), 1 = defenderSide (Right).
  const defenderSideProps = defenderSlot === 0
    ? (fieldOptions.attackerSide || {})
    : (fieldOptions.defenderSide || {});
  const ncpFieldWithSides = {
    ...ncpField,
    isReflect: defenderSideProps.isReflect || false,
    isLightScreen: defenderSideProps.isLightScreen || false,
    isAuroraVeil: defenderSideProps.isAuroraVeil || false,
    isFriendGuard: defenderSideProps.isFriendGuard || false,
    isHelpingHand: defenderSideProps.isHelpingHand || false,
  };

  // Use GET_DAMAGE_SV for Champions/gen 10 calculation
  let result;
  try {
    result = calc.GET_DAMAGE_SV(ncpAttacker, ncpDefender, ncpMove, ncpFieldWithSides);
  } catch (e) {
    console.error("Damage calc error:", e);
    return null;
  }

  if (!result || !result.damage) return null;

  const damageArray = Array.isArray(result.damage) ? result.damage : [result.damage];
  const defenderHP = ncpDefender.maxHP;
  const attackerHP = ncpAttacker.maxHP;
  const min = Math.min(...damageArray);
  const max = Math.max(...damageArray);

  // Calculate recoil text from move properties (% of attacker's max HP)
  let recoil = null;
  if (ncpMove.recoil) {
    const [num, den] = ncpMove.recoil;
    const rMin = Math.max(1, Math.round(min * num / den));
    const rMax = Math.max(1, Math.round(max * num / den));
    recoil = { text: `recoil: ${(rMin / attackerHP * 100).toFixed(1)}% - ${(rMax / attackerHP * 100).toFixed(1)}%` };
  } else if (ncpMove.hasCrashDamage) {
    recoil = { text: `recoil: 50%` };
  } else if (ncpMove.mindBlownRecoil) {
    recoil = { text: `recoil: 50%` };
  } else if (ncpMove.struggleRecoil) {
    recoil = { text: `recoil: 25%` };
  }

  // Calculate recovery text from move drain (% of attacker's max HP)
  let recovery = null;
  if (ncpMove.drain) {
    const [num, den] = ncpMove.drain;
    const hMin = Math.max(0, Math.floor(min * num / den));
    const hMax = Math.max(0, Math.floor(max * num / den));
    recovery = { text: `healed ${(hMin / attackerHP * 100).toFixed(1)}% - ${(hMax / attackerHP * 100).toFixed(1)}%` };
  }

  // Get KO chance text
  let kochance = "";
  try {
    kochance = calc.getKOChanceText(damageArray, ncpMove, ncpDefender, ncpField, false);
  } catch (e) {
    kochance = "";
  }

  // Build full description: NCP calc desc + damage range + KO chance
  const minPct = defenderHP ? Math.floor((min / defenderHP) * 1000) / 10 : 0;
  const maxPct = defenderHP ? Math.floor((max / defenderHP) * 1000) / 10 : 0;
  let desc = result.description || "";
  const rangeStr = `${min}-${max} (${minPct} - ${maxPct}%)`;
  if (desc && kochance) {
    desc = `${desc}: ${rangeStr} -- ${kochance}`;
  } else if (desc) {
    desc = `${desc}: ${rangeStr}`;
  }

  return {
    damage: damageArray.length === 1 ? damageArray[0] : damageArray,
    min,
    max,
    minPct,
    maxPct,
    desc,
    moveDesc: desc,
    kochance,
    damageArray,
    attackerAbility: ncpAttacker.ability || "",
    attackerItem: ncpAttacker.item || "",
    defenderAbility: ncpDefender.ability || "",
    defenderItem: ncpDefender.item || "",
    recovery,
    recoil,
  };
}

export async function getData() {
  const g = await getGen();
  const pokemonNames = [];
  for (const s of g.species) pokemonNames.push(s.name);
  pokemonNames.sort();

  const moveNames = [];
  for (const m of g.moves) moveNames.push(m.name);
  moveNames.sort();

  const abilityNames = [];
  for (const a of g.abilities) abilityNames.push(a.name);
  abilityNames.sort();

  const itemNames = [];
  for (const i of g.items) itemNames.push(i.name);
  itemNames.sort();

  return { pokemonNames, moveNames, abilityNames, itemNames };
}

export function preload() {
  return Promise.all([loadCalc(), getGen()]);
}
