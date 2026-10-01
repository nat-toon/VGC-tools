import { useEffect, useMemo, useRef, useState } from "react";
import TypeIcon from "./TypeIcon.jsx";
import SearchInput from "./SearchInput.jsx";
import { getMove } from "../lib/moves.js";
import { getIcon, getItemIcon } from "../lib/sprite.js";
import { getAllItems } from "../lib/items.js";
import Icon from "./Icon.jsx";
import { getAllNcpPokemon, getNcpSets } from "../lib/ncp-sets.js";
import { getRegulation } from "../lib/regulations.js";
import { calculateDamage } from "../lib/damage-calc.js";
import { NATURES, NATURE_MAP } from "../lib/constants.js";
import { DEFAULT_LEVEL, SP_MAX_PER_STAT, calcFinalStatsSP, calcStatSP } from "../lib/stats.js";

const NCP_SP_MAP = { hp: "hp", at: "atk", df: "def", sa: "spa", sd: "spd", sp: "spe" };
const CALC_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };

const DMG_FILTERS = ["All", "OHKO", "2HKO", "3HKO+"];
const KIND_FILTERS = ["All", "Physical", "Special"];
const SPEED_FILTERS = [
  { label: "All", value: "All" },
  { label: "You outspeed", value: "You" },
  { label: "Foe outspeeds", value: "Foe" },
  { label: "Speed tie", value: "Tie" },
];

const STAGE_MULT = [2 / 8, 2 / 7, 2 / 6, 2 / 5, 2 / 4, 2 / 3, 2 / 2, 3 / 2, 4 / 2, 5 / 2, 6 / 2, 7 / 2, 8 / 2];

// Final Speed with nature, SP, stat stage, and Tailwind. Mirrors TeamSpeed.
function calcSpe(baseSpe, spSpe, natureName, level, stage, tw) {
  const n = natureName ? NATURE_MAP[natureName] : null;
  let mult = 1;
  if (n?.plus === "spe") mult = 1.1;
  else if (n?.minus === "spe") mult = 0.9;
  let s = calcStatSP(baseSpe ?? 0, level ?? DEFAULT_LEVEL, spSpe ?? 0, mult);
  s = Math.floor(s * STAGE_MULT[(stage ?? 0) + 6]);
  if (tw) s = Math.floor(s * 2);
  return s;
}

function speedVerdict(mySpe, foeSpe) {
  if (mySpe == null || foeSpe == null) return null;
  if (mySpe > foeSpe) return "You";
  if (mySpe < foeSpe) return "Foe";
  return "Tie";
}

function dmgBand(maxPct) {
  if ((maxPct ?? -1) >= 100) return "OHKO";
  if ((maxPct ?? -1) >= 50) return "2HKO";
  return "3HKO+";
}

// Highest max-roll % the attacker can reach with max offensive investment
// (boosting nature + max SP in the attacking stat, everything else held at
// current values), across max-Atk and max-SpA investment. Null when the
// attacker has no damaging result. KO bands filter on this so they span
// from "misses with min investment" to "possible with max investment".
async function maxInvestHigh(attacker, defender, moveNames, field, counters) {
  let best = null;
  for (const stat of ["atk", "spa"]) {
    const nature = NATURES.find((n) => n.plus === stat)?.name || attacker.nature;
    const invested = { ...attacker, nature, sp: { ...attacker.sp, [stat]: SP_MAX_PER_STAT } };
    const b = await bestOf(invested, defender, moveNames, field, counters);
    if (b?.res) best = Math.max(best ?? -1, b.res.maxPct);
  }
  return best;
}

const WEATHER_ABILITIES = {
  drought: "Sun",
  drizzle: "Rain",
  sandstream: "Sand",
  snowwarning: "Snow",
  orichalcumpulse: "Sun",
};

const TERRAIN_ABILITIES = {
  electricsurge: "Electric",
  grassysurge: "Grassy",
  psychicsurge: "Psychic",
  mistysurge: "Misty",
  hadronengine: "Electric",
};

