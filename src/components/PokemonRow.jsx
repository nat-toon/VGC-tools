import { memo } from "react";
import TypeIcon from "./TypeIcon.jsx";
import Icon from "./Icon.jsx";
import { STAT_CONFIG } from "../lib/constants.js";
import { bst, displayName } from "../lib/utils.js";
import NameWithExt from "./NameWithExt.jsx";

function StatCell({ label, value }) {
  return (
    <td className="stat-cell">
      <div className="stat-cell-stack">
        <span className="stat-cell-label">{label}</span>
        <span className="stat-cell-value">{value ?? "?"}</span>
      </div>
    </td>
  );
}

function PokemonRow({ pokemon, selected, onClick }) {
  const p = pokemon;
  const abilities = p.abilities || [];
  const visibleAbilities = [];
  const hiddenAbilities = [];
  for (const a of abilities) {
    if (a.hidden) hiddenAbilities.push(a);
    else visibleAbilities.push(a);
  }
  const total = bst(p.baseStats);

  function handleClick() {
    if (onClick) onClick(p);
  }

  function handleKey(e) {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(p);
    }
  }

  return (
    <tr
      className={`pkmn-row${selected ? " selected" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : undefined}
      aria-pressed={onClick ? !!selected : undefined}
    >
      <td className="cell-num">#{String(p.num).padStart(4, "0")}</td>
      <td className="cell-sprite">
        <Icon className="row-icon" icon={p.icon} />
      </td>
      <td className="cell-name"><NameWithExt name={p.name} /></td>
      <td className="cell-type">
        <div className="row-types">
          {(p.types || []).map((t) => (
            <TypeIcon key={t} type={t} size={22} />
          ))}
        </div>
      </td>
      <td className="cell-ab">
        {visibleAbilities.length === 0
          ? <span className="muted">—</span>
          : visibleAbilities.map((a) => (
              <span key={a.name} className="ab">{displayName(a.name)}</span>
            ))}
      </td>
      <td className="cell-hab">
        {hiddenAbilities.length > 0 && hiddenAbilities.map((a) => (
              <span key={a.name} className="ab hidden">{displayName(a.name)}</span>
            ))}
      </td>
      {STAT_CONFIG.map(({ key, label }) => (
        <StatCell key={key} label={label} value={p.baseStats ? p.baseStats[key] : null} />
      ))}
      <td className="cell-bst">
        <div className="stat-cell-stack">
          <span className="stat-cell-label">BST</span>
          <span className="stat-cell-value">{total ?? "?"}</span>
        </div>
      </td>
    </tr>
  );
}

export default memo(PokemonRow);
