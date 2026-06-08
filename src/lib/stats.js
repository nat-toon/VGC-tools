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
function calcHP(base, level, iv, ev) {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
}

function calcStat(base, level, iv, ev, nature) {
  return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * nature);
}

export const NATURE_HINDER = 0.9;
export const NATURE_NEUTRAL = 1.0;
export const NATURE_BOOST = 1.1;

// Worst to best stat range at the given level, using the standard
// 4-column layout: [min-, min, max, max+].  min- is 0 IV / 0 EV /
// hindering nature; min is 0/0/neutral; max is 31/252/neutral; max+
// is 31/252/boosting.  HP ignores nature so the 4 values collapse to
// the 2 unique endpoints (returned as [min, min, max, max]).
export function statRangeAtLevel(base, isHP, level) {
  if (base == null) return [null, null, null, null];
  if (isHP) {
    const min = calcHP(base, level, 0, 0);
    const max = calcHP(base, level, 31, 252);
    return [min, min, max, max];
  }
  return [
    calcStat(base, level, 0, 0, NATURE_HINDER),
    calcStat(base, level, 0, 0, NATURE_NEUTRAL),
    calcStat(base, level, 31, 252, NATURE_NEUTRAL),
    calcStat(base, level, 31, 252, NATURE_BOOST),
  ];
}

export const DEFAULT_LEVEL = 50;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 100;
