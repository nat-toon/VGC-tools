import { API_URL, CACHE_KEY, CACHE_VERSION } from "./constants.js";
import { loadCache, saveCache } from "./cache.js";
import { getIcon } from "./sprite.js";

function processPokedex(data) {
  const list = [];
  for (const entry of Object.values(data)) {
    if (!entry || !entry.bs) continue;
    const name = entry.na;
    if (!name) continue;
    const abilities = entry.a || [];
    list.push({
      key: entry.k,
      num: entry.n,
      name,
      baseStats: entry.bs,
      types: entry.t || [],
      abilities,
      isNonstandard: entry.ns || null,
      baseSpecies: entry.bsp || null,
      forme: entry.fo || null,
      // Cell index in pokemonicons-sheet.png, pre-resolved by
      // slim-showdown.cjs (default = dex num, with the
      // BattlePokemonIconIndexes override applied).  src/lib/sprite.js
      // reads this directly when computing the icon background-position.
      iconIndex: entry.ii,
      _lcName: name.toLowerCase(),
      _lcAbil: abilities.map((ab) => ab.name.toLowerCase()),
    });
  }
  list.sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));
  return list;
}

function assignIcons(list) {
  for (const p of list) {
    p.icon = getIcon(p);
  }
}

async function fetchPokedex() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

export async function loadPokedex() {
  const cached = loadCache(CACHE_KEY, CACHE_VERSION);
  if (cached) {
    assignIcons(cached);
    return cached;
  }
  const data = await fetchPokedex();
  const list = processPokedex(data);
  assignIcons(list);
  saveCache(CACHE_KEY, CACHE_VERSION, list);
  return list;
}
