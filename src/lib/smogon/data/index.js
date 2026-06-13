import { Natures } from './natures.js';
import { Types } from './types.js';

class Abilities {
  constructor(gen) {
    this.gen = gen;
    this._list = [];
  }
  get(id) { return this._list.find(a => a.id === id); }
  *[Symbol.iterator]() { yield* this._list; }
  add(name) {
    const a = { kind: 'Ability', id: name.toLowerCase().replace(/[^a-z0-9]+/g, ''), name };
    this._list.push(a);
    return a;
  }
}

class Items {
  constructor(gen) {
    this.gen = gen;
    this._list = [];
  }
  get(id) { return this._list.find(i => i.id === id); }
  *[Symbol.iterator]() { yield* this._list; }
  add(name, opts = {}) {
    const i = { kind: 'Item', id: name.toLowerCase().replace(/[^a-z0-9]+/g, ''), name, ...opts };
    this._list.push(i);
    return i;
  }
}

class Moves {
  constructor(gen) {
    this.gen = gen;
    this._list = [];
  }
  get(id) { return this._list.find(m => m.id === id); }
  *[Symbol.iterator]() { yield* this._list; }
  add(name, data) {
    const m = { kind: 'Move', id: name.toLowerCase().replace(/[^a-z0-9]+/g, ''), name, ...data };
    this._list.push(m);
    return m;
  }
}

class Species {
  constructor(gen) {
    this.gen = gen;
    this._list = [];
  }
  get(id) { return this._list.find(s => s.id === id); }
  *[Symbol.iterator]() { yield* this._list; }
  add(name, data) {
    const s = { kind: 'Species', id: name.toLowerCase().replace(/[^a-z0-9]+/g, ''), name, ...data };
    this._list.push(s);
    return s;
  }
}

export class Generation {
  constructor(num) {
    this.num = num;
    this.abilities = new Abilities(num);
    this.items = new Items(num);
    this.moves = new Moves(num);
    this.species = new Species(num);
    this.types = new Types(num);
    this.natures = new Natures();
  }
}

export function createGen(num = 0) {
  return new Generation(num);
}
