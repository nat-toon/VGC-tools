import { memo, useCallback, useMemo, useState } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Modal from "./Modal.jsx";
import MoveDetail from "./MoveDetail.jsx";
import VirtualTable from "./VirtualTable.jsx";
import SectionHeader from "./SectionHeader.jsx";
import { getAllMoves, isMoveLegal } from "../lib/moves.js";
import { formatAcc, formatPower, buildAliasSet, matchesAlias } from "../lib/utils.js";
import { TYPES, CATEGORIES, CATEGORY_COLORS } from "../lib/constants.js";

const ROW_HEIGHT = 44;

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

const CategorySearchRow = memo(function CategorySearchRow({ cat, active }) {
  const bg = CATEGORY_COLORS[cat.toLowerCase()] || "transparent";
  return (
    <div className={`global-search-row${active ? " filter-active" : ""}`} style={{ display: "grid", gridTemplateColumns: "48px 1fr", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", background: bg, padding: "2px 6px" }}>
          <CategoryIcon category={cat} width={28} />
        </span>
      </div>
      <div className="vt-cell vt-name">{cat}</div>
    </div>
  );
});

const MoveSearchRow = memo(function MoveSearchRow({ m }) {
  return (
    <div className="global-search-row" style={{ display: "grid", gridTemplateColumns: "48px 160px 56px 56px 44px 56px 1fr", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <span className="move-stat-value">{m.pp ?? "\u2014"}</span>
      </div>
      <div className="vt-cell vt-move-stat">
        <span className="move-stat-label">Acc</span>
        <span className="move-stat-value">{formatAcc(m.accuracy)}</span>
      </div>
      <div className="vt-cell vt-desc">{m.shortDesc || m.desc || "\u2014"}</div>
    </div>
  );
});

const TypeSearchRow = memo(function TypeSearchRow({ t, active }) {
  return (
    <div className={`global-search-row${active ? " filter-active" : ""}`} style={{ display: "grid", gridTemplateColumns: "48px 1fr", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TypeIcon type={t} size={28} />
      </div>
      <div className="vt-cell vt-name">{t}</div>
    </div>
  );
});

const MoveGridRow = memo(function MoveGridRow({ m }) {
  return (
    <>
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
        <span className="move-stat-value">{m.pp ?? "\u2014"}</span>
      </div>
      <div className="vt-cell vt-move-stat">
        <span className="move-stat-label">Acc</span>
        <span className="move-stat-value">{formatAcc(m.accuracy)}</span>
      </div>
      <div className="vt-cell vt-desc">{m.shortDesc || m.desc || "\u2014"}</div>
    </>
  );
});

export default function MovesList({ regulation, search, allPokemon = [], onViewChange, filters, addFilter, removeFilter, setSearch }) {
  const [sortKey, setSortKey] = useState("");
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => {
    const all = getAllMoves();
    return all.filter((m) => isMoveLegal(m._key, regulation)).map((m) => ({ ...m, _lcName: m.name.toLowerCase() }));
  }, [regulation]);

  const isSearching = search.trim().length > 0;

  const matchingCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return CATEGORIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  const matchingTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return TYPES.filter((t) => t.includes(q));
  }, [search]);

  const matchingMoves = useMemo(() => {
    const { q, aliasSet } = buildAliasSet(search);
    if (!q) return [];
    return items
      .filter((m) => matchesAlias(m, q, aliasSet))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search]);

  const filtered = useMemo(() => {
    let result = items;
    if (filters.categories.length > 0) {
      result = result.filter((m) =>
        filters.categories.some((c) => (m.category || "").toLowerCase() === c.toLowerCase())
      );
    }
    if (filters.moveTypes.length > 0) {
      result = result.filter((m) =>
        filters.moveTypes.some((t) => (m.type || "").toLowerCase() === t.toLowerCase())
      );
    }
    return sortItems(result, sortKey);
  }, [items, sortKey, filters.categories, filters.moveTypes]);

  const toggleFilter = useCallback((category, value) => {
    setSearch("");
    if (filters[category].includes(value)) {
      removeFilter(category, value);
    } else {
      addFilter(category, value);
    }
  }, [addFilter, removeFilter, setSearch, filters]);

  const handleCategoryClick = useCallback((cat) => {
    toggleFilter("categories", cat);
  }, [toggleFilter]);

  const handleTypeClick = useCallback((t) => {
    toggleFilter("moveTypes", t);
  }, [toggleFilter]);

  const handleMoveClick = useCallback((m) => {
    setSelected((cur) => (cur && cur._key === m._key ? null : m));
  }, []);

  function cycleSort(field) {
    setSortKey((cur) => {
      if (!cur || !cur.startsWith(field)) return field + "-asc";
      return cur.split("-")[1] === "asc" ? field + "-desc" : "";
    });
  }

  function sortArrow(field) {
    if (!sortKey?.startsWith(field)) return null;
    return sortKey.split("-")[1] === "asc" ? "\u25B2" : "\u25BC";
  }

  const getKey = useCallback((m) => m._key, []);

  const handleTableSelect = useCallback((m) => {
    setSelected((cur) => (cur && cur._key === m._key ? null : m));
  }, []);

  const renderItem = useCallback((m) => <MoveGridRow m={m} />, []);

  const headers = useMemo(() => [
    { label: "Type", onClick: () => onViewChange?.("types") },
    { label: "Name", onClick: () => cycleSort("name"), active: sortKey?.startsWith("name"), arrow: sortArrow("name") },
    { nosort: true, label: "Cat" },
    { label: "BP", onClick: () => cycleSort("power"), active: sortKey?.startsWith("power"), arrow: sortArrow("power") },
    { label: "PP", onClick: () => cycleSort("pp"), active: sortKey?.startsWith("pp"), arrow: sortArrow("pp") },
    { label: "Acc", onClick: () => cycleSort("accuracy"), active: sortKey?.startsWith("accuracy"), arrow: sortArrow("accuracy") },
    { nosort: true, label: "Description" },
  ], [sortKey, onViewChange]);

  if (isSearching) {
    return (
      <div className="global-search tab-panel active">
        {matchingCategories.length > 0 && (
          <div className="global-search-section">
            <SectionHeader label="Categories" count={matchingCategories.length} />
            <div className="global-search-results">
              {matchingCategories.map((cat) => (
                <div key={cat} onClick={() => handleCategoryClick(cat)} role="button" tabIndex={0}>
                  <CategorySearchRow cat={cat} active={filters.categories.includes(cat)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {matchingMoves.length > 0 && (
          <div className="global-search-section">
            <SectionHeader label="Moves" count={matchingMoves.length} />
            <div className="global-search-results">
              {matchingMoves.map((m) => (
                <div key={m._key} onClick={() => handleMoveClick(m)} role="button" tabIndex={0}>
                  <MoveSearchRow m={m} />
                </div>
              ))}
            </div>
          </div>
        )}

        {matchingTypes.length > 0 && (
          <div className="global-search-section">
            <SectionHeader label="Types" count={matchingTypes.length} />
            <div className="global-search-results">
              {matchingTypes.map((t) => (
                <div key={t} onClick={() => handleTypeClick(t)} role="button" tabIndex={0}>
                  <TypeSearchRow t={t} active={filters.moveTypes.includes(t)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {matchingCategories.length === 0 && matchingMoves.length === 0 && matchingTypes.length === 0 && (
          <div className="empty-state">No results found.</div>
        )}

        <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="move-name">
          {selected && <MoveDetail move={selected} regulation={regulation} allPokemon={allPokemon} />}
        </Modal>
      </div>
    );
  }

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
        onSelect={handleTableSelect}
        emptyText="No moves match the current filters."
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="move-name">
        {selected && <MoveDetail move={selected} regulation={regulation} allPokemon={allPokemon} />}
      </Modal>
    </div>
  );
}
