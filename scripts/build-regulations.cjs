/*
 * Build per-regulation bundles and per-regulation learnset JSON.
 *
 * Each regulation becomes:
 *   - src/data/regulations/{key}.js
 *       exports KEY, LABEL, POKEMON, ITEMS, ABILITIES, IS_NONSTANDARD, LEARNSETS_URL
 *   - public/regulations/{key}/learnsets.json
 *       slimmed per-regulation learnsets (already includes form fallback)
 *   - src/data/regulations/index.js  (barrel re-exporting every bundle)
 *
 * The "all" pseudo-regulation is built-in to lib/regulations.js - it has
 * no data file because it accepts everything.
 *
 * The list of regulations to build is in scripts/regulations-config.cjs;
 * adding a new regulation = appending a new entry there and re-running
 * `npm run build:data`.
 *
 * The source TypeScript files live in scripts/.cache/upstream/ (populated
 * by `npm run fetch`, which pulls from
 * https://raw.githubusercontent.com/smogon/pokemon-showdown).  Set
 * POKEMON_SHOWDOWN_LOCAL to override with a local checkout.
 *
 * The Showdown mod is the source of truth for the per-regulation data:
 *   - mods/{modDir}/learnsets.ts     per-species learn codes
 *   - mods/{modDir}/formats-data.ts  legal species (roster)
 *   - mods/{modDir}/items.ts         per-regulation item patches
 *   - mods/{modDir}/abilities.ts     per-regulation ability patches
 *
 * Each of those four files is OPTIONAL on a per-mod basis.  A mod may
 * ship only some of them (e.g. a mod that patches items/abilities
 * without touching the roster or learnsets).  When a mod is missing a
 * given file we treat that as "mod does not define this file" and
 * gracefully fall back:
 *
 *   formats-data.ts   per-mod only; if NO mod in modDirs defines it,
 *                     the regulation has no roster and the build fails.
 *                     Otherwise the first (latest, in array order) mod
 *                     that defines it provides the data, with later
 *                     modDirs overlaying entries on conflict.
 *
 *   learnsets.ts      per-mod only; same as formats-data but missing
 *                     everywhere is NOT fatal - we just emit an empty
 *                     learnsets.json so the regulation still loads with
 *                     no learnset data attached to its roster.
 *
 *   items.ts          master data/items.ts is the default; missing mod
 *                     files contribute no patches and the master
 *                     allowlist is used verbatim.
 *
 *   abilities.ts      master data/abilities.ts is the default; same
 *                     behaviour as items.ts.
 *
 * The 404 / file-not-found case is therefore never fatal per mod -
 * it's only fatal across all modDirs for formats-data (the roster).
 *
 * The master pokedex is used to resolve form -> base species, so that
 * forms like Aegislash-Blade fall back to Aegislash's learnset.
 *
 * Per-species learnsets are merged: the form-specific entries are
 * layered on top of the base species' entries (form-specific wins on
 * conflict).  This matches Showdown's runtime semantics where forms
 * inherit their base species' learnset and override individual moves.
 *
 * Items and abilities are also per-regulation.  Each regulation's
 * ITEMS and ABILITIES allowlists are derived from:
 *
 *   master {items,abilities}.ts  +  this regulation's {items,abilities}.ts
 *
 * Patches are applied on top of the master (any `isNonstandard`
 * override in the patch wins).  Items/abilities whose final
 * `isNonstandard` is `undefined` or `null` are legal.  This means
 * each regulation's allowlist reflects only ITS OWN patches, not
 * patches from other regulations.
 *
 * The global src/data/{items,abilities}.js (emitted by
 * parse-ts-data.cjs) is still used for name/desc lookups but is no
 * longer authoritative for legality.
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const ts = require('typescript');
const { REGULATIONS, normalizeModDirs } = require('./regulations-config.cjs');

const ROOT = path.resolve(__dirname, '..');
/*
 * Source of truth for upstream TypeScript files.  By default we read
 * from scripts/.cache/upstream/ (populated by `npm run fetch`, which
 * pulls from https://raw.githubusercontent.com/smogon/pokemon-showdown).
 * To work offline against a local checkout, set POKEMON_SHOWDOWN_LOCAL
 * to the repo path.
 */
