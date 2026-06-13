export class Result {
  constructor(gen, attacker, defender, move, field, damage, rawDesc) {
    this.gen = gen;
    this.attacker = attacker;
    this.defender = defender;
    this.move = move;
    this.field = field;
    this.damage = damage;
    this.rawDesc = rawDesc;
  }

  range() {
    return damageRange(this.damage);
  }

  desc() {
    return this.fullDesc();
  }

  fullDesc(notation = '%', err = true) {
    const [min, max] = damageRange(this.damage);
    const minDisplay = toDisplay(notation, min, this.defender.maxHP());
    const maxDisplay = toDisplay(notation, max, this.defender.maxHP());
    return `${min}-${max} (${minDisplay} - ${maxDisplay}${notation})`;
  }
}

export function damageRange(damage) {
  if (typeof damage === 'number') return [damage, damage];
  if (typeof damage[0] !== 'number') {
    const d = damage;
    const ranges = [[], []];
    for (const damageList of d) {
      ranges[0].push(damageList[0]);
      ranges[1].push(damageList[damageList.length - 1]);
    }
    const summedRange = [0, 0];
    for (let i = 0; i < ranges[0].length; i++) {
      summedRange[0] += ranges[0][i];
      summedRange[1] += ranges[1][i];
    }
    return summedRange;
  }
  return [damage[0], damage[damage.length - 1]];
}

function toDisplay(notation, a, b, f = 1) {
  return notation === '%' ? Math.floor((a * (1000 / f)) / b) / 10 : Math.floor((a * (48 / f)) / b);
}
