import { toID } from './util.js';

export class Move {
  constructor(gen, nameOrConf, options = {}) {
    const conf = typeof nameOrConf === 'string' ? { name: nameOrConf } : nameOrConf;
    this.gen = gen;
    this.name = conf.name || '';
    this.id = toID(this.name);
    this.kind = 'Move';

    this.basePower = options.bp ?? conf.bp ?? 0;
    this.type = options.type || conf.type || 'Normal';
    this.category = options.category || conf.category || 'Special';
    this.priority = options.priority ?? conf.priority ?? 0;
    this.target = options.target || conf.target || 'normal';
    this.recoil = options.recoil || conf.recoil;
    this.hasCrashDamage = !!conf.hasCrashDamage;
    this.mindBlownRecoil = !!conf.mindBlownRecoil;
    this.struggleRecoil = !!conf.struggleRecoil;
    this.willCrit = options.willCrit || conf.willCrit;
    this.drain = options.drain || conf.drain;
    this.flags = options.flags || conf.flags || {};
    this.secondaries = options.secondaries || conf.secondaries;
    this.self = options.self || conf.self;
    this.ignoreDefensive = !!conf.ignoreDefensive;
    this.overrideOffensiveStat = conf.overrideOffensiveStat;
    this.overrideDefensiveStat = conf.overrideDefensiveStat;
    this.overrideOffensivePokemon = conf.overrideOffensivePokemon;
    this.overrideDefensivePokemon = conf.overrideDefensivePokemon;
    this.breaksProtect = !!conf.breaksProtect;
    this.isZ = conf.isZ || false;
    this.isMax = conf.isMax || false;
    this.multihit = conf.multihit;
    this.multiaccuracy = conf.multiaccuracy;
    this.timesUsed = options.timesUsed || 1;
    this.timesUsedWithMetronome = options.timesUsedWithMetronome || 1;
    this.hits = options.hits || 1;
  }

  named(...names) {
    return names.some(n => this.name === n);
  }

  hasType(type) {
    return this.type === type;
  }
}