const PS_ROOT = process.env.POKEMON_SHOWDOWN_LOCAL
  ? path.resolve(process.env.POKEMON_SHOWDOWN_LOCAL)
  : path.join(ROOT, 'scripts', '.cache', 'upstream');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'regulations');
const PUBLIC_REG_DIR = path.join(ROOT, 'public', 'regulations');

/*
 * Per-regulation config.
 *
 *   key               the regulation key (must be unique, used as filename)
 *   label             UI label
 *   modDir            Showdown mod folder name; `formats-data.ts` lives there
 *
 * The Champions mod is internally named "champions" in Showdown's source;
 * the regulation we expose is "m-a" (Pokemon Champions, the launch product).
 */
function makeLiteralToValue(sf) {
  return function literalToValue(node) {
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
      const inner = literalToValue(node.operand);
      return typeof inner === 'number' ? -inner : undefined;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const obj = {};
      for (const prop of node.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const key = prop.name.getText(sf).replace(/['"]/g, '');
        const val = literalToValue(prop.initializer);
        if (val !== undefined) obj[key] = val;
      }
      return obj;
    }
    if (ts.isArrayLiteralExpression(node)) {
      return node.elements.map((el) => literalToValue(el)).filter((v) => v !== undefined);
    }
    return undefined;
  };
}

function findObjectExport(sf, exportName) {
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExport = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExport) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (decl.name.getText(sf) !== exportName) continue;
      if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
      return decl.initializer;
    }
  }
  return null;
}

