import { useCallback, useMemo, useRef, useState } from "react";
import VirtualTable from "./VirtualTable.jsx";
import Modal from "./Modal.jsx";
import PokemonEntry from "./PokemonEntry.jsx";
import PokemonGridRow from "./rows/PokemonGridRow.jsx";
import { getPool } from "../lib/regulations.js";
import { getLearnset, areLearnsetsLoaded } from "../lib/learnsets.js";
import { STAT_CONFIG } from "../lib/constants.js";
import { bst, applySearchPokemon } from "../lib/utils.js";
import { useRowHeight } from "../lib/hooks.js";

function sortItems(items, sortKey) {
  if (!sortKey) {
    return items.slice().sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));
  }
  const [field, dir] = sortKey.split("-");
  const desc = dir === "desc" ? -1 : 1;
  return items.slice().sort((a, b) => {
    if (field === "name") return desc * a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    if (field === "num") return desc * (a.num - b.num);
    if (field === "bst") return desc * (bst(b.baseStats) - bst(a.baseStats));
    const va = a.baseStats ? a.baseStats[field] : 0;
    const vb = b.baseStats ? b.baseStats[field] : 0;
    return desc * (vb - va);
  });
}

export default function Pokedex({ allPokemon, regulation, search, filters, onViewChange, onPokemonSelect, learnsetsLoaded = true }) {
  const [sortKey, setSortKey] = useState("");
  const sortKeyRef = useRef("");
  const [selected, setSelected] = useState(null);
  const rowHeight = useRowHeight();

  const regPool = useMemo(() => getPool(allPokemon, regulation), [allPokemon, regulation]);

  const items = useMemo(() => {
    let pool = applySearchPokemon(regPool, search);

    if (filters) {
      if (filters.types.length > 0) {
        pool = pool.filter((p) =>
          filters.types.every((t) => (p.types || []).includes(t))
        );
      }
      if (filters.moves.length > 0 && areLearnsetsLoaded(regulation)) {
        pool = pool.filter((p) => {
          const learnset = getLearnset(p.key, regulation);
          return Array.isArray(learnset) && filters.moves.every((m) => learnset.includes(m));
        });
      }
      if (filters.abilities.length > 0) {
        pool = pool.filter((p) =>
          filters.abilities.some((a) =>
            (p.abilities || []).some((pa) => pa.name && pa.name.toLowerCase() === a.toLowerCase())
          )
        );
      }
    }

    return sortItems(pool, sortKey);
  }, [regPool, search, sortKey, filters, regulation, learnsetsLoaded]);

  const cycleSort = useCallback((field) => {
    setSortKey((cur) => {
      const next = !cur || !cur.startsWith(field) ? field + "-asc" : cur.split("-")[1] === "asc" ? field + "-desc" : "";
      sortKeyRef.current = next;
      return next;
    });
  }, []);

  const sortArrow = useCallback((field) => {
    const sk = sortKeyRef.current;
    if (!sk || !sk.startsWith(field)) return null;
    return sk.split("-")[1] === "asc" ? "▲" : "▼";
  }, []);

  const getKey = useCallback((p) => p.key, []);

  const handleSelect = useCallback((p) => {
    if (onPokemonSelect) {
      onPokemonSelect(p);
    } else {
      setSelected((cur) => (cur && cur.key === p.key ? null : p));
    }
  }, [onPokemonSelect]);

  const renderItem = useCallback((p) => <PokemonGridRow p={p} />, []);

  const headers = useMemo(() => [
    { label: "#", onClick: () => cycleSort("num"), active: sortKey?.startsWith("num"), arrow: sortArrow("num") },
    { nosort: true },
    { label: "Name", onClick: () => cycleSort("name"), active: sortKey?.startsWith("name"), arrow: sortArrow("name") },
    { label: "Type", className: "text-left", onClick: () => onViewChange?.("types") },
    { label: "Abilities", style: { gridColumn: "span 2" }, onClick: () => onViewChange?.("abilities") },
    ...STAT_CONFIG.map(({ key, label }) => ({
      label, onClick: () => cycleSort(key), active: sortKey?.startsWith(key), arrow: sortArrow(key),
    })),
    { label: "BST", onClick: () => cycleSort("bst"), active: sortKey?.startsWith("bst"), arrow: sortArrow("bst") },
  ], [sortKey, onViewChange, cycleSort, sortArrow]);

  return (
    <div className="tab-panel active" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <VirtualTable
        headers={headers}
        gridClass="pkmn-grid"
        items={items}
        rowHeight={rowHeight}
        renderItem={renderItem}
        selectedKey={selected?.key}
        getKey={getKey}
        onSelect={handleSelect}
        emptyText="No Pokemon match the current filters."
      />
      {!onPokemonSelect && (
        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          labelledBy="entry-name"
        >
          {selected && (
            <PokemonEntry pokemon={selected} regulation={regulation} allPokemon={allPokemon} />
          )}
        </Modal>
      )}
    </div>
  );
}
