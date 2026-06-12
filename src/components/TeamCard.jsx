import { memo, useState } from "react";
import Sprite from "./Sprite.jsx";
import { getIcon, getLargeSprite, getItemIcon } from "../lib/sprite.js";

function TeamCardSprite({ mon }) {
  const [failed, setFailed] = useState(false);
  const sprite = getLargeSprite(mon);
  const icon = getIcon(mon);

  if (failed || !sprite) {
    return <span className="team-card-slot-icon" style={icon?.css} />;
  }
  return (
    <Sprite
      sprite={sprite}
      className="team-card-slot-sprite"
      alt={mon.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function TeamCard({ team, pokedexMap, itemsMap, regulationLabel, onClick }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) onClick(team);
    }
  }

  return (
    <div
      className="team-card"
      onClick={() => onClick && onClick(team)}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : undefined}
    >
      <div className="team-card-header">
        <span className="team-card-name">{team.name}</span>
        <span className="team-card-reg">{regulationLabel || team.regulation}</span>
      </div>
      <div className="team-card-pokemon">
        {team.pokemon.map((slot, i) => {
          const mon = slot.name ? pokedexMap[slot.name.toLowerCase()] : null;
          const item = slot.item ? itemsMap[slot.item] : null;
          const itemIcon = item ? getItemIcon(item.spritenum) : null;
          return (
            <div key={i} className="team-card-slot">
              {mon ? (
                <div className="team-card-slot-sprite-wrap">
                  <TeamCardSprite mon={mon} />
                  {itemIcon && (
                    <span className="team-card-slot-item" style={itemIcon.css} title={item.name} />
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TeamCard);
