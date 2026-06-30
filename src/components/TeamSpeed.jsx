import { getIcon } from "../lib/sprite.js";
import { NATURE_MAP } from "../lib/constants.js";
import { calcStatSP, NATURE_HINDER, NATURE_NEUTRAL, NATURE_BOOST, DEFAULT_LEVEL } from "../lib/stats.js";
import { getPool } from "../lib/regulations.js";

function calcSpeed(base, level, ev, nature) {
  return calcStatSP(base, level ?? DEFAULT_LEVEL, ev, nature);
}

export default function TeamSpeed({ team, pokedexMap, allPokemon }) {
  const slots = team.pokemon.filter((s) => s.name);
  if (slots.length === 0) {
    return <div className="sp-empty">No Pokemon in team to evaluate.</div>;
  }

  const level = team.level ?? DEFAULT_LEVEL;
  const regPool = getPool(allPokemon, team.regulation);
  if (!regPool.length) return <div className="sp-empty">No Pokemon in this regulation.</div>;

  const mine = [];
  for (const s of slots) {
    const mon = pokedexMap[s.name.toLowerCase()];
    if (!mon) continue;
    const base = mon.baseStats?.spe ?? 0;
    const natureObj = s.nature ? NATURE_MAP[s.nature] : null;
    let curNature = NATURE_NEUTRAL;
    if (natureObj?.plus === "spe") curNature = NATURE_BOOST;
    else if (natureObj?.minus === "spe") curNature = NATURE_HINDER;
    const speed = calcSpeed(base, level, s.sp?.spe ?? 0, curNature);
    mine.push({ name: mon.name, speed, mon });
  }

  const groups = new Map();
  for (const m of regPool) {
    const speed = calcSpeed(m.baseStats?.spe ?? 0, level, 0, NATURE_NEUTRAL);
    if (!groups.has(speed)) groups.set(speed, []);
    groups.get(speed).push({ m, isMine: false });
  }

  const mySpeedSet = new Set();
  for (const entry of mine) {
    mySpeedSet.add(entry.speed);
    if (!groups.has(entry.speed)) groups.set(entry.speed, []);
    const list = groups.get(entry.speed);
    const existing = list.findIndex((x) => x.m.name.toLowerCase() === entry.name.toLowerCase());
    if (existing >= 0) list[existing].isMine = true;
    else list.push({ m: entry.mon, isMine: true });
  }

  const sortedSpeeds = [...groups.keys()].sort((a, b) => b - a);
  const mySpeedsSorted = [...mySpeedSet].sort((a, b) => b - a);

  const sections = [];
  let prevSpeed = Infinity;
  for (const ms of mySpeedsSorted) {
    const above = sortedSpeeds.filter((s) => s < prevSpeed && s > ms);
    if (above.length > 0) sections.push({ type: "gap", speeds: above });
    sections.push({ type: "mine", speeds: [ms] });
    prevSpeed = ms;
  }
  const below = sortedSpeeds.filter((s) => s < Math.min(...mySpeedSet));
  if (below.length > 0) sections.push({ type: "gap", speeds: below });

  return (
    <div className="sp-wrap">
      {sections.map((sec, i) => (
        <div key={i} className={`sp-section-row ${sec.type === "mine" ? "sp-section-mine" : ""}`}>
          {sec.speeds.map((speed) => {
            const list = groups.get(speed);
            return [
              <span key={`${speed}-label`} className="sp-sg-speed">{speed}</span>,
              ...list.map((entry) => {
                const ic = getIcon(entry.m);
                return (
                  <span key={entry.m.name} className={`sp-sg-mon ${entry.isMine ? "sp-mine-mon" : ""}`} title={entry.m.name}>
                    {ic && <span className="pd-pokemon-icon" style={ic.css} />}
                  </span>
                );
              }),
            ];
          })}
        </div>
      ))}
    </div>
  );
}
