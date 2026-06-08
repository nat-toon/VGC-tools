/*
 * Read Showdown's three JSON dumps from scripts/.cache/ and emit slim
 * versions into public/ for the app to fetch.
 *
 *   public/pokedex.json     - species base stats + types + abilities
 *   public/moves.json       - move metadata
 *   public/learnsets.json   - per-species learnset (move -> learn codes)
 *
 * The slim pokedex drops only non-standard CAP forms.  Past, Future,
 * LGPE, Unobtainable and Custom forms are kept; regulation filters in
 * `lib/regulations.js` decide which subset the UI shows.
 *
 * The slim learnsets keep every species' learnset but strip the
 * `learnset` wrapper and drop empty entries.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');
const OUT = path.join(ROOT, 'public');

const MOVE_FIELDS = new Set([
  'num', 'name', 'type', 'basePower', 'category', 'pp', 'accuracy',
  'priority', 'target', 'flags', 'desc', 'shortDesc', 'isNonstandard',
]);
const LEARNSET_CODES = /^(\d+)([LMTEVS])(\d*)$/;

// pokemonicons-sheet.png holds 12 icons per row.  The default cell for
// a species is its dex num, capped to [0, MAX_DEFAULT_CELL] - out-of-
// range nums (eggs, CAP, missingno) collapse to 0 (the egg icon).
// BattlePokemonIconIndexes overrides that default for forms, the egg
// placeholder, CAP, etc.  Overrides are allowed to exceed the cap
// (the sheet is tall enough); we trust the upstream table.
const ICONS_PER_ROW = 12;
const MAX_DEFAULT_CELL = 1025;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, obj) {
  const json = JSON.stringify(obj);
  fs.writeFileSync(file, json);
  return json.length;
}

function parseAbilities(r) {
  if (!r) return [];
  const out = [];
  if (r['0']) out.push({ name: r['0'], hidden: false });
  if (r['1']) out.push({ name: r['1'], hidden: false });
  if (r['H']) out.push({ name: r['H'], hidden: true });
  if (r['S']) out.push({ name: r['S'], hidden: false });
  return out;
}

function loadIconOverrides() {
  const p = path.join(CACHE, 'sprite-overrides.json');
  if (!fs.existsSync(p)) {
    console.warn(`! ${path.relative(ROOT, p)} missing - icon cell will fall back to dex num for all species`);
    return {};
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function resolveIconIndex(entry, overrides) {
  // Match Showdown: default = dex num, then apply override if the
  // species has one.  Out-of-range defaults collapse to 0 before the
  // override is applied, so a stale upstream num never leaks through.
  let ii = (typeof entry.num === 'number' && entry.num >= 0) ? entry.num : 0;
  if (ii > MAX_DEFAULT_CELL) ii = 0;
  const key = entry.name && toIDForOverride(entry.name);
  if (key && typeof overrides[key] === 'number' && overrides[key] >= 0) {
    ii = overrides[key];
  }
  return ii;
}

// Local copy of Showdown's toID - lower-case, strip non-[a-z0-9].  We
// only use it to key the override map by species id; the runtime
// spriteid for the gen5 sprite is computed in src/lib/sprite.js.
function toIDForOverride(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function slimPokedex(raw, overrides) {
  const slim = {};
  let kept = 0, dropped = 0, capDropped = 0, garbageDropped = 0;
  let overrideHits = 0;
  for (const [key, entry] of Object.entries(raw)) {
    if (entry.isNonstandard === 'CAP') { dropped++; capDropped++; continue; }
    if (!entry || !entry.baseStats) { dropped++; garbageDropped++; continue; }
    if (!entry.num || entry.num <= 0) { dropped++; garbageDropped++; continue; }
    if (entry.baseStats.spe == null) { dropped++; garbageDropped++; continue; }
    const ii = resolveIconIndex(entry, overrides);
    const overrideKey = entry.name && toIDForOverride(entry.name);
    if (overrideKey && typeof overrides[overrideKey] === 'number' && overrides[overrideKey] >= 0) {
      overrideHits++;
    }
    slim[key] = {
      k: key,
      n: entry.num,
      na: entry.name,
      ns: entry.isNonstandard || null,
      bs: entry.baseStats,
      t: (entry.types || []).map((t) => t.toLowerCase()),
      a: parseAbilities(entry.abilities),
      // baseSpecies / forme are present on forms (e.g. "Charizard" /
      // "Mega-X") and absent on standard species.  src/lib/sprite.js
      // uses them to compute the gen5 sprite id at runtime.
      bsp: entry.baseSpecies || null,
      fo: entry.forme || null,
      // Resolved icon cell in pokemonicons-sheet.png (0-indexed).  The
      // default is the species's dex num; the BattlePokemonIconIndexes
      // table in battle-dex-data.ts overrides that for forms, the egg
      // placeholder, CAP, etc.  See scripts/parse-sprite-data.cjs.
      ii,
    };
    kept++;
  }
  return { slim, kept, dropped, capDropped, garbageDropped, overrideHits };
}

function slimMoves(raw) {
  const slim = {};
  let kept = 0;
  for (const [key, m] of Object.entries(raw)) {
    if (!m || !m.name) continue;
    const out = {};
    for (const f of MOVE_FIELDS) {
      if (m[f] !== undefined) out[f] = m[f];
    }
    if (out.flags === undefined) out.flags = {};
    slim[key] = out;
    kept++;
  }
  return { slim, kept };
}

function slimLearnsets(raw) {
  const slim = {};
  let kept = 0, dropped = 0;
  let codeCount = 0;
  for (const [speciesId, data] of Object.entries(raw)) {
    const learnset = data && data.learnset;
    if (!learnset) { dropped++; continue; }
    let hasMove = false;
    const out = {};
    for (const [moveId, codes] of Object.entries(learnset)) {
      if (!Array.isArray(codes) || codes.length === 0) continue;
      const valid = codes.filter((c) => LEARNSET_CODES.test(c));
      if (valid.length === 0) continue;
      out[moveId] = valid;
      codeCount += valid.length;
      hasMove = true;
    }
    if (!hasMove) { dropped++; continue; }
    slim[speciesId] = out;
    kept++;
  }
  return { slim, kept, dropped, codeCount };
}

function ensureCache(name) {
  const p = path.join(CACHE, name + '.json');
  if (!fs.existsSync(p)) {
    console.error(`Missing cache: ${p} - run \`npm run fetch\` first.`);
    process.exit(1);
  }
  return p;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const dexPath = ensureCache('pokedex');
  const movesPath = ensureCache('moves');
  const learnPath = ensureCache('learnsets');

  const overrides = loadIconOverrides();
  const dex = slimPokedex(readJson(dexPath), overrides);
  const moves = slimMoves(readJson(movesPath));
  const learn = slimLearnsets(readJson(learnPath));

  const sizes = {};
  sizes.pokedex = writeJson(path.join(OUT, 'pokedex.json'), dex.slim);
  sizes.moves = writeJson(path.join(OUT, 'moves.json'), moves.slim);
  sizes.learnsets = writeJson(path.join(OUT, 'learnsets.json'), learn.slim);

  console.log('pokedex.json:  ' + dex.kept + ' kept, ' + dex.dropped + ' dropped (' + dex.capDropped + ' CAP, ' + dex.garbageDropped + ' invalid), ' + dex.overrideHits + ' icon overrides applied, ' + (sizes.pokedex / 1024).toFixed(1) + ' KB');
  console.log('moves.json:    ' + moves.kept + ' moves, ' + (sizes.moves / 1024).toFixed(1) + ' KB');
  console.log('learnsets.json: ' + learn.kept + ' species, ' + learn.codeCount + ' codes, ' + (sizes.learnsets / 1024).toFixed(1) + ' KB');
}

main();
