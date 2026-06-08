import { STAT_CONFIG } from "./constants.js";

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
  return pool.filter((p) => {
    if (p._lcName.includes(q)) return true;
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
