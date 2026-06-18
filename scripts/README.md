# Data build pipeline

The data layer for `pokemon-tools` is generated locally; nothing in the app
talks to Showdown's CDN at runtime except for the slim JSON drops in
`public/`.  This folder contains the scripts that produce those drops.

## Quick start

```
npm run build          # fetch upstream + rebuild data + vite build
npm run build:data     # fetch upstream + rebuild data only
npm run fetch          # refresh scripts/.cache/ from GitHub + Showdown CDN
npm run smoke          # run smoke tests against the built artefacts
```

The default `npm run build` runs the data pipeline first, so the public
JSON and bundled data files are always in sync with the source mod.

## Source data

Two sources feed the data:

1. `https://raw.githubusercontent.com/smogon/pokemon-showdown/master/...`
   - Showdown's master TypeScript data files.  Pulled into
     `scripts/.cache/upstream/data/` by `fetch-showdown.cjs` and read
     from there by the build scripts:
     - `pokedex.ts`     - canonical species name map AND form -> base mapping
     - `items.ts`       - all items
     - `abilities.ts`   - all abilities
     - `mods/{modDir}/formats-data.ts` - per-regulation roster
     - `mods/{modDir}/items.ts`        - per-regulation item patches
     - `mods/{modDir}/abilities.ts`    - per-regulation ability patches
     - `mods/{modDir}/learnsets.ts`    - per-regulation per-species learnsets
     - `mods/{modDir}/moves.ts`        - per-regulation move patches

     `{modDir}` is taken from each entry in `regulations-config.cjs`.
     If a mod directory is missing `formats-data.ts` or `learnsets.ts`,
     the builder keeps the latest available file from earlier modDirs;
     if no mod file exists at all, it falls back to master
     `data/formats-data.ts` / `data/learnsets.ts`.

     To work offline against a local checkout, set `POKEMON_SHOWDOWN_LOCAL`
     to the repo path.  The build scripts will read from there instead
     of the cache.

2. `https://play.pokemonshowdown.com/data/` - Showdown's compiled JSON:
   - `pokedex.json`
   - `moves.json`
   - `learnsets.json`

   Pulled into `scripts/.cache/` by `fetch-showdown.cjs`.  Items,
   abilities and conditions are NOT exposed as JSON; they only exist as
   TypeScript.  That's why we parse the .ts files directly.

## Pipeline order

```
fetch-showdown.cjs       -> scripts/.cache/{pokedex,moves,learnsets}.json
                          scripts/.cache/upstream/data/...
parse-ts-data.cjs        -> src/data/{items,abilities}.js                  (bundled)
build-regulations.cjs    -> src/data/regulations/{key}.js                  (bundled)
                          src/data/regulations/index.js                    (barrel)
                          public/regulations/{key}/learnsets.json          (fetched)
slim-showdown.cjs        -> public/{pokedex,moves,learnsets}.json          (fetched)
```

`build-data.cjs` runs all four in order.  The fetch step is a no-op when
the cache is fresh (24h by default; override with
`SHOWDOWN_CACHE_TTL_HOURS`).  Set `SKIP_FETCH=1` to bypass it, or run
`npm run fetch` directly to force a refresh.  Set
`POKEMON_SHOWDOWN_LOCAL` to use a local checkout in place of the
upstream cache.

The list of regulations to build lives in `regulations-config.cjs`,
which is shared by `parse-ts-data.cjs` (so it knows which per-mod
patches to merge) and `build-regulations.cjs` (so it knows which
bundles to emit).

## Output sizes (May 2026)

| File                                    | Source                 | Slim       |
| --------------------------------------- | ---------------------- | ---------- |
| `src/data/items.js`                     | 1 MB TS                | 45 KB      |
| `src/data/abilities.js`                 | 600 KB TS              | 20 KB      |
| `src/data/regulations/m-a.js`           | derived                | ~5 KB      |
| `src/data/regulations/index.js`         | barrel                 | <1 KB      |
| `public/regulations/m-a/learnsets.json` | 280 KB TS              | 197 KB     |
| `public/pokedex.json`                   | 510 KB JSON            | 310 KB     |
| `public/moves.json`                     | 475 KB JSON            | 418 KB     |
| `public/learnsets.json`                 | 3.1 MB JSON            | 2.9 MB     |

Items and abilities are bundled because every Pokemon row references
them by name/id.  Regulation bundles are bundled too - they are tiny
Sets that need to be available synchronously on first render.

