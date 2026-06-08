import { useState } from "react";
import PokemonRow from "./PokemonRow.jsx";
import Modal from "./Modal.jsx";
import PokemonEntry from "./PokemonEntry.jsx";
import { STAT_CONFIG } from "../lib/constants.js";

export default function PokedexTable({
  pokemon,
  regulation,
  allPokemon = [],
  sortKey,
  onHeaderClick,
  showEmpty = true,
}) {
  const [entrySelected, setEntrySelected] = useState(null);

  function handleRowClick(p) {
    setEntrySelected((cur) => (cur && cur.key === p.key ? null : p));
  }

  function handleCloseEntry() {
    setEntrySelected(null);
  }

  function sortArrow(field) {
    if (!sortKey || !sortKey.startsWith(field)) return null;
    return sortKey.split("-")[1] === "asc" ? "▲" : "▼";
  }

  function headerClick(field) {
    if (onHeaderClick) onHeaderClick(field);
  }

  function headerClass(field, base) {
    if (!sortKey) return base;
    return `${base} ${sortKey.startsWith(field) ? "active" : ""}`;
  }

  if (pokemon.length === 0) {
    if (showEmpty) return <div className="empty-state">No Pokemon match.</div>;
    return null;
  }

  const isRowSelected = (p) => entrySelected && entrySelected.key === p.key;

  return (
    <>
      <div className="table-wrap">
        <table className="pkmn-table">
          <thead>
            <tr>
              <th
                className={headerClass("num", "th-num")}
                onClick={() => headerClick("num")}
              >
                # {sortArrow("num")}
              </th>
              <th className="th-sprite"></th>
              <th
                className={headerClass("name", "th-name")}
                onClick={() => headerClick("name")}
              >
                Name {sortArrow("name")}
              </th>
              <th className="th-type">Type</th>
              {STAT_CONFIG.map(({ key, label }) => (
                <th
                  key={key}
                  className={headerClass(key, "th-stat")}
                  onClick={() => headerClick(key)}
                >
                  {label} {sortArrow(key)}
                </th>
              ))}
              <th
                className={headerClass("bst", "th-bst")}
                onClick={() => headerClick("bst")}
              >
                BST {sortArrow("bst")}
              </th>
              <th className="th-ab" colSpan="2">Abilities</th>
            </tr>
          </thead>
          <tbody>
            {pokemon.map((p) => (
              <PokemonRow
                key={p.name}
                pokemon={p}
                selected={isRowSelected(p)}
                onClick={handleRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={!!entrySelected}
        onClose={handleCloseEntry}
        labelledBy="entry-name"
      >
        {entrySelected && (
          <PokemonEntry pokemon={entrySelected} regulation={regulation} allPokemon={allPokemon} />
        )}
      </Modal>
    </>
  );
}
