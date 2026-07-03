/*
 * Build the damage calculator from smogon/damage-calc source.
 *
 * Run: node scripts/build-damage-calc.cjs
 */

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const CALC_ROOT = path.join(ROOT, 'scripts', '.cache', 'upstream', 'damage-calc', 'calc', 'src');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const OUT_FILE = path.join(OUT_DIR, 'damage-calc.js');

function removeVarBlock(code, startPattern) {
  const start = code.indexOf(startPattern);
  if (start === -1) return code;
  let i = start + startPattern.length;
  // The startPattern ends with { or [, which is the opening delimiter
  // but scanning starts after it, so start depth at 1 to account for it
  let depth = (startPattern.endsWith('{') || startPattern.endsWith('[') || startPattern.endsWith('(')) ? 1 : 0;
  let inStr = false;
  let strChar = '';
  while (i < code.length) {
    const ch = code[i];
    if (inStr) {
      if (ch === strChar && code[i - 1] !== '\\') inStr = false;
    } else {
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch; }
      else if (ch === '{' || ch === '[' || ch === '(') depth++;
      else if (ch === '}' || ch === ']' || ch === ')') depth--;
      else if (ch === ';' && depth === 0) {
        i++;
        if (i < code.length && code[i] === '\n') i++;
        return code.slice(0, start) + code.slice(i);
      }
    }
    i++;
  }
  return code;
}

function removeTopLevelFunc(code, funcPattern) {
  const start = code.indexOf(funcPattern);
  if (start === -1) return code;
  // Only remove if this is a top-level function (preceded by newline or start of file)
  if (start > 0 && code[start - 1] !== '\n') return code;
  let braceStart = code.indexOf('{', start + funcPattern.length);
  if (braceStart === -1) return code;
  let depth = 1;
  let i = braceStart + 1;
  while (i < code.length && depth > 0) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') depth--;
    i++;
  }
  while (i < code.length && (code[i] === ';' || code[i] === '\n')) i++;
  return code.slice(0, start) + code.slice(i);
}

function postProcess(code) {
  const before = code.length;

  // Remove standalone variables/data
  code = removeVarBlock(code, 'var HP_TYPES = [');
  code = removeVarBlock(code, 'var HP = {');
  code = removeVarBlock(code, 'var SPECIAL = [');
  code = removeVarBlock(code, 'var ZMOVES_TYPING = {');
  code = removeVarBlock(code, 'var MAXMOVES_TYPING = {');

  // Remove standalone functions
  code = removeTopLevelFunc(code, 'function getZMoveName(');
  code = removeTopLevelFunc(code, 'function getMaxMoveName(');

  // Simplify category inference
  code = code.replace(
    'this.category = data.category || (gen.num > 0 && gen.num < 4 ? SPECIAL.includes(data.type) ? "Special" : "Physical" : "Status");',
    'this.category = data.category || "Status";'
  );

  // Remove useZ/useMax assignments
  code = code.replace(/    this\.useZ = options\.useZ;\n/g, '');
  code = code.replace(/    this\.useMax = options\.useMax;\n/g, '');
  code = code.replace(/      useZ: this\.useZ,\n/g, '');
  code = code.replace(/      useMax: this\.useMax,\n/g, '');
  code = code.replace(/    __publicField\(this, "useZ"\);\n/g, '');
  code = code.replace(/    __publicField\(this, "useMax"\);\n/g, '');

  console.log(`  Removed ${((before - code.length) / 1024).toFixed(1)} KB`);
  return code;
}

function build() {
  if (!fs.existsSync(CALC_ROOT)) {
    console.error('damage-calc source not found at', CALC_ROOT);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const CALC = CALC_ROOT.replace(/\\/g, '/');
  const entryContent = [
    `import {calculateChampions} from '${CALC}/mechanics/champions.ts';`,
    `export {calculateChampions};`,
    `export {Pokemon} from '${CALC}/pokemon.ts';`,
    `export {Move} from '${CALC}/move.ts';`,
    `export {Field, Side} from '${CALC}/field.ts';`,
    `export {Result} from '${CALC}/result.ts';`,
  ].join('\n');

  const tmpEntry = path.join(ROOT, 'scripts', '.cache', 'damage-calc-entry.ts');
  fs.writeFileSync(tmpEntry, entryContent);

  console.log('Bundling damage-calc with esbuild...');

  try {
    esbuild.buildSync({
      entryPoints: [tmpEntry],
      bundle: true,
      format: 'esm',
      outfile: OUT_FILE,
      platform: 'browser',
      target: 'es2020',
      tsconfigRaw: JSON.stringify({
        compilerOptions: {
          strict: false,
          skipLibCheck: true,
          moduleResolution: 'node',
        },
      }),
      logLevel: 'info',
    });

    console.log('Post-processing...');
    let code = fs.readFileSync(OUT_FILE, 'utf8');
    code = postProcess(code);
    fs.writeFileSync(OUT_FILE, code);

    const stat = fs.statSync(OUT_FILE);
    console.log(`  Final: ${(stat.size / 1024).toFixed(1)} KB`);
    console.log('\nDamage calc build complete.');
  } finally {
    try { fs.unlinkSync(tmpEntry); } catch {}
  }
}

build();
