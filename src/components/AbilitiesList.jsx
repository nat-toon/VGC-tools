import { memo, useCallback, useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import AbilityDetail from "./AbilityDetail.jsx";
import VirtualTable from "./VirtualTable.jsx";
import { getAllAbilities, isAbilityLegal } from "../lib/abilities.js";
import { sortByNameAsc, buildAliasSet, matchesAlias } from "../lib/utils.js";

const ROW_HEIGHT = 44;

const AbilityGridRow = memo(function AbilityGridRow({ a }) {
  return (
    <>
      <div className="vt-cell vt-sprite"></div>
      <div className="vt-cell vt-name">{a.name}</div>
      <div className="vt-cell vt-desc">{a.shortDesc || a.desc || "—"}</div>
    </>
  );
});

export default function AbilitiesList({ regulation, search, allPokemon = [] }) {
  const [sortKey, setSortKey] = useState("");
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => {
    const all = getAllAbilities();
    return all
      .filter((a) => isAbilityLegal(a._key, regulation))
      .map((a) => ({ ...a, _lcName: a.name.toLowerCase() }));
  }, [regulation]);

  const filtered = useMemo(() => {
    const { q, aliasSet } = buildAliasSet(search);
    const searched = items.filter((a) => {
      if (!q) return true;
      return matchesAlias(a, q, aliasSet);
    });
    if (!sortKey) return searched.sort(sortByNameAsc);
    const [field, dir] = sortKey.split("-");
    const desc = dir === "desc" ? -1 : 1;
    return searched.sort((a, b) => {
      if (field === "name") return desc * a.name.localeCompare(b.name);
      return 0;
    });
  }, [items, search, sortKey]);

  function cycleSort(field) {
    setSortKey((cur) => {
      if (!cur || !cur.startsWith(field)) return field + "-asc";
      return cur.split("-")[1] === "asc" ? field + "-desc" : "";
    });
  }

  function sortArrow(field) {
    if (!sortKey?.startsWith(field)) return null;
    return sortKey.split("-")[1] === "asc" ? "▲" : "▼";
  }

  const getKey = useCallback((a) => a._key, []);

  const handleSelect = useCallback((a) => {
    setSelected((cur) => (cur && cur._key === a._key ? null : a));
  }, []);

  const renderItem = useCallback((a) => <AbilityGridRow a={a} />, []);

  const headers = useMemo(() => [
    { nosort: true },
    { label: "Name", onClick: () => cycleSort("name"), active: sortKey?.startsWith("name"), arrow: sortArrow("name") },
    { nosort: true, label: "Description" },
  ], [sortKey]);

  return (
    <div className="tab-panel active" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <VirtualTable
        headers={headers}
        gridClass="abilities-grid"
        items={filtered}
        rowHeight={ROW_HEIGHT}
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
