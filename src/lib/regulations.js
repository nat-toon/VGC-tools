/*
 * Regulation registry.
 *
 * Built automatically at build time.  Each regulation's bundle lives in
 * src/data/regulations/{key}.js and exports:
 *
 *   KEY             string                 regulation id
 *   LABEL           string                 UI label
 *   POKEMON         Set<name>              legal species
 *   ITEMS           Set<id>                legal items
 *   ABILITIES       Set<id>                legal abilities
 *   IS_NONSTANDARD  Set<string>            isNonstandard tags that are
 *                                          blocked by this regulation
 *   LEARNSETS_URL   string                 per-regulation learnset URL
 *
 * A bundle's namespace re-export is registered in
 * src/data/regulations/index.js (the barrel emitted by
 * scripts/build-regulations.cjs).  We iterate that barrel to build
 * REGULATIONS at startup - no per-regulation import or list of bundle
 * filenames is hardcoded in this file.
 *
 * The "all" pseudo-regulation is a built-in fallback that accepts
 * everything; it has no bundle and is the same for every project.
 *
 * Runtime shape consumed by the lib:
 *
 *   key                string                 regulation id
 *   label              string                 UI label
 *   pool               Set<name> | null       legal species; null = no filter
 *   items              Set<id>   | null       legal items;   null = use isNonstandard fallback
 *   abilities          Set<id>   | null       legal abilities; null = use isNonstandard fallback
 *   learnsetsUrl       string | null          per-regulation learnset URL; null = use master fallback
 *   isNonstandardMove  (ns) => boolean         true if move is blocked by this regulation
 *   isNonstandardItem  (ns) => boolean         fallback item-block check (used when items allowlist is null)
 *   isNonstandardAbility (ns) => boolean      fallback ability-block check (used when abilities allowlist is null)
 *
 * ITEMS and ABILITIES are per-regulation allowlists.  Each regulation
 * builds its own from master + that regulation's items.ts/abilities.ts
 * patches.  This means an item un-banned in regulation A is NOT
 * automatically legal in regulation B (a real bug that existed when
 * these were derived from the globally-merged items.js / abilities.js).
 *
 * For regulations without an allowlist (the "all" pseudo-regulation),
 * legality is decided by the per-regulation `isNonstandardX` check
 * against the global items.js / abilities.js.
 */

import * as REG_BUNDLES from "../data/regulations/index.js";

const ALL_BUNDLE = {
  KEY: "all",
  LABEL: "National Pokedex",
  POKEMON: null,
  ITEMS: null,
  ABILITIES: null,
  IS_NONSTANDARD: new Set(["Past", "LGPE", "Future", "CAP", "Unobtainable"]),
};

function isNonstandardFromSet(set) {
  return (ns) => set.has(ns);
}

function buildRecord(bundle) {
  return {
    key: bundle.KEY,
    label: bundle.LABEL,
    pool: bundle.POKEMON || null,
    items: bundle.ITEMS || null,
    abilities: bundle.ABILITIES || null,
    learnsetsUrl: bundle.LEARNSETS_URL || null,
    isNonstandardMove: isNonstandardFromSet(bundle.IS_NONSTANDARD),
    isNonstandardItem: isNonstandardFromSet(bundle.IS_NONSTANDARD),
    isNonstandardAbility: isNonstandardFromSet(bundle.IS_NONSTANDARD),
  };
}

const bundleRecords = Object.values(REG_BUNDLES).map(buildRecord);

export const REGULATIONS = {
  ...Object.fromEntries(bundleRecords.map((r) => [r.key, r])),
  [ALL_BUNDLE.KEY]: buildRecord(ALL_BUNDLE),
};

export const DEFAULT_REG = bundleRecords.length ? bundleRecords[0].key : ALL_BUNDLE.KEY;

export function getRegulation(key) {
  return REGULATIONS[key] || REGULATIONS[DEFAULT_REG];
}

export function getPool(allPokemon, regulation) {
  const regSet = getRegulation(regulation).pool;
  if (!regSet) return allPokemon;
  return allPokemon.filter((p) => regSet.has(p.name));
}

export function isItemLegalInRegulation(item, regulation) {
  const reg = getRegulation(regulation);
  if (!item) return false;
  return !reg.isNonstandardItem(item.isNonstandard);
}

export function isAbilityLegalInRegulation(ability, regulation) {
  const reg = getRegulation(regulation);
  if (!ability) return false;
  return !reg.isNonstandardAbility(ability.isNonstandard);
}
