import { useRef, useState, useEffect, memo, createElement } from "react";
import { List } from "react-window";

const OVERCAN = 12;

const Row = memo(function Row({ index, style, items, gridClass, selectedKey, getKey, onSelect, renderItem }) {
  const item = items[index];
  const isSelected = selectedKey != null && getKey(item) === selectedKey;
  return createElement(
    "div",
    {
      style,
      className: `vt-row ${gridClass}${isSelected ? " selected" : ""}`,
      onClick: () => onSelect(item),
      tabIndex: 0,
    },
    renderItem(item, index),
  );
});

export default function VirtualTable({
  headers,
  gridClass,
  items,
  rowHeight,
  renderItem,
  selectedKey,
  getKey,
  onSelect,
  emptyText,
}) {
  const wrapRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentBoxSize?.[0]?.blockSize ?? el.clientHeight);
    });
    ro.observe(el);
    setHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const rowProps = {
    items,
    gridClass,
    selectedKey,
    getKey,
    onSelect,
    renderItem,
  };

  const listHeight = items.length === 0 ? 0 : Math.min(items.length * rowHeight, height);

  return createElement(
    "div",
    { ref: wrapRef, className: "vt-wrap" },
    createElement(
      "div",
      { className: `vt-header ${gridClass}`, role: "row" },
      headers.map((h, i) =>
        createElement(
          "div",
          {
            key: i,
            className: `vt-hcell${h.nosort ? " nosort" : ""}${h.active ? " active" : ""}${h.className ? ` ${h.className}` : ""}`,
            onClick: h.onClick,
            role: h.nosort ? undefined : "columnheader",
            style: h.style,
          },
          h.label,
          h.arrow ? createElement("span", { className: "vt-arrow" }, ` ${h.arrow}`) : null,
        ),
      ),
    ),
    listHeight > 0 &&
      createElement(List, {
        height: listHeight,
        rowCount: items.length,
        rowHeight,
        rowComponent: Row,
        rowProps,
        overscanCount: OVERCAN,
        width: "100%",
      }),
    items.length === 0 && emptyText && createElement("div", { className: "empty-state" }, emptyText),
  );
}
