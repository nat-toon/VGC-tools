export function statTier(v) {
  if (v == null) return 0;
  if (v >= 150) return 6;
  if (v >= 120) return 5;
  if (v >= 90) return 4;
  if (v >= 60) return 3;
  if (v >= 30) return 2;
  return 1;
}

export function bstTier(v) {
  if (v == null) return 0;
  if (v >= 600) return 6;
  if (v >= 550) return 5;
  if (v >= 500) return 4;
  if (v >= 400) return 3;
  if (v >= 300) return 2;
  return 1;
}

/*
 * Pokemon stat formula at a given level.
 *
 *   HP:   floor((2*B + IV + floor(EV/4)) * L / 100) + L + 10
 *   stat: (floor((2*B + IV + floor(EV/4)) * L / 100) + 5) * nature
 *
 * Nature is 0.9 (hinder), 1.0 (neutral) or 1.1 (boost).  HP is
 * unaffected by nature.
 */
export function calcHP(base, level, iv, ev) {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

export function calcStat(base, level, iv, ev, nature) {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature);
}

export const NATURE_HINDER = 0.9;
export const NATURE_NEUTRAL = 1.0;
export const NATURE_BOOST = 1.1;

export const SP_MAX_TOTAL = 66;
export const SP_MAX_PER_STAT = 32;
export const FIXED_IV = 31;

/*
 * Pokémon Champions SP formula.
 *   HP:   floor((2B + 31) * L / 100) + L + 10 + SP_HP
 *   Stat: floor((floor((2B + 31) * L / 100) + 5 + SP) * N)
 * IV is always 31.
 */
export function calcHPSpecial(base, level, sp) {
  return Math.floor(((2 * base + FIXED_IV) * level) / 100) + level + 10 + sp;
}

export function calcStatSP(base, level, sp, nature) {
  return Math.floor((Math.floor(((2 * base + FIXED_IV) * level) / 100) + 5 + sp) * nature);
}

export function calcFinalStatsSP(baseStats, sp, natureObj, level) {
  if (!baseStats) return null;
  const L = level ?? DEFAULT_LEVEL;
  const plus = natureObj?.plus;
  const minus = natureObj?.minus;
  const stats = {};
  stats.hp = calcHPSpecial(baseStats.hp ?? 0, L, sp?.hp ?? 0);
  for (const key of ["atk", "def", "spa", "spd", "spe"]) {
    let natureMult = NATURE_NEUTRAL;
    if (plus === key) natureMult = NATURE_BOOST;
    else if (minus === key) natureMult = NATURE_HINDER;
    stats[key] = calcStatSP(baseStats[key] ?? 0, L, sp?.[key] ?? 0, natureMult);
  }
  return stats;
}

/*
 * Returns [min, max] for stat bar scaling.
 * HP max is 362, other stats max is 252.
 */
export function statRangeSP(isHP) {
  return [0, isHP ? 362 : 252];
}

export const DEFAULT_LEVEL = 50;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 100;

/*
 * Pokedex stat range helpers (used by PokemonEntry.jsx).
 * Standard formula with variable IV/EV for range display.
 */
export function statRangeAtLevel(base, isHP, level) {
  if (base == null) return [null, null, null, null];
  if (isHP) {
    const min = calcHP(base, level, 0, 0);
    const max = calcHP(base, level, 31, 252);
    return [min, min, max, max];
  }
  return [
    calcStatSP(base, level, 0, NATURE_HINDER),
    calcStatSP(base, level, 0, NATURE_NEUTRAL),
    calcStatSP(base, level, 32, NATURE_NEUTRAL),
    calcStatSP(base, level, 32, NATURE_BOOST),
  ];
}
