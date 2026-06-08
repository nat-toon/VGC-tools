import { useMemo } from "react";
import PokedexTable from "./PokedexTable.jsx";
import { getPokemonWithAbility } from "../lib/abilities.js";
import { getPool } from "../lib/regulations.js";

export default function AbilityDetail({ ability, regulation, allPokemon }) {
  const regPool = useMemo(() => getPool(allPokemon, regulation), [allPokemon, regulation]);
  const bearers = useMemo(
    () => (ability ? getPokemonWithAbility(ability.name, regPool) : []),
    [ability, regPool],
  );
  if (!ability) return null;
  return (
    <div className="ability-detail">
      <h2 className="ability-detail-name">{ability.name}</h2>
      <p className="ability-detail-desc">{ability.desc || ability.shortDesc || "No description available."}</p>
      <PokedexTable
        pokemon={bearers}
        regulation={regulation}
        allPokemon={allPokemon}
      />
    </div>
  );
}
