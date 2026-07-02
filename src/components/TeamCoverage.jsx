import { useState, useCallback } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Modal from "./Modal.jsx";
import { TYPES } from "../lib/constants.js";
import { getMove } from "../lib/moves.js";
import { getIcon } from "../lib/sprite.js";
import { ENTRIES } from "../data/abilities.js";
import { TYPE_CHART, typeEffectiveness, effLabel } from "../lib/type-chart.js";

const ABILITY_MAP = new Map(Object.entries(ENTRIES));

const TYPE_CHANGER_ABILITIES = {
  pixilate: "fairy",
  galvanize: "electric",
  aerilate: "flying",
  refrigerate: "ice",
  liquidvoice: "water",
};

const IMMUNITY_BYPASS = {
  scrappy: { type: "fighting", defType: "ghost" },
};

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

  function getAbilityKey(name) {
    if (!name) return null;
    const key = name.toLowerCase().replace(/[\s'-]/g, "");
    return ABILITY_MAP.has(key) ? key : null;
  }

  slots.forEach((slot) => {
    const mon = pokedexMap?.[slot.name.toLowerCase()];
    const monName = mon?.name || slot.name;
    const sprite = mon ? getIcon(mon) : null;
    const abilityKey = getAbilityKey(slot.ability);
    const abilityName = slot.ability || null;
    const moves = slot.moves || [];

    const validMoves = [];
    for (const moveKey of moves) {
      if (!moveKey) continue;
      const move = getMove(moveKey);
      if (!move) continue;
      let type = move.category === "Status" ? null : move.type.toLowerCase();
      if (type === "normal" && abilityKey && TYPE_CHANGER_ABILITIES[abilityKey]) {
        type = TYPE_CHANGER_ABILITIES[abilityKey];
      }
      validMoves.push({
        name: move.name,
        type,
        category: move.category,
        isStatus: move.category === "Status",
      });
    }

    if (validMoves.length === 0) return;

    for (const a of TYPES) {
      for (const b of TYPES) {
        const pairMoves = validMoves.map((m) => {
          let eff = m.isStatus ? 1 : typeEffectiveness(m.type, a, b);
          if (abilityKey && !m.isStatus && IMMUNITY_BYPASS[abilityKey] && eff === 0) {
            const bp = IMMUNITY_BYPASS[abilityKey];
            if (m.type === bp.type) {
              const chart = TYPE_CHART[m.type];
              if (!chart) eff = 1;
              else if (a === b) eff = chart[a] === 0 ? 1 : (chart[a] ?? 1);
              else eff = (chart[a] === 0 ? 1 : (chart[a] ?? 1)) * (chart[b] === 0 ? 1 : (chart[b] ?? 1));
            }
          }
          return { ...m, eff };
        });
        const maxEff = Math.max(...pairMoves.map((m) => m.eff));
        detailData[a][b].push({ monName, sprite, abilityName, moves: pairMoves, bestEff: maxEff });
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
                    {entry.abilityName && <span className="cv-modal-mon-ability">{entry.abilityName}</span>}
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
