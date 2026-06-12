/*
 * Per-regulation learnset loader.
 *
 * Each regulation has its own learnset JSON at the URL declared in its
 * bundle (`reg.learnsetsUrl`).  The master `public/learnsets.json` is
 * the fallback for regulations that don't declare one (e.g. the "all"
 * pseudo-regulation).
 *
 * The on-the-wire shape is `{ speciesId: [moveId, ...] }` - just the
 * list of moves the Pokemon can learn, with no learn codes.  The
 * master JSON uses the older `{ speciesId: { moveId: [codes] } }`
 * shape; `normalizeLearnsets` flattens that to the new shape at load
 * time.
 *
 * Cache key is per-regulation: `pkmn_learnsets_{key}_v{version}`.
 */

import { LEARNSETS_URL, LEARNSETS_CACHE_VERSION } from "./constants.js";
import { loadCache, saveCache } from "./cache.js";
import { getMove } from "./moves.js";
import { getRegulation } from "./regulations.js";

const dataByRegulation = new Map();
const loadingByRegulation = new Map();

function cacheKey(regulation) {
  return `pkmn_learnsets_${regulation}_v${LEARNSETS_CACHE_VERSION}`;
}

function normalizeLearnsets(data) {
  /*
   * Accepts either:
   *   { speciesId: [moveId, ...] }        (new shape, per-regulation)
   *   { speciesId: { moveId: [codes] } }  (old shape, master)
   * Returns the new shape.
   */
  if (!data || typeof data !== "object") return data;
  const out = {};
  for (const [speciesId, learnset] of Object.entries(data)) {
    if (Array.isArray(learnset)) {
      out[speciesId] = learnset;
    } else if (learnset && typeof learnset === "object") {
      out[speciesId] = Object.keys(learnset);
    }
  }
  return out;
}

async function fetchLearnsetsFor(regulation) {
  const reg = getRegulation(regulation);
  const url = reg.learnsetsUrl || LEARNSETS_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

export function loadLearnsets(regulation = "all") {
  if (dataByRegulation.has(regulation)) return Promise.resolve(dataByRegulation.get(regulation));
  if (loadingByRegulation.has(regulation)) return loadingByRegulation.get(regulation);

  const cached = loadCache(cacheKey(regulation), LEARNSETS_CACHE_VERSION);
  if (cached) {
    const normalized = normalizeLearnsets(cached);
    dataByRegulation.set(regulation, normalized);
    return Promise.resolve(normalized);
  }

  const promise = (async () => {
    try {
      const raw = await fetchLearnsetsFor(regulation);
      const normalized = normalizeLearnsets(raw);
      dataByRegulation.set(regulation, normalized);
      saveCache(cacheKey(regulation), LEARNSETS_CACHE_VERSION, normalized);
      return normalized;
    } finally {
      loadingByRegulation.delete(regulation);
    }
  })();
  loadingByRegulation.set(regulation, promise);
  return promise;
}

export function areLearnsetsLoaded(regulation = "all") {
  return dataByRegulation.has(regulation);
}

export function getLearnset(speciesId, regulation = "all") {
  const data = dataByRegulation.get(regulation);
  if (!data) return null;
  const ids = data[speciesId];
  return Array.isArray(ids) ? ids : null;
}

export function getMovesWithDetails(speciesId, regulation = "all") {
  const learnset = getLearnset(speciesId, regulation);
  if (!learnset) return [];
  const out = [];
  for (const moveId of learnset) {
    const move = getMove(moveId);
    if (!move) continue;
    out.push({
      id: moveId,
      name: move.name,
      type: move.type || null,
      basePower: move.basePower ?? null,
      category: move.category || null,
      pp: move.pp ?? null,
      accuracy: move.accuracy ?? null,
      priority: move.priority ?? 0,
      shortDesc: move.shortDesc || "",
      desc: move.desc || "",
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export function getPokemonWithMove(moveId, regulation = "all", allPokemon = []) {
  const data = dataByRegulation.get(regulation);
  if (!data) return [];
  return allPokemon.filter((p) => {
    const learnset = data[p.key];
    return Array.isArray(learnset) && learnset.includes(moveId);
  });
}
