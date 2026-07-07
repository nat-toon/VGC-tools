/*
 * Build the damage calculator from NCP-VGC-Damage-Calculator source.
 *
 * The NCP calculator is a standalone JS app (not ES modules), so we
 * concatenate the source files and wrap them in an ESM module.
 *
 * Run: node scripts/build-damage-calc.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NCP_CALC_ROOT = path.join(ROOT, 'scripts', '.cache', 'upstream', 'ncp-calc');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const OUT_FILE = path.join(OUT_DIR, 'damage-calc.js');

// Type chart data for effectiveness calculations (SS/SM/XY)
const TYPE_CHART_DATA = {
  Normal:   {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:0.5,Ghost:0,Dragon:1,Dark:1,Steel:0.5,Fairy:1},
  Fire:     {Normal:1,Fire:0.5,Water:0.5,Electric:1,Grass:2,Ice:2,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:2,Rock:0.5,Ghost:1,Dragon:0.5,Dark:1,Steel:2,Fairy:1},
  Water:    {Normal:1,Fire:2,Water:0.5,Electric:1,Grass:0.5,Ice:1,Fighting:1,Poison:1,Ground:2,Flying:1,Psychic:1,Bug:1,Rock:2,Ghost:1,Dragon:0.5,Dark:1,Steel:1,Fairy:1},
  Electric: {Normal:1,Fire:1,Water:2,Electric:0.5,Grass:0.5,Ice:1,Fighting:1,Poison:1,Ground:0,Flying:2,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:0.5,Dark:1,Steel:1,Fairy:1},
  Grass:    {Normal:1,Fire:0.5,Water:2,Electric:1,Grass:0.5,Ice:1,Fighting:1,Poison:0.5,Ground:2,Flying:0.5,Psychic:1,Bug:0.5,Rock:2,Ghost:1,Dragon:0.5,Dark:1,Steel:0.5,Fairy:1},
  Ice:      {Normal:1,Fire:0.5,Water:0.5,Electric:1,Grass:2,Ice:0.5,Fighting:1,Poison:1,Ground:2,Flying:2,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:2,Dark:1,Steel:0.5,Fairy:1},
  Fighting: {Normal:2,Fire:1,Water:1,Electric:1,Grass:1,Ice:2,Fighting:1,Poison:0.5,Ground:1,Flying:0.5,Psychic:0.5,Bug:0.5,Rock:2,Ghost:0,Dragon:1,Dark:2,Steel:2,Fairy:0.5},
  Poison:   {Normal:1,Fire:1,Water:1,Electric:1,Grass:2,Ice:1,Fighting:1,Poison:0.5,Ground:0.5,Flying:1,Psychic:1,Bug:1,Rock:0.5,Ghost:0.5,Dragon:1,Dark:1,Steel:0,Fairy:2},
  Ground:   {Normal:1,Fire:2,Water:1,Electric:2,Grass:0.5,Ice:1,Fighting:1,Poison:2,Ground:1,Flying:0,Psychic:1,Bug:0.5,Rock:2,Ghost:1,Dragon:1,Dark:1,Steel:2,Fairy:1},
  Flying:   {Normal:1,Fire:1,Water:1,Electric:0.5,Grass:2,Ice:1,Fighting:2,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:2,Rock:0.5,Ghost:1,Dragon:1,Dark:1,Steel:0.5,Fairy:1},
  Psychic:  {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:2,Poison:2,Ground:1,Flying:1,Psychic:0.5,Bug:1,Rock:1,Ghost:1,Dragon:1,Dark:0,Steel:0.5,Fairy:1},
  Bug:      {Normal:1,Fire:0.5,Water:1,Electric:1,Grass:2,Ice:1,Fighting:0.5,Poison:0.5,Ground:1,Flying:0.5,Psychic:2,Bug:1,Rock:1,Ghost:0.5,Dragon:1,Dark:2,Steel:0.5,Fairy:0.5},
  Rock:     {Normal:1,Fire:2,Water:1,Electric:1,Grass:1,Ice:2,Fighting:0.5,Poison:1,Ground:0.5,Flying:2,Psychic:1,Bug:2,Rock:1,Ghost:1,Dragon:1,Dark:1,Steel:0.5,Fairy:1},
  Ghost:    {Normal:0,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:2,Bug:1,Rock:1,Ghost:2,Dragon:1,Dark:0.5,Steel:1,Fairy:1},
  Dragon:   {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:2,Dark:1,Steel:0.5,Fairy:0},
  Dark:     {Normal:1,Fire:1,Water:1,Electric:1,Grass:1,Ice:1,Fighting:0.5,Poison:1,Ground:1,Flying:1,Psychic:2,Bug:1,Rock:1,Ghost:2,Dragon:1,Dark:0.5,Steel:0.5,Fairy:0.5},
  Steel:    {Normal:1,Fire:0.5,Water:0.5,Electric:0.5,Grass:1,Ice:2,Fighting:1,Poison:1,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:2,Ghost:1,Dragon:1,Dark:1,Steel:0.5,Fairy:2},
  Fairy:    {Normal:1,Fire:0.5,Water:1,Electric:1,Grass:1,Ice:1,Fighting:2,Poison:0.5,Ground:1,Flying:1,Psychic:1,Bug:1,Rock:1,Ghost:1,Dragon:2,Dark:2,Steel:0.5,Fairy:1},
};

// Nature data
const NATURES_DATA = {
  Adamant: ['at', 'sa'],
  Bashful: ['', ''],
  Bold: ['df', 'at'],
  Brave: ['at', 'sp'],
  Calm: ['sd', 'at'],
  Careful: ['sd', 'sa'],
  Docile: ['', ''],
  Gentle: ['sd', 'df'],
  Hardy: ['', ''],
  Hasty: ['sp', 'df'],
  Impish: ['df', 'sa'],
  Jolly: ['sp', 'sa'],
  Lax: ['df', 'sd'],
  Lonely: ['at', 'df'],
  Mild: ['sa', 'df'],
  Modest: ['sa', 'at'],
  Naive: ['sp', 'sd'],
  Naughty: ['at', 'sd'],
  Quiet: ['sa', 'sp'],
  Quirky: ['', ''],
  Rash: ['sa', 'sd'],
  Relaxed: ['df', 'sp'],
  Sassy: ['sd', 'sp'],
  Serious: ['', ''],
  Timid: ['sp', 'at'],
};

function postProcess(code) {
  const before = code.length;

  // Replace jQuery checkbox reads with false (these control UI-only features)
  // Pattern: $(...).is(':checked') or $(...).prop("checked")
  code = code.replace(/\$\(\s*["']#douswitch["']\s*\)\.is\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#evoL["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#evoR["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#tatsuL["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#tatsuR["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#clangL["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#clangR["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#weakL["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#weakR["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');

  // Replace more complex jQuery reads with safe defaults
  // Pattern: $("#p1").find(".transform").prop("checked")
  code = code.replace(/\$\(\s*["']#p1["']\s*\)\.find\(\s*["']\.transform["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');
  code = code.replace(/\$\(\s*["']#p2["']\s*\)\.find\(\s*["']\.transform["']\s*\)\.prop\(\s*['"]?:checked['"]?\s*\)/g, 'false');

  // Replace jQuery checkbox val() reads with undefined (aura checks)
  // Pattern: $("input:checkbox[id='...']:checked").val()
  code = code.replace(/\$\(\s*["'][^"']*["']\s*\)\.val\(\s*\)/g, 'undefined');

  // Replace complex jQuery expressions that read checkbox values
  // These appear as: $("input:checkbox[id='...']:checked").val() != undefined
  // Replace the entire jQuery expression with undefined
  code = code.replace(/\$\([^)]*:checked[^)]*\)\.val\(\s*\)/g, 'undefined');

  // Replace aura toggles with ability-based checks instead of false
  // The original used jQuery checkboxes to manually toggle auras; we
  // derive auraActive/auraBreak from the Pokemon abilities instead.
  code = code.replace(
    "var auraActive = ($(\"input:checkbox[id='\" + move.type.toLowerCase() + \"-aura']:checked\").val() != undefined);",
    'var auraActive = isAttackerAura || isDefenderAura;'
  );
  code = code.replace(
    /var auraBreak = \$\([^)]+\)\.val\(\s*\)\s*!=\s*undefined/g,
    'var auraBreak = attacker.ability === "Aura Break" || defAbility === "Aura Break";'
  );

  // Remove jQuery DOM write calls that crash outside a browser (replace with nothing)
  code = code.replace(/\$\(\s*["'][^"']+["']\s*\)\.text\(\s*[^)]*\)\s*;?/g, '');

  // Remove any remaining $() calls - replace with false if in expression context, nothing if standalone
  code = code.replace(/\$\(\s*["'][^"']+["']\s*\)\.\w+\(\s*[^)]*\)/g, 'false');

  // Fix broken if conditions from jQuery replacements (e.g. "if (|| )", "if (false || )", "if ( || false)")
  code = code.replace(/if\s*\(\s*\|\|\s*\)/g, 'if (false)');
  code = code.replace(/if\s*\(\s*false\s*\|\|\s*\)/g, 'if (false)');
  code = code.replace(/if\s*\(\s*\|\|\s*false\s*\)/g, 'if (false)');
  code = code.replace(/if\s*\(\s*false\s*\|\|\s*false\s*\)/g, 'if (false)');

  console.log(`  Removed ${((before - code.length) / 1024).toFixed(1)} KB of DOM references`);
  return code;
}

function build() {
  if (!fs.existsSync(NCP_CALC_ROOT)) {
    console.error('NCP damage-calc source not found at', NCP_CALC_ROOT);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Read the NCP calculator source files
  const masterCode = fs.readFileSync(path.join(NCP_CALC_ROOT, 'damage_MASTER.js'), 'utf8');
  const svCode = fs.readFileSync(path.join(NCP_CALC_ROOT, 'damage_SV.js'), 'utf8');
  const koCode = fs.readFileSync(path.join(NCP_CALC_ROOT, 'ko_chance.js'), 'utf8');

  // Load moves data for the `moves` global used by the calculator
  const movesJsonPath = path.join(ROOT, 'public', 'moves.json');
  let movesData = {};
  if (fs.existsSync(movesJsonPath)) {
    const raw = JSON.parse(fs.readFileSync(movesJsonPath, 'utf8'));
    for (const [id, m] of Object.entries(raw)) {
      movesData[m.name] = {
        bp: m.basePower || 0,
        type: m.type || 'Normal',
        category: m.category || 'Status',
        statChange: m.statChange || null,
      };
    }
  }
  const movesJson = JSON.stringify(movesData);

  // Helper function source (from NCP HTML, not in the JS source files)
  const helperSource = `
function getItemBoostType(item) {
    var m = {
        'Flame Plate':'Fire','Charcoal':'Fire',
        'Splash Plate':'Water','Mystic Water':'Water','Sea Incense':'Water',
        'Zap Plate':'Electric','Magnet':'Electric',
        'Meadow Plate':'Grass','Miracle Seed':'Grass','Rose Incense':'Grass',
        'Icicle Plate':'Ice','Never-Melt Ice':'Ice',
        'Fist Plate':'Fighting','Black Belt':'Fighting',
        'Toxic Plate':'Poison','Poison Barb':'Poison',
        'Earth Plate':'Ground','Soft Sand':'Ground',
        'Sky Plate':'Flying','Sharp Beak':'Flying',
        'Mind Plate':'Psychic','TwistedSpoon':'Psychic','Odd Incense':'Psychic',
        'Insect Plate':'Bug','SilverPowder':'Bug',
        'Stone Plate':'Rock','Hard Stone':'Rock','Rock Incense':'Rock',
        'Spooky Plate':'Ghost','Spell Tag':'Ghost',
        'Draco Plate':'Dragon','Dragon Fang':'Dragon',
        'Dread Plate':'Dark','Black Glasses':'Dark',
        'Iron Plate':'Steel','Metal Coat':'Steel',
        'Pixie Plate':'Fairy',
        'Silk Scarf':'Normal'
    };
    return m[item] || '';
}
function getItemDualTypeBoost(item) { return ''; }
function getMemoryType(item) {
    var m = {
        'Fire Memory':'Fire','Water Memory':'Water','Electric Memory':'Electric',
        'Grass Memory':'Grass','Ice Memory':'Ice','Fighting Memory':'Fighting',
        'Poison Memory':'Poison','Ground Memory':'Ground','Flying Memory':'Flying',
        'Psychic Memory':'Psychic','Bug Memory':'Bug','Rock Memory':'Rock',
        'Ghost Memory':'Ghost','Dragon Memory':'Dragon','Dark Memory':'Dark',
        'Steel Memory':'Steel','Fairy Memory':'Fairy'
    };
    return m[item] || '';
}
function getNaturalGift(berry) {
    var normal = {type:'Normal',bp:1};
    if (!berry || !berry.includes(' Berry')) return normal;
    var gifts = {
        'Cheri Berry':{type:'Fire',bp:80},'Chesto Berry':{type:'Water',bp:80},'Pecha Berry':{type:'Electric',bp:80},'Rawst Berry':{type:'Grass',bp:80},'Aspear Berry':{type:'Ice',bp:80},'Leppa Berry':{type:'Fighting',bp:80},'Oran Berry':{type:'Poison',bp:80},'Persim Berry':{type:'Ground',bp:80},'Lum Berry':{type:'Flying',bp:80},'Sitrus Berry':{type:'Psychic',bp:80},'Figy Berry':{type:'Bug',bp:80},'Wiki Berry':{type:'Rock',bp:80},'Mago Berry':{type:'Ghost',bp:80},'Aguav Berry':{type:'Dragon',bp:80},'Iapapa Berry':{type:'Dark',bp:80},'Pomeg Berry':{type:'Steel',bp:90},'Kelpsy Berry':{type:'Fighting',bp:90},'Qualot Berry':{type:'Poison',bp:90},'Hondew Berry':{type:'Psychic',bp:90},'Grepa Berry':{type:'Flying',bp:90},'Tamato Berry':{type:'Ghost',bp:90},'Cornn Berry':{type:'Bug',bp:90},'Magost Berry':{type:'Rock',bp:90},'Rabuta Berry':{type:'Ghost',bp:90},'Nomel Berry':{type:'Dragon',bp:90},'Spelon Berry':{type:'Dark',bp:90},'Pamtre Berry':{type:'Steel',bp:90},'Watmel Berry':{type:'Fire',bp:100},'Durin Berry':{type:'Water',bp:100},'Belue Berry':{type:'Electric',bp:100},'Occa Berry':{type:'Fire',bp:60},'Passho Berry':{type:'Water',bp:60},'Wacan Berry':{type:'Electric',bp:60},'Rindo Berry':{type:'Grass',bp:60},'Yache Berry':{type:'Ice',bp:60},'Chople Berry':{type:'Fighting',bp:60},'Kebia Berry':{type:'Poison',bp:60},'Shuca Berry':{type:'Ground',bp:60},'Coba Berry':{type:'Flying',bp:60},'Payapa Berry':{type:'Psychic',bp:60},'Tanga Berry':{type:'Bug',bp:60},'Charti Berry':{type:'Rock',bp:60},'Kasib Berry':{type:'Ghost',bp:60},'Haban Berry':{type:'Dragon',bp:60},'Colbur Berry':{type:'Dark',bp:60},'Babiri Berry':{type:'Steel',bp:60},'Chilan Berry':{type:'Normal',bp:60},'Liechi Berry':{type:'Grass',bp:100},'Ganlon Berry':{type:'Ice',bp:100},'Salac Berry':{type:'Fighting',bp:100},'Petaya Berry':{type:'Psychic',bp:100},'Apicot Berry':{type:'Ground',bp:100},'Lansat Berry':{type:'Flying',bp:100},'Starf Berry':{type:'Psychic',bp:100},'Enigma Berry':{type:'Bug',bp:100},'Micle Berry':{type:'Rock',bp:100},'Custap Berry':{type:'Ghost',bp:100},'Jaboca Berry':{type:'Dragon',bp:100},'Rowap Berry':{type:'Dark',bp:100}
    };
    return gifts[berry] || normal;
}
function getFlingPower(item) {
    var p = {
        'Iron Ball':130,'Choice Specs':10,'Choice Band':10,'Choice Scarf':10,'Light Ball':30,'Eject Button':10,'Red Card':10,'Air Balloon':10,'Electric Seed':10,'Psychic Seed':10,'Misty Seed':10,'Grassy Seed':10,'Absorb Bulb':10,'Cell Battery':10,'Luminous Moss':10,'Snowball':10,
        'Flame Orb':30,'Toxic Orb':30,'Black Sludge':30,'Rock Incense':10,'Rose Incense':10,'Sea Incense':10,'Wave Incense':10,'Odd Incense':10,'Pure Incense':10,'Lax Incense':10,'Full Incense':10,'Luck Incense':10,
        'Adamant Orb':60,'Lustrous Orb':60,'Griseous Orb':60,'Macho Brace':60,'Power Weight':10,'Power Bracer':10,'Power Belt':10,'Power Lens':10,'Power Band':10,'Power Anklet':10,'Damp Rock':60,'Heat Rock':60,'Icy Rock':60,'Smooth Rock':60,'Everstone':30,'Float Stone':30,'Hard Stone':100,'Soft Sand':10,'Razor Claw':30,'Razor Fang':30,'Poison Barb':70,'Dragon Fang':30,'Black Belt':30,'Black Glasses':10,'Iron Plate':10,'Silk Scarf':10,"King's Rock":30,'Metal Coat':10,'Sharp Beak':10,'Silver Powder':10,'Spell Tag':10,'TwistedSpoon':10,'Mystic Water':10,'Never-Melt Ice':30,'Magnet':30,'Miracle Seed':30,'Charcoal':30,
        'Deep Sea Tooth':90,'Shuca Berry':10,'Coba Berry':10,'Payapa Berry':10,'Tanga Berry':10,'Charti Berry':10,'Kasib Berry':10,'Haban Berry':10,'Colbur Berry':10,'Babiri Berry':10,'Chilan Berry':10,'Occa Berry':10,'Passho Berry':10,'Wacan Berry':10,'Rindo Berry':10,'Yache Berry':10,'Chople Berry':10,'Kebia Berry':10,
        'Acorn':10,'Stick':30,'Big Pearl':30,'Pearl':30,'Pearly String':30,'Big Nugget':100,'Nugget':30,'Star Piece':30,'Rare Bone':30,'Balm Mushroom':30,'Big Mushroom':30,'Tiny Mushroom':30,'Shoal Salt':30,'Shoal Shell':30,'Red Shard':30,'Blue Shard':30,'Yellow Shard':30,'Green Shard':30,'Health Feather':10,'Muscle Feather':10,'Resist Feather':10,'Genius Feather':10,'Clever Feather':10,'Swift Feather':10,'Pretty Wing':10,
        "King's Rock":30,'Deep Sea Scale':20,'Soul Dew':30,'Thick Club':90,'Stick':60,'Luck Punch':60,'Metal Powder':10,'Quick Powder':10,'White Herb':10,'Mental Herb':10,'Power Herb':10
    };
    return p[item] || 30;
}
function getBerryResistType(item) {
    var m = {
        'Occa Berry':'Fire','Passho Berry':'Water','Wacan Berry':'Electric','Rindo Berry':'Grass','Yache Berry':'Ice','Chople Berry':'Fighting','Kebia Berry':'Poison','Shuca Berry':'Ground','Coba Berry':'Flying','Payapa Berry':'Psychic','Tanga Berry':'Bug','Charti Berry':'Rock','Kasib Berry':'Ghost','Haban Berry':'Dragon','Colbur Berry':'Dark','Babiri Berry':'Steel','Chilan Berry':'Normal'
    };
    return m[item] || '';
}
function getSignatureZMove(item, species, moveName) { return -1; }
function cantFlingItem(item) {
    return ['Master Ball','Pok\u00e9 Ball','Great Ball','Ultra Ball','Rare Candy'].includes(item);
}
function cantRemoveItem(item) {
    return ['Griseous Orb','Adamant Orb','Lustrous Orb','Blue Orb','Red Orb','Mega Stone','Primal Orb'].includes(item);
}
function getMoveCooldown(pokemon, move) { return 0; }
var setHasTypeFunc = function(...typesToCheck) {
    return typesToCheck.includes(this.type1) || typesToCheck.includes(this.type2);
};
`;

  // Build the NCP calculator as a non-strict function (bypasses strict-mode implicit-global errors)
  // new Function() runs in non-strict mode by default, allowing undeclared variable assignments
  const typeChartJson = JSON.stringify(TYPE_CHART_DATA);
  const naturesJson = JSON.stringify(NATURES_DATA);
  const bundle = `
// Mock jQuery to prevent crashes outside a browser
if (typeof window === 'undefined') {
  globalThis.window = { location: { hostname: '' } };
  globalThis.document = { querySelectorAll: () => [], querySelector: () => null, getElementById: () => null };
  globalThis.\$ = function() { return { text: function(){}, prop: function(){return false}, is: function(){return false}, html: function(){}, val: function(){}, attr: function(){} }; };
  globalThis.\$.fn = {};
  globalThis.\$.extend = function(){};
}

// NCP calculator factory — new Function() runs in non-strict mode
const __ncpCalc = new Function("\\$g", \`
var gen = \\$g.gen;
var AT = 0, DF = 1, SA = 2, SD = 3, SP = 4;
var STATS = [AT, DF, SA, SD, SP];
var lastHighestStat = [-1, -1];
var manualProtoQuark = false;
var resultDisplayMode = \\$g.resultDisplayMode;
var typeChart = \\$g.typeChart;
var NATURES = \\$g.natures;
var moves = \\$g.moves;

${helperSource}

${masterCode}

${svCode}

${koCode}

return { GET_DAMAGE_SV, GET_DAMAGE_HANDLER, CALCULATE_ALL_MOVES_SV, getKOChanceText, buildDescription, pokeRound, chainMods, getModifiedStat, getFinalSpeed };
\`)({
  gen: 10,
  resultDisplayMode: "SPs",
  typeChart: ${typeChartJson},
  natures: ${naturesJson},
  moves: ${movesJson},
});

// Re-export for the adapter
const { GET_DAMAGE_SV, GET_DAMAGE_HANDLER, CALCULATE_ALL_MOVES_SV, getKOChanceText, buildDescription, pokeRound, chainMods, getModifiedStat, getFinalSpeed } = __ncpCalc;
export { GET_DAMAGE_SV, GET_DAMAGE_HANDLER, CALCULATE_ALL_MOVES_SV, getKOChanceText, buildDescription, pokeRound, chainMods, getModifiedStat, getFinalSpeed };
export const gen = 10;
export const AT = 0, DF = 1, SA = 2, SD = 3, SP = 4;
export const STATS = [0, 1, 2, 3, 4];
export const typeChart = ${typeChartJson};
export const NATURES = ${naturesJson};
export const moves = ${movesJson};
`;

  console.log('Building NCP damage-calc bundle...');

  let code = bundle;

  console.log('Post-processing...');
  code = postProcess(code);

  fs.writeFileSync(OUT_FILE, code);

  const stat = fs.statSync(OUT_FILE);
  console.log(`  Final: ${(stat.size / 1024).toFixed(1)} KB`);
  console.log('\nNCP Damage calc build complete.');
}

build();
