import { calculate, createGen, Pokemon, Move, Field } from "./smogon/index.js";
import { calcStatChampions } from "./smogon/stats.js";

/*
 * Creates a Smogon-compatible Generation object.
 * Uses gen num 0 for Champions.
 */
function getGen() {
  return createGen(0);
}

/*
 * Convert our Pokemon data to a Smogon Pokemon object.
 */
function toSmogonPokemon(gen, monData, side, pokedexMap) {
  if (!monData?.pokemon) return null;
  const key = monData.pokemon.toLowerCase();
  const species = pokedexMap?.[key];
  if (!species) return null;

  const sp = monData.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const baseStats = species.baseStats || {};

  const natureName = monData.nature || '';

  return new Pokemon(gen, species.name, {
    level: monData.level ?? 50,
    types: species.types || [],
    weightkg: species.weightkg || 0,
    baseStats,
    sp,
    nature: natureName,
    item: monData.item || '',
    ability: monData.ability || '',
    gender: species.gender || 'N',
    boosts: monData.boosts || { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  });
}

/*
 * Convert our Move data to a Smogon Move object.
 */
function toSmogonMove(gen, moveData) {
  if (!moveData) return null;
  return new Move(gen, moveData.name, {
    bp: moveData.basePower || 0,
    type: moveData.type || 'Normal',
    category: moveData.category || 'Special',
    priority: moveData.priority || 0,
    target: moveData.target || 'normal',
    recoil: moveData.recoil,
    hasCrashDamage: moveData.hasCrashDamage || false,
    drain: moveData.drain,
    flags: moveData.flags || {},
    secondaries: moveData.secondaries,
    willCrit: moveData.willCrit,
    multihit: moveData.multihit,
  });
}

/*
 * Create a Smogon Field object from our field state.
 */
function toSmogonField(field, attackerSideLabel) {
  const sideA = field.sideA || {};
  const sideB = field.sideB || {};
  const atkSide = attackerSideLabel === "B" ? sideB : sideA;
  const defSide = attackerSideLabel === "B" ? sideA : sideB;

  return new Field({
    gameType: field.gameType || 'Singles',
    weather: field.weather || undefined,
    terrain: field.terrain || undefined,
    isGravity: !!field.isGravity,
    isMagicRoom: !!field.isMagicRoom,
    isWonderRoom: !!field.isWonderRoom,
    attackerSide: {
      isHelpingHand: !!atkSide.isHelpingHand,
      isTailwind: !!atkSide.isTailwind,
      isLightScreen: !!atkSide.isLightScreen,
      isReflect: !!atkSide.isReflect,
      isAuroraVeil: !!atkSide.isAuroraVeil,
      isProtected: !!atkSide.isProtected,
      isSeeded: !!atkSide.isSeeded,
      isSaltCured: !!atkSide.isSaltCured,
      isPowerTrick: !!atkSide.isPowerTrick,
      isSwitching: atkSide.isSwitching || undefined,
    },
    defenderSide: {
      isHelpingHand: !!defSide.isHelpingHand,
      isTailwind: !!defSide.isTailwind,
      isLightScreen: !!defSide.isLightScreen,
      isReflect: !!defSide.isReflect,
      isAuroraVeil: !!defSide.isAuroraVeil,
      isProtected: !!defSide.isProtected,
      isSeeded: !!defSide.isSeeded,
      isSaltCured: !!defSide.isSaltCured,
      isPowerTrick: !!defSide.isPowerTrick,
      isFriendGuard: !!defSide.isFriendGuard,
      isFriendGuard: !!defSide.isFriendGuard,
      isSwitching: defSide.isSwitching || undefined,
      spikes: defSide.spikes || 0,
      isSR: !!defSide.isSR,
    },
  });
}

/*
 * Core damage calculation wrapper.
 * Uses the Smogon calc engine (Champions mode).
 */
export function calcDamage(attacker, defender, move, field, pokedexMap, attackerSideLabel) {
  if (!attacker || !defender || !move) return { min: 0, max: 0, percent: 0 };

  const gen = getGen();

  const smogonAttacker = toSmogonPokemon(gen, attacker, 'attacker', pokedexMap);
  const smogonDefender = toSmogonPokemon(gen, defender, 'defender', pokedexMap);
  const smogonMove = toSmogonMove(gen, move);
  const smogonField = toSmogonField(field || {}, attackerSideLabel);

  if (!smogonAttacker || !smogonDefender || !smogonMove) {
    return { min: 0, max: 0, percent: 0 };
  }

  try {
    const result = calculate(gen, smogonAttacker, smogonDefender, smogonMove, smogonField);
    const [min, max] = result.range();
    const defHP = smogonDefender.maxHP();
    return {
      min,
      max,
      percent: +((min / defHP) * 100).toFixed(1),
      percentMax: +((max / defHP) * 100).toFixed(1),
    };
  } catch (e) {
    console.error('Smogon calc error:', e);
    return { min: 0, max: 0, percent: 0 };
  }
}

/*
 * Calculate damage for both directions.
 * sideA and sideB each have: { pokemon, moves, activeMoveIdx, item, ability, nature, sp, level }
 * field has: { weather, terrain, lightScreen, reflect }
 */
export function calcAllDamage(sideA, sideB, field, getMoveFn, pokedexMap) {
  const resolveSide = (side) => {
    if (!side?.pokemon) return null;
    const mon = pokedexMap ? pokedexMap[side.pokemon.toLowerCase()] : null;
    if (!mon) return null;
    return {
      pokemon: side.pokemon,
      moves: side.moves,
      activeMoveIdx: side.activeMoveIdx,
      item: side.item,
      ability: side.ability,
      nature: side.nature,
      sp: side.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      boosts: side.boosts || { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      level: side.level ?? 50,
    };
  };

  const resolvedA = resolveSide(sideA);
  const resolvedB = resolveSide(sideB);

  if (!resolvedA || !resolvedB) {
    return { aToB: null, bToA: null };
  }

  let moveA = null;
  if (resolvedA.activeMoveIdx != null && resolvedA.moves?.[resolvedA.activeMoveIdx]) {
    const moveId = resolvedA.moves[resolvedA.activeMoveIdx];
    moveA = typeof moveId === 'object' ? moveId : (getMoveFn ? getMoveFn(moveId) : null);
  }

  let moveB = null;
  if (resolvedB.activeMoveIdx != null && resolvedB.moves?.[resolvedB.activeMoveIdx]) {
    const moveId = resolvedB.moves[resolvedB.activeMoveIdx];
    moveB = typeof moveId === 'object' ? moveId : (getMoveFn ? getMoveFn(moveId) : null);
  }

  const aToB = moveA
    ? calcDamage(resolvedA, resolvedB, moveA, field, pokedexMap, "A")
    : null;

  const bToA = moveB
    ? calcDamage(resolvedB, resolvedA, moveB, field, pokedexMap, "B")
    : null;

  return { aToB, bToA };
}
