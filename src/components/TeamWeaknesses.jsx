import TypeIcon from "./TypeIcon.jsx";
import { TYPES } from "../lib/constants.js";
import { getIcon } from "../lib/sprite.js";

const TYPE_CHART = {
  normal:   { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:.5, ghost:0, dragon:1, dark:1, steel:.5, fairy:1 },
  fire:     { normal:1, fire:.5, water:.5, electric:1, grass:2, ice:2, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:2, rock:.5, ghost:1, dragon:.5, dark:1, steel:2, fairy:1 },
  water:    { normal:1, fire:2, water:.5, electric:1, grass:.5, ice:1, fighting:1, poison:1, ground:2, flying:1, psychic:1, bug:1, rock:2, ghost:1, dragon:.5, dark:1, steel:1, fairy:1 },
  electric: { normal:1, fire:1, water:2, electric:.5, grass:.5, ice:1, fighting:1, poison:1, ground:0, flying:2, psychic:1, bug:1, rock:1, ghost:1, dragon:.5, dark:1, steel:1, fairy:1 },
  grass:    { normal:1, fire:.5, water:2, electric:1, grass:.5, ice:1, fighting:1, poison:.5, ground:2, flying:.5, psychic:1, bug:.5, rock:2, ghost:1, dragon:.5, dark:1, steel:.5, fairy:1 },
  ice:      { normal:1, fire:.5, water:.5, electric:1, grass:2, ice:.5, fighting:1, poison:1, ground:2, flying:2, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:1, steel:.5, fairy:1 },
  fighting: { normal:2, fire:1, water:1, electric:1, grass:1, ice:2, fighting:1, poison:.5, ground:1, flying:.5, psychic:.5, bug:.5, rock:2, ghost:0, dragon:1, dark:2, steel:2, fairy:.5 },
  poison:   { normal:1, fire:1, water:1, electric:1, grass:2, ice:1, fighting:1, poison:.5, ground:.5, flying:1, psychic:1, bug:1, rock:.5, ghost:.5, dragon:1, dark:1, steel:0, fairy:2 },
  ground:   { normal:1, fire:2, water:1, electric:2, grass:.5, ice:1, fighting:1, poison:2, ground:1, flying:0, psychic:1, bug:.5, rock:2, ghost:1, dragon:1, dark:1, steel:2, fairy:1 },
  flying:   { normal:1, fire:1, water:1, electric:.5, grass:2, ice:1, fighting:2, poison:1, ground:1, flying:1, psychic:1, bug:2, rock:.5, ghost:1, dragon:1, dark:1, steel:.5, fairy:1 },
  psychic:  { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:2, poison:2, ground:1, flying:1, psychic:.5, bug:1, rock:1, ghost:1, dragon:1, dark:0, steel:.5, fairy:1 },
  bug:      { normal:1, fire:.5, water:1, electric:1, grass:2, ice:1, fighting:.5, poison:.5, ground:1, flying:.5, psychic:2, bug:1, rock:1, ghost:.5, dragon:1, dark:2, steel:.5, fairy:.5 },
  rock:     { normal:1, fire:2, water:1, electric:1, grass:1, ice:2, fighting:.5, poison:1, ground:.5, flying:2, psychic:1, bug:2, rock:1, ghost:1, dragon:1, dark:1, steel:.5, fairy:1 },
  ghost:    { normal:0, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:2, bug:1, rock:1, ghost:2, dragon:1, dark:.5, steel:1, fairy:1 },
  dragon:   { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:1, steel:.5, fairy:0 },
  dark:     { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:.5, poison:1, ground:1, flying:1, psychic:2, bug:1, rock:1, ghost:2, dragon:1, dark:.5, steel:.5, fairy:.5 },
  steel:    { normal:1, fire:.5, water:.5, electric:.5, grass:1, ice:2, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:2, ghost:1, dragon:1, dark:1, steel:.5, fairy:2 },
  fairy:    { normal:1, fire:.5, water:1, electric:1, grass:1, ice:1, fighting:2, poison:.5, ground:1, flying:1, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:2, steel:.5, fairy:1 },
};

function typeEffectiveness(attackType, defTypes) {
  let eff = 1;
  const chart = TYPE_CHART[attackType];
  if (!chart) return 1;
  for (const t of defTypes) {
    eff *= chart[t] ?? 1;
  }
  return eff;
}

function EffLabel({ value }) {
  if (value === 0) return "0x";
  if (value === 1) return "";
  return `${value}x`;
}

const EFF_CLASS = {
  0: "eff-immune",
  0.25: "eff-double-resist",
  0.5: "eff-resist",
  1: "eff-neutral",
  2: "eff-weak",
  4: "eff-double-weak",
};

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
            const effs = mons.map((m) => typeEffectiveness(attackType, m.types));
            return (
              <tr key={attackType}>
                <th className="tw-atk-type">
                  <TypeIcon type={attackType} size={24} />
                </th>
                {effs.map((eff, i) => (
                  <td key={i} className={`td-eff ${EFF_CLASS[eff] || ""}`}>
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
