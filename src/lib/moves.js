import { MOVES_URL, MOVES_CACHE_KEY, MOVES_CACHE_VERSION } from "./constants.js";
import { loadCache, saveCache } from "./cache.js";
import { getRegulation } from "./regulations.js";

let movesPromise = null;
let moves = null;

async function fetchMoves() {
  const res = await fetch(MOVES_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

export function loadMoves() {
  if (moves) return Promise.resolve(moves);
  if (movesPromise) return movesPromise;
  const cached = loadCache(MOVES_CACHE_KEY, MOVES_CACHE_VERSION);
  if (cached) {
    moves = new Map(Object.entries(cached));
    return Promise.resolve(moves);
  }
  movesPromise = (async () => {
    try {
      const raw = await fetchMoves();
      moves = new Map(Object.entries(raw));
      saveCache(MOVES_CACHE_KEY, MOVES_CACHE_VERSION, raw);
      return moves;
    } finally {
      movesPromise = null;
    }
  })();
  return movesPromise;
}

export function getMove(id) {
  return moves ? moves.get(id) || null : null;
}

export function getAllMoves() {
  if (!moves) return [];
  return [...moves.entries()].map(([k, v]) => ({ ...v, _key: k }));
}

export function isMoveLegal(id, regulation) {
  const m = moves ? moves.get(id) : null;
  if (!m) return false;
  const reg = getRegulation(regulation);
  return !reg.isNonstandardMove(m.isNonstandard);
}