function parseFormatsData(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const literalToValue = makeLiteralToValue(sf);

  const root = findObjectExport(sf, exportName);
  if (!root) return null;

  const entries = {};
  for (const prop of root.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const id = prop.name.getText(sf).replace(/['"]/g, '');
    if (!/^[a-z0-9]+$/.test(id)) continue;
    const obj = literalToValue(prop.initializer);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
    entries[id] = {
      isNonstandard: obj.isNonstandard ?? null,
      tier: obj.tier ?? null,
      _name: obj.name ?? null,
    };
  }
  return entries;
}

function parseLearnsets(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const literalToValue = makeLiteralToValue(sf);

  const root = findObjectExport(sf, exportName);
  if (!root) return null;

  const result = {};
  for (const prop of root.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const id = prop.name.getText(sf).replace(/['"]/g, '');
    if (!/^[a-z0-9]+$/.test(id)) continue;
    const value = literalToValue(prop.initializer);
    if (value && typeof value === 'object' && !Array.isArray(value) && value.learnset) {
      result[id] = value.learnset;
    }
  }
  return result;
}

function parseFormToBase(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const root = findObjectExport(sf, 'Pokedex');
  if (!root) return {};

  const map = {};
  for (const prop of root.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const id = prop.name.getText(sf).replace(/['"]/g, '');
    if (!/^[a-z0-9]+$/.test(id)) continue;
    if (!ts.isObjectLiteralExpression(prop.initializer)) continue;
    for (const sub of prop.initializer.properties) {
      if (!ts.isPropertyAssignment(sub)) continue;
      const key = sub.name.getText(sf).replace(/['"]/g, '');
      if (key !== 'baseSpecies') continue;
      const init = sub.initializer;
      if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
        map[id] = init.text.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      break;
    }
  }
  return map;
}

function loadNameMap() {
  const masterDex = path.join(PS_ROOT, 'data', 'pokedex.ts');
  if (!fs.existsSync(masterDex)) return null;
  const parsed = parseFormatsData(masterDex, 'Pokedex');
  if (!parsed) return null;
  const map = {};
  for (const [id, entry] of Object.entries(parsed)) {
    if (entry._name) map[id] = entry._name;
  }
  return map;
}

function deriveRosterIds(parsed, excludedNonstandard) {
  const ids = new Set();
  for (const [id, { isNonstandard }] of Object.entries(parsed)) {
    if (isNonstandard && excludedNonstandard.has(isNonstandard)) continue;
    ids.add(id);
  }
  return ids;
}

function resolveNames(ids, nameMap) {
  const out = [];
  const unresolved = [];
  for (const id of ids) {
    const name = nameMap?.[id] || id;
    if (name === id) unresolved.push(id);
    out.push(name);
  }
  out.sort((a, b) => a.localeCompare(b));
  return { names: out, unresolved };
}

function deriveLegalIds(obj) {
  const ids = new Set();
  for (const [id, entry] of Object.entries(obj)) {
    if (!entry) continue;
    const ns = entry.isNonstandard;
    if (ns === undefined || ns === null) ids.add(id);
  }
  return ids;
}

const ENTRY_FIELDS = ['name', 'num', 'gen', 'desc', 'shortDesc', 'isNonstandard', 'rating'];

function pickEntryFields(obj) {
  const out = {};
  for (const f of ENTRY_FIELDS) {
    if (obj[f] !== undefined) out[f] = obj[f];
  }
  return Object.keys(out).length ? out : null;
}

function parseExportedMap(filePath, exportName) {
  /*
   * Parse a Showdown-style `export const X = { id: { ... }, ... }` file
   * and return `{ id: { name, num, ... } }` for every id that matches
   * /^[a-z0-9]+$/.  Returns null if the export isn't found.
   */
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const literalToValue = makeLiteralToValue(sf);

  const root = findObjectExport(sf, exportName);
  if (!root) return null;

  const out = {};
  for (const prop of root.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const id = prop.name.getText(sf).replace(/['"]/g, '');
    if (!/^[a-z0-9]+$/.test(id)) continue;
    const value = literalToValue(prop.initializer);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const picked = pickEntryFields(value);
      if (picked) out[id] = picked;
    }
  }
  return out;
}

function mergeEntries(base, patch) {
  /*
   * Apply `patch` on top of a shallow copy of `base`.  Only entries
   * with a defined `isNonstandard` in the patch are applied (matches
   * parse-ts-data.cjs's mergePatches behaviour).  Returns the merged
   * map (base is not mutated) and the number of entries changed.
   */
  if (!patch) return { merged: { ...base }, changed: 0 };
  const merged = { ...base };
  let changed = 0;
  for (const [id, patchEntry] of Object.entries(patch)) {
    if (!patchEntry || patchEntry.isNonstandard === undefined) continue;
    if (!merged[id]) {
      merged[id] = { name: id, ...pickEntryFields(patchEntry) };
      changed++;
      continue;
    }
    merged[id] = { ...merged[id], isNonstandard: patchEntry.isNonstandard };
    changed++;
  }
  return { merged, changed };
}

function loadEntryMap(modRelPath, exportName, opts = {}) {
  /*
   * Load an entries map from the master data or a per-regulation mod
   * folder.  Returns an empty object if the file doesn't exist (e.g.
   * a mod has no `items.ts`).
   *
   *   opts.silent   true to suppress the "mod does not define this
   *                 file" warning.  Use for the master files, where
   *                 a missing file is already a fatal error handled
   *                 by the caller - emitting a warning first would
   *                 be noise.
   */
  const abs = path.join(PS_ROOT, 'data', modRelPath);
  if (!fs.existsSync(abs)) {
    if (!opts.silent) {
      console.warn(
        `  ${modRelPath} not found - mod does not define this file, ` +
        `falling back to default config`
      );
    }
    return {};
  }
  return parseExportedMap(abs, exportName) || {};
}

function readModFileIfExists(modDir, fileName, label) {
  /*
   * Resolve a per-mod file path, returning null (with a warning) if
   * the file is missing.  This is the per-mod equivalent of the
   * "404 -> mod does not define this file" fallback used for items /
   * abilities via loadEntryMap, applied to formats-data.ts and
   * learnsets.ts which are read with file-type-specific parsers.
   *
   *   modDir    e.g. "champions" or "championsregma"
   *   fileName  e.g. "formats-data.ts"
   *   label     human-readable role of the file (for the warning)
   */
  const abs = path.join(PS_ROOT, 'data', 'mods', modDir, fileName);
  if (!fs.existsSync(abs)) {
    console.warn(
      `  mods/${modDir}/${fileName} not found - ${label} not defined ` +
      `by this mod, falling back to latest available modDir or default config`
    );
    return null;
  }
  return abs;
}

function buildRegulationLearnsets(modLearnsets, formToBase, rosterIds) {
  /*
   * Each species' learnset is the union of its base species' learnset
   * and its own form-specific entries (form-specific wins on conflict).
   * This matches Showdown's runtime semantics where forms inherit their
   * base species' learnset and override individual moves.
   *
   *   rotomheat  =  rotom (42 moves)  +  rotomheat { overheat: ["9R"] }
   *               =  43 moves
   *
   *   aegislashblade  =  aegislash (45 moves)  +  aegislashblade (none)
   *                    =  45 moves
   *
   *   floettemega  =  floetteeternal (inherited)  +  floettemega (none)
   *                 =  floetteeternal's moves
   */
  const out = {};
  let merged = 0;
  let inherited = 0;
  const missing = [];
  for (const id of rosterIds) {
    const formLearnset = modLearnsets[id];
    const baseId = formToBase[id];
    const baseLearnset = baseId ? modLearnsets[baseId] : null;
    if (formLearnset && baseLearnset) {
      out[id] = { ...baseLearnset, ...formLearnset };
      merged++;
    } else if (formLearnset) {
      out[id] = formLearnset;
      merged++;
    } else if (baseLearnset) {
      out[id] = baseLearnset;
      inherited++;
    } else {
      missing.push(id);
    }
  }
  return { learnsets: out, merged, inherited, missing };
}

function slimLearnsets(raw) {
  /*
   * Per-regulation learnsets are just `speciesId -> [moveId, ...]`.
   * Learn codes are dropped - the UI doesn't care how the Pokemon
   * learns the move, only whether it can.
   */
  const slim = {};
  for (const [speciesId, learnset] of Object.entries(raw)) {
    if (!learnset || typeof learnset !== 'object') continue;
    const moveIds = [];
    for (const [moveId, codes] of Object.entries(learnset)) {
      if (!Array.isArray(codes) || codes.length === 0) continue;
      moveIds.push(moveId);
    }
    if (moveIds.length > 0) {
      moveIds.sort();
      slim[speciesId] = moveIds;
    }
  }
  return { slim };
}

function emitRegulation(filePath, config, pokemonNames, legalItemIds, legalAbilityIds) {
  const learnsetsUrl = `/regulations/${config.key}/learnsets.json`;
  const pokemonBlock =
    'export const POKEMON = new Set([\n' +
    pokemonNames.map((n) => '  ' + JSON.stringify(n) + ',').join('\n') +
    '\n]);\n';
  const itemsBlock =
    'export const ITEMS = new Set([\n' +
    [...legalItemIds].sort().map((id) => '  ' + JSON.stringify(id) + ',').join('\n') +
    '\n]);\n';
  const abilitiesBlock =
    'export const ABILITIES = new Set([\n' +
    [...legalAbilityIds].sort().map((id) => '  ' + JSON.stringify(id) + ',').join('\n') +
    '\n]);\n';
  const isNonstandardBlock =
    'export const IS_NONSTANDARD = new Set([\n' +
    config.isNonstandard.map((t) => '  ' + JSON.stringify(t) + ',').join('\n') +
    '\n]);\n';
  const urlBlock =
    'export const LEARNSETS_URL = ' +
    JSON.stringify(learnsetsUrl) +
    ';\n';
  const body =
    '// AUTO-GENERATED by scripts/build-regulations.cjs - do not edit by hand.\n' +
    '// Re-run `npm run build:data` to regenerate.\n\n' +
    'export const KEY = ' + JSON.stringify(config.key) + ';\n' +
    'export const LABEL = ' + JSON.stringify(config.label) + ';\n\n' +
    pokemonBlock + '\n' +
    itemsBlock + '\n' +
    abilitiesBlock + '\n' +
    isNonstandardBlock + '\n' +
    urlBlock;
  fs.writeFileSync(filePath, body);
}

function emitBarrel(keys) {
  /*
   * Barrel re-exporting every regulation bundle.  src/lib/regulations.js
   * imports from this to build the runtime registry without needing to
   * know each bundle's filename in advance.
   *
   * Order is preserved as-given (the iteration order of REGULATIONS in
   * the config).  src/lib/regulations.js uses bundleRecords[0] as
   * DEFAULT_REG, so the first config entry becomes the default; sorting
   * alphabetically here would silently override that intent.
   */
  const lines = keys.map(
    (k) => `export * as ${sanitizeIdent(k)} from "./${k}.js";`
  );
  const body =
    '// AUTO-GENERATED by scripts/build-regulations.cjs - do not edit by hand.\n' +
    '// Re-run `npm run build:data` to regenerate.\n' +
    '//\n' +
    '// Barrel re-exporting every regulation bundle.  Each namespace is\n' +
    '// named after its `key` (e.g. the bundle at `m-a.js` becomes\n' +
    '// `export * as m_a from "./m-a.js"`).  src/lib/regulations.js\n' +
    '// iterates the namespaces at startup to build REGULATIONS.\n\n' +
    lines.join('\n') + '\n';
  fs.writeFileSync(path.join(OUT_DIR, 'index.js'), body);
}

function sanitizeIdent(key) {
  return key.replace(/[^a-zA-Z0-9_$]/g, '_');
}

function emitLearnsetsJson(filePath, slim) {
  const json = JSON.stringify(slim);
  fs.writeFileSync(filePath, json);
  return json.length;
}

async function build() {
  if (!fs.existsSync(PS_ROOT)) {
    console.error(
      'upstream source not found at', PS_ROOT, '\n' +
      '  run `npm run fetch` to populate scripts/.cache/upstream, or\n' +
      '  set POKEMON_SHOWDOWN_LOCAL to a local checkout of pokemon-showdown.'
    );
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const nameMap = loadNameMap();

  const masterDex = path.join(PS_ROOT, 'data', 'pokedex.ts');
  const formToBase = parseFormToBase(masterDex);

  // Floette-Mega should inherit from Floette-Eternal, not base Floette
  formToBase['floettemega'] = 'floetteeternal';

  // Master items.ts / abilities.ts are the "default config" fallback
  // for per-regulation patches.  Missing master files are fatal - the
  // master is the foundation everything else builds on top of.
  const masterItems = loadEntryMap('items.ts', 'Items', { silent: true });
  const masterAbilities = loadEntryMap('abilities.ts', 'Abilities', { silent: true });
  if (!Object.keys(masterItems).length) {
    console.error('Failed to parse master items.ts');
    process.exit(1);
  }
  if (!Object.keys(masterAbilities).length) {
    console.error('Failed to parse master abilities.ts');
    process.exit(1);
  }

  const builtKeys = [];

  for (const config of REGULATIONS) {
    if (config.frozen) {
      /*
       * Frozen regulations are preserved as-is: no upstream read, no
       * bundle/learnset overwrite.  The entry must still appear in
       * the barrel so the UI keeps exposing it.  The bundle +
       * learnset files must already exist on disk; if they don't,
       * the entry was added without ever being built.
       */
      const bundlePath = path.join(OUT_DIR, config.key + '.js');
      const learnsetPath = path.join(PUBLIC_REG_DIR, config.key, 'learnsets.json');
      const missing = [];
      if (!fs.existsSync(bundlePath)) missing.push(bundlePath);
      if (!fs.existsSync(learnsetPath)) missing.push(learnsetPath);
      if (missing.length) {
        console.error(`Frozen regulation "${config.key}" is missing:`);
        for (const m of missing) console.error('  ' + m);
        console.error(`Either remove the entry, or set frozen:false and run build once to generate it.`);
        process.exit(1);
      }
      console.log(`${config.key}.js: FROZEN (skipping build, preserving existing bundle + learnset)`);
      builtKeys.push(config.key);
      continue;
    }

    const modDirs = normalizeModDirs(config.modDir);
    if (modDirs.length === 0) {
      console.error(`Regulation "${config.key}" has no modDir and is not frozen.`);
      process.exit(1);
    }

    /*
     * Each per-mod file is optional.  A mod is allowed to ship only
     * some of {formats-data.ts, learnsets.ts, items.ts, abilities.ts};
     * missing files are treated as "mod does not define this file"
     * and the build gracefully falls back to the next modDir in
     * array order (which is the latest, matching the "last directory
     * wins" merge semantics) or, for items/abilities, to the master
     * default config.
     *
     * Per-file coverage is tracked across all modDirs so we can
     * surface partial mods in the build log and fail loudly only
     * when no provider exists for a mandatory file (formats-data.ts
     * is mandatory because the regulation has no roster without it).
     */
    const coverage = { formats: false, learnsets: false, items: false, abilities: false };
    for (const md of modDirs) {
      const modDirPath = path.join(PS_ROOT, 'data', 'mods', md);
      for (const f of ['formats-data.ts', 'learnsets.ts', 'items.ts', 'abilities.ts']) {
        if (fs.existsSync(path.join(modDirPath, f))) {
          if (f === 'formats-data.ts') coverage.formats = true;
          else if (f === 'learnsets.ts') coverage.learnsets = true;
          else if (f === 'items.ts') coverage.items = true;
          else if (f === 'abilities.ts') coverage.abilities = true;
        }
      }
    }
    for (const md of modDirs) {
      const modDirPath = path.join(PS_ROOT, 'data', 'mods', md);
      if (!fs.existsSync(modDirPath)) {
        console.warn(`  mod directory mods/${md} not found - this modDir will contribute nothing to "${config.key}"`);
        continue;
      }
      for (const [file, key] of [
        ['formats-data.ts', 'formats'],
        ['learnsets.ts', 'learnsets'],
        ['items.ts', 'items'],
        ['abilities.ts', 'abilities'],
      ]) {
        if (!fs.existsSync(path.join(modDirPath, file))) {
          console.warn(`  mod "${md}" has no ${file} - not defined by this mod`);
        }
      }
    }
    if (!coverage.formats) {
      console.error(
        `Regulation "${config.key}" has no formats-data.ts in any modDir ` +
        `(${modDirs.join(', ')}); the regulation would have no roster.`
      );
      process.exit(1);
    }
    if (!coverage.learnsets) {
      // Not fatal: a regulation without learnset data still loads,
      // its roster just won't have moves attached.  Surface as a
      // warning so it's visible in the build log.
      console.warn(
        `  Regulation "${config.key}" has no learnsets.ts in any modDir ` +
        `(${modDirs.join(', ')}); an empty learnsets.json will be emitted.`
      );
    }

    // Merge formats-data from all modDirs (later wins on conflict).
    // Each mod's file is read only if it exists - a missing file just
    // means that mod doesn't define this data and we fall back to
    // whatever earlier modDir provided it (or skip the file entirely
    // if none do, which the coverage check above already handled).
    let parsed = {};
    for (const md of modDirs) {
      const formatsPath = readModFileIfExists(md, 'formats-data.ts', 'formats-data');
      if (!formatsPath) continue;
      const entries = parseFormatsData(formatsPath, 'FormatsData');
      if (!entries) {
        console.error('Failed to parse', formatsPath);
        process.exit(1);
      }
      Object.assign(parsed, entries);
    }

    const excludedSet = new Set(config.excludedRosterNonstandard);
    const ids = deriveRosterIds(parsed, excludedSet);
    const { names, unresolved } = resolveNames(ids, nameMap);

    // Merge learnsets from all modDirs (later wins on conflict).
    // Same fallback semantics as formats-data: a missing file is
    // "mod does not define learnsets", and we let later modDirs or
    // the earlier modDir provide the data.
    let modLearnsets = {};
    for (const md of modDirs) {
      const learnsetsPath = readModFileIfExists(md, 'learnsets.ts', 'learnsets');
      if (!learnsetsPath) continue;
      const entries = parseLearnsets(learnsetsPath, 'Learnsets') || {};
      Object.assign(modLearnsets, entries);
    }
    const { learnsets: regLearnsets, merged, inherited, missing } =
      buildRegulationLearnsets(modLearnsets, formToBase, ids);
    const { slim } = slimLearnsets(regLearnsets);

    // Apply items/abilities patches from all modDirs in order
    // (later wins).  loadEntryMap already treats a missing per-mod
    // file as "mod does not define this file" and contributes no
    // patches; the master allowlist remains the default.
    let regItemsPatch = {};
    let regAbilitiesPatch = {};
    for (const md of modDirs) {
      const itemsFile = `mods/${md}/items.ts`;
      const abilitiesFile = `mods/${md}/abilities.ts`;
      const itemsPatch = loadEntryMap(itemsFile, 'Items');
      const abilitiesPatch = loadEntryMap(abilitiesFile, 'Abilities');
      // Later modDirs overwrite earlier ones on the same key
      Object.assign(regItemsPatch, itemsPatch);
      Object.assign(regAbilitiesPatch, abilitiesPatch);
    }
    const { merged: mergedItems, changed: itemsChanged } = mergeEntries(masterItems, regItemsPatch);
    const { merged: mergedAbilities, changed: abilitiesChanged } = mergeEntries(masterAbilities, regAbilitiesPatch);
    const legalItemIds = deriveLegalIds(mergedItems);
    const legalAbilityIds = deriveLegalIds(mergedAbilities);

    const outPath = path.join(OUT_DIR, config.key + '.js');
    emitRegulation(outPath, config, names, legalItemIds, legalAbilityIds);

    const publicDir = path.join(PUBLIC_REG_DIR, config.key);
    fs.mkdirSync(publicDir, { recursive: true });
    const learnsetJsonPath = path.join(publicDir, 'learnsets.json');
    const bytes = emitLearnsetsJson(learnsetJsonPath, slim);

    const totalMoves = Object.values(slim).reduce((s, ids) => s + ids.length, 0);

    // Summary of which files contributed to this regulation, so a
    // partial mod is visible at a glance instead of having to grep
    // through warnings.
    const contributedFrom = [];
    for (const md of modDirs) {
      const modDirPath = path.join(PS_ROOT, 'data', 'mods', md);
      if (!fs.existsSync(modDirPath)) continue;
      const present = ['formats-data.ts', 'learnsets.ts', 'items.ts', 'abilities.ts']
        .filter((f) => fs.existsSync(path.join(modDirPath, f)))
        .map((f) => f.replace('.ts', ''));
      if (present.length) {
        contributedFrom.push(`${md}[${present.join(',')}]`);
      } else {
        contributedFrom.push(`${md}[none]`);
      }
    }

    console.log(
      `${config.key}.js: ${names.length} pokemon, ${legalItemIds.size} items, ${legalAbilityIds.size} abilities, ${config.isNonstandard.length} blocked tags`
    );
    console.log(
      `    (items: ${itemsChanged} patched by mod; abilities: ${abilitiesChanged} patched by mod)` +
      ` [modDirs: ${contributedFrom.join(', ')}]`
    );
    console.log(
      `  regulations/${config.key}/learnsets.json: ${Object.keys(slim).length} species (${merged} merged, ${inherited} inherited), ${totalMoves} moves, ${(bytes / 1024).toFixed(1)} KB`
    );
    if (missing.length) {
      console.warn(`  Note: ${missing.length} species have no learnset: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
    }
    if (unresolved.length) {
      console.warn(`  Note: ${unresolved.length} ids could not be resolved to display names.`);
    }
    builtKeys.push(config.key);
  }

  emitBarrel(builtKeys);
  console.log(`  regulations/index.js: barrel re-exporting ${builtKeys.length} bundle(s)`);
}

build();
