import { ENTRIES } from "../data/aliases.js";

const ALIASES = new Map(Object.entries(ENTRIES));

export function resolveAlias(query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return ALIASES.get(q) || null;
}

export function getAliasTarget(alias) {
  const q = alias.trim().toLowerCase();
  return ALIASES.get(q) || null;
}

export function hasAlias(query) {
  const q = query.trim().toLowerCase();
  return ALIASES.has(q);
}

export function getAliasesMatching(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  for (const [alias, target] of ALIASES) {
    if (alias.startsWith(q)) {
      results.push(target);
    }
  }
  return [...new Set(results)];
}
