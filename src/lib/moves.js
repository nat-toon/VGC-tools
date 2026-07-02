import { MOVES_URL, MOVES_CACHE_KEY, MOVES_CACHE_VERSION } from "./constants.js";
import { loadCache, saveCache } from "./cache.js";
import { getRegulation } from "./regulations.js";

const memory = { value: null, promise: null };

async function fetchMovesJson() {
  const res = await fetch(MOVES_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

export function loadMoves() {
  if (memory.value) return Promise.resolve(memory.value);
  if (memory.promise) return memory.promise;
  const cached = loadCache(MOVES_CACHE_KEY, MOVES_CACHE_VERSION);
  if (cached) {
    memory.value = new Map(Object.entries(cached));
    return Promise.resolve(memory.value);
  }
  memory.promise = (async () => {
    try {
      const raw = await fetchMovesJson();
      memory.value = new Map(Object.entries(raw));
      saveCache(MOVES_CACHE_KEY, MOVES_CACHE_VERSION, raw);
      return memory.value;
    } finally {
      memory.promise = null;
    }
  })();
  return memory.promise;
}

export function getMove(id) {
  return memory.value ? memory.value.get(id) || null : null;
}

export function getAllMoves() {
  if (!memory.value) return [];
  return [...memory.value.entries()].map(([k, v]) => ({ ...v, _key: k }));
}

export function isMoveLegal(id, regulation) {
  const m = memory.value ? memory.value.get(id) : null;
  if (!m) return false;
  const reg = getRegulation(regulation);
  return !reg.isNonstandardMove(m.isNonstandard);
}
