import { ENTRIES } from "../data/abilities.js";
import { getRegulation, isAbilityLegalInRegulation } from "./regulations.js";

const ABILITIES = new Map(Object.entries(ENTRIES));

export function getAbilityByName(name) {
  const needle = name.toLowerCase();
  for (const a of ABILITIES.values()) {
    if (a.name && a.name.toLowerCase() === needle) return a;
  }
  return null;
}

export function getAllAbilities() {
  return [...ABILITIES.entries()].map(([k, v]) => ({ ...v, _key: k }));
}

export function isAbilityLegal(id, regulation) {
  const reg = getRegulation(regulation);
  if (reg.abilities) return reg.abilities.has(id);
  const a = ABILITIES.get(id);
  if (!a) return false;
  return isAbilityLegalInRegulation(a, regulation);
}

export function getPokemonWithAbility(abilityName, allPokemon = []) {
  const needle = (abilityName || "").toLowerCase();
  if (!needle) return [];
  return allPokemon.filter((p) =>
    (p.abilities || []).some((a) => a.name && a.name.toLowerCase() === needle),
  );
}
