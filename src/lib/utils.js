import { STAT_CONFIG } from "./constants.js";
import { resolveAlias, getAliasesMatching } from "./aliases.js";

export function buildAliasSet(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { q: "", aliasSet: new Set() };
  const exactAlias = resolveAlias(q);
  const exactAliasLower = exactAlias ? exactAlias.toLowerCase() : null;
  const aliasTargets = getAliasesMatching(q);
  const aliasSet = new Set(aliasTargets.map((t) => t.toLowerCase()));
  if (exactAliasLower) aliasSet.add(exactAliasLower);
  return { q, aliasSet };
}

export function matchesAlias(item, q, aliasSet) {
  if (item._lcName.includes(q)) return true;
  if (aliasSet.has(item._lcName)) return true;
  return false;
}

export function cycleSort(sortKey, field) {
  if (!sortKey || !sortKey.startsWith(field)) return field + "-asc";
  return sortKey.split("-")[1] === "asc" ? field + "-desc" : "";
}

export function sortArrow(sortKey, field) {
  if (!sortKey || !sortKey.startsWith(field)) return null;
  return sortKey.split("-")[1] === "asc" ? "▲" : "▼";
}

export function formatAcc(value) {
  if (value === true) return "\u2014";
  if (value == null) return "\u2014";
  return value + "%";
}

export function formatPower(value) {
  if (value == null) return "\u2014";
  if (value === 0) return "\u2014";
  return String(value);
}

export function bst(baseStats) {
  if (!baseStats) return 0;
  return STAT_CONFIG.reduce((s, c) => s + (baseStats[c.key] || 0), 0);
}

export function displayName(name) {
  if (name.startsWith("Embody Aspect")) return "Embody Aspect";
  return name;
}

export function applySearchPokemon(pool, search) {
  const q = search.trim().toLowerCase();
  if (!q) return pool;

  const exactAlias = resolveAlias(q);
  const exactAliasLower = exactAlias ? exactAlias.toLowerCase() : null;
  const aliasTargets = getAliasesMatching(q);
  const aliasSet = new Set(aliasTargets.map((t) => t.toLowerCase()));
  if (exactAliasLower) aliasSet.add(exactAliasLower);

  return pool.filter((p) => {
    if (p._lcName.includes(q)) return true;
    if (aliasSet.has(p._lcName)) return true;
    if (String(p.num).includes(q)) return true;
    return p._lcAbil.some((a) => a.includes(q));
  });
}

export function applySearchText(items, search, key = "_lcName") {
  const q = search.trim().toLowerCase();
  if (!q) return items;
  return items.filter((i) => i[key]?.includes(q));
}

export function sortByNameAsc(a, b) {
  return a.name.localeCompare(b.name);
}

export function sortByNumAsc(a, b) {
  return a.num - b.num || a.name.localeCompare(b.name);
}
