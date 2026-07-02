import { useState } from "react";
import Modal from "./Modal.jsx";
import PokemonEntry from "./PokemonEntry.jsx";
import PokemonGridRow from "./rows/PokemonGridRow.jsx";

/*
 * Compact, non-virtualized Pokemon list rendered inside a modal.
 * Each row is clickable and pops a second Pokémon-entry modal on top.
 *
 * Used by item, ability, move, and type detail panels where the
 * underlying bearer list is small (typically <50 entries) and the
 * modal stack provides the affordance for "click to see this Pokemon".
 */
export default function PokemonModalList({ pokemon, regulation, allPokemon, emptyText = "No Pokemon match." }) {
  const [entrySelected, setEntrySelected] = useState(null);

  if (pokemon.length === 0) {
    return <div className="empty-state">{emptyText}</div>;
  }

  function handleRowClick(p) {
    setEntrySelected((cur) => (cur && cur.key === p.key ? null : p));
  }

  return (
    <>
      <div className="modal-table-wrap">
        {pokemon.map((p) => (
          <div
            key={p.key}
            className={`vt-row pkmn-grid modal-table-row${entrySelected?.key === p.key ? " selected" : ""}`}
            onClick={() => handleRowClick(p)}
            tabIndex={0}
            role="button"
          >
            <PokemonGridRow p={p} />
          </div>
        ))}
      </div>
      <Modal
        open={!!entrySelected}
        onClose={() => setEntrySelected(null)}
        labelledBy="entry-name"
      >
        {entrySelected && (
          <PokemonEntry pokemon={entrySelected} regulation={regulation} allPokemon={allPokemon} />
        )}
      </Modal>
    </>
  );
}
