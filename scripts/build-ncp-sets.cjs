/*
 * Parse the upstream NCP VGC Damage Calculator setdex (setdex_ncp-g10.js)
 * and pokedex (pokedex.js), then generate src/data/ncp-sets.json.
 *
 * Every set gets an ability:
 *   - If the set specifies one, use it.
 *   - Otherwise, use the species' default "ab" from the upstream pokedex.
 *
 * Output: src/data/ncp-sets.json
 */

const fs = require('fs');
const path = require('path');

const UPSTREAM_DIR = path.join(__dirname, '.cache', 'upstream', 'ncp');
const SETDEX_FILE = path.join(UPSTREAM_DIR, 'setdex_ncp-g10.js');
const POKEDEX_FILE = path.join(UPSTREAM_DIR, 'pokedex.js');

const OUTPUT_FILE = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'ncp-sets.json'
);

// ── Parse upstream pokedex.js via eval ─────────────────────────────────
// The upstream file uses $.extend to chain gen pokedexes together.
// We mock jQuery's $ to evaluate it and extract the final pokedex.
function parseUpstreamPokedex() {
  const source = fs.readFileSync(POKEDEX_FILE, 'utf-8');

  const $ = {
    extend: function(deep, target) {
      for (let i = 2; i < arguments.length; i++) {
        const source = arguments[i];
        if (typeof source === 'object' && source !== null) {
          for (const key of Object.keys(source)) {
            if (deep && typeof source[key] === 'object' && source[key] !== null) {
              if (!target[key]) target[key] = {};
              $.extend(true, target[key], source[key]);
            } else {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    }
  };

  const evalCode = `(function($) { ${source}; return typeof POKEDEX_CHAMPIONS !== 'undefined' && Object.keys(POKEDEX_CHAMPIONS).length > 0 ? POKEDEX_CHAMPIONS : typeof POKEDEX_SV !== 'undefined' ? POKEDEX_SV : POKEDEX_RBY; })($);`;
  const pokedex = eval(evalCode);

  const abilities = {};
  for (const [species, data] of Object.entries(pokedex)) {
    if (data && data.ab) {
      abilities[species] = data.ab;
    }
  }

  return abilities;
}

// ── Parse upstream setdex_ncp-g10.js ───────────────────────────────────
function parseSetdexJs(source) {
  const result = {};

  const speciesRegex = /"([A-Za-z0-9\-]+)":\s*\{/g;
  let speciesMatch;

  while ((speciesMatch = speciesRegex.exec(source)) !== null) {
    const speciesName = speciesMatch[1];
    const speciesStart = speciesMatch.index + speciesMatch[0].length;

    let depth = 1;
    let i = speciesStart;
    while (i < source.length && depth > 0) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') depth--;
      i++;
    }
    const speciesBlock = source.substring(speciesStart, i - 1);

    const sets = {};
    const setRegex = /"([^"]+)":\s*\{/g;
    let setMatch;

    const PROPERTY_KEYS = new Set([
      'sps', 'nature', 'ability', 'item', 'moves', 'level',
    ]);

    while ((setMatch = setRegex.exec(speciesBlock)) !== null) {
      const setName = setMatch[1];
      if (PROPERTY_KEYS.has(setName)) continue;
      const setStart = setMatch.index + setMatch[0].length;

      let setDepth = 1;
      let j = setStart;
      while (j < speciesBlock.length && setDepth > 0) {
        if (speciesBlock[j] === '{') setDepth++;
        else if (speciesBlock[j] === '}') setDepth--;
        j++;
      }
      const setBlock = speciesBlock.substring(setStart, j - 1);

      const set = {};

      const natureMatch = setBlock.match(/"nature":\s*"([^"]+)"/);
      if (natureMatch) set.nature = natureMatch[1];

      const abilityMatch = setBlock.match(/"ability":\s*"([^"]+)"/);
      if (abilityMatch) set.ability = abilityMatch[1];

      const itemMatch = setBlock.match(/"item":\s*"([^"]+)"/);
      if (itemMatch) set.item = itemMatch[1];

      const levelMatch = setBlock.match(/"level":\s*(\d+)/);
      if (levelMatch) set.level = parseInt(levelMatch[1], 10);

      const spsMatch = setBlock.match(/"sps":\s*\{([^}]+)\}/);
      if (spsMatch) {
        const sps = {};
        const spRegex = /"(hp|at|df|sa|sd|sp)":\s*(\d+)/g;
        let spMatch;
        while ((spMatch = spRegex.exec(spsMatch[1])) !== null) {
          sps[spMatch[1]] = parseInt(spMatch[2], 10);
        }
        set.sps = sps;
      }

      const movesMatch = setBlock.match(/"moves":\s*\[([^\]]+)\]/);
      if (movesMatch) {
        const movesStr = movesMatch[1];
        const moveRegex = /"([^"]+)"/g;
        const moves = [];
        let moveMatch;
        while ((moveMatch = moveRegex.exec(movesStr)) !== null) {
          moves.push(moveMatch[1]);
        }
        set.moves = moves;
      }

      sets[setName] = set;
    }

    if (Object.keys(sets).length > 0) {
      result[speciesName] = sets;
    }
  }

  return result;
}

