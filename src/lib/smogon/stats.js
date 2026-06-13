import { toID } from './util.js';

export function calcStatChampions(natures, stat, base, sp, natureName) {
  if (stat === 'hp') {
    return base === 1 ? base : base + sp + 75;
  }
  let plus, minus;
  if (natureName) {
    const nat = natures.get(toID(natureName));
    plus = nat?.plus;
    minus = nat?.minus;
  }
  const n =
    plus === stat && minus === stat ? 1 :
    plus === stat ? 1.1 :
    minus === stat ? 0.9 : 1;
  return Math.floor(n * (base + sp + 20));
}
