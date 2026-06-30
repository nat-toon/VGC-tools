import TypeIcon from "./TypeIcon.jsx";
import { TYPES } from "../lib/constants.js";
import { getMove } from "../lib/moves.js";

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

export default function TeamCoverage({ team }) {
  const slots = team.pokemon.filter((s) => s.name);
  if (slots.length === 0) {
    return <div className="cv-empty">No Pokemon in team to evaluate.</div>;
  }

  const counts = {};
  for (const atk of TYPES) {
    counts[atk] = {};
    for (const def of TYPES) {
      counts[atk][def] = 0;
    }
  }

  slots.forEach((slot) => {
    const covered = {};
    for (const a of TYPES) {
      covered[a] = {};
      for (const b of TYPES) {
        covered[a][b] = false;
      }
    }

    const moves = slot.moves || [];
    for (const moveKey of moves) {
      if (!moveKey) continue;
      const move = getMove(moveKey);
      if (!move) continue;
      if (move.category === "Status") continue;

      const mt = move.type.toLowerCase();
      for (const a of TYPES) {
        for (const b of TYPES) {
          const eff = a === b
            ? (TYPE_CHART[mt]?.[a] ?? 1)
            : (TYPE_CHART[mt]?.[a] ?? 1) * (TYPE_CHART[mt]?.[b] ?? 1);
          if (eff >= 2) {
            covered[a][b] = true;
          }
        }
      }
    }

    for (const a of TYPES) {
      for (const b of TYPES) {
        if (covered[a][b]) {
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
          {TYPES.map((atkType) => (
            <tr key={atkType}>
              <th className="cv-atk-type">
                <TypeIcon type={atkType} size={24} />
              </th>
              {TYPES.map((defType) => (
                <td key={defType} className="cv-data" style={cellStyle(counts[atkType][defType])}>
                  {counts[atkType][defType]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
