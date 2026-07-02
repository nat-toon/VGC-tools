import { useCallback, useMemo, useState } from "react";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";
import PokemonModalList from "./PokemonModalList.jsx";
import VirtualTable from "./VirtualTable.jsx";
import ItemGridRow from "./rows/ItemGridRow.jsx";
import { getAllItems, isItemLegal } from "../lib/items.js";
import { getItemIcon } from "../lib/sprite.js";
import { getPool } from "../lib/regulations.js";
import { useRowHeight, useTableSearchSort } from "../lib/hooks.js";

function extractItemPokemonName(item) {
  const desc = item.desc || item.shortDesc || "";
  if (!desc) return null;
  let m = desc.match(/If held by (?:a|an) ([A-Z][a-zA-Z]+(?:[-\s][A-Z][a-zA-Z]+)*)/);
  if (m) return m[1];
  m = desc.match(/^([A-Z][a-z]+(?:-[A-Z][a-z]+)?):/);
  if (m) return m[1];
  return null;
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
      {nameText && (
        <PokemonModalList
          pokemon={bearers}
          regulation={regulation}
          allPokemon={allPokemon}
        />
      )}
    </div>
  );
}

export default function ItemsList({ regulation, search, allPokemon = [] }) {
  const [selected, setSelected] = useState(null);
  const rowHeight = useRowHeight();

  const items = useMemo(() => {
    const all = getAllItems();
    return all
      .filter((i) => isItemLegal(i._key, regulation))
      .map((i) => ({ ...i, _lcName: i.name.toLowerCase() }));
  }, [regulation]);

  const { filtered, cycleSort, sortArrow, sortKey } = useTableSearchSort(items, search);

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
  }, [sortKey, isSearching, cycleSort, sortArrow]);

  return (
    <div className="tab-panel active" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <VirtualTable
        headers={headers}
        gridClass="items-grid"
        items={filtered}
        rowHeight={rowHeight}
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
