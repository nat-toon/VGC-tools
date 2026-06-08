const VIEWS = [
  { key: "pokemon", label: "Pokemon" },
  { key: "types", label: "Types" },
  { key: "moves", label: "Moves" },
  { key: "items", label: "Items" },
  { key: "abilities", label: "Abilities" },
];

export default function ViewSelector({ value, onChange }) {
  return (
    <div className="view-selector" role="tablist" aria-label="View">
      {VIEWS.map((v) => (
        <button
          key={v.key}
          type="button"
          role="tab"
          aria-selected={value === v.key}
          className={`view-selector-btn ${value === v.key ? "active" : ""}`}
          onClick={() => onChange(v.key)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
