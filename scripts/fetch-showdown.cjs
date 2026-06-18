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
 * Per-mod files (data/mods/{modDir}/{formats-data,learnsets,items,
 * abilities}.ts) are OPTIONAL on a per-mod basis.  HTTP 404 from
 * upstream for one of these is treated as "mod does not define this
 * file" rather than an error: we log a warning, delete any stale
 * cached copy (so the build script doesn't accidentally apply
 * outdated per-mod patches via fs.existsSync), and continue.  The
 * downstream build script falls back to the master / default config
 * for that file.  All other files (master, text, CDN, client) are
 * still required - a 404 on those aborts the fetch as before.
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
  { rel: 'data/aliases.ts' },
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
  /*
   * GET `url` and resolve with the body buffer.  On non-2xx,
   * rejects with an Error whose `.statusCode` reflects the HTTP
   * status so callers can distinguish 404 (file truly missing
   * upstream) from 5xx / timeout (transient failure).
   */
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(Object.assign(
          new Error(`HTTP ${res.statusCode} for ${url}`),
          { statusCode: res.statusCode, url }
        ));
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

async function fetchTo(out, url, opts = {}) {
  /*
   * Fetch `url` -> `out`.  Cache-aware (skip if fresh).
   *
   *   opts.optional   true treats HTTP 404 as "upstream does not
   *                   define this file" instead of an error.  Used
   *                   for per-mod files where a mod is allowed to
   *                   ship only some of {formats-data, learnsets,
   *                   items, abilities}.  The caller (build script)
   *                   treats the missing file as a no-op and falls
   *                   back to the master / default config.
   *
   * Failure handling:
   *   - HTTP 404 + opts.optional: log warning, unlink any stale
   *     cached copy (so the next run doesn't pretend it's fresh and
   *     so the build script doesn't apply outdated per-mod patches
   *     via fs.existsSync), return without error.
   *   - any other error with a stale cache on disk: log warning,
   *     keep the stale copy, return (existing behaviour).
   *   - no cache + any error: log error and process.exit(1)
   *     (existing behaviour - only reached for required files now).
   */
  if (isFresh(out)) {
    const size = (fs.statSync(out).size / 1024).toFixed(1);
    console.log(`  cached (${size} KB): ${path.relative(CACHE_DIR, out)}`);
    return;
  }
  console.log(`  GET ${url}`);
  try {
    const buf = await download(url);
    ensureDir(path.dirname(out));
    fs.writeFileSync(out, buf);
    const size = (buf.length / 1024).toFixed(1);
    console.log(`    -> ${path.relative(CACHE_DIR, out)} (${size} KB)`);
  } catch (err) {
    if (opts.optional && err.statusCode === 404) {
      console.warn(
        `  - ${path.relative(CACHE_DIR, out)}: HTTP 404 - upstream ` +
        `does not define this file, skipping (build will use default config)`
      );
      if (fs.existsSync(out)) {
        /*
         * Stale copy from a previous upstream revision where this
         * file existed.  Drop it so the build script's
         * fs.existsSync check returns false and the master /
         * default config is used instead of outdated per-mod data.
         */
        fs.unlinkSync(out);
      }
      return;
    }
    if (fs.existsSync(out)) {
      console.warn(`  ! ${err.message} - using stale cache`);
      return;
    }
    console.error(`  x ${err.message} - no cache available`);
    process.exit(1);
  }
}

function readModDirs() {
  try {
    const { REGULATIONS, normalizeModDirs } = require('./regulations-config.cjs');
    return [...new Set(
      REGULATIONS
        .filter((r) => !r.frozen && r.modDir)
        .flatMap((r) => normalizeModDirs(r.modDir))
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

function isPerModFile(rel) {
  /*
   * True iff `rel` matches the per-mod file pattern
   * `data/mods/{modDir}/{name}.ts`.  These are the files we tolerate
   * 404s for.  Master files (data/{pokedex,items,abilities,aliases}.ts),
   * text/ descriptions, CDN JSON, and client files are all required
   * and a 404 on any of them is still fatal.
   */
  return /^data\/mods\/[^/]+\/[^/]+\.ts$/.test(rel);
}

async function fetchOneCompiled(name) {
  const out = path.join(CACHE_DIR, name + '.json');
  await fetchTo(out, CDN_BASE + name + '.json');
}

async function fetchOneUpstream(rel, opts = {}) {
  const out = path.join(UPSTREAM_DIR, rel);
  await fetchTo(out, GITHUB_RAW_BASE + rel, opts);
}

async function fetchOneClient(rel) {
  // Mirror the upstream repo layout so parse-sprite-data.cjs can read
  // scripts/.cache/upstream/client/play.pokemonshowdown.com/src/...
  // the same way it would read a local POKEMON_SHOWDOWN_LOCAL clone.
  const out = path.join(UPSTREAM_DIR, 'client', rel);
  await fetchTo(out, CLIENT_GITHUB_RAW_BASE + rel);
}

function summarisePerModCoverage(modDirs) {
  /*
   * After the fetch loop, inspect which per-mod files actually
   * landed on disk and report a one-line summary per modDir so
   * partial mods are obvious in the build log.  Uses fs.existsSync
   * against the cache so it's independent of whether the file was
   * skipped on 404, deleted as stale, or never tried because it
   * was within TTL.
   */
  if (!modDirs.length) return;
  console.log('\nPer-mod coverage:');
  for (const modDir of modDirs) {
    const files = perModTsFiles(modDir);
    const present = files.filter(({ rel }) =>
      fs.existsSync(path.join(UPSTREAM_DIR, rel))
    );
    const missing = files
      .filter(({ rel }) => !fs.existsSync(path.join(UPSTREAM_DIR, rel)))
      .map(({ rel }) => path.basename(rel, '.ts'));
    if (missing.length === 0) {
      console.log(`  ${modDir}: ${files.length}/${files.length} files`);
    } else if (missing.length === files.length) {
      console.warn(
        `  ${modDir}: 0/${files.length} files - mod not found upstream ` +
        `(check modDir name in regulations-config.cjs)`
      );
    } else {
      console.warn(
        `  ${modDir}: ${present.length}/${files.length} files ` +
        `(missing: ${missing.join(', ')} - build will fall back to ` +
        `master / default config for these)`
      );
    }
  }
}

async function main() {
  ensureDir(CACHE_DIR);
  ensureDir(UPSTREAM_DIR);

  console.log('Compiled JSON (from CDN)');
  for (const name of COMPILED_FILES) {
    await fetchOneCompiled(name);
  }

  console.log('\nTypeScript source (from GitHub)');
  const modDirs = readModDirs();
  const tsFiles = [...MASTER_TS_FILES];
  for (const m of modDirs) tsFiles.push(...perModTsFiles(m));

  for (const { rel } of tsFiles) {
    /*
     * Per-mod files are optional (404 = "mod doesn't define this
     * file"); everything else is required (404 = fatal).  See
     * isPerModFile and the comment on fetchTo.
     */
    await fetchOneUpstream(rel, { optional: isPerModFile(rel) });
  }

  console.log('\nClient TypeScript source (from GitHub)');
  for (const { rel } of CLIENT_TS_FILES) {
    await fetchOneClient(rel);
  }

  if (modDirs.length === 0) {
    console.warn('  ! no mod dirs discovered from regulations-config (no per-mod files fetched)');
  } else {
    summarisePerModCoverage(modDirs);
  }
}

main();
