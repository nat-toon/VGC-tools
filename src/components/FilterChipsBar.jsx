import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import { CATEGORY_COLORS } from "../lib/constants.js";
import { getMove } from "../lib/moves.js";

function CategoryChipBody({ value }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "3px",
        background: CATEGORY_COLORS[value.toLowerCase()] || "transparent",
        padding: "1px 3px",
      }}
    >
      <CategoryIcon category={value} width={16} />
    </span>
  );
}

function FilterChip({ category, value, onRemove }) {
  const key = `${category}-${value}`;
  const onActivate = () => onRemove(category, value);
  if (category === "types" || category === "moveTypes") {
    return (
      <span
        key={key}
        className="filter-chip filter-chip-type"
        onClick={onActivate}
        role="button"
        tabIndex={0}
      >
        <TypeIcon type={value} size={16} />
      </span>
    );
  }
  if (category === "moves") {
    const moveData = getMove(value);
    return (
      <span
        key={key}
        className="filter-chip filter-chip-move"
        onClick={onActivate}
        role="button"
        tabIndex={0}
      >
        <span className="filter-chip-label">{moveData?.name || value}</span>
      </span>
    );
  }
  if (category === "abilities") {
    return (
      <span
        key={key}
        className="filter-chip filter-chip-ability"
        onClick={onActivate}
        role="button"
        tabIndex={0}
      >
        <span className="filter-chip-label">{value}</span>
      </span>
    );
  }
  if (category === "categories") {
    return (
      <span
        key={key}
        className="filter-chip filter-chip-category"
        onClick={onActivate}
        role="button"
        tabIndex={0}
      >
        <CategoryChipBody value={value} />
      </span>
    );
  }
  return null;
}

export default function FilterChipsBar({ entries, onRemove, onClear, clearLabel = "Clear all" }) {
  if (entries.length === 0) return null;
  return (
    <div className="filter-bar">
      {entries.map((e) => (
        <FilterChip key={`${e.category}-${e.value}`} category={e.category} value={e.value} onRemove={onRemove} />
      ))}
      {onClear && (
        <button className="filter-clear-all" onClick={onClear}>{clearLabel}</button>
      )}
    </div>
  );
}
