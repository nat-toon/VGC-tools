/*
 * Orchestrator for the data build pipeline.
 *
 *   1. fetch-showdown.cjs      -> scripts/.cache/{pokedex,moves,learnsets}.json
 *                                + scripts/.cache/upstream/{data,client/...}/...
 *   2. parse-ts-data.cjs      -> src/data/items.js, src/data/abilities.js
 *   3. parse-sprite-data.cjs  -> src/data/sprite-overrides.js
 *                                + scripts/.cache/sprite-overrides.json
 *   4. build-regulations.cjs  -> src/data/regulations/{key}.js
 *                                + public/regulations/{key}/learnsets.json
 *   5. slim-showdown.cjs      -> public/pokedex.json, public/moves.json
 *                                + public/learnsets.json
 *
 * Step 1 is a no-op when the cache is fresh (24h by default; override
 * with SHOWDOWN_CACHE_TTL_HOURS).  Run `npm run fetch` directly to
 * force a refresh.  To skip step 1 set SKIP_FETCH=1.
 *
 * For offline dev against a local checkout of pokemon-showdown, set
 * POKEMON_SHOWDOWN_LOCAL to the repo path before running.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const steps = [
  ['parse-ts-data.cjs', 'src/data/items.js + abilities.js'],
  ['parse-sprite-data.cjs', 'src/data/sprite-overrides.js + scripts/.cache/sprite-overrides.json'],
  ['build-regulations.cjs', 'src/data/regulations/*.js + public/regulations/*/learnsets.json'],
  ['slim-showdown.cjs', 'public/pokedex.json + moves.json + learnsets.json'],
];

function run(script, what) {
  console.log(`\n=== ${script} (${what}) ===`);
  const r = spawnSync(process.execPath, [path.join(__dirname, script)], {
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.error(`\n${script} failed with exit code ${r.status}`);
    process.exit(r.status ?? 1);
  }
}

if (!process.env.SKIP_FETCH) {
  run('fetch-showdown.cjs', 'scripts/.cache/ + scripts/.cache/upstream/');
}

for (const [script, what] of steps) {
  run(script, what);
}

console.log('\nData build complete.');
