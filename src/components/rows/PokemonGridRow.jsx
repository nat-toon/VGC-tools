import { memo } from "react";
import TypeIcon from "../TypeIcon.jsx";
import Icon from "../Icon.jsx";
import { STAT_CONFIG } from "../../lib/constants.js";
import { bst, displayName } from "../../lib/utils.js";
import NameWithExt from "../NameWithExt.jsx";

const PokemonGridRow = memo(function PokemonGridRow({ p }) {
  const abilities = p.abilities || [];
  const visibleAbilities = [];
  const hiddenAbilities = [];
  for (const a of abilities) {
    if (a.hidden) hiddenAbilities.push(a);
    else visibleAbilities.push(a);
  }
  const total = bst(p.baseStats);
  return (
    <>
      <div className="vt-cell vt-num">#{String(p.num).padStart(4, "0")}</div>
      <div className="vt-cell vt-sprite">
        <Icon className="row-icon" icon={p.icon} />
      </div>
      <div className="vt-cell vt-name"><NameWithExt name={p.name} /></div>
      <div className="vt-cell vt-types">
        {(p.types || []).map((t) => (
          <TypeIcon key={t} type={t} size={22} />
        ))}
      </div>
      <div className="vt-cell vt-ab">
        {visibleAbilities.length === 0
          ? <span className="muted">—</span>
          : visibleAbilities.map((a) => (
              <span key={a.name} className="ab">{displayName(a.name)}</span>
            ))}
      </div>
      <div className="vt-cell vt-ab">
        {hiddenAbilities.length > 0 && hiddenAbilities.map((a) => (
              <span key={a.name} className="ab hidden">{displayName(a.name)}</span>
            ))}
      </div>
      {STAT_CONFIG.map(({ key, label }) => (
        <div key={key} className="vt-cell vt-stat">
          <div className="stat-cell-stack">
            <span className="stat-cell-label">{label}</span>
            <span className="stat-cell-value">{p.baseStats ? p.baseStats[key] : "?"}</span>
          </div>
        </div>
      ))}
      <div className="vt-cell vt-stat">
        <div className="stat-cell-stack">
          <span className="stat-cell-label">BST</span>
          <span className="stat-cell-value">{total ?? "?"}</span>
        </div>
      </div>
    </>
  );
});

export default PokemonGridRow;
