import { memo, useCallback, useMemo, useState } from "react";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";
import PokedexTable from "./PokedexTable.jsx";
import VirtualTable from "./VirtualTable.jsx";
import { getAllItems, isItemLegal } from "../lib/items.js";
import { getItemIcon } from "../lib/sprite.js";
import { getPool } from "../lib/regulations.js";
import { applySearchText, sortByNameAsc } from "../lib/utils.js";

const ROW_HEIGHT = 44;

function extractItemPokemonName(item) {
  const desc = item.desc || item.shortDesc || "";
  if (!desc) return null;
  let m = desc.match(/If held by (?:a|an) ([A-Z][a-zA-Z]+(?:[-\s][A-Z][a-zA-Z]+)*)/);
  if (m) return m[1];
  m = desc.match(/^([A-Z][a-z]+(?:-[A-Z][a-z]+)?):/);
  if (m) return m[1];
  return null;
}

function isPokemonSpecificItem(item) {
  return extractItemPokemonName(item) != null;
}

function findItemBearers(nameText, regPool) {
  if (!nameText) return [];
  const tokens = nameText
    .toLowerCase()
    .split(/[\s-]+/)
    .filter((t) => t.length >= 4);
  return regPool.filter((p) => {
    const pTokens = p.name.toLowerCase().split(/[\s-]+/);
    return tokens.some((t) => pTokens.includes(t));
  });
}

function ItemDetail({ item, regulation, allPokemon }) {
  const icon = getItemIcon(item.spritenum);
  const regPool = useMemo(() => getPool(allPokemon, regulation), [allPokemon, regulation]);
  const nameText = extractItemPokemonName(item);
  const bearers = useMemo(
    () => (nameText ? findItemBearers(nameText, regPool) : []),
    [nameText, regPool],
  );
  if (!item) return null;
  return (
    <div className="item-detail">
      <div className="item-detail-head">
        {icon ? <Icon className="item-detail-sprite" icon={icon} /> : null}
        <h2 className="item-detail-name">{item.name}</h2>
      </div>
      <p className="item-detail-desc">{item.desc || item.shortDesc || "No description available."}</p>
      {isPokemonSpecificItem(item) && (
        <PokedexTable
          pokemon={bearers}
          regulation={regulation}
          allPokemon={allPokemon}
        />
      )}
    </div>
  );
}

const ItemGridRow = memo(function ItemGridRow({ i }) {
  const icon = getItemIcon(i.spritenum);
  return (
    <>
      <div className="vt-cell vt-num"></div>
      <div className="vt-cell vt-sprite">
        {icon ? <Icon className="item-row-icon" icon={icon} /> : null}
      </div>
      <div className="vt-cell vt-name">{i.name}</div>
      <div className="vt-cell vt-desc">{i.shortDesc || i.desc || "—"}</div>
    </>
  );
});

export default function ItemsList({ regulation, search, allPokemon = [] }) {
  const [sortKey, setSortKey] = useState("");
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => {
    const all = getAllItems();
    return all
      .filter((i) => isItemLegal(i._key, regulation))
      .map((i) => ({ ...i, _lcName: i.name.toLowerCase() }));
  }, [regulation]);

  const filtered = useMemo(() => {
    const searched = applySearchText(items, search);
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

  const getKey = useCallback((i) => i._key, []);

  const handleSelect = useCallback((i) => {
    setSelected((cur) => (cur && cur._key === i._key ? null : i));
  }, []);

  const renderItem = useCallback((i) => <ItemGridRow i={i} />, []);

  const isSearching = search.trim().length > 0;

  const headers = useMemo(() => {
    if (isSearching) return [];
    return [
      { nosort: true },
      { nosort: true },
      { label: "Name", onClick: () => cycleSort("name"), active: sortKey?.startsWith("name"), arrow: sortArrow("name") },
      { nosort: true, label: "Description" },
    ];
  }, [sortKey, isSearching]);

  return (
    <div className="tab-panel active" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <VirtualTable
        headers={headers}
        gridClass="items-grid"
        items={filtered}
        rowHeight={ROW_HEIGHT}
        renderItem={renderItem}
        selectedKey={selected?._key}
        getKey={getKey}
        onSelect={handleSelect}
        emptyText="No items match the current filters."
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="item-name">
        {selected && (
          <ItemDetail
            item={selected}
            regulation={regulation}
            allPokemon={allPokemon}
          />
        )}
      </Modal>
    </div>
  );
}