// ── Main ───────────────────────────────────────────────────────────────
function main() {
  // 1. Parse upstream pokedex for default abilities
  if (!fs.existsSync(POKEDEX_FILE)) {
    console.error(`Upstream pokedex not found: ${POKEDEX_FILE}`);
    console.error('Run `npm run fetch` first to download upstream data.');
    process.exit(1);
  }

  console.log(`Parsing upstream pokedex: ${POKEDEX_FILE}`);
  console.log(`  File size: ${(fs.statSync(POKEDEX_FILE).size / 1024).toFixed(1)} KB`);
  const defaultAbilities = parseUpstreamPokedex();
  const pokedexSpeciesCount = Object.keys(defaultAbilities).length;
  console.log(`  Extracted default abilities for ${pokedexSpeciesCount} species`);

  // 2. Parse upstream setdex
  if (!fs.existsSync(SETDEX_FILE)) {
    console.error(`Upstream setdex not found: ${SETDEX_FILE}`);
    console.error('Run `npm run fetch` first to download upstream data.');
    process.exit(1);
  }

  const setdexSource = fs.readFileSync(SETDEX_FILE, 'utf-8');
  console.log(`\nParsing upstream setdex: ${SETDEX_FILE}`);
  console.log(`  Source size: ${(setdexSource.length / 1024).toFixed(1)} KB`);
  const sets = parseSetdexJs(setdexSource);

  // 3. Merge: fill in missing abilities from upstream pokedex
  let filledCount = 0;
  let explicitCount = 0;
  for (const [species, speciesSets] of Object.entries(sets)) {
    for (const [, setData] of Object.entries(speciesSets)) {
      if (setData.ability) {
        explicitCount++;
      } else {
        const fallback = defaultAbilities[species];
        if (fallback) {
          setData.ability = fallback;
          filledCount++;
        }
      }
    }
  }

  const speciesCount = Object.keys(sets).length;
  const setCount = Object.values(sets).reduce(
    (sum, s) => sum + Object.keys(s).length,
    0
  );
  const abilityCount = explicitCount + filledCount;

  console.log(`  Parsed ${speciesCount} species, ${setCount} sets`);
  console.log(`  ${abilityCount}/${setCount} sets have abilities`);
  console.log(`    - ${explicitCount} explicit from setdex`);
  console.log(`    - ${filledCount} filled from upstream pokedex`);

  // 4. Write output
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  const json = JSON.stringify(sets, null, 2) + '\n';
  fs.writeFileSync(OUTPUT_FILE, json);
  console.log(`\nWrote ${OUTPUT_FILE} (${(json.length / 1024).toFixed(1)} KB)`);
}

main();
