/*
 * Per-regulation configuration.  Shared by:
 *   - scripts/parse-ts-data.cjs     (items/abilities patches)
 *   - scripts/build-regulations.cjs (bundle + per-regulation learnset)
 *
 * Each entry is a self-contained record.  Adding a new regulation =
 * appending a new entry here + re-running `npm run build:data`.
 *
 * Fields:
 *   key                          string  regulation id (becomes the bundle
 *                                         filename and the default UI key)
 *   label                        string  UI label
 *   modDir                       string | string[]
 *                                         Upstream Showdown mod folder(s).
 *                                         (REQUIRED unless `frozen: true`).
 *                                         When an array is given, the build
 *                                         merges data from each mod directory
 *                                         in order.  On conflicts (same key
 *                                         in formats-data, learnsets, items,
 *                                         or abilities), the LAST directory
 *                                         wins.
 *   isNonstandard                string[]  isNonstandard tags that are blocked
 *                                         by this regulation (used to check
 *                                         whether a move / item / ability is
 *                                         legal).  See "isNonstandard tags"
 *                                         below.
 *   excludedRosterNonstandard    string[]  isNonstandard tags that are
 *                                         excluded from the roster (i.e. the
 *                                         Pokemon the regulation bans outright,
 *                                         not just un-bans as moves).  The
 *                                         roster is derived from
 *                                         `mods/{modDir}/formats-data.ts`; any
 *                                         entry whose `isNonstandard` matches
 *                                         one of these is dropped.
 *   frozen                       boolean  (optional, default false)
 *                                         If true, the regulation's bundle
 *                                         and per-regulation learnset are
 *                                         preserved as-is - the build
 *                                         doesn't read from upstream and
 *                                         doesn't overwrite the files.  The
 *                                         regulation is still exposed in the
 *                                         UI and still appears in the
 *                                         bundle barrel.  See "Frozen
 *                                         regulations" below.
 *
 * isNonstandard tags
 * ------------------
 *   'Past'         - only legal in past gens (not in current gen standard)
 *   'LGPE'         - Let's Go Pikachu/Eevee exclusive moves/items
 *   'Future'       - Gen 10+ (not yet released)
 *   'CAP'          - Create-A-Pokemon project, not in standard play
 *   'Unobtainable' - exists in the data files but not obtainable in game
 *   'Custom'       - mod-specific fakemon (e.g. the Champions mod has none)
 *
 *   The "all" pseudo-regulation is built into the runtime registry
 *   (see src/lib/regulations.js); it is intentionally NOT in this list
 *   because it has no upstream mod folder.
 *
 * Preserving old regulations across Showdown updates
 * ---------------------------------------------------
 *   Each entry is a frozen snapshot.  When Showdown updates to a new
 *   regulation:
 *
 *     1. Append a new entry below with the new `key` and `modDir`.
 *     2. Run `npm run build:data`.
 *
 *   The old entry stays in the list (or can be removed - its bundle
 *   file is already on disk and won't be re-emitted).  Removing the
 *   entry only affects the dropdown and the default.
 *
 *   If you rename an existing entry (e.g. `key: 'm-a'` -> `key: 'm-a-2025'`),
 *   a fresh bundle is emitted under the new key.  Any localStorage
 *   references to the old key will fall back to the default.
 *
 * Frozen regulations
 * ------------------
 *   Use `frozen: true` to mark a regulation as "frozen at this version".
 *   The build will:
 *     - skip reading from `mods/{modDir}/` (modDir is optional)
 *     - skip regenerating the bundle at `src/data/regulations/{key}.js`
 *     - skip regenerating the per-regulation learnset at
 *       `public/regulations/{key}/learnsets.json`
 *     - still include the regulation in the bundle barrel
 *       (`src/data/regulations/index.js`) so the UI dropdown shows it
 *     - fail loudly if the bundle or learnset files don't exist on
 *       disk (means: the entry was added but never built once)
 *
 *   Typical workflow:
 *     1. Add a new entry as non-frozen.  Run `npm run build:data` to
 *        generate the bundle + learnset.
 *     2. Edit the entry to set `frozen: true`.  Run `npm run build:data`
 *        again.  The existing files are preserved; future builds leave
 *        them alone.
 *
 *   To unfreeze: set `frozen: false` (or remove the field) and rebuild.
 *   The bundle + learnset will be regenerated from upstream.
 *
 *   Use cases:
 *     - Snapshotting a past season's metagame (e.g. "M-A 2024" built
 *       from the upstream state as of 2024, then frozen)
 *     - Carrying a regulation across Showdown's upstream renames
 *       (frozen entry still works even if the modDir is gone)
 */

const REGULATIONS = [
  {
    key: "m-a",
    label: "Regulation M-A",
    modDir: "champions",
    isNonstandard: ["Past", "LGPE", "Future", "CAP", "Unobtainable", "Custom"],
    excludedRosterNonstandard: ["Past", "Future", "LGPE", "Unobtainable", "Custom"],
  },
];

/**
 * Normalize a regulation's modDir to an array of strings.
 * Accepts a single string or an array of strings.
 * Returns [] for frozen regulations with no modDir.
 */
function normalizeModDirs(modDir) {
  if (!modDir) return [];
  return Array.isArray(modDir) ? modDir : [modDir];
}

module.exports = { REGULATIONS, normalizeModDirs };
