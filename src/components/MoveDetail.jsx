import { useMemo } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import PokedexTable from "./PokedexTable.jsx";
import { getPokemonWithMove } from "../lib/learnsets.js";
import { formatAcc, formatPower } from "../lib/utils.js";

const PRIORITY_TEXT = {
  "-7": "Extremely slow",
  "-6": "Very slow",
  "-5": "Slow",
  "-4": "Slow",
  "-3": "Somewhat slow",
  "-2": "Half speed",
  "-1": "Usually moves last",
  "0": "Normal priority",
  "1": "Usually moves first",
  "2": "Fast",
  "3": "Very fast",
  "4": "Extremely fast",
  "5": "Extremely fast",
  "6": "Extremely fast",
  "7": "Extremely fast",
};

const FLAG_INFO = {
  contact: "Contact",
  sound: "Sound",
  powder: "Powder",
  punch: "Punch",
  pulse: "Pulse",
  bite: "Bite",
  bullet: "Ballistic",
  slicing: "Slicing",
  wind: "Wind",
  heal: "Healing",
  dance: "Dance",
  defrost: "Thaws user",
  charge: "Charge turn",
  recharge: "Recharge turn",
  gravity: "Gravity",
  minimize: "Minimize",
};

const TARGET_LABELS = {
  normal: "Single target",
  self: "User",
  allAdjacentFoes: "All adjacent foes",
  adjacentFoe: "Adjacent foe",
  any: "Any target",
  all: "All Pokémon",
  allAdjacent: "All adjacent Pokémon",
  allySide: "User's side",
  randomNormal: "Random foe",
  adjacentAlly: "Adjacent ally",
  adjacentAllyOrSelf: "Adjacent ally or user",
  allies: "All allies",
  foeSide: "Foe's side",
  allyTeam: "Ally's team",
  scripted: "Self",
};

function formatPP(pp) {
  if (!pp && pp !== 0) return "—";
  const max = Math.min(Math.floor(pp * 1.6), pp + 21);
  return `${pp} (max: ${max})`;
}

function formatAccuracy(acc) {
  if (acc === true || acc === "true") return "—";
  return formatAcc(acc);
}

function formatPriority(p) {
  const key = String(p);
  if (PRIORITY_TEXT[key]) {
    return `${PRIORITY_TEXT[key]} (${p >= 0 ? "+" : ""}${p})`;
  }
  return `${p >= 0 ? "+" : ""}${p}`;
}

function getFlags(flags) {
  if (!flags) return [];
  return Object.keys(flags).filter((f) => FLAG_INFO[f]);
}

export default function MoveDetail({ move, regulation, allPokemon }) {
  const moveId = move._key || move.id;
  const learners = useMemo(
    () => (moveId ? getPokemonWithMove(moveId, regulation, allPokemon) : []),
    [moveId, regulation, allPokemon],
  );
  if (!move) return null;

  const flags = getFlags(move.flags);
  const target = TARGET_LABELS[move.target] || move.target;
  const showPower = move.category !== "Status" && move.basePower;

  return (
    <div className="move-detail">
      <h2 className="move-detail-name">{move.name}</h2>

      <div className="move-detail-meta">
        <dl className="move-detail-entry">
          <dt>Type</dt>
          <dd className="move-detail-type-cat">
            <TypeIcon type={move.type} size={20} />
            <span
              className="entry-move-cat"
              data-category={move.category ? String(move.category).toLowerCase() : undefined}
            >
              {move.category ? (
                <CategoryIcon category={move.category} width={16} title={move.category} />
              ) : null}
            </span>
          </dd>
        </dl>

        <dl className="move-detail-entry">
          <dt>Power</dt>
          <dd className="move-detail-stat-value">
            {showPower ? formatPower(move.basePower) : "—"}
          </dd>
        </dl>

        <dl className="move-detail-entry">
          <dt>Accuracy</dt>
          <dd className="move-detail-stat-value">{formatAccuracy(move.accuracy)}</dd>
        </dl>

        <dl className="move-detail-entry">
          <dt>PP</dt>
          <dd className="move-detail-stat-value">{formatPP(move.pp)}</dd>
        </dl>
      </div>

      <p className="move-detail-priority">
        {formatPriority(move.priority)}
      </p>

      <p className="move-detail-desc">{move.desc || move.shortDesc || "No description available."}</p>

      <div className="move-detail-flags">
        {flags.map((f) => (
          <span key={f} className="move-detail-flag">
            {FLAG_INFO[f]}
          </span>
        ))}
        {target && (
          <span className="move-detail-flag">
            {target}
          </span>
        )}
      </div>

      <PokedexTable pokemon={learners} regulation={regulation} allPokemon={allPokemon} />
    </div>
  );
}
