import { memo, useCallback, useMemo, useState } from "react";
import TypeIcon from "./TypeIcon.jsx";
import Modal from "./Modal.jsx";
import PokedexTable from "./PokedexTable.jsx";
import VirtualTable from "./VirtualTable.jsx";
import { getPool } from "../lib/regulations.js";
import { applySearchPokemon, sortByNumAsc } from "../lib/utils.js";
import { TYPES } from "../lib/constants.js";

const ROW_HEIGHT = 44;

const TypeGridRow = memo(function TypeGridRow({ t }) {
  return (
    <>
      <div className="vt-cell vt-sprite">
        <TypeIcon type={t} size={28} />
      </div>
      <div className="vt-cell vt-name">{t}</div>
    </>
  );
});

export default function TypesList({ allPokemon, regulation, search }) {
  const [selected, setSelected] = useState(null);

  const regPool = useMemo(() => getPool(allPokemon, regulation), [allPokemon, regulation]);

  const types = useMemo(
    () => TYPES
      .filter((t) => !search.trim() || t.includes(search.trim().toLowerCase()))
      .sort((a, b) => a.localeCompare(b)),
    [search],
  );

  const members = useMemo(() => {
    if (!selected) return [];
    return applySearchPokemon(regPool, search).sort(sortByNumAsc);
  }, [selected, regPool, search]);

  const getKey = useCallback((t) => t, []);

  const handleSelect = useCallback((t) => {
    setSelected((cur) => (cur === t ? null : t));
  }, []);

  const renderItem = useCallback((t) => <TypeGridRow t={t} />, []);

  const headers = useMemo(() => [
    { nosort: true },
    { nosort: true, label: "Name" },
  ], []);

  return (
    <div className="tab-panel active">
      <VirtualTable
        headers={headers}
        gridClass="types-grid"
        items={types}
        rowHeight={ROW_HEIGHT}
        renderItem={renderItem}
        selectedKey={selected}
        getKey={getKey}
        onSelect={handleSelect}
        emptyText="No types match the current filters."
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="type-detail">
        {selected && (
          <div className="type-detail">
            <div className="type-detail-head">
              <TypeIcon type={selected} size={48} />
              <h2 id="type-detail" className="type-detail-name">{selected}</h2>
            </div>
            <PokedexTable
              pokemon={members.filter((p) => (p.types || []).includes(selected))}
              regulation={regulation}
              allPokemon={allPokemon}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
