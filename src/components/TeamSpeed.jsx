import { useState } from "react";
import { getIcon } from "../lib/sprite.js";
import { NATURE_MAP } from "../lib/constants.js";
import { calcStatSP, NATURE_HINDER, NATURE_NEUTRAL, NATURE_BOOST, DEFAULT_LEVEL, SP_MAX_PER_STAT } from "../lib/stats.js";
import { getPool } from "../lib/regulations.js";

const STAGE_MULT = [2/8, 2/7, 2/6, 2/5, 2/4, 2/3, 2/2, 3/2, 4/2, 5/2, 6/2, 7/2, 8/2];

function calcSpeed(base, level, ev, nature, stage, tailwind) {
  let s = calcStatSP(base, level ?? DEFAULT_LEVEL, ev, nature);
  s = Math.floor(s * STAGE_MULT[stage + 6]);
  if (tailwind) s = Math.floor(s * 2);
  return s;
}

export default function TeamSpeed({ team, pokedexMap, allPokemon }) {
  const slots = team.pokemon.filter((s) => s.name);
  if (slots.length === 0) {
    return <div className="sp-empty">No Pokemon in team to evaluate.</div>;
  }

  const level = team.level ?? DEFAULT_LEVEL;
  const regPool = getPool(allPokemon, team.regulation);
  if (!regPool.length) return <div className="sp-empty">No Pokemon in this regulation.</div>;

  const [oppSpeEv, setOppSpeEv] = useState(0);
  const [oppNature, setOppNature] = useState(NATURE_NEUTRAL);
  const [oppStage, setOppStage] = useState(0);
  const [oppTailwind, setOppTailwind] = useState(false);
  const [myStage, setMyStage] = useState(0);
  const [myTailwind, setMyTailwind] = useState(false);

  const mine = [];
  for (const s of slots) {
    const mon = pokedexMap[s.name.toLowerCase()];
    if (!mon) continue;
    const base = mon.baseStats?.spe ?? 0;
    const natureObj = s.nature ? NATURE_MAP[s.nature] : null;
    let curNature = NATURE_NEUTRAL;
    if (natureObj?.plus === "spe") curNature = NATURE_BOOST;
    else if (natureObj?.minus === "spe") curNature = NATURE_HINDER;
    const speed = calcSpeed(base, level, s.sp?.spe ?? 0, curNature, myStage, myTailwind);
    mine.push({ name: mon.name, speed, mon });
  }

  const groups = new Map();
  for (const m of regPool) {
    const speed = calcSpeed(m.baseStats?.spe ?? 0, level, oppSpeEv, oppNature, oppStage, oppTailwind);
    if (!groups.has(speed)) groups.set(speed, []);
    groups.get(speed).push({ m, isMine: false });
  }

  // Add the team's actual Pokemon at their calculated speed,
  // along with all forms of the same species using the same EV/nature spread
  for (const entry of mine) {
    const baseSpecies = entry.mon.baseSpecies || entry.mon.name;
    const natureObj = entry.mon.nature ? null : null; // We need the team slot's nature, not the mon's
    // Find the team slot for this entry to get EVs and nature
    const slot = team.pokemon.find((s) => s.name && s.name.toLowerCase() === entry.name.toLowerCase());
    const slotNature = slot?.nature ? NATURE_MAP[slot.nature] : null;
    let curNature = NATURE_NEUTRAL;
    if (slotNature?.plus === "spe") curNature = NATURE_BOOST;
    else if (slotNature?.minus === "spe") curNature = NATURE_HINDER;
    const ev = slot?.sp?.spe ?? 0;

    // Find all reg pool entries with the same baseSpecies
    for (const [, list] of groups) {
      for (let j = list.length - 1; j >= 0; j--) {
        const item = list[j];
        const itemBase = item.m.baseSpecies || item.m.name;
        if (itemBase === baseSpecies && item.m.name !== entry.name) {
          // Calculate this form's speed using the team's EV/nature
          const formSpeed = calcSpeed(item.m.baseStats?.spe ?? 0, level, ev, curNature, myStage, myTailwind);
          // Remove from current group
          list.splice(j, 1);
          // Add to the calculated-speed group
          if (!groups.has(formSpeed)) groups.set(formSpeed, []);
          groups.get(formSpeed).push({ m: item.m, isMine: true });
        }
      }
    }

    // Add the team's actual Pokemon
    if (!groups.has(entry.speed)) groups.set(entry.speed, []);
    const targetList = groups.get(entry.speed);
    const existing = targetList.findIndex((x) => x.m.name.toLowerCase() === entry.name.toLowerCase());
    if (existing >= 0) targetList[existing].isMine = true;
    else targetList.push({ m: entry.mon, isMine: true });
  }

  // Remove neutral entries of the team's Pokemon from other speed groups
  const teamNames = new Set(mine.map((e) => e.name.toLowerCase()));
  for (const [, list] of groups) {
    for (let j = list.length - 1; j >= 0; j--) {
      if (!list[j].isMine && teamNames.has(list[j].m.name.toLowerCase())) {
        list.splice(j, 1);
      }
    }
  }

  const mySpeedsSorted = [...groups.entries()].filter(([, list]) => list.some((e) => e.isMine)).map(([speed]) => speed).sort((a, b) => b - a);
  const sortedSpeeds = [...groups.keys()].sort((a, b) => b - a);

  const sections = [];
  let prevSpeed = Infinity;
  for (const ms of mySpeedsSorted) {
    const above = sortedSpeeds.filter((s) => s < prevSpeed && s > ms);
    if (above.length > 0) sections.push({ type: "gap", speeds: above });
    sections.push({ type: "mine", speeds: [ms] });
    prevSpeed = ms;
  }
  const below = sortedSpeeds.filter((s) => s < Math.min(...mySpeedsSorted));
  if (below.length > 0) sections.push({ type: "gap", speeds: below });

  return (
    <>
      <div className="sp-opp-bar">
        <div className="sp-opp-bar-left">
          <span className="sp-opp-bar-label">Me</span>
          <div className="sp-opp-bar-group">
            <button
              className="sp-opp-bar-btn"
              onClick={() => setMyStage((s) => Math.max(-6, s - 1))}
              disabled={myStage <= -6}
              title="Lower Speed stage"
            >−</button>
            <span className="sp-opp-stage-val">{myStage >= 0 ? "+" : ""}{myStage}</span>
            <button
              className="sp-opp-bar-btn"
              onClick={() => setMyStage((s) => Math.min(6, s + 1))}
              disabled={myStage >= 6}
              title="Raise Speed stage"
            >+</button>
          </div>
          <button
            className={`sp-opp-tw-btn${myTailwind ? " sp-opp-tw-btn--on" : ""}`}
            onClick={() => setMyTailwind((t) => !t)}
            title="Tailwind (doubles Speed)"
          >TW</button>
        </div>
        <div className="sp-opp-bar-right">
          <span className="sp-opp-bar-label">Opp</span>
          <input
            type="number"
            className="sp-opp-input"
            min={0}
            max={SP_MAX_PER_STAT}
            value={oppSpeEv}
            onChange={(e) => setOppSpeEv(Math.max(0, Math.min(SP_MAX_PER_STAT, Number(e.target.value) || 0)))}
          />
          <input
            type="range"
            className="se-stats-sp-slider"
            min={0}
            max={SP_MAX_PER_STAT}
            value={oppSpeEv}
            onChange={(e) => setOppSpeEv(Number(e.target.value))}
          />
          <div className="sp-opp-bar-group">
            <button
              className={`sp-opp-bar-btn${oppNature === NATURE_BOOST ? " sp-opp-bar-btn--active" : ""}`}
              onClick={() => setOppNature(NATURE_BOOST)}
              title="Speed-boosting nature"
            >+</button>
            <button
              className={`sp-opp-bar-btn${oppNature === NATURE_NEUTRAL ? " sp-opp-bar-btn--active" : ""}`}
              onClick={() => setOppNature(NATURE_NEUTRAL)}
              title="Neutral nature"
            >=</button>
            <button
              className={`sp-opp-bar-btn${oppNature === NATURE_HINDER ? " sp-opp-bar-btn--active" : ""}`}
              onClick={() => setOppNature(NATURE_HINDER)}
              title="Speed-hindering nature"
            >−</button>
          </div>
          <div className="sp-opp-bar-group">
            <button
              className="sp-opp-bar-btn"
              onClick={() => setOppStage((s) => Math.max(-6, s - 1))}
              disabled={oppStage <= -6}
              title="Lower Speed stage"
            >−</button>
            <span className="sp-opp-stage-val">{oppStage >= 0 ? "+" : ""}{oppStage}</span>
            <button
              className="sp-opp-bar-btn"
              onClick={() => setOppStage((s) => Math.min(6, s + 1))}
              disabled={oppStage >= 6}
              title="Raise Speed stage"
            >+</button>
          </div>
          <button
            className={`sp-opp-tw-btn${oppTailwind ? " sp-opp-tw-btn--on" : ""}`}
            onClick={() => setOppTailwind((t) => !t)}
            title="Tailwind (doubles Speed)"
          >TW</button>
        </div>
      </div>
      <div className="sp-opp-sep" />
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
    </>
  );
}
