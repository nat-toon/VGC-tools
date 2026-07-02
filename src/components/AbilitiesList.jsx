import { useCallback, useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import AbilityDetail from "./AbilityDetail.jsx";
import VirtualTable from "./VirtualTable.jsx";
import AbilityGridRow from "./rows/AbilityGridRow.jsx";
import { getAllAbilities, isAbilityLegal } from "../lib/abilities.js";
import { useRowHeight, useTableSearchSort } from "../lib/hooks.js";

export default function AbilitiesList({ regulation, search, allPokemon = [] }) {
  const [selected, setSelected] = useState(null);
  const rowHeight = useRowHeight();

  const items = useMemo(() => {
    const all = getAllAbilities();
    return all
      .filter((a) => isAbilityLegal(a._key, regulation))
      .map((a) => ({ ...a, _lcName: a.name.toLowerCase() }));
  }, [regulation]);

  const {
    filtered,
    cycleSort,
    sortArrow,
    sortKey,
  } = useTableSearchSort(items, search, { defaultSort: { key: "name" } });

  const getKey = useCallback((a) => a._key, []);

  const handleSelect = useCallback((a) => {
    setSelected((cur) => (cur && cur._key === a._key ? null : a));
  }, []);

  const renderItem = useCallback((a) => <AbilityGridRow a={a} />, []);

  const headers = useMemo(() => [
    { nosort: true },
    { label: "Name", onClick: () => cycleSort("name"), active: sortKey?.startsWith("name"), arrow: sortArrow("name") },
    { nosort: true, label: "Description" },
  ], [sortKey, cycleSort, sortArrow]);

  return (
    <div className="tab-panel active" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <VirtualTable
        headers={headers}
        gridClass="abilities-grid"
        items={filtered}
        rowHeight={rowHeight}
        renderItem={renderItem}
        selectedKey={selected?._key}
        getKey={getKey}
        onSelect={handleSelect}
        emptyText="No abilities match the current filters."
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="ability-name">
        {selected && (
          <AbilityDetail
            ability={selected}
            regulation={regulation}
            allPokemon={allPokemon}
          />
        )}
      </Modal>
    </div>
  );
}
