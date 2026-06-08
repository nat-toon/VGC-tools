/*
 * Extract the per-species icon-cell override map from Showdown's
 * battle-dex-data.ts.  Showdown renders small icons from a single
 * sprite sheet (pokemonicons-sheet.png) where each species/forme is
 * pinned to a specific cell.  Most species render from the cell that
 * matches their dex number, but forms (mega, gmax, alola, ...) and a
 * few special cases (egg, CAP) use a different cell.  Those overrides
 * live in the `BattlePokemonIconIndexes` table.
 *
 * slim-showdown.cjs reads the JSON we emit here and embeds the
 * resolved icon index into each slim pokedex entry, so the runtime
 * never walks the upstream TS itself.  The .js module is kept around
 * for browsing the raw override list.
 *
 * The arithmetic expressions in the source (e.g. `1032 + 1`) are
 * resolved by the TypeScript compiler's constant-folder, which is
 * what we get for free when we walk the AST via typescript.createSourceFile.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PS_ROOT = process.env.POKEMON_SHOWDOWN_LOCAL
  ? path.resolve(process.env.POKEMON_SHOWDOWN_LOCAL)
  : path.join(ROOT, 'scripts', '.cache', 'upstream');
// battle-dex-data.ts ships with the client (play.pokemonshowdown.com/...),
// not the simulator.  When POKEMON_SHOWDOWN_LOCAL points at the client
// checkout the file lives at PS_ROOT/play.pokemonshowdown.com/src/.
const SOURCE = process.env.POKEMON_SHOWDOWN_LOCAL
  ? path.join(PS_ROOT, 'play.pokemonshowdown.com', 'src', 'battle-dex-data.ts')
  : path.join(PS_ROOT, 'client', 'play.pokemonshowdown.com', 'src', 'battle-dex-data.ts');
const OUT = path.join(ROOT, 'src', 'data', 'sprite-overrides.js');
// Also drop a plain JSON copy under scripts/.cache/ so the other
// build scripts (slim-showdown.cjs) can read it without needing the
// TS compiler or an ESM import.  Keeping the .js module around is
// useful for browsing the data, but the build pipeline only consumes
// the JSON form.
const CACHE_JSON = path.join(ROOT, 'scripts', '.cache', 'sprite-overrides.json');

function parseIconIndexMap() {
  if (!fs.existsSync(SOURCE)) {
    console.error(
      'battle-dex-data.ts not found at', SOURCE, '\n' +
      '  run `npm run fetch` to populate scripts/.cache/upstream, or\n' +
      '  set POKEMON_SHOWDOWN_LOCAL to a local checkout.'
    );
    process.exit(1);
  }
  const ts = require('typescript');
  const source = fs.readFileSync(SOURCE, 'utf8');
  const sf = ts.createSourceFile(SOURCE, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  // The values in BattlePokemonIconIndexes are small arithmetic
  // expressions on numeric literals (e.g. `1032 + 1`, `1320 + 69`).
  // We walk the AST and fold them ourselves - that keeps us off the
  // TS type-checker API, which has shifted shape between versions.
  function foldNumeric(node) {
    if (!node) return undefined;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
      const inner = foldNumeric(node.operand);
      return typeof inner === 'number' ? -inner : undefined;
    }
    if (ts.isBinaryExpression(node)) {
      const l = foldNumeric(node.left);
      const r = foldNumeric(node.right);
      if (typeof l !== 'number' || typeof r !== 'number') return undefined;
      switch (node.operatorToken.kind) {
        case ts.SyntaxKind.PlusToken: return l + r;
        case ts.SyntaxKind.MinusToken: return l - r;
        case ts.SyntaxKind.AsteriskToken: return l * r;
        case ts.SyntaxKind.SlashToken: return r === 0 ? undefined : l / r;
        default: return undefined;
      }
    }
    if (ts.isParenthesizedExpression(node)) return foldNumeric(node.expression);
    return undefined;
  }

  let result = null;

  function visit(node) {
    if (result) return;
    if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const decl of node.declarationList.declarations) {
        if (decl.name.getText(sf) !== 'BattlePokemonIconIndexes') continue;
        if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
        const map = {};
        for (const prop of decl.initializer.properties) {
          if (!ts.isPropertyAssignment(prop)) continue;
          const id = prop.name.getText(sf).replace(/['"]/g, '');
          if (!/^[a-z0-9]+$/.test(id)) continue;
          const num = foldNumeric(prop.initializer);
          if (typeof num !== 'number') continue;
          map[id] = num;
        }
        result = map;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return result;
}

function emit(map) {
  const entries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  const lines = entries.map(([id, n]) => `  ${JSON.stringify(id)}: ${n},`);
  const sourceRel = path.relative(ROOT, SOURCE).replace(/\\/g, '/');
  const sourceUrl = process.env.POKEMON_SHOWDOWN_LOCAL
    ? '(from POKEMON_SHOWDOWN_LOCAL)'
    : 'https://raw.githubusercontent.com/smogon/pokemon-showdown-client/master/play.pokemonshowdown.com/src/battle-dex-data.ts';
  const body =
    '// AUTO-GENERATED by scripts/parse-sprite-data.cjs - do not edit by hand.\n' +
    '// Re-run `npm run build:data` to regenerate.\n' +
    '//\n' +
    '// BattlePokemonIconIndexes from\n' +
    '//   ' + sourceRel + '\n' +
    '// (' + sourceUrl + ')\n' +
    '//\n' +
    '// Maps a species id to the cell in play.pokemonshowdown.com/sprites/pokemonicons-sheet.png\n' +
    '// (40x30 icons, 12 per row) where its icon lives.  The default cell for a\n' +
    '// species is its dex num, so this map only contains the overrides (forms\n' +
    '// like mega/gmax/alola, the egg placeholder, CAP, etc.).\n' +
    '//\n' +
    '// slim-showdown.cjs embeds the resolved icon index into each slim pokedex\n' +
    '// entry, so the runtime never reads this module directly.\n\n' +
    'export const ENTRIES = Object.freeze({\n' +
    lines.join('\n') +
    '\n});\n';
  fs.writeFileSync(OUT, body);
  return entries.length;
}

function main() {
  const map = parseIconIndexMap();
  if (!map) {
    console.error('Failed to extract BattlePokemonIconIndexes from', SOURCE);
    process.exit(1);
  }
  const n = emit(map);
  fs.mkdirSync(path.dirname(CACHE_JSON), { recursive: true });
  fs.writeFileSync(CACHE_JSON, JSON.stringify(map));
  console.log(`sprite-overrides.js: ${n} icon overrides (+ cached JSON for the build)`);
}

main();
