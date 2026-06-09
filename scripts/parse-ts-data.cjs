/*
 * Parse the TypeScript data files from upstream Pokemon Showdown and emit
 * slim ES-module data files for the app.
 *
 *   - src/data/items.js     (Map<id, {name,num,gen,desc,shortDesc,isNonstandard}>)
 *   - src/data/abilities.js (Map<id, {name,num,gen,desc,shortDesc,isNonstandard}>)
 *
 * Ability/item descriptions are NOT in the gameplay files
 * (data/items.ts, data/abilities.ts) - those hold the onModifyX
 * callbacks and metadata.  The `desc` / `shortDesc` strings live in
 * data/text/abilities.ts (AbilitiesText) and data/text/items.ts
 * (ItemsText).  For each base entry we overlay those two fields from
 * the matching text entry, applied AFTER the gameplay parse but
 * BEFORE the per-regulation patches so a mod that wants to override
 * an ability's description can do so via its own patch.
 *
 * The source TypeScript files live in scripts/.cache/upstream/ (populated
 * by `npm run fetch`, which pulls from
 * https://raw.githubusercontent.com/smogon/pokemon-showdown).  Set
 * POKEMON_SHOWDOWN_LOCAL to override with a local checkout.
 *
 * These are lookup tables used by lib/items.js and lib/abilities.js for
 * name/desc rendering.  Per-regulation ITEMS and ABILITIES allowlists
 * are derived separately in build-regulations.cjs (master + that
 * regulation's patches only — patches from other regulations do not
 * leak through).
 *
 * The patches merged here (one `data/mods/{modDir}/{items,abilities}.ts`
 * per entry in scripts/regulations-config.cjs) are for LOOKUP only.
 * `isNonstandard` in the emitted items.js / abilities.js reflects the
 * last patch applied in config order.  Do not use it for legality
 * checks — use the per-regulation allowlist from the regulation
 * bundle instead.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { REGULATIONS } = require('./regulations-config.cjs');

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
const OUT_DIR = path.join(ROOT, 'src', 'data');

const BASE_FILES = {
  Items: path.join(PS_ROOT, 'data', 'items.ts'),
  Abilities: path.join(PS_ROOT, 'data', 'abilities.ts'),
};

const ALIASES_FILE = path.join(PS_ROOT, 'data', 'aliases.ts');

// text/ companions: hold the `desc` / `shortDesc` strings (and battle
// messages we ignore).  The export name in each file is `{Kind}Text`
// (e.g. `AbilitiesText` in data/text/abilities.ts).  We only carry
// `desc` and `shortDesc` into the lookup tables; the gen-specific
// `genN.desc` variants and battle messages (damage/start/block/...)
// are dropped - we only render the current gen's description.
const TEXT_FILES = {
  Abilities: path.join(PS_ROOT, 'data', 'text', 'abilities.ts'),
  Items: path.join(PS_ROOT, 'data', 'text', 'items.ts'),
};
const TEXT_FIELDS = ['desc', 'shortDesc'];

const MOD_FILES = {};
for (const reg of REGULATIONS) {
  /*
   * Frozen regulations are preserved as-is by build-regulations.cjs and
   * ship their own per-regulation allowlist in the bundle, so their
   * upstream patches must NOT be merged into the global lookup tables.
   * Skipping them here also avoids a path.join(..., undefined, ...) crash
   * when a frozen entry omits modDir.
   */
  if (reg.frozen) continue;
  for (const kind of ['Items', 'Abilities']) {
    const file = path.join(PS_ROOT, 'data', 'mods', reg.modDir, kind.toLowerCase() + '.ts');
    if (fs.existsSync(file)) {
      MOD_FILES[kind] = MOD_FILES[kind] || [];
      MOD_FILES[kind].push({ key: reg.key, modDir: reg.modDir, file });
    }
  }
}

// `spritenum` is the cell index into play.pokemonshowdown.com's
// itemicons-sheet.png (24x24 icons, 16 per row).  Only relevant for
// items.js; abilities.js just won't have it on the picked objects.
const FIELDS = ['name', 'num', 'gen', 'desc', 'shortDesc', 'isNonstandard', 'spritenum'];

