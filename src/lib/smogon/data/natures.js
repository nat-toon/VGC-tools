import { toID } from '../util.js';

export const NATURES_DATA = {
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

class NatureImpl {
  constructor(name, [plus, minus]) {
    this.kind = 'Nature';
    this.id = toID(name);
    this.name = name;
    this.plus = plus;
    this.minus = minus;
  }
}

const NATURES_BY_ID = {};
for (const nature in NATURES_DATA) {
  const n = new NatureImpl(nature, NATURES_DATA[nature]);
  NATURES_BY_ID[n.id] = n;
}

export class Natures {
  get(id) {
    return NATURES_BY_ID[toID(id)];
  }
  *[Symbol.iterator]() {
    for (const id in NATURES_BY_ID) {
      yield this.get(id);
    }
  }
}
