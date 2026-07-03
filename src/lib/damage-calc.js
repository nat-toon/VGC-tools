/**
 * Damage Calculator library.
 *
 * Wraps the compiled smogon/damage-calc engine for Pokemon Champions (gen 0).
 * All data (species, moves, abilities, items) comes from the project's own data.
 * Type chart and natures are inlined since the project doesn't have equivalents.
 */

let calcModule = null;
let calcPromise = null;

async function loadCalc() {
  if (calcModule) return calcModule;
  if (calcPromise) return calcPromise;

  calcPromise = (async () => {
    try {
      calcModule = await import('../data/damage-calc.js');
      return calcModule;
    } catch (err) {
      console.error('Failed to load damage calculator:', err);
      calcPromise = null;
      throw err;
    }
  })();

  return calcPromise;
}

function toID(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Inline type chart (Champions = SS/SM/XY) ---
const TYPE_CHART = {
  Normal:   {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:0.5,Ghost:0,Dragon:1,Dark:1,Steel:0.5,Fairy:1},
  Fire:     {Normal:1,Fire:0.5,Water:0.5,Electric:1,Grass:2,Ice:2,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:2,Rock:0.5,Ghost:1,Dragon:0.5,Dark:1,Steel:2,Fairy:1},
  Water:    {Normal:1,Fire:2,Water:0.5,Electric:1,Grass:0.5,Ice:1,Fighting:1,Poison:1,Ground:2,Flying:1,Psychic:1,Bug:1,Rock:2,Ghost:1,Dragon:0.5,Dark:1,Steel:1,Fairy:1},
  Electric: {Normal:1,Fire:1,Water:2,Electric:0.5,Grass:0.5,Ice:1,Fighting:1,Poison:1,Ground:0,Flying:2,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:0.5,Dark:1,Steel:1,Fairy:1},
  Grass:    {Normal:1,Fire:0.5,Water:2,Electric:1,Grass:0.5,Ice:1,Fighting:1,Poison:0.5,Ground:2,Flying:0.5,Psychic:1,Bug:0.5,Rock:2,Ghost:1,Dragon:0.5,Dark:1,Steel:0.5,Fairy:1},
  Ice:      {Normal:1,Fire:0.5,Water:0.5,Electric:1,Grass:2,Ice:0.5,Fighting:1,Poison:1,Ground:2,Flying:2,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:2,Dark:1,Steel:0.5,Fairy:1},
  Fighting: {Normal:2,Fire:1,Water:1,Electric:1,Grass:1,Ice:2,Fighting:1,Poison:0.5,Ground:1,Flying:0.5,Psychic:0.5,Bug:0.5,Rock:2,Ghost:0,Dragon:1,Dark:2,Steel:2,Fairy:0.5},
  Poison:   {Normal:1,Fire:1,Water:1,Electric:1,Grass:2,Ice:1,Fighting:1,Poison:0.5,Ground:0.5,Flying:1,Psychic:1,Bug:1,Rock:0.5,Ghost:0.5,Dragon:1,Dark:1,Steel:0,Fairy:2},
  Ground:   {Normal:1,Fire:2,Water:1,Electric:2,Grass:0.5,Ice:1,Fighting:1,Poison:2,Ground:1,Flying:0,Psychic:1,Bug:0.5,Rock:2,Ghost:1,Dragon:1,Dark:1,Steel:2,Fairy:1},
  Flying:   {Normal:1,Fire:1,Water:1,Electric:0.5,Grass:2,Ice:1,Fighting:2,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:2,Rock:0.5,Ghost:1,Dragon:1,Dark:1,Steel:0.5,Fairy:1},
  Psychic:  {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:2,Poison:2,Ground:1,Flying:1,Psychic:0.5,Bug:1,Rock:1,Ghost:1,Dragon:1,Dark:0,Steel:0.5,Fairy:1},
  Bug:      {Normal:1,Fire:0.5,Water:1,Electric:1,Grass:2,Ice:1,Fighting:0.5,Poison:0.5,Ground:1,Flying:0.5,Psychic:2,Bug:1,Rock:1,Ghost:0.5,Dragon:1,Dark:2,Steel:0.5,Fairy:0.5},
  Rock:     {Normal:1,Fire:2,Water:1,Electric:1,Grass:1,Ice:2,Fighting:0.5,Poison:1,Ground:0.5,Flying:2,Psychic:1,Bug:2,Rock:1,Ghost:1,Dragon:1,Dark:1,Steel:0.5,Fairy:1},
  Ghost:    {Normal:0,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:2,Bug:1,Rock:1,Ghost:2,Dragon:1,Dark:0.5,Steel:1,Fairy:1},
  Dragon:   {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:2,Dark:1,Steel:0.5,Fairy:0},
  Dark:     {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:0.5,Poison:1,Ground:1,Flying:1,Psychic:2,Bug:1,Rock:1,Ghost:2,Dragon:1,Dark:0.5,Steel:0.5,Fairy:0.5},
  Steel:    {Normal:1,Fire:0.5,Water:0.5,Electric:0.5,Grass:1,Ice:2,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:2,Ghost:1,Dragon:1,Dark:1,Steel:0.5,Fairy:2},
  Fairy:    {Normal:1,Fire:0.5,Water:1,Electric:1,Grass:1,Ice:1,Fighting:2,Poison:0.5,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:2,Dark:2,Steel:0.5,Fairy:1},
};

// --- Inline natures ---
const NATURES_DATA = {
  Adamant: ['atk', 'spa'],
  Bashful: ['spa', 'spa'],
  Bold: ['def', 'atk'],
  Brave: ['atk', 'spe'],
  Calm: ['spd', 'atk'],
  Careful: ['spd', 'spa'],
  Docile: ['def', 'def'],
  Gentle: ['spd', 'def'],
  Hardy: ['atk', 'atk'],
  Hasty: ['spe', 'def'],
  Impish: ['def', 'spa'],
  Jolly: ['spe', 'spa'],
  Lax: ['def', 'spd'],
  Lonely: ['atk', 'def'],
  Mild: ['spa', 'def'],
  Modest: ['spa', 'atk'],
  Naive: ['spe', 'spd'],
  Naughty: ['atk', 'spd'],
  Quiet: ['spa', 'spe'],
  Quirky: ['spd', 'spd'],
  Rash: ['spa', 'spd'],
  Relaxed: ['def', 'spe'],
  Sassy: ['spd', 'spe'],
  Serious: ['spe', 'spe'],
  Timid: ['spe', 'atk'],
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
        kind: 'Species',
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
        abilities: d.a && d.a.length ? {0: d.a[0].name} : undefined,
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
      // Map project flags to damage-calc MoveFlags
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
        kind: 'Move',
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
        kind: 'Ability',
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
        kind: 'Item',
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
        kind: 'Type',
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
        kind: 'Nature',
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

// --- Data loading ---

let genPromise = null;

async function getGen() {
  if (genPromise) return genPromise;

  genPromise = (async () => {
    const [pokedex, moves, abilitiesMod, itemsMod] = await Promise.all([
      fetch('/pokedex.json').then(r => r.json()),
      fetch('/moves.json').then(r => r.json()),
      import('../data/abilities.js'),
      import('../data/items.js'),
    ]);

    return new Generation(pokedex, moves, abilitiesMod.ENTRIES, itemsMod.ENTRIES);
  })();

  return genPromise;
}

export async function calculateDamage(attacker, defender, moveName, fieldOptions = {}) {
  if (!attacker.name || !defender.name || !moveName) return null;

  const calc = await loadCalc();
  const g = await getGen();

  const atkId = toID(attacker.name);
  const defId = toID(defender.name);
  if (!g.species.get(atkId)) throw new Error(`Unknown Pokemon: ${attacker.name}`);
  if (!g.species.get(defId)) throw new Error(`Unknown Pokemon: ${defender.name}`);

  // Convert SP to EVs for damage calc: ev = sp * 4 * 100 / level
  const level = attacker.level || 50;
  const spToEv = (sp) => {
    if (!sp) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const evFactor = 400 / level;
    return {
      hp: Math.round((sp.hp || 0) * evFactor),
      atk: Math.round((sp.atk || 0) * evFactor),
      def: Math.round((sp.def || 0) * evFactor),
      spa: Math.round((sp.spa || 0) * evFactor),
      spd: Math.round((sp.spd || 0) * evFactor),
      spe: Math.round((sp.spe || 0) * evFactor),
    };
  };

  const atk = new calc.Pokemon(g, attacker.name, {
    level: level,
    ability: attacker.ability,
    item: attacker.item,
    nature: attacker.nature || 'Serious',
    evs: spToEv(attacker.sp),
    boosts: attacker.boosts,
    teraType: attacker.teraType,
    status: attacker.status,
    abilityOn: attacker.abilityOn,
  });

  const defLevel = defender.level || 50;
  const def = new calc.Pokemon(g, defender.name, {
    level: defLevel,
    ability: defender.ability,
    item: defender.item,
    nature: defender.nature || 'Serious',
    evs: spToEv(defender.sp),
    boosts: defender.boosts,
    teraType: defender.teraType,
    status: defender.status,
  });

  const move = new calc.Move(g, moveName, {
    ability: attacker.ability,
    item: attacker.item,
    species: attacker.name,
  });

  const field = new calc.Field({
    gameType: fieldOptions.gameType || 'Singles',
    weather: fieldOptions.weather,
    terrain: fieldOptions.terrain,
    isMagicRoom: fieldOptions.isMagicRoom,
    isWonderRoom: fieldOptions.isWonderRoom,
    isGravity: fieldOptions.isGravity,
    attackerSide: fieldOptions.attackerSide || {},
    defenderSide: fieldOptions.defenderSide || {},
  });

  const result = calc.calculateChampions(g, atk, def, move, field);
  const [min, max] = result.range();

  return {
    damage: result.damage,
    min,
    max,
    desc: result.desc(),
    moveDesc: result.moveDesc(),
    kochance: result.kochance(),
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
