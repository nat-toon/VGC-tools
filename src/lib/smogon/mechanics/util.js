export function isGrounded(pokemon, field) {
  if (field.isGravity) return true;
  if (pokemon.hasType('Flying')) return false;
  if (pokemon.hasItem('Air Balloon')) return false;
  if (pokemon.hasAbility('Levitate')) return false;
  if (pokemon.hasItem('Iron Ball')) return true;
  if (pokemon.hasAbility('Magnet Pull')) return true;
  if (pokemon.volatiles['ingrain']) return true;
  if (pokemon.volatiles['smackdown']) return true;
  if (field.terrain === 'Grassy' && pokemon.hasAbility('Grass Pelt')) return true;
  if (field.terrain === 'Misty' && pokemon.hasAbility('Misty Surge')) return true;
  if (field.terrain === 'Electric' && pokemon.hasAbility('Electric Surge')) return true;
  if (field.terrain === 'Psychic' && pokemon.hasAbility('Psychic Surge')) return true;
  return true;
}
