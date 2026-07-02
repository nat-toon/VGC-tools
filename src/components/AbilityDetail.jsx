import { useMemo } from "react";
import PokemonModalList from "./PokemonModalList.jsx";
import { getPokemonWithAbility } from "../lib/abilities.js";

export default function AbilityDetail({ ability, regulation, allPokemon }) {
  const bearers = useMemo(
    () => (ability ? getPokemonWithAbility(ability.name, allPokemon) : []),
    [ability, allPokemon],
  );
  if (!ability) return null;
  return (
    <div className="ability-detail">
      <h2 className="ability-detail-name">{ability.name}</h2>
      <p className="ability-detail-desc">{ability.desc || ability.shortDesc || "No description available."}</p>
      <PokemonModalList pokemon={bearers} regulation={regulation} allPokemon={allPokemon} />
    </div>
  );
}
