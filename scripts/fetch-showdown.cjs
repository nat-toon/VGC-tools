/*
 * Pull Pokemon Showdown's source data into scripts/.cache/ so the build
 * pipeline can run offline.
 *
 * Two sources:
 *
 *   1. Compiled JSON from Showdown's CDN
 *      https://play.pokemonshowdown.com/data/{pokedex,moves,learnsets}.json
 *      -> scripts/.cache/{pokedex,moves,learnsets}.json
 *
 *   2. TypeScript source from the upstream GitHub repos
 *        pokemon-showdown (simulator) master:  github.com/smogon/pokemon-showdown
 *          -> scripts/.cache/upstream/data/...
 *        pokemon-showdown-client:  github.com/smogon/pokemon-showdown-client
 *          -> scripts/.cache/upstream/client/play.pokemonshowdown.com/src/...
 *      The directory layout mirrors the upstream repos so the build
 *      scripts can read it as if it were a local checkout.
 *
 * Re-running is a no-op when the cache is fresh.  Override the TTL
 * (24h by default) with SHOWDOWN_CACHE_TTL_HOURS.
 *
 * The TypeScript files fetched include the master `data/{pokedex,items,
 * abilities}.ts` and the per-regulation `data/mods/{modDir}/...` files
 * for every entry in scripts/regulations-config.cjs.  The text/lore
 * files `data/text/abilities.ts` and `data/text/items.ts` are also
 * fetched so parse-ts-data.cjs can pull the `desc`/`shortDesc`
 * strings into the lookup tables.
 *
 * If you need to work offline, you can set POKEMON_SHOWDOWN_LOCAL to a
 * path on disk that has the same structure (i.e. a `data/` directory
 * with the relevant .ts files).  The build scripts will read from
 * that path instead of the cache.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CACHE_DIR = path.join(__dirname, '.cache');
const UPSTREAM_DIR = path.join(CACHE_DIR, 'upstream');
const TTL_HOURS = Number(process.env.SHOWDOWN_CACHE_TTL_HOURS || 24);
const USER_AGENT = process.env.SHOWDOWN_USER_AGENT || 'pokemon-tools-build';

const CDN_BASE = 'https://play.pokemonshowdown.com/data/';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/';
const CLIENT_GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/smogon/pokemon-showdown-client/master/';

const COMPILED_FILES = ['pokedex', 'moves', 'learnsets'];

const MASTER_TS_FILES = [
  { rel: 'data/pokedex.ts' },
  { rel: 'data/items.ts' },
  { rel: 'data/abilities.ts' },
  { rel: 'data/text/abilities.ts' },
  { rel: 'data/text/items.ts' },
];

// Files from pokemon-showdown-client.  battle-dex-data.ts holds the
// per-species icon-cell override table (BattlePokemonIconIndexes) that
// forms (mega, gmax, alola, ...) need in order to render from the
// correct cell of pokemonicons-sheet.png.
const CLIENT_TS_FILES = [
  { rel: 'play.pokemonshowdown.com/src/battle-dex-data.ts' },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isFresh(file) {
  if (!fs.existsSync(file)) return false;
  const ageMs = Date.now() - fs.statSync(file).mtimeMs;
  return ageMs < TTL_HOURS * 3600 * 1000;
}

function download(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}

async function fetchTo(out, url) {
  if (isFresh(out)) {
    const size = (fs.statSync(out).size / 1024).toFixed(1);
    console.log(`  cached (${size} KB): ${path.relative(CACHE_DIR, out)}`);
    return;
  }
  console.log(`  GET ${url}`);
  const buf = await download(url);
  ensureDir(path.dirname(out));
  fs.writeFileSync(out, buf);
  const size = (buf.length / 1024).toFixed(1);
  console.log(`    -> ${path.relative(CACHE_DIR, out)} (${size} KB)`);
}

function readModDirs() {
  try {
    const { REGULATIONS } = require('./regulations-config.cjs');
    return [...new Set(
      REGULATIONS
        .filter((r) => !r.frozen && r.modDir)
        .map((r) => r.modDir)
    )];
  } catch (err) {
    console.warn(`  ! could not read regulations-config.cjs: ${err.message}`);
    return [];
  }
}

function perModTsFiles(modDir) {
  return [
    { rel: `data/mods/${modDir}/formats-data.ts` },
    { rel: `data/mods/${modDir}/learnsets.ts` },
    { rel: `data/mods/${modDir}/items.ts` },
    { rel: `data/mods/${modDir}/abilities.ts` },
  ];
}

async function fetchOneCompiled(name) {
  const out = path.join(CACHE_DIR, name + '.json');
  await fetchTo(out, CDN_BASE + name + '.json');
}

async function fetchOneUpstream(rel) {
  const out = path.join(UPSTREAM_DIR, rel);
  await fetchTo(out, GITHUB_RAW_BASE + rel);
}

async function fetchOneClient(rel) {
  // Mirror the upstream repo layout so parse-sprite-data.cjs can read
  // scripts/.cache/upstream/client/play.pokemonshowdown.com/src/...
  // the same way it would read a local POKEMON_SHOWDOWN_LOCAL clone.
  const out = path.join(UPSTREAM_DIR, 'client', rel);
  await fetchTo(out, CLIENT_GITHUB_RAW_BASE + rel);
}

async function main() {
  ensureDir(CACHE_DIR);
  ensureDir(UPSTREAM_DIR);

  console.log('Compiled JSON (from CDN)');
  for (const name of COMPILED_FILES) {
    try {
      await fetchOneCompiled(name);
    } catch (err) {
      const out = path.join(CACHE_DIR, name + '.json');
      if (fs.existsSync(out)) {
        console.warn(`  ! ${err.message} - using stale cache`);
      } else {
        console.error(`  x ${err.message} - no cache available`);
        process.exit(1);
      }
    }
  }

  console.log('\nTypeScript source (from GitHub)');
  const modDirs = readModDirs();
  const tsFiles = [...MASTER_TS_FILES];
  for (const m of modDirs) tsFiles.push(...perModTsFiles(m));

  for (const { rel } of tsFiles) {
    try {
      await fetchOneUpstream(rel);
    } catch (err) {
      const out = path.join(UPSTREAM_DIR, rel);
      if (fs.existsSync(out)) {
        console.warn(`  ! ${err.message} - using stale cache`);
      } else {
        console.error(`  x ${err.message} - no cache available`);
        process.exit(1);
      }
    }
  }

  console.log('\nClient TypeScript source (from GitHub)');
  for (const { rel } of CLIENT_TS_FILES) {
    try {
      await fetchOneClient(rel);
    } catch (err) {
      const out = path.join(UPSTREAM_DIR, 'client', rel);
      if (fs.existsSync(out)) {
        console.warn(`  ! ${err.message} - using stale cache`);
      } else {
        console.error(`  x ${err.message} - no cache available`);
        process.exit(1);
      }
    }
  }

  if (modDirs.length === 0) {
    console.warn('  ! no mod dirs discovered from regulations-config (no per-mod files fetched)');
  }
}

main();
