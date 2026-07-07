/**
 * Mega evolution utility.
 *
 * Builds mappings between mega stone items and mega forme species
 * using the pokedex and items data at runtime.
 */

import { ENTRIES as ITEM_ENTRIES } from "../data/items.js";

let _cache = null;

function build() {
  if (_cache) return _cache;

  const stoneToForme = new Map();   // itemKey -> { formeKey, baseKey }
  const formeToStone = new Map();   // formeKey -> { stoneKey, baseKey }
  const baseToMegas = new Map();    // baseKey -> [{ formeKey, stoneKey }]

  // Find all mega stone items by their description
  for (const [itemKey, item] of Object.entries(ITEM_ENTRIES)) {
    if (!item.shortDesc || !item.shortDesc.includes("Mega Evolve")) continue;

    // Parse the species name from: "If held by a Venusaur, this item allows it to Mega Evolve..."
    const speciesMatch = item.shortDesc.match(/If held by (?:a|an) ([^,]+)/);
    if (!speciesMatch) continue;
    const speciesName = speciesMatch[1].trim();

    // Parse the target forme from: "...into Mega Charizard X." (if present)
    const intoMatch = item.shortDesc.match(/into (.+?)\.?\s*$/);
    const targetForme = intoMatch ? intoMatch[1].trim() : null;

    stoneToForme.set(itemKey, { speciesName, targetForme });
  }

  // We'll finalize forme->stone mappings once we have pokedex data.
  // Expose the stone data so the caller can resolve formes.
  _cache = { stoneToForme, formeToStone, baseToMegas };
  return _cache;
}

/**
 * Given a mega stone item key and the pokedex map (lowercase name -> entry),
 * return the mega forme entry from the pokedex, or null.
 */
export function getMegaFormeForStone(stoneKey, pokedexMap) {
  const { stoneToForme } = build();
  const info = stoneToForme.get(stoneKey);
  if (!info) return null;

  const { speciesName, targetForme } = info;

  // Find all mega formes for this species in the pokedex
  const candidates = [];
  for (const entry of Object.values(pokedexMap)) {
    if (entry.baseSpecies === speciesName && entry.forme && entry.forme.startsWith("Mega")) {
      candidates.push(entry);
    }
  }

  // Fallback: if no candidates, try matching when species name contains base species
  if (candidates.length === 0) {
    for (const entry of Object.values(pokedexMap)) {
      if (entry.baseSpecies && speciesName.toLowerCase().includes(entry.baseSpecies.toLowerCase()) && entry.forme && entry.forme.startsWith("Mega")) {
        candidates.push(entry);
      }
    }
  }

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Multiple mega formes (e.g. Charizard X/Y) — match by target name
  if (targetForme) {
    const targetLower = targetForme.toLowerCase();
    const match = candidates.find((c) => {
      const nameLower = c.name.toLowerCase();
      // Check if target matches pokedex name
      if (nameLower === targetLower) return true;
      // Match by base species + suffix: "Mega Charizard X" vs "Charizard-Mega-X"
      if (targetLower.startsWith("mega") && c.baseSpecies && targetLower.includes(c.baseSpecies.toLowerCase())) {
        const suffix = targetForme.replace(/mega\s*/i, "").replace(new RegExp(c.baseSpecies, "i"), "").trim();
        const targetSuffix = c.name.replace(new RegExp("^" + c.baseSpecies + "-mega", "i"), "").replace("-", "").trim();
        return suffix.toLowerCase() === targetSuffix.toLowerCase();
      }
      return false;
    });
    if (match) return match;
  }

  return candidates[0];
}

/**
 * Given a mega forme pokedex entry, return the base species entry.
 */
export function getBaseForme(megaEntry, pokedexMap) {
  if (!megaEntry || !megaEntry.baseSpecies) return null;
  return pokedexMap[megaEntry.baseSpecies.toLowerCase()] || null;
}

/**
 * Given a mega forme pokedex entry, return the mega stone item key, or null.
 */
export function getStoneForForme(megaEntry, pokedexMap) {
  if (!megaEntry) return null;
  const base = getBaseForme(megaEntry, pokedexMap);
  if (!base) return null;

  // Search items for one whose description targets this mega forme
  for (const [itemKey, item] of Object.entries(ITEM_ENTRIES)) {
    if (!item.shortDesc || !item.shortDesc.includes("Mega Evolve")) continue;
    const speciesMatch = item.shortDesc.match(/If held by (?:a|an) ([^,]+)/);
    if (!speciesMatch) continue;
    // Flexible match: "Eternal Flower Floette" contains "Floette"
    const itemSpecies = speciesMatch[1].trim();
    if (!itemSpecies.toLowerCase().includes(base.name.toLowerCase())) continue;

    // Check if this stone targets this specific forme
    const intoMatch = item.shortDesc.match(/into (.+?)\.?\s*$/);
    if (intoMatch) {
      const intoName = intoMatch[1].trim();
      // Match by base species + forme: "Mega Charizard X" targets species "Charizard" with forme suffix "X"
      const intoLower = intoName.toLowerCase();
      const baseLower = base.name.toLowerCase();
      if (intoLower.startsWith("mega") && intoLower.includes(baseLower)) {
        // Extract suffix like "X" or "Y" from "Mega Charizard X"
        const suffix = intoName.replace(/mega\s*/i, "").replace(new RegExp(base.name, "i"), "").trim();
        const targetSuffix = megaEntry.name.replace(new RegExp("^" + base.name + "-mega", "i"), "").replace("-", "").trim();
        if (suffix.toLowerCase() === targetSuffix.toLowerCase()) return itemKey;
      }
      // Exact match fallback
      if (intoName === megaEntry.name) return itemKey;
    } else {
      // Single mega forme for this species
      return itemKey;
    }
  }
  return null;
}

/**
 * Check if an item key is a mega stone.
 */
export function isMegaStone(itemKey) {
  const { stoneToForme } = build();
  return stoneToForme.has(itemKey);
}

/**
 * Given a mega forme entry, return its default ability name.
 */
export function getMegaAbility(megaEntry) {
  if (!megaEntry || !megaEntry.abilities || megaEntry.abilities.length === 0) return null;
  return megaEntry.abilities[0].name;
}
