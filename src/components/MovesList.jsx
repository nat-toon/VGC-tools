import { memo, useCallback, useMemo, useState } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Modal from "./Modal.jsx";
import MoveDetail from "./MoveDetail.jsx";
import VirtualTable from "./VirtualTable.jsx";
import { getAllMoves, isMoveLegal } from "../lib/moves.js";
import { formatAcc, formatPower } from "../lib/utils.js";

const ROW_HEIGHT = 44;

function applySearch(items, search) {
  const q = search.trim().toLowerCase();
  if (!q) return items;
  return items.filter((m) => m._lcName.includes(q) || (m.type || "").toLowerCase().includes(q));
}

function sortItems(items, sortKey) {
  if (!sortKey) {
    return items.slice().sort((a, b) => a.name.localeCompare(b.name));
  }
  const [field, dir] = sortKey.split("-");
  const desc = dir === "desc" ? -1 : 1;
  return items.slice().sort((a, b) => {
    if (field === "name") return desc * a.name.localeCompare(b.name);
    if (field === "power") {
      const va = a.basePower || 0;
      const vb = b.basePower || 0;
      return desc * (vb - va);
    }
    if (field === "pp") {
      const va = a.pp || 0;
      const vb = b.pp || 0;
      return desc * (vb - va);
    }
    if (field === "accuracy") {
      const va = a.accuracy === true ? 101 : a.accuracy || 0;
      const vb = b.accuracy === true ? 101 : b.accuracy || 0;
      return desc * (vb - va);
    }
    return 0;
  });
}

const MoveGridRow = memo(function MoveGridRow({ m }) {
  return (
    <>
      <div className="vt-cell vt-num"></div>
      <div className="vt-cell vt-sprite">
        <TypeIcon type={m.type} size={28} />
      </div>
      <div className="vt-cell vt-name move-name">{m.name}</div>
      <div className="vt-cell vt-cat">
        {m.category ? (
          <span className="entry-move-cat" data-category={String(m.category).toLowerCase()}>
            <CategoryIcon category={m.category} width={20} />
          </span>
        ) : null}
      </div>
      <div className="vt-cell vt-move-stat" data-no-power={(m.category || "").toLowerCase() === "status" || undefined}>
        <span className="move-stat-label">BP</span>
        <span className="move-stat-value">{formatPower(m.basePower)}</span>
      </div>
      <div className="vt-cell vt-move-stat">
        <span className="move-stat-label">PP</span>
        <span className="move-stat-value">{m.pp ?? "—"}</span>
      </div>
      <div className="vt-cell vt-move-stat">
        <span className="move-stat-label">Acc</span>
        <span className="move-stat-value">{formatAcc(m.accuracy)}</span>
      </div>
      <div className="vt-cell vt-desc">{m.shortDesc || m.desc || "—"}</div>
    </>
  );
});

export default function MovesList({ regulation, search, allPokemon = [], onViewChange }) {
  const [sortKey, setSortKey] = useState("");
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => {
    const all = getAllMoves();
    return all.filter((m) => isMoveLegal(m._key, regulation)).map((m) => ({ ...m, _lcName: m.name.toLowerCase() }));
  }, [regulation]);

  const filtered = useMemo(() => sortItems(applySearch(items, search), sortKey), [items, search, sortKey]);

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

  const getKey = useCallback((m) => m._key, []);

  const handleSelect = useCallback((m) => {
    setSelected((cur) => (cur && cur._key === m._key ? null : m));
  }, []);

  const renderItem = useCallback((m) => <MoveGridRow m={m} />, []);

  const headers = useMemo(() => [
    { nosort: true },
    { label: "Type", onClick: () => onViewChange?.("types") },
    { label: "Name", onClick: () => cycleSort("name"), active: sortKey?.startsWith("name"), arrow: sortArrow("name") },
    { nosort: true, label: "Cat" },
    { label: "BP", onClick: () => cycleSort("power"), active: sortKey?.startsWith("power"), arrow: sortArrow("power") },
    { label: "PP", onClick: () => cycleSort("pp"), active: sortKey?.startsWith("pp"), arrow: sortArrow("pp") },
    { label: "Acc", onClick: () => cycleSort("accuracy"), active: sortKey?.startsWith("accuracy"), arrow: sortArrow("accuracy") },
    { nosort: true, label: "Description" },
  ], [sortKey, onViewChange]);

  return (
    <div className="tab-panel active" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <VirtualTable
        headers={headers}
        gridClass="moves-grid"
        items={filtered}
        rowHeight={ROW_HEIGHT}
        renderItem={renderItem}
        selectedKey={selected?._key}
        getKey={getKey}
        onSelect={handleSelect}
        emptyText="No moves match the current filters."
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="move-name">
        {selected && <MoveDetail move={selected} regulation={regulation} allPokemon={allPokemon} />}
      </Modal>
    </div>
  );
}
