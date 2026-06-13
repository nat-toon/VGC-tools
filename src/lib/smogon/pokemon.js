import { toID } from './util.js';
import { calcStatChampions } from './stats.js';

export class Pokemon {
  constructor(gen, nameOrConf, options = {}) {
    const conf = typeof nameOrConf === 'string' ? { name: nameOrConf } : nameOrConf;
    this.gen = gen;
    this.name = conf.name || '';
    this.id = toID(this.name);
    this.species = conf.species || this.name;
    this.specieskind = 'Species';

    this.level = options.level || 50;
    this.gender = options.gender || conf.gender || 'N';
    this.teraType = options.teraType || conf.teraType;
    this.isDynamaxed = !!options.isDynamaxed;
    this.isMax = !!options.isMax;

    this.types = options.types || conf.types || ['Normal'];
    this.weightkg = options.weightkg || conf.weightkg || 0;
    this.baseStats = options.baseStats || conf.baseStats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    this.ivs = options.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    this.evs = options.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    this.sp = options.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    this.nature = options.nature || '';

    this.item = options.item || '';
    this.ability = options.ability || '';
    this.abilityOn = !!options.abilityOn;

    this.boosts = options.boosts || { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    this.status = options.status || undefined;
    this.toxicCounter = options.toxicCounter || 0;
    this.volatiles = options.volatiles || {};

    this._curHP = options.curHP || undefined;
  }

  maxHP() {
    if (this.baseStats) {
      return calcStatChampions(this.gen.natures, 'hp', this.baseStats.hp, (this.sp || {}).hp || 0);
    }
    return 1;
  }

  curHP() {
    return this._curHP || this.maxHP();
  }

  hasType(type) {
    return this.types.some(t => toID(t) === toID(type));
  }

  hasItem(...items) {
    return items.some(item => toID(this.item) === toID(item));
  }

  hasAbility(...abilities) {
    return abilities.some(a => toID(this.ability) === toID(a));
  }

  hasStatus(status) {
    return this.status === status;
  }

  named(...names) {
    return names.some(n => this.name === n);
  }

  hasEV(stat) {
    return (this.evs[stat] || 0) > 0;
  }

  hasBoost(stat) {
    return (this.boosts[stat] || 0) > 0;
  }

  stats() {
    const sp = this.sp || {};
    const base = this.baseStats || {};
    const stats = {};
    for (const stat of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) {
      stats[stat] = calcStatChampions(this.gen.natures, stat, base[stat] || 0, sp[stat] || 0, this.nature);
    }
    return stats;
  }
}
