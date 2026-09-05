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

### NCP Damage Calculator refresh (one-command path)

The damage engine is sourced directly from
`https://github.com/nerd-of-now/NCP-VGC-Damage-Calculator`
via `script_res/{damage_MASTER.js,damage_SV.js,ko_chance.js}`.
To pin or refresh it:

```
npm run fetch && npm run build:data   # refetch upstream + rebuild src/data/damage-calc.js
```

`scripts/fetch-showdown.cjs` fetches the three files into
`scripts/.cache/upstream/ncp-calc/` and writes a pinned version record to
`scripts/.cache/upstream/ncp-calc/version.json` **and**
`scripts/ncp-calc-version.json` (commit SHA, branch, raw URLs, file hashes,
`fetchedAt`). Deleting `src/data/damage-calc.js` and re-running `npm run build:data`
recreates an equivalent bundle from the cached files (reproducible; the bundle
header records the upstream SHA and hash so the diff can be audited).

If the upstream repo renames or moves those `script_res/` files, the fetch
will 404. The build will abort with the attempted URLs, cached SHA, and the
failing parity cases logged — report those and the upstream change required to
resolve the new raw URL. Similarly, if the core calculation becomes dependent on
jQuery/DOM that cannot be stripped while preserving parity, the build will warn
about remaining `$(` references and fail the parity checks with the same logs.

## Source data

Three sources feed the data:

1. `https://raw.githubusercontent.com/nerd-of-now/NCP-VGC-Damage-Calculator/main/script_res/`
   - NCP VGC Damage Calculator engine. Pulled into
     `scripts/.cache/upstream/ncp-calc/` by `fetch-showdown.cjs`:
     - `damage_MASTER.js`  - shared damage logic (gen 1-9 + Champions)
     - `damage_SV.js`      - Scarlet/Violet + Champions overrides
     - `ko_chance.js`      - KO chance text
   - Built into `src/data/damage-calc.js` by `scripts/build-damage-calc.cjs`
     via concatenation + `postProcess()` DOM stripping (only documented
     replacements; see that function's header for the exact diff). The
     provenance header in the bundle records the upstream commit SHA and
     file hashes. Refresh with `npm run fetch && npm run build:data`.

2. `https://raw.githubusercontent.com/smogon/pokemon-showdown/master/...`
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

     To work offline against a local checkout, set `POKEMON_SHOWDOWN_LOCAL`
     to the repo path.  The build scripts will read from there instead
     of the cache.

3. `https://play.pokemonshowdown.com/data/` - Showdown's compiled JSON:
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
                           scripts/.cache/upstream/ncp-calc/{damage_MASTER.js,damage_SV.js,ko_chance.js} + version.json
                           scripts/ncp-calc-version.json (pinned SHA)
parse-ts-data.cjs        -> src/data/{items,abilities}.js                  (bundled)
build-regulations.cjs    -> src/data/regulations/{key}.js                  (bundled)
                           src/data/regulations/index.js                    (barrel)
                           public/regulations/{key}/learnsets.json          (fetched)
slim-showdown.cjs        -> public/{pokedex,moves,learnsets}.json          (fetched)
build-damage-calc.cjs    -> src/data/damage-calc.js                        (NCP bundle, provenance header)
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

## How the NCP damage bundle is built

`scripts/build-damage-calc.cjs` concatenates the three pinned upstream files
(`damage_MASTER.js`, `damage_SV.js`, `ko_chance.js`) from
`scripts/.cache/upstream/ncp-calc/` and wraps them in an ESM factory
(`new Function` in non-strict mode). The only diff from verbatim upstream
is the documented `postProcess()` DOM stripping:

- Level/evo/tatsu/clang/weak Armor checkboxes -> `false`
- Transform checkboxes -> `false`
- Ruin checkboxes (`tablets/vessel/sword/beads-of-ruin`) -> ability presence
  (`attacker.ability === "…"` / `defender.ability === "…"`, preserving
  `&& !field.isNeutralizingGas`)
- Aura checkboxes (`-aura`, `aura-break`) -> `isAttackerAura||isDefenderAura`
  and `Aura Break` ability check
- Speed-mod DOM writes (`$(".p1-speed-mods").text(...)`) -> removed
- Remaining `$(...).val()/prop` -> `undefined`/`false`

The build logs the upstream commit SHA (from `scripts/ncp-calc-version.json`),
the concatenated hash, and the size removed. No hand-edits are made to
`src/data/damage-calc.js`; deleting it and re-running `npm run build:data`
recreates an equivalent bundle from the cached files.

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