Per-regulation learnsets are fetched on first use, same as the master
`learnsets.json`.  Each regulation gets its own cache entry
(`pkmn_learnsets_{key}_v2`) so switching regulations is instant on
subsequent visits.

Abilities and items are NOT global - they are per-regulation allowlists,
emitted in each bundle.  See "ITEMS and ABILITIES are per-regulation"
in `src/data/README.md` for the rationale (a real bug existed when
items were derived from a globally-merged `items.js`).  Each
regulation builds its own allowlist from master + its own patches.

## How regulations are derived

`build-regulations.cjs` iterates over the `REGULATIONS` table in
`regulations-config.cjs`.  For each entry it produces three artefacts:

- A bundle at `src/data/regulations/{key}.js` with:
  - `KEY`            - the regulation id
  - `LABEL`          - UI label
  - `POKEMON`        - the legal species (Set<display name>)
  - `ITEMS`          - the legal items   (Set<id>) — derived from
                       master `items.ts` + this regulation's patches
  - `ABILITIES`      - the legal abilities (Set<id>) — derived from
                       master `abilities.ts` + this regulation's patches
  - `IS_NONSTANDARD` - the `isNonstandard` tags blocked by this
                       regulation (Set<string>)
  - `LEARNSETS_URL`  - where to fetch the per-regulation learnset

- A learnset JSON at `public/regulations/{key}/learnsets.json` shaped
  as `{ speciesId: [moveId, ...] }` - just the list of moves the
  Pokemon can learn, no learn codes.  ~17,200 moves for M-A across
  275 species.

- An entry in the barrel at `src/data/regulations/index.js`, where the
  bundle is re-exported as a namespace named after its `key`.  This
  is what `lib/regulations.js` iterates at startup to build
  `REGULATIONS` - no per-bundle import or filename list is
  hardcoded in lib code.

### M-A bundle (the only one currently in the config)

- **Roster**: every species in `mods/champions/formats-data.ts` whose
  `isNonstandard` is not in `excludedRosterNonstandard`
  (`Past` / `Future` / `LGPE` / `Unobtainable` / `Custom`).  Names are
  resolved from the master `pokedex.ts` so the resulting `Set`
  contains display names like `"Aegislash-Blade"` and
  `"Gourgeist-Large"`.  This gives 276 legal species.

- **Items**: the master `items.ts` (from
  `scripts/.cache/upstream/data/items.ts`, downloaded from
  `https://raw.githubusercontent.com/smogon/pokemon-showdown`)
  merged with `mods/champions/items.ts` patches (only those patches
  — NOT patches from other regulations).  Filtered to entries where
  `isNonstandard === undefined || null`.  117 items qualify.  See
  "ITEMS and ABILITIES are per-regulation" in `src/data/README.md` for
  why this is per-regulation rather than reading from a global
  `items.js`.

- **Abilities**: the master `abilities.ts` (same upstream source)
  merged with `mods/champions/abilities.ts` patches.  Filtered to
  entries where `isNonstandard === undefined || null`.  314 abilities
  qualify for M-A (master has 318; 4 are non-standard by default; M-A
  un-bans 4 `Future` abilities, so the net count is 310 standard + 4
  un-bans = 314).

- **IS_NONSTANDARD**: the set of `isNonstandard` tags this regulation
  blocks.  M-A's set is `{Past, LGPE, Future, CAP, Unobtainable, Custom}`
  - i.e. anything not in standard play.  The same set is used for
  move legality, item legality fallback, and ability legality
  fallback (for regulations without an allowlist).

- **Learnsets**: parsed from `mods/champions/learnsets.ts`, merged
  with form fallback.  Each species' learnset is the union of:
  1. Its own entries in the mod's learnsets
  2. Its `baseSpecies`' entries (from the master `pokedex.ts`)

  Form-specific entries win on conflict.  Examples:

  - `rotomheat` = `rotom` (42 moves) + `rotomheat`
    `{ overheat: [...] }` = **43 moves**.
  - `aegislashblade` = `aegislash` (45 moves) + `aegislashblade`
    (no entries) = **45 moves**.
  - `floettemega` = `floette` (no entries in M-A) +
    `floettemega` (no entries) = **missing** (correctly dropped
    from the per-regulation JSON).

  After merging, species with no usable learnset (e.g. `floettemega`)
  are dropped from the per-regulation JSON.  The resulting JSON covers
  275 of the 276 legal species.

  **This is important**: the per-regulation learnset is the
  authoritative source for what's legal in M-A, not the master
  `learnsets.json`.  A move that's standard in the master but banned
  by the M-A mod's `moves.ts` (e.g. `absorb`) will correctly NOT
  appear in the per-regulation learnset.

  Learn codes (`9M`, `9R`, etc.) are dropped at build time - the UI
  doesn't need to know how the Pokemon learns the move, only whether
  it can.

