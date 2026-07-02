import TypeIcon from "./TypeIcon.jsx";
import { TYPES } from "../lib/constants.js";
import { getIcon } from "../lib/sprite.js";
import { defendEffectiveness, EFFECTIVENESS_CLASS } from "../lib/type-chart.js";

function EffLabel({ value }) {
  if (value === 0) return "0x";
  if (value === 1) return "";
  return `${value}x`;
}

export default function TeamWeaknesses({ team, pokedexMap }) {
  const slots = team.pokemon.filter((s) => s.name);
  if (slots.length === 0) {
    return <div className="tw-empty">No Pokemon in team to evaluate.</div>;
  }

  const mons = slots.map((s) => {
    const mon = pokedexMap[s.name.toLowerCase()];
    return mon ? { name: mon.name, types: mon.types || [], spriteKey: s.name } : null;
  }).filter(Boolean);

  const monsWithIcons = mons.map((m) => {
    const mon = pokedexMap[m.name.toLowerCase()];
    return { ...m, icon: mon ? getIcon(mon) : null };
  });

  return (
    <div className="tw-wrap">
      <table className="tw-table">
        <thead>
          <tr>
            <th className="tw-corner"></th>
            {monsWithIcons.map((m) => (
              <th key={m.name} className="tw-mons-head">
                <span className="tw-mon-row">
                  {m.icon && <span className="pd-pokemon-icon tw-mon-icon" style={m.icon.css} />}
                  <span className="tw-mon-name">{m.name}</span>
                  <span className="tw-mon-types">
                    {m.types.map((t) => (
                      <TypeIcon key={t} type={t} size={14} />
                    ))}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TYPES.map((attackType) => {
            const effs = mons.map((m) => defendEffectiveness(attackType, m.types));
            return (
              <tr key={attackType}>
                <th className="tw-atk-type">
                  <TypeIcon type={attackType} size={24} />
                </th>
                {effs.map((eff, i) => (
                  <td key={i} className={`td-eff ${EFFECTIVENESS_CLASS[eff] || ""}`}>
                    <EffLabel value={eff} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
