import { calculateChampions } from './mechanics/champions.js';
import { Result, damageRange } from './result.js';

export function calculate(gen, attacker, defender, move, field) {
  if (gen.num === 0) {
    const result = calculateChampions(gen, attacker, defender, move, field);
    return new Result(gen, attacker, defender, move, field, result.damage, result.desc);
  }
  // For other gens, use champions formula as fallback
  const result = calculateChampions(gen, attacker, defender, move, field);
  return new Result(gen, attacker, defender, move, field, result.damage, result.desc);
}

export { Result, damageRange } from './result.js';
export { Pokemon } from './pokemon.js';
export { Move } from './move.js';
export { Field, Side } from './field.js';
export { Generation, createGen } from './data/index.js';
