export const API_URL = "/pokedex.json";
export const MOVES_URL = "/moves.json";
export const LEARNSETS_URL = "/learnsets.json";

export const CACHE_VERSION = 11;
export const MOVES_CACHE_VERSION = 2;
export const LEARNSETS_CACHE_VERSION = 3;

export const REG_KEY = "pkmn_last_reg";
export const CACHE_KEY = "pkmn_pokedex_v11";
export const MOVES_CACHE_KEY = "pkmn_moves_v2";

export const STAT_CONFIG = [
  { key: "hp", label: "HP", max: 255 },
  { key: "atk", label: "ATK", max: 255 },
  { key: "def", label: "DEF", max: 255 },
  { key: "spa", label: "SPA", max: 255 },
  { key: "spd", label: "SPD", max: 255 },
  { key: "spe", label: "SPE", max: 255 },
];

export const TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];

export const NATURES = [
  { name: "Hardy",   plus: null,    minus: null },
  { name: "Lonely",  plus: "atk",   minus: "def" },
  { name: "Brave",   plus: "atk",   minus: "spe" },
  { name: "Adamant", plus: "atk",   minus: "spa" },
  { name: "Naughty", plus: "atk",   minus: "spd" },
  { name: "Bold",    plus: "def",   minus: "atk" },
  { name: "Docile",  plus: null,    minus: null },
  { name: "Relaxed", plus: "def",   minus: "spe" },
  { name: "Impish",  plus: "def",   minus: "spa" },
  { name: "Lax",     plus: "def",   minus: "spd" },
  { name: "Timid",   plus: "spe",   minus: "atk" },
  { name: "Hasty",   plus: "spe",   minus: "def" },
  { name: "Serious", plus: null,    minus: null },
  { name: "Jolly",   plus: "spe",   minus: "spa" },
  { name: "Naive",   plus: "spe",   minus: "spd" },
  { name: "Modest",  plus: "spa",   minus: "atk" },
  { name: "Mild",    plus: "spa",   minus: "def" },
  { name: "Quiet",   plus: "spa",   minus: "spe" },
  { name: "Bashful", plus: null,    minus: null },
  { name: "Rash",    plus: "spa",   minus: "spd" },
  { name: "Calm",    plus: "spd",   minus: "atk" },
  { name: "Gentle",  plus: "spd",   minus: "def" },
  { name: "Sassy",   plus: "spd",   minus: "spe" },
  { name: "Careful", plus: "spd",   minus: "spa" },
  { name: "Quirky",  plus: null,    minus: null },
];

export const NATURE_MAP = Object.fromEntries(NATURES.map((n) => [n.name, n]));

export const CATEGORIES = ["Physical", "Special", "Status"];

export const CATEGORY_COLORS = {
  physical: "#ed6744",
  special: "#60acf1",
  status: "#959899",
};
