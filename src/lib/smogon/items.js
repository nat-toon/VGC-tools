import { toID } from './util.js';

const SEED_BOOSTED_STAT = {
  'electricseed': 'def',
  'grassyseed': 'def',
  'mistyseed': 'spd',
  'psychicseed': 'spd',
};

export function getItemBoostType(item) {
  if (!item) return undefined;
  const map = {
    'dracoplate': 'Dragon', 'dragonfang': 'Dragon',
    'dreadplate': 'Dark', 'blackglasses': 'Dark',
    'earthplate': 'Ground', 'softsand': 'Ground',
    'fistplate': 'Fighting', 'blackbelt': 'Fighting',
    'flameplate': 'Fire', 'charcoal': 'Fire',
    'icicleplate': 'Ice', 'nevermeltice': 'Ice',
    'insectplate': 'Bug', 'silverpowder': 'Bug',
    'ironplate': 'Steel', 'metalcoat': 'Steel',
    'meadowplate': 'Grass', 'roseincense': 'Grass', 'miracleseed': 'Grass',
    'mindplate': 'Psychic', 'oddincense': 'Psychic', 'twistedspoon': 'Psychic',
    'fairyfeather': 'Fairy', 'pixieplate': 'Fairy',
    'skyplate': 'Flying', 'sharpbeak': 'Flying',
    'splashplate': 'Water', 'seaincense': 'Water', 'waveincense': 'Water', 'mysticwater': 'Water',
    'spookyplate': 'Ghost', 'spelltag': 'Ghost',
    'stoneplate': 'Rock', 'rockincense': 'Rock', 'hardstone': 'Rock',
    'toxicplate': 'Poison', 'poisonbarb': 'Poison',
    'zapplate': 'Electric', 'magnet': 'Electric',
    'silkscarf': 'Normal', 'pinkbow': 'Normal', 'polkadotbow': 'Normal',
  };
  return map[toID(item)];
}

export function getBerryResistType(berry) {
  if (!berry) return undefined;
  const map = {
    'chilanberry': 'Normal', 'occaberry': 'Fire', 'passhoberry': 'Water',
    'wacanberry': 'Electric', 'rindoberry': 'Grass', 'yacheberry': 'Ice',
    'chopleberry': 'Fighting', 'kebiaberry': 'Poison', 'shucaberry': 'Ground',
    'cobaberry': 'Flying', 'payapaberry': 'Psychic', 'tangaberry': 'Bug',
    'chartiberry': 'Rock', 'kasibberry': 'Ghost', 'habanberry': 'Dragon',
    'colburberry': 'Dark', 'babiriberry': 'Steel', 'roseliberry': 'Fairy',
  };
  return map[toID(berry)];
}