function normKey(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function ncpToSp(sps) {
  const sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  if (!sps) return sp;
  for (const [ncp, calc] of Object.entries(NCP_SP_MAP)) {
    sp[calc] = sps[ncp] || 0;
  }
  return sp;
}

function moveDisplayNames(keys) {
  return (keys || []).map((k) => (k ? getMove(k)?.name || k : "")).filter(Boolean);
}

function autoFieldFor(myAbility, oppAbility) {
  const mine = normKey(myAbility);
  const opp = normKey(oppAbility);
  const weather = WEATHER_ABILITIES[mine] || WEATHER_ABILITIES[opp] || "";
  const terrain = TERRAIN_ABILITIES[mine] || TERRAIN_ABILITIES[opp] || "";
  return { weather, terrain };
}

async function bestOf(attacker, defender, moveNames, field, counters) {
  let best = null;
  for (const name of moveNames) {
    try {
      // Counter moves (Rage Fist, Last Respects) need an explicit count or
      // the engine returns NaN. Defaults come from the Hits options (0).
      const moveOptions = {};
      if (counters) {
        const key = normKey(name);
        if (key === "ragefist") moveOptions.rageFistHits = counters.rf ?? 0;
        if (key === "lastrespects") moveOptions.lastRespects = counters.lr ?? 0;
      }
      const r = await calculateDamage(attacker, defender, name, field, 1, moveOptions);
      if (!r || !Number.isFinite(r.min) || !Number.isFinite(r.max)) continue;
      if (!best || (r.max ?? -1) > (best.res.max ?? -1)) {
        best = { move: name, res: r };
      }
    } catch {
      // Unknown move/species in engine data: skip, keep other moves.
    }
  }
  return best;
}

// Stat keys that matter on the card's Pokemon: the HP + defending stat its
// foe hits on offence, its own attacking stat on defence, Speed on speed.
function relevantStatKeys({ tab, category }) {
  if (tab === "speed") return ["spe"];
  if (tab === "offence") {
    if (category === "Physical") return ["hp", "def"];
    if (category === "Special") return ["hp", "spd"];
    return ["hp"];
  }
  if (category === "Physical") return ["atk"];
  if (category === "Special") return ["spa"];
  return [];
}

function StageStepper({ label, title, value, onChange, min = -6, max = 6 }) {
  return (
    <span className="mu-stage" title={title}>
      <span className="mu-stage-label">{label}</span>
      <button
        className="mu-stage-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Lower ${label} stage`}
      >
        −
      </button>
      <span className="mu-stage-val">
        {value > 0 ? `+${value}` : value}
      </span>
      <button
        className="mu-stage-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Raise ${label} stage`}
      >
        +
      </button>
    </span>
  );
}

function AttrsStrip({ mv, entryMove, oppAbility, oppItemData, oppItem, oppItemIcon }) {
  return (
    <span className="mu-card-attrs">
      <span className="mu-card-attr">
        <span className="mu-card-attr-label">Move</span>
        <span className="mu-card-attr-val">
          {mv?.type && <TypeIcon type={mv.type} size={14} />}
          <span className="mu-card-attr-text">{mv?.name || entryMove || "…"}</span>
        </span>
      </span>
      <span className="mu-card-attr">
        <span className="mu-card-attr-label">Ability</span>
        <span className="mu-card-attr-val">
          <span className="mu-card-attr-text">{oppAbility || "—"}</span>
        </span>
      </span>
      <span className="mu-card-attr mu-card-attr--fit">
        <span className="mu-card-attr-label">Item</span>
        <span
          className="mu-card-attr-val mu-card-item--icon"
          title={oppItemData ? oppItemData.name : oppItem || "None"}
        >
          {oppItemIcon ? (
            <Icon className="item-row-icon" icon={oppItemIcon} />
          ) : (
            <span className="mu-card-attr-text">{oppItem || "—"}</span>
          )}
        </span>
      </span>
    </span>
  );
}

function StatsGrid({ oppFinal, relKeys, oppNatureObj }) {
  if (!oppFinal) return null;
  return (
    <span className="mu-card-stats6">
      {CALC_KEYS.map((k) => (
        <span
          key={k}
          className={
            `mu-card-stat` +
            (relKeys.includes(k) ? " mu-stat--rel" : "") +
            (oppNatureObj?.plus === k ? " mu-stat--plus" : "") +
            (oppNatureObj?.minus === k ? " mu-stat--minus" : "")
          }
        >
          <span className="mu-card-stat-label">{STAT_LABELS[k]}</span>
          <span className="mu-card-stat-val">{oppFinal[k]}</span>
        </span>
      ))}
    </span>
  );
}

function OptToggle({ title, active, onClick, children }) {
  return (
    <button title={title} className={`mu-chip${active ? " mu-chip--active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function OpponentEditor({ base, override, onChange, onReset }) {
  const cur = {
    nature: override?.nature ?? base.nature ?? "",
    level: override?.level ?? base.level ?? DEFAULT_LEVEL,
    item: override?.item ?? base.item ?? "",
    ability: override?.ability ?? base.ability ?? "",
    sp: override?.sp ?? base.sp,
  };
  const set = (patch) => onChange({ ...cur, ...patch });

  return (
    <div className="mu-editor" onClick={(e) => e.stopPropagation()}>
      <div className="mu-editor-row">
        <label className="mu-editor-label">
          Nature
          <select
            className="mu-editor-input"
            value={cur.nature || ""}
            onChange={(e) => set({ nature: e.target.value || "" })}
          >
            <option value="">—</option>
            {NATURES.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mu-editor-label">
          Level
          <input
            className="mu-editor-input"
            type="number"
            min={1}
            max={100}
            value={cur.level}
            onChange={(e) => set({ level: Math.max(1, Math.min(100, Number(e.target.value) || DEFAULT_LEVEL)) })}
          />
        </label>
      </div>
      <div className="mu-editor-row">
        <label className="mu-editor-label">
          Item
          <input
            className="mu-editor-input"
            type="text"
            value={cur.item || ""}
            onChange={(e) => set({ item: e.target.value })}
            placeholder="None"
          />
        </label>
        <label className="mu-editor-label">
          Ability
          <input
            className="mu-editor-input"
            type="text"
            value={cur.ability || ""}
            onChange={(e) => set({ ability: e.target.value })}
            placeholder="None"
          />
        </label>
      </div>
      <div className="mu-editor-row mu-editor-sp">
        {CALC_KEYS.map((k) => (
          <label key={k} className="mu-editor-label mu-editor-sp-label">
            {k.toUpperCase()}
            <input
              className="mu-editor-input"
              type="number"
              min={0}
              max={SP_MAX_PER_STAT}
              value={cur.sp?.[k] ?? 0}
              onChange={(e) =>
                set({
                  sp: {
                    ...cur.sp,
                    [k]: Math.max(0, Math.min(SP_MAX_PER_STAT, Number(e.target.value) || 0)),
                  },
                })
              }
            />
          </label>
        ))}
      </div>
      <div className="mu-editor-actions">
        <button className="mu-editor-reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default function MatchupPanel({ slot, mon, pokedexMap, regulation }) {
  const [tab, setTab] = useState("offence");
  const [query, setQuery] = useState("");
  const [dmgFilter, setDmgFilter] = useState("All");
  const [kindFilter, setKindFilter] = useState("All");
  const [speedFilter, setSpeedFilter] = useState("All");
  const [myOpts, setMyOpts] = useState({ atk: 0, spa: 0, spe: 0, tw: false, hh: false, ref: false, ls: false });
  const [foeOpts, setFoeOpts] = useState({ atk: 0, spa: 0, spe: 0, tw: false, ref: false, ls: false });
  const [counters, setCounters] = useState({ rf: 0, lr: 0 });
  const setMyOpt = (k, v) => setMyOpts((p) => ({ ...p, [k]: v }));
  const setFoeOpt = (k, v) => setFoeOpts((p) => ({ ...p, [k]: v }));
  const [overrides, setOverrides] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [results, setResults] = useState({});
  // Last fully-completed run. Ordering and damage-band membership follow
  // this snapshot so cards never reshuffle mid-recalculation; live values
  // still update in place via `results`.
  const [committed, setCommitted] = useState({});
  const runId = useRef(0);

  const rows = useMemo(() => {
    const pool = getRegulation(regulation).pool;
    const list = [];
    for (const species of getAllNcpPokemon()) {
      if (pool && !pool.has(species)) continue;
      const sets = getNcpSets(species);
      if (!sets) continue;
      for (const [setName, set] of Object.entries(sets)) {
        list.push({ key: `${species}::${setName}`, species, setName, set });
      }
    }
    return list;
  }, [regulation]);

  const myMoves = useMemo(() => moveDisplayNames(slot.moves), [slot.moves]);
  const itemsByName = useMemo(() => {
    const m = new Map();
    for (const i of getAllItems()) m.set(normKey(i.name), i);
    return m;
  }, []);
  const mySide = useMemo(
    () => ({
      name: mon?.name || slot.name,
      item: slot.item || "",
      ability: slot.ability || "",
      nature: slot.nature || "Serious",
      level: slot.level ?? DEFAULT_LEVEL,
      sp: slot.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      boosts: { atk: myOpts.atk, def: 0, spa: myOpts.spa, spd: 0, spe: myOpts.spe },
    }),
    [mon, slot, myOpts.atk, myOpts.spa, myOpts.spe],
  );

  const mySpe = useMemo(
    () =>
      mon?.baseStats
        ? calcSpe(mon.baseStats.spe, slot.sp?.spe, slot.nature, slot.level ?? DEFAULT_LEVEL, myOpts.spe, myOpts.tw)
        : null,
    [mon, slot.sp, slot.nature, slot.level, myOpts.spe, myOpts.tw],
  );

  const oppBase = useMemo(() => {
    const map = {};
    for (const r of rows) {
      map[r.key] = {
        name: r.species,
        item: r.set.item || "",
        ability: r.set.ability || "",
        nature: r.set.nature || "Serious",
        level: DEFAULT_LEVEL,
        sp: ncpToSp(r.set.sps),
        moves: [...(r.set.moves || [])],
      };
    }
    return map;
  }, [rows]);

  const sig = useMemo(
    () =>
      JSON.stringify({
        me: mySide,
        moves: myMoves,
        ov: overrides,
        mine: myOpts,
        foe: foeOpts,
        cnt: counters,
        rows: rows.map((r) => r.key),
      }),
    [mySide, myMoves, overrides, myOpts, foeOpts, counters, rows],
  );

  useEffect(() => {
    const id = ++runId.current;
    // Prune results for rows that no longer exist, but otherwise keep the
    // previous ranges on screen while the new ones compute (no flash back
    // to skeletons on every EV/nature/move tweak).
    const valid = new Set(rows.map((r) => r.key));
    setResults((prev) => {
      let pruned = prev;
      for (const k of Object.keys(prev)) {
        if (!valid.has(k)) {
          if (pruned === prev) pruned = { ...prev };
          delete pruned[k];
        }
      }
      return pruned;
    });
    let cancelled = false;

    (async () => {
      const chunk = {};
      const fresh = {};
      const flush = () => {
        if (cancelled || runId.current !== id) return false;
        const snapshot = { ...chunk };
        for (const k of Object.keys(snapshot)) delete chunk[k];
        setResults((prev) => ({ ...prev, ...snapshot }));
        return true;
      };
      for (let i = 0; i < rows.length; i += 1) {
        if (cancelled || runId.current !== id) return;
        const r = rows[i];
        const ov = overrides[r.key];
        const base = oppBase[r.key];
        const opp = {
          ...base,
          ...(ov || {}),
          sp: ov?.sp || base.sp,
          moves: ov?.moves || base.moves,
          boosts: { atk: foeOpts.atk, def: 0, spa: foeOpts.spa, spd: 0, spe: foeOpts.spe },
        };
        // Weather/terrain come only from abilities on either side. Side
        // conditions come from the Mine/Foe options below.
        const auto = autoFieldFor(mySide.ability, opp.ability);
        const baseField = { gameType: "Doubles", weather: auto.weather, terrain: auto.terrain };
        const offField = {
          ...baseField,
          attackerSide: { isTailwind: myOpts.tw, isHelpingHand: myOpts.hh },
          defenderSide: { isReflect: foeOpts.ref, isLightScreen: foeOpts.ls, isTailwind: foeOpts.tw },
        };
        const defField = {
          ...baseField,
          attackerSide: { isTailwind: foeOpts.tw },
          defenderSide: { isReflect: myOpts.ref, isLightScreen: myOpts.ls, isTailwind: myOpts.tw },
        };
        const myMoveNames = myMoves;
        const oppMoveNames = (opp.moves || []).filter(Boolean);
        const [off, def] = await Promise.all([
          myMoveNames.length ? bestOf(mySide, opp, myMoveNames, offField, counters) : null,
          oppMoveNames.length ? bestOf(opp, mySide, oppMoveNames, defField, counters) : null,
        ]);
        const [offHigh, defHigh] = await Promise.all([
          myMoveNames.length ? maxInvestHigh(mySide, opp, myMoveNames, offField, counters) : null,
          oppMoveNames.length ? maxInvestHigh(opp, mySide, oppMoveNames, defField, counters) : null,
        ]);
        chunk[r.key] = { off, def, offHigh, defHigh };
        fresh[r.key] = { off, def, offHigh, defHigh };
        // Lazily stream results so the list fills while tuning EVs.
        if (i % 4 === 3 || i === rows.length - 1) {
          if (!flush()) return;
          await new Promise((res) => setTimeout(res, 0));
        }
      }
      // Clean finish: freeze the new ordering/membership snapshot.
      if (!cancelled && runId.current === id) setCommitted(fresh);
    })();

    return () => {
      cancelled = true;
    };
  }, [sig, rows, overrides, oppBase, mySide, myMoves, myOpts, foeOpts, counters]);

  const speMap = useMemo(() => {
    const map = {};
    for (const r of rows) {
      const oppMon = pokedexMap?.[r.species.toLowerCase()];
      if (oppMon?.baseStats?.spe == null) continue;
      const base = oppBase[r.key];
      if (!base) continue;
      const ov = overrides[r.key];
      map[r.key] = calcSpe(
        oppMon.baseStats.spe,
        (ov?.sp || base.sp).spe,
        ov?.nature ?? base.nature,
        ov?.level ?? base.level ?? DEFAULT_LEVEL,
        foeOpts.spe,
        foeOpts.tw,
      );
    }
    return map;
  }, [rows, overrides, oppBase, pokedexMap, foeOpts.spe, foeOpts.tw]);

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesQuery = (r) => !q || `${r.species} ${r.setName}`.toLowerCase().includes(q);
    if (tab === "speed") {
      // Speed needs no engine run: order by live Speed margin so the
      // biggest deficits surface first. No reshuffle problem here.
      const list = [];
      for (const r of rows) {
        if (!matchesQuery(r)) continue;
        const foeSpe = speMap[r.key] ?? null;
        const v = speedVerdict(mySpe, foeSpe);
        if (speedFilter !== "All" && v && v !== speedFilter) continue;
        list.push({ ...r, _foeSpe: foeSpe });
      }
      return list.sort((a, b) => {
        const ma = a._foeSpe == null || mySpe == null ? null : a._foeSpe - mySpe;
        const mb = b._foeSpe == null || mySpe == null ? null : b._foeSpe - mySpe;
        if (ma == null && mb == null) return a.key.localeCompare(b.key);
        if (ma == null) return 1;
        if (mb == null) return -1;
        if (mb !== ma) return mb - ma;
        return a.key.localeCompare(b.key);
      });
    }
    // Offence/defence path below.
    const withRes = [];
    for (const r of rows) {
      if (!matchesQuery(r)) continue;
      // Displayed values are live; ordering and damage-band membership use
      // the last completed run so a recalculation never reshuffles the list.
      // Damage bands filter on the max-investment high, so each band spans
      // from "misses with min investment" to "possible with max investment".
      const off = results[r.key]?.off;
      const def = results[r.key]?.def;
      const stable = committed[r.key] || results[r.key] || {};
      const stableEntry = tab === "offence" ? stable.off : stable.def;
      const stableHigh = tab === "offence" ? stable.offHigh : stable.defHigh;
      const entry = tab === "offence" ? off : def;
      const hasData = !!(results[r.key] || committed[r.key]);
      if (dmgFilter !== "All" && hasData && (stableHigh == null || dmgBand(stableHigh) !== dmgFilter)) continue;
      if (kindFilter !== "All") {
        const cat = entry?.move ? getMove(normKey(entry.move))?.category : null;
        if (cat && cat !== kindFilter) continue;
      }
      withRes.push({ ...r, off, def, _stable: stableEntry });
    }
    const pick = (e) => e._stable?.res?.maxPct;
    return withRes.sort((a, b) => {
      const pa = pick(a);
      const pb = pick(b);
      if (pa == null && pb == null) return a.key.localeCompare(b.key);
      if (pa == null) return 1;
      if (pb == null) return -1;
      if (pb !== pa) return pb - pa;
      return a.key.localeCompare(b.key);
    });
  }, [rows, results, committed, tab, query, dmgFilter, kindFilter, speMap, mySpe, speedFilter]);

  // Counter moves in play on this tab: my moves on offence (I'm the
  // attacker), the shown NCP sets' moves on defence (they are). The Hits
  // options only render when the move exists here.
  const hasCounters = useMemo(() => {
    const found = { rf: false, lr: false };
    const check = (names) => {
      for (const n of names || []) {
        const k = normKey(n);
        if (k === "ragefist") found.rf = true;
        if (k === "lastrespects") found.lr = true;
      }
    };
    if (tab === "offence") check(myMoves);
    if (tab === "defence") for (const r of sorted) check(r.set.moves);
    return found;
  }, [tab, myMoves, sorted]);

  return (
    <div className="mu-wrap">
      <div className="mu-tabs">
        <button
          className={`mu-tab ${tab === "offence" ? "mu-tab--active" : ""}`}
          onClick={() => {
            setTab("offence");
          }}
        >
          Offence
        </button>
        <button
          className={`mu-tab ${tab === "defence" ? "mu-tab--active" : ""}`}
          onClick={() => {
            setTab("defence");
          }}
        >
          Defence
        </button>
        <button
          className={`mu-tab ${tab === "speed" ? "mu-tab--active" : ""}`}
          onClick={() => {
            setTab("speed");
          }}
        >
          Speed
        </button>
      </div>
      <div className="mu-filterbar">
        <SearchInput
          className="input"
          value={query}
          onChange={(v) => {
            setQuery(v);
          }}
        />
        <div className="mu-chiprow">
          {tab === "speed" ? (
            <div className="mu-chipgroup" role="group" aria-label="Speed result filter">
              <span className="mu-chipgroup-label">Result</span>
              {SPEED_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`mu-chip${speedFilter === f.value ? " mu-chip--active" : ""}`}
                  onClick={() => {
                    setSpeedFilter(f.value);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="mu-chipgroup" role="group" aria-label="Damage filter">
                <span className="mu-chipgroup-label">Damage</span>
                {DMG_FILTERS.map((f) => (
                  <button
                    key={f}
                    title={
                      f === "All"
                        ? "Show everything"
                        : `Can reach ${f} with max offensive investment`
                    }
                    className={`mu-chip${dmgFilter === f ? " mu-chip--active" : ""}`}
                    onClick={() => {
                      setDmgFilter(f);
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="mu-chipgroup" role="group" aria-label="Attack kind filter">
                <span className="mu-chipgroup-label">Attack</span>
                {KIND_FILTERS.map((f) => (
                  <button
                    key={f}
                    className={`mu-chip${kindFilter === f ? " mu-chip--active" : ""}`}
                    onClick={() => {
                      setKindFilter(f);
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mu-optbar">
        <div className="mu-optgroup" role="group" aria-label="My field options">
          <span className="mu-chipgroup-label">Mine</span>
          {tab === "offence" && (
            <>
              <StageStepper label="Atk" title="My Attack stage" value={myOpts.atk} onChange={(v) => setMyOpt("atk", v)} />
              <StageStepper label="SpA" title="My Sp. Atk stage" value={myOpts.spa} onChange={(v) => setMyOpt("spa", v)} />
              <OptToggle title="Helping Hand: my damage ×1.5" active={myOpts.hh} onClick={() => setMyOpt("hh", !myOpts.hh)}>
                HH
              </OptToggle>
            </>
          )}
          {tab === "defence" && (
            <>
              <OptToggle title="Reflect on my side: halves incoming physical" active={myOpts.ref} onClick={() => setMyOpt("ref", !myOpts.ref)}>
                Ref
              </OptToggle>
              <OptToggle title="Light Screen on my side: halves incoming special" active={myOpts.ls} onClick={() => setMyOpt("ls", !myOpts.ls)}>
                LS
              </OptToggle>
            </>
          )}
          {tab === "speed" && (
            <>
              <StageStepper label="Spe" title="My Speed stage" value={myOpts.spe} onChange={(v) => setMyOpt("spe", v)} />
              <OptToggle title="Tailwind: my Speed ×2" active={myOpts.tw} onClick={() => setMyOpt("tw", !myOpts.tw)}>
                TW
              </OptToggle>
            </>
          )}
        </div>
        <div className="mu-optgroup" role="group" aria-label="Foe field options">
          <span className="mu-chipgroup-label">Foe</span>
          {tab === "offence" && (
            <>
              <OptToggle title="Reflect on foe side: halves my physical damage" active={foeOpts.ref} onClick={() => setFoeOpt("ref", !foeOpts.ref)}>
                Ref
              </OptToggle>
              <OptToggle title="Light Screen on foe side: halves my special damage" active={foeOpts.ls} onClick={() => setFoeOpt("ls", !foeOpts.ls)}>
                LS
              </OptToggle>
            </>
          )}
          {tab === "defence" && (
            <>
              <StageStepper label="Atk" title="Foe Attack stage" value={foeOpts.atk} onChange={(v) => setFoeOpt("atk", v)} />
              <StageStepper label="SpA" title="Foe Sp. Atk stage" value={foeOpts.spa} onChange={(v) => setFoeOpt("spa", v)} />
            </>
          )}
          {tab === "speed" && (
            <>
              <StageStepper label="Spe" title="Foe Speed stage" value={foeOpts.spe} onChange={(v) => setFoeOpt("spe", v)} />
              <OptToggle title="Tailwind: foe Speed ×2" active={foeOpts.tw} onClick={() => setFoeOpt("tw", !foeOpts.tw)}>
                TW
              </OptToggle>
            </>
          )}
        </div>
        {(hasCounters.rf || hasCounters.lr) && (
          <div className="mu-optgroup" role="group" aria-label="Counter move options">
            <span className="mu-chipgroup-label">Hits</span>
            {hasCounters.rf && (
              <StageStepper
                label="RF"
                title={`Rage Fist: times hit (BP ${50 + counters.rf * 50})`}
                value={counters.rf}
                min={0}
                max={6}
                onChange={(v) => setCounters((p) => ({ ...p, rf: v }))}
              />
            )}
            {hasCounters.lr && (
              <StageStepper
                label="LR"
                title={`Last Respects: allies fainted (BP ${50 + counters.lr * 50})`}
                value={counters.lr}
                min={0}
                max={5}
                onChange={(v) => setCounters((p) => ({ ...p, lr: v }))}
              />
            )}
          </div>
        )}
      </div>
      <div className="mu-list">
        {sorted.length === 0 && <div className="mu-empty">No NCP sets match.</div>}
        {sorted.map((r) => {
          // Speed tab shows my best move for context but compares Speed.
          const entry = tab === "defence" ? r.def : r.off;
          const oppMon = pokedexMap?.[r.species.toLowerCase()];
          const icon = oppMon ? getIcon(oppMon) : null;
          const mv = entry?.move ? getMove(normKey(entry.move)) : null;
          const res = entry?.res;
          const isOpen = expanded === r.key;
          // Full details of the card's Pokemon: final stats from its SP
          // spread + nature + level, plus ability and item.
          const ov = overrides[r.key];
          const base = oppBase[r.key];
          const oppSp = ov?.sp || base.sp;
          const oppNatureName = ov?.nature ?? base.nature;
          const oppLevel = ov?.level ?? base.level ?? DEFAULT_LEVEL;
          const oppAbility = ov?.ability ?? base.ability ?? "";
          const oppItem = ov?.item ?? base.item ?? "";
          const oppNatureObj = NATURE_MAP[oppNatureName] || null;
          const oppFinal = oppMon?.baseStats
            ? calcFinalStatsSP(oppMon.baseStats, oppSp, oppNatureObj, oppLevel)
            : null;
          const relKeys = relevantStatKeys({ tab, category: mv?.category });
          const oppItemData = itemsByName.get(normKey(oppItem));
          const oppItemIcon = oppItemData ? getItemIcon(oppItemData.spritenum) : null;
          const foeSpe = tab === "speed" ? (r._foeSpe ?? null) : null;
          const verdict = tab === "speed" ? speedVerdict(mySpe, foeSpe) : null;
          return (
            <div key={r.key} className={`mu-card${isOpen ? " mu-card--open" : ""}`}>
              <button className="mu-card-btn" onClick={() => setExpanded(isOpen ? null : r.key)}>
                <span className="mu-card-top">
                  {icon && <span className="pd-pokemon-icon mu-card-icon" style={icon.css} />}
                  <span className="mu-card-names">
                    <span className="mu-card-species">{r.species}</span>
                    <span className="mu-card-set">{r.setName}</span>
                  </span>
                  {tab === "speed" ? (
                    foeSpe != null && mySpe != null && (
                      <span className="mu-card-dmg">
                        {mySpe} <span className="mu-card-pct">vs {foeSpe}</span>
                      </span>
                    )
                  ) : (
                    res && (
                      <span className="mu-card-dmg">
                        {res.min}-{res.max} <span className="mu-card-pct">({res.minPct} - {res.maxPct}%)</span>
                      </span>
                    )
                  )}
                </span>
                {tab === "speed" ? (
                  <>
                    {verdict ? (
                      <span className={`mu-verdict mu-verdict--${verdict.toLowerCase()}`}>
                        {verdict === "You" ? "You outspeed" : verdict === "Foe" ? "Foe outspeeds" : "Speed tie"}
                      </span>
                    ) : (
                      <span className="mu-card-pending">—</span>
                    )}
                    <AttrsStrip
                      mv={mv}
                      entryMove={entry?.move}
                      oppAbility={oppAbility}
                      oppItemData={oppItemData}
                      oppItem={oppItem}
                      oppItemIcon={oppItemIcon}
                    />
                    <StatsGrid oppFinal={oppFinal} relKeys={relKeys} oppNatureObj={oppNatureObj} />
                  </>
                ) : res ? (
                  <>
                    <AttrsStrip
                      mv={mv}
                      entryMove={entry?.move}
                      oppAbility={oppAbility}
                      oppItemData={oppItemData}
                      oppItem={oppItem}
                      oppItemIcon={oppItemIcon}
                    />
                    <StatsGrid oppFinal={oppFinal} relKeys={relKeys} oppNatureObj={oppNatureObj} />
                  </>
                ) : entry === undefined ? (
                  myMoves.length || tab === "defence" ? (
                    <>
                      <span className="mu-card-skel mu-card-skel-dmg" />
                      <span className="mu-card-skel mu-card-skel-attrs" />
                      <span className="mu-card-skel mu-card-skel-stats" />
                    </>
                  ) : (
                    <span className="mu-card-pending">No moves</span>
                  )
                ) : (
                  <span className="mu-card-pending">—</span>
                )}
              </button>
              {isOpen && (
                <OpponentEditor
                  base={oppBase[r.key]}
                  override={overrides[r.key]}
                  onChange={(patch) => setOverrides((prev) => ({ ...prev, [r.key]: patch }))}
                  onReset={() =>
                    setOverrides((prev) => {
                      const next = { ...prev };
                      delete next[r.key];
                      return next;
                    })
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