### Preserving old regulations across Showdown updates

The `REGULATIONS` table in `regulations-config.cjs` is a list of
frozen snapshots.  When Showdown updates to a new regulation:

- **To add it without losing the old one**: append a new entry with
  the new `key` and `modDir`.  The old entry stays in the list, so
  its bundle is re-emitted under the same `key` (or you can remove
  it - the file is still on disk and won't be re-emitted).  The
  `key` is the public id used in localStorage and the URL, so
  changing it would orphan any saved state.

- **To replace the old one**: just edit the existing entry's `key`
  and `modDir`.  A fresh bundle is emitted under the new `key`; the
  old file is left on disk but not in the barrel, so it won't be
  selectable.  Any localStorage references to the old `key` will
  fall back to the default.

### Frozen regulations (snapshot a past season)

Set `frozen: true` on a regulation entry to mark it as "do not
rebuild from upstream".  The build will:

- skip reading from `mods/{modDir}/` (so `modDir` becomes optional)
- skip regenerating `src/data/regulations/{key}.js`
- skip regenerating `public/regulations/{key}/learnsets.json`
- still include the regulation in the bundle barrel
- fail loudly if the bundle or learnset files don't already exist
  on disk (the entry was added but never built once)

The build logs `FROZEN (skipping build, preserving existing bundle +
learnset)` for each frozen entry it sees, so you can verify at a
glance which entries were skipped.

Workflow:

1. Add the entry as non-frozen.  Run `npm run build:data` to
   generate the bundle + learnset from upstream.
2. Edit the entry to add `frozen: true`.  Re-run `npm run build:data`.
   The existing files are preserved; future builds leave them alone.

To unfreeze: set `frozen: false` (or remove the field) and rebuild -
the bundle + learnset will be regenerated from upstream.

## How items/abilities are slimmed

The `typescript` package's compiler API is used to safely walk the AST
of the base data files.  Only literal fields (`name`, `num`, `gen`,
`desc`, `shortDesc`, `isNonstandard`, `rating`) are extracted;
callback functions and complex objects are dropped.

The per-regulation patches (one `data/mods/{modDir}/{items,abilities}.ts`
per entry in `regulations-config.cjs`) are then merged on top in
config order: any `isNonstandard` override in a mod wins over the
base value.  In practice this currently:

- Bans items M-A marks as `isNonstandard: "Past"` (199 items)
- Un-bans items M-A marks as `isNonstandard: null` (60 items, mostly
  Mega Stones)
- Un-bans 4 abilities and tweaks 7 others

When more regulations are added, their patches are merged in too.
The header comment in each emitted `items.js` / `abilities.js`
lists the mod directories that contributed patches, so it's clear
where a value came from.

## How the slim pokedex is built

`public/pokedex.json` keeps every species that is standard in Showdown
plus every species that appears in at least one regulation's roster.
That way, switching between regulations in the UI never triggers a
re-fetch.

`public/moves.json` keeps every move with the field whitelist
`{num, name, type, basePower, category, pp, accuracy, priority, target,
flags, desc, shortDesc, isNonstandard}`.  The `flags` object is
preserved for the UI (e.g. `contact`, `protect`, `mirror`).

**Note**: `public/moves.json` is the **master** Showdown moves with
**no mod patches applied**.  Per-regulation move legality is enforced
by the mod's `learnsets.ts` (moves not in the learnset are simply
not available), not by a per-regulation `moves.json`.  If a future
regulation needs to patch moves (e.g. change `basePower` for a move
that's only legal in that mod), we'd need to emit per-regulation
`moves.json` files; the architecture supports it but the data flow
isn't wired up yet.

`public/learnsets.json` keeps every species' learnset in the
Showdown-native shape `{ speciesId: { moveId: [codes] } }` (the
wrapper key is stripped).  Each code is validated against
`^(\d+)([LMTEVS])(\d*)$` so malformed entries are dropped.  This
file is the **master** Showdown learnset, used as the fallback for
the "all" pseudo-regulation.  The lib normalises it to the
per-regulation shape `{ speciesId: [moveId, ...] }` at load time.
