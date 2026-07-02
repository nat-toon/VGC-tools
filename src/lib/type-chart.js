/*
 * Defensive and offensive type effectiveness.
 *
 * Used by the team's Weaknesses panel (defending - "how much damage does
 * each attacking type do to each Pokemon?") and Coverage panel (attacking
 * - "for each attacking type, what's the best effectiveness my team has
 * against every defending dual-type combination?").
 *
 * Single source of truth for the type chart and the two effectiveness
 * helpers; both call sites used to ship a local copy of TYPE_CHART and
 * a hand-rolled multiplier.  The chart matches Gen 9 - immune (0),
 * quarter-resist (0.25), resist (0.5), neutral (1), weakness (2), and
 * double-weakness (4).
 */

export const TYPE_CHART = {
  normal:   { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:.5, ghost:0, dragon:1, dark:1, steel:.5, fairy:1 },
  fire:     { normal:1, fire:.5, water:.5, electric:1, grass:2, ice:2, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:2, rock:.5, ghost:1, dragon:.5, dark:1, steel:2, fairy:1 },
  water:    { normal:1, fire:2, water:.5, electric:1, grass:.5, ice:1, fighting:1, poison:1, ground:2, flying:1, psychic:1, bug:1, rock:2, ghost:1, dragon:.5, dark:1, steel:1, fairy:1 },
  electric: { normal:1, fire:1, water:2, electric:.5, grass:.5, ice:1, fighting:1, poison:1, ground:0, flying:2, psychic:1, bug:1, rock:1, ghost:1, dragon:.5, dark:1, steel:1, fairy:1 },
  grass:    { normal:1, fire:.5, water:2, electric:1, grass:.5, ice:1, fighting:1, poison:.5, ground:2, flying:.5, psychic:1, bug:.5, rock:2, ghost:1, dragon:.5, dark:1, steel:.5, fairy:1 },
  ice:      { normal:1, fire:.5, water:.5, electric:1, grass:2, ice:.5, fighting:1, poison:1, ground:2, flying:2, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:1, steel:.5, fairy:1 },
  fighting: { normal:2, fire:1, water:1, electric:1, grass:1, ice:2, fighting:1, poison:.5, ground:1, flying:.5, psychic:.5, bug:.5, rock:2, ghost:0, dragon:1, dark:2, steel:2, fairy:.5 },
  poison:   { normal:1, fire:1, water:1, electric:1, grass:2, ice:1, fighting:1, poison:.5, ground:.5, flying:1, psychic:1, bug:1, rock:.5, ghost:.5, dragon:1, dark:1, steel:0, fairy:2 },
  ground:   { normal:1, fire:2, water:1, electric:2, grass:.5, ice:1, fighting:1, poison:2, ground:1, flying:0, psychic:1, bug:.5, rock:2, ghost:1, dragon:1, dark:1, steel:2, fairy:1 },
  flying:   { normal:1, fire:1, water:1, electric:.5, grass:2, ice:1, fighting:2, poison:1, ground:1, flying:1, psychic:1, bug:2, rock:.5, ghost:1, dragon:1, dark:1, steel:.5, fairy:1 },
  psychic:  { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:2, poison:2, ground:1, flying:1, psychic:.5, bug:1, rock:1, ghost:1, dragon:1, dark:0, steel:.5, fairy:1 },
  bug:      { normal:1, fire:.5, water:1, electric:1, grass:2, ice:1, fighting:.5, poison:.5, ground:1, flying:.5, psychic:2, bug:1, rock:1, ghost:.5, dragon:1, dark:2, steel:.5, fairy:.5 },
  rock:     { normal:1, fire:2, water:1, electric:1, grass:1, ice:2, fighting:.5, poison:1, ground:.5, flying:2, psychic:1, bug:2, rock:1, ghost:1, dragon:1, dark:1, steel:.5, fairy:1 },
  ghost:    { normal:0, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:2, bug:1, rock:1, ghost:2, dragon:1, dark:.5, steel:1, fairy:1 },
  dragon:   { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:1, steel:.5, fairy:0 },
  dark:     { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:.5, poison:1, ground:1, flying:1, psychic:2, bug:1, rock:1, ghost:2, dragon:1, dark:.5, steel:.5, fairy:.5 },
  steel:    { normal:1, fire:.5, water:.5, electric:.5, grass:1, ice:2, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:2, ghost:1, dragon:1, dark:1, steel:.5, fairy:2 },
  fairy:    { normal:1, fire:.5, water:1, electric:1, grass:1, ice:1, fighting:2, poison:.5, ground:1, flying:1, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:2, steel:.5, fairy:1 },
};

/*
 * Offensive effectiveness.
 *   attackType     the type doing the hitting
 *   defA, defB     the defender's two types (mono-typed defenders pass
 *                  the same type for both)
 * Returns the product of the two multipliers.  Unknown types are
 * treated as neutral (1).
 */
export function typeEffectiveness(attackType, defA, defB) {
  const chart = TYPE_CHART[attackType];
  if (!chart) return 1;
  if (defA === defB) return chart[defA] ?? 1;
  return (chart[defA] ?? 1) * (chart[defB] ?? 1);
}

/*
 * Defensive effectiveness: how much damage does `attackType` do to a
 * Pokemon with the given types?  Same math as typeEffectiveness -
 * provided as a separate name to make call sites self-documenting.
 */
export function defendEffectiveness(attackType, defTypes) {
  let eff = 1;
  const chart = TYPE_CHART[attackType];
  if (!chart) return 1;
  for (const t of defTypes) {
    eff *= chart[t] ?? 1;
  }
  return eff;
}

/*
 * Human-readable multiplier label (e.g., "0.5x", "2x") for use in
 * weakness/coverage tables.  Unknown values fall back to "Nx" where N
 * is the raw multiplier.
 */
export function effLabel(value) {
  if (value === 0) return "\u00d70";
  if (value === 0.25) return "\u00d7\u00bc";
  if (value === 0.5) return "\u00d7\u00bd";
  if (value === 1) return "";
  if (value === 2) return "\u00d72";
  if (value === 4) return "\u00d74";
  return `\u00d7${value}`;
}

export const EFFECTIVENESS_CLASS = {
  0: "eff-immune",
  0.25: "eff-double-resist",
  0.5: "eff-resist",
  1: "eff-neutral",
  2: "eff-weak",
  4: "eff-double-weak",
};
