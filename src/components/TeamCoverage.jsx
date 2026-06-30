import { useState, useCallback } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Modal from "./Modal.jsx";
import { TYPES } from "../lib/constants.js";
import { getMove } from "../lib/moves.js";
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

function typeEffectiveness(attackType, defA, defB) {
  const chart = TYPE_CHART[attackType];
  if (!chart) return 1;
  if (defA === defB) return chart[defA] ?? 1;
  return (chart[defA] ?? 1) * (chart[defB] ?? 1);
}

function effLabel(value) {
  if (value === 0) return "\u00d70";
  if (value === 0.25) return "\u00d7\u00bc";
  if (value === 0.5) return "\u00d7\u00bd";
  if (value === 1) return "";
  if (value === 2) return "\u00d72";
  if (value === 4) return "\u00d74";
  return `\u00d7${value}`;
}

const EFF_CLASS = {
  0: "cve-immune",
  0.25: "cve-double-resist",
  0.5: "cve-resist",
  1: "",
  2: "cve-weak",
  4: "cve-double-weak",
};

function EffBadge({ value }) {
  const cls = EFF_CLASS[value] || "";
  if (value === 1 && !cls) return null;
  return <span className={`cv-eff-badge ${cls}`}>{effLabel(value)}</span>;
}

export default function TeamCoverage({ team, pokedexMap }) {
  const [selectedPair, setSelectedPair] = useState(null);

  const slots = team.pokemon.filter((s) => s.name);
  if (slots.length === 0) {
    return <div className="cv-empty">No Pokemon in team to evaluate.</div>;
  }

  const detailData = {};
  const counts = {};
  for (const a of TYPES) {
    detailData[a] = {};
    counts[a] = {};
    for (const b of TYPES) {
      detailData[a][b] = [];
      counts[a][b] = 0;
    }
  }

  slots.forEach((slot) => {
    const mon = pokedexMap?.[slot.name.toLowerCase()];
    const monName = mon?.name || slot.name;
    const sprite = mon ? getIcon(mon) : null;
    const moves = slot.moves || [];

    const validMoves = [];
    for (const moveKey of moves) {
      if (!moveKey) continue;
      const move = getMove(moveKey);
      if (!move) continue;
      validMoves.push({
        name: move.name,
        type: move.category === "Status" ? null : move.type.toLowerCase(),
        category: move.category,
        isStatus: move.category === "Status",
      });
    }

    if (validMoves.length === 0) return;

    for (const a of TYPES) {
      for (const b of TYPES) {
        const pairMoves = validMoves.map((m) => ({
          ...m,
          eff: m.isStatus ? 1 : typeEffectiveness(m.type, a, b),
        }));
        const maxEff = Math.max(...pairMoves.map((m) => m.eff));
        detailData[a][b].push({ monName, sprite, moves: pairMoves, bestEff: maxEff });
        if (maxEff >= 2) {
          counts[a][b]++;
        }
      }
    }
  });

  const maxCount = Math.max(1, ...TYPES.flatMap((a) => TYPES.map((d) => counts[a][d])));

  function cellStyle(count) {
    const t = count / Math.max(maxCount, 1);
    const r = Math.round(200 - t * 200);
    const g = Math.round(60 + t * 140);
    const b = Math.round(60 - t * 40);
    return { background: `rgb(${r},${g},${b})`, color: "#fff" };
  }

  const handleCellClick = useCallback((a, b) => {
    setSelectedPair({ a, b, data: detailData[a][b] });
  }, [detailData]);

  return (
    <div className="cv-wrap">
      <table className="cv-table">
        <thead>
          <tr>
            <th className="cv-corner"></th>
            {TYPES.map((t) => (
              <th key={t} className="cv-def-head">
                <TypeIcon type={t} size={24} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TYPES.map((a) => (
            <tr key={a}>
              <th className="cv-atk-type">
                <TypeIcon type={a} size={24} />
              </th>
              {TYPES.map((b) => {
                const count = counts[a][b];
                const hasDetail = detailData[a][b].length > 0;
                return (
                  <td
                    key={b}
                    className={"cv-data" + (hasDetail ? " cv-clickable" : "")}
                    style={cellStyle(count)}
                    onClick={hasDetail ? () => handleCellClick(a, b) : undefined}
                  >
                    {count}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={!!selectedPair} onClose={() => setSelectedPair(null)} labelledBy="cv-modal-title">
        {selectedPair && (
          <div className="cv-modal">
            <div className="cv-modal-head">
              <span className="cv-modal-head-label">Coverage vs</span>
              <span className="cv-modal-types">
                <TypeIcon type={selectedPair.a} size={20} />
                {selectedPair.a !== selectedPair.b && <TypeIcon type={selectedPair.b} size={20} />}
              </span>
            </div>
            <div className="cv-modal-body">
              {selectedPair.data.map((entry, i) => (
                <div key={i} className="cv-modal-mon">
                  <div className="cv-modal-mon-head">
                    {entry.sprite && <span className="cv-modal-mon-icon" style={entry.sprite.css} />}
                    <span className="cv-modal-mon-name">{entry.monName}</span>
                  </div>
                  <div className="cv-modal-moves">
                    {entry.moves.map((m, j) => (
                      <span
                        key={j}
                        className={"cv-modal-move" + (m.isStatus ? " cv-modal-move--status" : "")}
                        data-eff={m.eff}
                      >
                        {m.type && <TypeIcon type={m.type} size={16} />}
                        <CategoryIcon category={m.category} width={16} />
                        <span className="cv-modal-move-name">{m.name}</span>
                        <EffBadge value={m.eff} />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