function parseExport(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const result = {};
  let found = false;

  function literalToValue(node) {
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    }
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
  }

  function visit(node) {
    if (found) return;
    if (ts.isVariableStatement(node)) {
      const isExport = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExport) return;
      for (const decl of node.declarationList.declarations) {
        if (decl.name.getText(sf) !== exportName) continue;
        if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
        found = true;
        for (const prop of decl.initializer.properties) {
          if (!ts.isPropertyAssignment(prop)) continue;
          const id = prop.name.getText(sf).replace(/['"]/g, '');
          if (!/^[a-z0-9]+$/.test(id)) continue;
          const value = literalToValue(prop.initializer);
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const picked = pickFields(value);
            if (picked) result[id] = picked;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return found ? result : null;
}

function pickFields(obj) {
  const out = {};
  for (const f of FIELDS) {
    if (obj[f] !== undefined) out[f] = obj[f];
  }
  return Object.keys(out).length ? out : null;
}

function mergeTextDescriptions(base, text, fields) {
  // Overlay `fields` from each text entry onto the matching base
  // entry.  Only entries that exist in `base` are updated; text-only
  // entries (e.g. `noability`, mod-only descriptions) are not added
  // to the lookup.  An entry in the text file may be missing a field
  // we want; in that case the base's value (if any) is preserved.
  if (!text) return { merged: 0 };
  let merged = 0;
  for (const [id, baseEntry] of Object.entries(base)) {
    const textEntry = text[id];
    if (!textEntry) continue;
    let touched = false;
    for (const f of fields) {
      if (textEntry[f] !== undefined && textEntry[f] !== null) {
        baseEntry[f] = textEntry[f];
        touched = true;
      }
    }
    if (touched) merged++;
  }
  return { merged };
}

function mergePatches(base, patches) {
  if (!patches.length) return { merged: base, changed: 0 };
  let changed = 0;
  for (const { patch } of patches) {
    if (!patch) continue;
    for (const [id, patchEntry] of Object.entries(patch)) {
      if (!patchEntry || patchEntry.isNonstandard === undefined) continue;
      if (!base[id]) {
        base[id] = { name: id, ...pickFields(patchEntry) };
        changed++;
        continue;
      }
      base[id] = { ...base[id], isNonstandard: patchEntry.isNonstandard };
      changed++;
    }
  }
  return { merged: base, changed };
}

function emitMapModule(filePath, mapObj, mergedModDirs, textFileRel) {
  const entries = Object.entries(mapObj)
    .map(([id, v]) => [id, JSON.stringify(v)])
    .sort((a, b) => a[0].localeCompare(b[0]));
  const lines = entries.map(([id, json]) => `  ${JSON.stringify(id)}: ${json},`);
  const modList = mergedModDirs.length
    ? 'per-regulation patches merged: ' + mergedModDirs.map((m) => '`' + m + '`').join(', ') + '.'
    : 'no per-regulation patches merged.';
  const textList = textFileRel
    ? 'text descriptions sourced from `' + textFileRel + '`.'
    : 'no text description file.';
  const body =
    '// AUTO-GENERATED by scripts/parse-ts-data.cjs - do not edit by hand.\n' +
    '// Re-run `npm run build:data` to regenerate.\n' +
    '//\n' +
    '// Slimmed data extracted from scripts/.cache/upstream/data/{items,abilities}.ts\n' +
    '// (fetched from https://raw.githubusercontent.com/smogon/pokemon-showdown)\n' +
    '// with ' + modList + '\n' +
    '// ' + textList + '\n\n' +
    'export const ENTRIES = Object.freeze({\n' +
    lines.join('\n') +
    '\n});\n';
  fs.writeFileSync(filePath, body);
  return entries.length;
}

function parseAliasesExport(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const result = {};
  let found = false;

  function literalToValue(node) {
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    return undefined;
  }

  function visit(node) {
    if (found) return;
    if (ts.isVariableStatement(node)) {
      const isExport = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExport) return;
      for (const decl of node.declarationList.declarations) {
        if (decl.name.getText(sf) !== 'Aliases') continue;
        if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
        found = true;
        for (const prop of decl.initializer.properties) {
          if (!ts.isPropertyAssignment(prop)) continue;
          const key = prop.name.getText(sf).replace(/['"]/g, '');
          const value = literalToValue(prop.initializer);
          if (typeof value === 'string') {
            result[key] = value;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return found ? result : null;
}

function emitAliasesModule(filePath, aliases) {
  const entries = Object.entries(aliases)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const lines = entries.map(([alias, target]) =>
    `  ${JSON.stringify(alias)}: ${JSON.stringify(target)},`
  );
  const body =
    '// AUTO-GENERATED by scripts/parse-ts-data.cjs - do not edit by hand.\n' +
    '// Re-run `npm run build:data` to regenerate.\n' +
    '//\n' +
    '// Alias map extracted from scripts/.cache/upstream/data/aliases.ts\n' +
    '// (fetched from https://raw.githubusercontent.com/smogon/pokemon-showdown)\n' +
    '// Maps lowercase alias IDs to canonical names.\n\n' +
    'export const ENTRIES = Object.freeze({\n' +
    lines.join('\n') +
    '\n});\n';
  fs.writeFileSync(filePath, body);
  return entries.length;
}

function build() {
  if (!fs.existsSync(PS_ROOT)) {
    console.error(
      'upstream source not found at', PS_ROOT, '\n' +
      '  run `npm run fetch` to populate scripts/.cache/upstream, or\n' +
      '  set POKEMON_SHOWDOWN_LOCAL to a local checkout of pokemon-showdown.'
    );
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const [kind, basePath] of Object.entries(BASE_FILES)) {
    const exportName = kind;
    const outPath = path.join(OUT_DIR, kind.toLowerCase() + '.js');

    const base = parseExport(basePath, exportName);
    if (!base) {
      console.error(`Failed to parse ${basePath}`);
      process.exit(1);
    }

    // Overlay desc/shortDesc from the matching data/text/*.ts file.
    // Applied after the base parse and before per-regulation patches
    // so a mod patch can still override a description by setting it
    // on its own abilities.ts entry.
    let textFileRel = null;
    let textMerged = 0;
    const textPath = TEXT_FILES[kind];
    if (textPath && fs.existsSync(textPath)) {
      const text = parseExport(textPath, exportName + 'Text');
      if (!text) {
        console.error(`Failed to parse ${textPath}`);
        process.exit(1);
      }
      const { merged } = mergeTextDescriptions(base, text, TEXT_FIELDS);
      textMerged = merged;
      textFileRel = path.relative(ROOT, textPath).replace(/\\/g, '/');
    }

    const patchSources = (MOD_FILES[kind] || []).map((m) => ({
      ...m,
      patch: parseExport(m.file, exportName) || {},
    }));
    const mergedModDirs = patchSources.map((m) => m.modDir);
    const { merged, changed } = mergePatches(base, patchSources);

    const count = emitMapModule(outPath, merged, mergedModDirs, textFileRel);
    const modNote = mergedModDirs.length
      ? `${changed} patched across ${mergedModDirs.length} mod(s): ${mergedModDirs.join(', ')}`
      : 'no mod patches';
    const textNote = textFileRel
      ? `, ${textMerged} desc/shortDesc from text/${kind.toLowerCase()}.ts`
      : '';
    console.log(
      `${kind.toLowerCase()}.js: ${count} entries (${modNote}${textNote})`
    );
  }

  // Parse aliases
  const aliasesPath = path.join(OUT_DIR, 'aliases.js');
  if (fs.existsSync(ALIASES_FILE)) {
    const aliases = parseAliasesExport(ALIASES_FILE);
    if (!aliases) {
      console.error(`Failed to parse ${ALIASES_FILE}`);
      process.exit(1);
    }
    const count = emitAliasesModule(aliasesPath, aliases);
    console.log(`aliases.js: ${count} entries`);
  } else {
    console.warn(`aliases.ts not found at ${ALIASES_FILE}, skipping aliases`);
  }
}

build();
