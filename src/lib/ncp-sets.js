import sets from "../data/ncp-sets.json";

export function getNcpSets(speciesName) {
  return sets[speciesName] || null;
}

export function getAllNcpPokemon() {
  return Object.keys(sets);
}
