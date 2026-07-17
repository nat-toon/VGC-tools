import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { calculateDamage, getData } from "../lib/damage-calc.js";
import { loadPokedex } from "../lib/pokedex.js";
import { STAT_CONFIG, NATURES, NATURE_MAP } from "../lib/constants.js";
import { calcFinalStatsSP, SP_MAX_TOTAL, SP_MAX_PER_STAT, DEFAULT_LEVEL } from "../lib/stats.js";
import { REGULATIONS, DEFAULT_REG } from "../lib/regulations.js";
import { getLargeSprite, getIcon, getItemIcon } from "../lib/sprite.js";
import { getMove, getAllMoves, loadMoves } from "../lib/moves.js";
import { getLearnset, loadLearnsets } from "../lib/learnsets.js";
import { getAllItems, isItemLegal } from "../lib/items.js";
import { loadTeams } from "../lib/teams.js";
import { getAllNcpPokemon, getNcpSets } from "../lib/ncp-sets.js";
import { getAbilityByName, getAllAbilities } from "../lib/abilities.js";
import { isMegaStone, getMegaFormeForStone, getBaseForme, getMegaAbility, getStoneForForme } from "../lib/mega.js";
import { useRowHeight } from "../lib/hooks.js";
import Sprite from "../components/Sprite.jsx";
import Icon from "../components/Icon.jsx";
import TypeIcon from "../components/TypeIcon.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import SearchInput from "../components/SearchInput.jsx";
import FilterChipsBar from "../components/FilterChipsBar.jsx";
import VirtualTable from "../components/VirtualTable.jsx";
import Pokedex from "../components/Pokedex.jsx";
import GlobalSearch from "../components/GlobalSearch.jsx";
import MovesList from "../components/MovesList.jsx";
import ItemGridRow from "../components/rows/ItemGridRow.jsx";

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE" };

const STATUS_OPTIONS = ["", "brn", "frz", "par", "psn", "slp", "tox"];

function applyStatModifiers(baseStats, side, field, sideField) {
  if (!baseStats) return baseStats;
  const stats = { ...baseStats };
  const ability = side.ability || "";
  const item = side.item || "";
  const status = side.status || "";
  const weather = field.weather || "";
  const terrain = field.terrain || "";
  const sf = sideField || {};

  // Power Trick: swap Atk and Def
  if (sf.isPowerTrick) {
    [stats.atk, stats.def] = [stats.def, stats.atk];
  }

  // Wonder Room: swap Def and SpD
  if (field.isWonderRoom) {
    [stats.def, stats.spd] = [stats.spd, stats.def];
  }

  // Speed modifiers
  let speMult = 1;
  if (sf.isTailwind) speMult *= 2;
  if (ability === "Chlorophyll" && weather.includes("Sun")) speMult *= 2;
  else if (ability === "Swift Swim" && weather.includes("Rain")) speMult *= 2;
  else if (ability === "Sand Rush" && weather === "Sand") speMult *= 2;
  else if (ability === "Slush Rush" && (weather === "Hail" || weather === "Snow")) speMult *= 2;
  else if (ability === "Surge Surfer" && terrain === "Electric") speMult *= 2;
  else if (ability === "Unburden" && side.abilityOn) speMult *= 2;
  else if (ability === "Quick Feet" && status) speMult *= 1.5;
  else if (ability === "Slow Start" && side.abilityOn) speMult *= 0.5;
  if (item === "Choice Scarf" && ability !== "Unburden") speMult *= 1.5;
  else if (item === "Iron Ball") speMult *= 0.5;
  stats.spe = Math.floor(stats.spe * speMult);
  // Paralysis applied after other speed modifiers (matches NCP engine order)
  if (status === "par" && ability !== "Quick Feet") stats.spe = Math.floor(stats.spe / 2);

  // Hustle: Atk * 1.5
  if (ability === "Hustle") stats.atk = Math.floor(stats.atk * 1.5);

  // Grass Pelt: Def * 1.5 in Grassy Terrain
  if (ability === "Grass Pelt" && terrain === "Grassy") stats.def = Math.floor(stats.def * 1.5);

  // Ice Scales: SpD * 2
  if (ability === "Ice Scales") stats.spd = Math.floor(stats.spd * 2);

  return stats;
}

function applyBoosts(stats, boosts) {
  if (!stats || !boosts) return stats;
  const result = { ...stats };
  for (const key of ["atk", "def", "spa", "spd", "spe"]) {
    const b = boosts[key] ?? 0;
    if (b > 0) result[key] = Math.floor((result[key] * (2 + b)) / 2);
    else if (b < 0) result[key] = Math.max(1, Math.floor((result[key] * 2) / (2 - b)));
  }
  return result;
}

const emptySide = {
  name: "",
  moves: ["", "", "", ""],
  level: 50,
  nature: "Serious",
  teraType: undefined,
  ability: undefined,
  item: undefined,
  status: "",
  curHP: null,
  abilityOn: false,
  sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  boosts: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
};

/* ---------- Sprite ---------- */

function SpriteView({ mon }) {
  const sprite = useMemo(() => (mon ? getLargeSprite(mon) : null), [mon]);
  const icon = useMemo(() => (mon ? getIcon(mon) : null), [mon]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [mon]);
  if (!mon) return null;
  if (failed || !sprite) return <span className="pd-pokemon-icon" style={icon?.css} />;
  return (
    <Sprite sprite={sprite} className="calc-sprite" alt={mon.name} loading="lazy" onError={() => setFailed(true)} />
  );
}

/* ---------- Stats panel ---------- */

function CalcStatsPanel({ side, mon, onChange, field, sideField }) {
  const sp = side.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
  const natureHintsRef = useRef({});

  const totalSP = useMemo(() => Object.values(sp).reduce((s, v) => s + v, 0), [sp]);
  const remainingSP = SP_MAX_TOTAL - totalSP;

  const rawStats = useMemo(
    () => (mon ? calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level || DEFAULT_LEVEL) : null),
    [mon, sp, natureObj, side.level],
  );
  const finalStats = useMemo(
    () => (rawStats ? applyBoosts(applyStatModifiers(rawStats, side, field, sideField), side.boosts) : null),
    [rawStats, side, field, sideField],
  );

  const handleNatureChange = useCallback(
    (e) => onChange({ ...side, nature: e.target.value || null }),
    [side, onChange],
  );

  const handleSpChange = useCallback(
    (key, raw) => {
      const str = String(raw);
      const num = parseInt(str.replace(/[+-]/g, ""), 10);
      const v = Number.isFinite(num) ? Math.max(0, Math.min(SP_MAX_PER_STAT, num)) : 0;

      const hints = { ...natureHintsRef.current };
      if (str.includes("+") && key !== "hp") {
        for (const k of Object.keys(hints)) {
          if (hints[k] === "+") hints[k] = null;
        }
        hints[key] = "+";
      } else if (str.includes("-") && key !== "hp") {
        for (const k of Object.keys(hints)) {
          if (hints[k] === "-") hints[k] = null;
        }
        hints[key] = "-";
      } else if (v === 0) {
        hints[key] = null;
      }
      natureHintsRef.current = hints;

      let newNature = side.nature;
      const plusKey = Object.keys(hints).find((k) => hints[k] === "+");
      const minusKey = Object.keys(hints).find((k) => hints[k] === "-");
      if (plusKey || minusKey) {
        const found = NATURES.find(
          (n) => (plusKey ? n.plus === plusKey : !n.plus) && (minusKey ? n.minus === minusKey : !n.minus),
        );
        newNature = found?.name || null;
      } else {
        newNature = null;
      }

      const newSp = { ...sp, [key]: v };
      if (Object.values(newSp).reduce((s, x) => s + x, 0) <= SP_MAX_TOTAL) {
        onChange({ ...side, sp: newSp, nature: newNature });
      }
    },
    [side, sp, onChange],
  );

  const handleSpSlider = useCallback(
    (key, val) => {
      const v = Number(val);
      const newSp = { ...sp, [key]: v };
      if (Object.values(newSp).reduce((s, x) => s + x, 0) <= SP_MAX_TOTAL) {
        onChange({ ...side, sp: newSp });
      }
    },
    [side, sp, onChange],
  );

  return (
    <div className="calc-stats-panel">
      <div className="se-stats-headers">
        <span className="se-stats-head-left">Base</span>
        <span className="se-stats-head-right">Points</span>
      </div>
      {STAT_KEYS.map((key) => {
        const base = mon?.baseStats?.[key] ?? 0;
        const value = finalStats?.[key] ?? 0;
        const spVal = sp?.[key] ?? 0;
        const [min, max] = [0, key === "hp" ? 362 : 252];
        const range = max - min || 1;
        const pct = Math.max(0, Math.min(100, ((value - min) / range) * 100));
        const hue = Math.min(360, Math.floor((value * 180) / max));
        const plusKey = Object.keys(natureHintsRef.current).find((k) => natureHintsRef.current[k] === "+");
        const minusKey = Object.keys(natureHintsRef.current).find((k) => natureHintsRef.current[k] === "-");
        const natureHint =
          !plusKey && !minusKey && natureObj
            ? natureObj.plus === key
              ? "+"
              : natureObj.minus === key
                ? "-"
                : null
            : null;
        const hint = natureHintsRef.current[key] || natureHint;
        return (
          <div key={key} className="calc-stat-row">
            <span className="se-stats-name">{STAT_LABELS[key]}</span>
            <span className="se-stats-base">{base}</span>
            <div className="se-stats-bar">
              <div className="se-stats-fill" style={{ width: pct + "%", background: `hsl(${hue},85%,45%)` }} />
            </div>
            <div className="calc-stat-inputs">
              <div className="se-stats-sp-wrap">
                <input
                  className="calc-ev-input"
                  type="number"
                  inputMode="numeric"
                  value={spVal}
                  onChange={(e) => handleSpChange(key, e.target.value)}
                  min={0}
                  max={SP_MAX_PER_STAT}
                  title="SP"
                />
                {hint && key !== "hp" && (
                  <span
                    className={`se-stats-sp-hint ${hint === "+" ? "se-stats-sp-hint--plus" : "se-stats-sp-hint--minus"}`}
                  >
                    {hint}
                  </span>
                )}
              </div>
            </div>
            <input
              type="range"
              className="calc-sp-slider"
              min={0}
              max={SP_MAX_PER_STAT}
              value={spVal}
              onChange={(e) => handleSpSlider(key, e.target.value)}
            />
            <div className="calc-boost-group">
              <button
                className="calc-boost-btn"
                disabled={(side.boosts?.[key] ?? 0) <= -6}
                onClick={() => {
                  const b = { ...side.boosts, [key]: Math.max(-6, (side.boosts?.[key] ?? 0) - 1) };
                  onChange({ ...side, boosts: b });
                }}
              >
                -
              </button>
              <span
                className={`calc-boost-val ${(side.boosts?.[key] ?? 0) > 0 ? "calc-boost--plus" : (side.boosts?.[key] ?? 0) < 0 ? "calc-boost--minus" : ""}`}
              >
                {(side.boosts?.[key] ?? 0) > 0 ? `+${side.boosts?.[key]}` : (side.boosts?.[key] ?? 0)}
              </span>
              <button
                className="calc-boost-btn"
                disabled={(side.boosts?.[key] ?? 0) >= 6}
                onClick={() => {
                  const b = { ...side.boosts, [key]: Math.min(6, (side.boosts?.[key] ?? 0) + 1) };
                  onChange({ ...side, boosts: b });
                }}
              >
                +
              </button>
            </div>
            <span className="se-stats-final">{value}</span>
          </div>
        );
      })}
      <div className="se-stats-bottom">
        <label className="se-stats-nature-row">
          <span className="se-stats-nature-label">Nature:</span>
          <select className="se-stats-nature-select" value={side.nature || "Serious"} onChange={handleNatureChange}>
            {NATURES.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
                {n.plus ? ` (+${n.plus.toUpperCase()}, -${n.minus.toUpperCase()})` : ""}
              </option>
            ))}
          </select>
        </label>
        <span className={`se-stats-remaining ${remainingSP === 0 ? "se-stats-sp-full" : ""}`}>
          Remaining: <strong>{remainingSP}</strong> / {SP_MAX_TOTAL}
        </span>
      </div>
    </div>
  );
}

/* ---------- Modal icon sprite ---------- */

function ModalIcon({ mon }) {
  const icon = useMemo(() => (mon ? getIcon(mon) : null), [mon]);
  if (!icon) return <span className="tpc-sprite-fallback">{mon?.name?.[0]}</span>;
  return <span className="pd-pokemon-icon" style={icon.css} />;
}

/* ---------- Team picker modal ---------- */

function TeamPickerModal({ teams, pokedexMap, itemsMap, onSelect, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="team-picker-overlay" onClick={onClose}>
      <div className="team-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-picker-header">
          <span className="team-picker-title">Load from Team</span>
          <button className="team-picker-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="team-picker-body">
          {teams.length === 0 ? (
            <div className="team-picker-empty">No saved teams</div>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="team-picker-group">
                <div className="team-picker-group-name">{team.name}</div>
                <div className="team-picker-grid">
                  {team.pokemon
                    .filter((p) => p.name)
                    .map((pokemon, pi) => {
                      const mon = pokedexMap?.[pokemon.name?.toLowerCase()];
                      return (
                        <button key={pi} className="team-picker-pokemon-card" onClick={() => onSelect(pokemon)}>
                          <div className="tpc-sprite">
                            {mon ? (
                              <ModalIcon mon={mon} />
                            ) : (
                              <span className="tpc-sprite-fallback">{pokemon.name?.[0]}</span>
                            )}
                          </div>
                          <div className="tpc-info">
                            <div className="tpc-top">
                              <span className="tpc-name">{pokemon.name}</span>
                              <span className="tpc-nature">{pokemon.nature}</span>
                            </div>
                            <div className="tpc-row">
                              <span className="tpc-label">Item</span>
                              <span className="tpc-value">{itemsMap?.[pokemon.item]?.name || pokemon.item || "—"}</span>
                            </div>
                            <div className="tpc-row">
                              <span className="tpc-label">Ability</span>
                              <span className="tpc-value">{pokemon.ability || "—"}</span>
                            </div>
                            <div className="tpc-moves">
                              {(pokemon.moves || []).filter(Boolean).map((m, mi) => {
                                const moveData = getMove(m);
                                return (
                                  <span key={mi} className="tpc-move">
                                    {moveData?.name || m}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- NCP Set picker modal ---------- */

function NcpSetPickerModal({ pokedexMap, itemsMap, onSelect, onClose }) {
  const allPokemon = useMemo(() => getAllNcpPokemon(), []);
  const [filter, setFilter] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!selectedPokemon) requestAnimationFrame(() => filterRef.current?.focus());
  }, [selectedPokemon]);

  const filtered = useMemo(() => {
    if (!filter) return allPokemon;
    const q = filter.toLowerCase();
    return allPokemon.filter((n) => n.toLowerCase().includes(q));
  }, [allPokemon, filter]);

  const sets = selectedPokemon ? getNcpSets(selectedPokemon) : null;

  return (
    <div className="team-picker-overlay" onClick={onClose}>
      <div className="team-picker-modal ncp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-picker-header">
          {selectedPokemon ? (
            <button className="pd-back-btn" onClick={() => setSelectedPokemon(null)}></button>
          ) : (
            <span className="team-picker-title">NCP Sets</span>
          )}
          <span className="ncp-selected-name">{selectedPokemon || ""}</span>
          <button className="team-picker-close" onClick={onClose}>
            &times;
          </button>
        </div>
        {!selectedPokemon ? (
          <>
            <div className="ncp-search-row">
              <input
                ref={filterRef}
                className="ncp-filter"
                type="text"
                placeholder="Search..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="team-picker-body ncp-body">
              <div className="ncp-pokemon-grid">
                {filtered.map((name) => {
                  const mon = pokedexMap?.[name.toLowerCase()];
                  return (
                    <button key={name} className="ncp-pokemon-btn" onClick={() => setSelectedPokemon(name)}>
                      <div className="ncp-pokemon-sprite">
                        {mon ? <ModalIcon mon={mon} /> : <span className="tpc-sprite-fallback">{name[0]}</span>}
                      </div>
                      <span className="ncp-pokemon-name">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="team-picker-body ncp-body">
            <div className="team-picker-grid">
              {sets &&
                Object.entries(sets).map(([setName, set]) => {
                  const mon = pokedexMap?.[selectedPokemon.toLowerCase()];
                  return (
                    <button
                      key={setName}
                      className="team-picker-pokemon-card"
                      onClick={() => onSelect(selectedPokemon, set)}
                    >
                      <div className="tpc-sprite">
                        {mon ? (
                          <ModalIcon mon={mon} />
                        ) : (
                          <span className="tpc-sprite-fallback">{selectedPokemon[0]}</span>
                        )}
                      </div>
                      <div className="tpc-info">
                        <div className="tpc-top">
                          <span className="tpc-name">{setName}</span>
                          <span className="tpc-nature">{set.nature}</span>
                        </div>
                        <div className="tpc-row">
                          <span className="tpc-label">Item</span>
                          <span className="tpc-value">{itemsMap?.[set.item]?.name || set.item || "—"}</span>
                        </div>
                        {set.ability && (
                          <div className="tpc-row">
                            <span className="tpc-label">Ability</span>
                            <span className="tpc-value">{set.ability}</span>
                          </div>
                        )}
                        <div className="tpc-moves">
                          {(set.moves || []).filter(Boolean).map((m, mi) => {
                            const moveData = getMove(m);
                            return (
                              <span key={mi} className="tpc-move">
                                {moveData?.name || m}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Side card ---------- */

function CalcPokemonSide({ label, side, onChange, onOpenSearch, pokedexMap, itemsMap, field }) {
  const mon = side.name ? pokedexMap[side.name.toLowerCase()] : null;
  const itemData = side.item ? itemsMap[side.item] : null;
  const itemIcon = itemData ? getItemIcon(itemData.spritenum) : null;
  const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
  const sideField = label === "Left" ? field.attackerSide || {} : field.defenderSide || {};
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showNcpPicker, setShowNcpPicker] = useState(false);

  // Mega evolution detection
  const megaInfo = useMemo(() => {
    if (!side.item || !isMegaStone(side.item) || !pokedexMap) return null;
    // Stone must correspond to the current Pokemon
    const megaEntry = getMegaFormeForStone(side.item, pokedexMap);
    if (!megaEntry) return null;
    const baseEntry = getBaseForme(megaEntry, pokedexMap);
    if (!baseEntry || !mon) return null;
    // Only show toggle if this Pokemon is the base form or already the mega forme
    if (mon.name !== baseEntry.name && mon.name !== megaEntry.name) return null;
    // Floettite only works with Floette-Eternal or Floette-Mega, not base Floette
    if (side.item === "floettite") {
      if (mon.forme !== "Eternal" && mon.forme !== "Mega") return null;
    }
    return { megaEntry, baseEntry };
  }, [side.item, side.name, pokedexMap, mon]);

  const isMega = megaInfo && mon && megaInfo.megaEntry.name === mon.name;
  const preMegaAbility = useRef(null);

  const handleMegaToggle = useCallback(() => {
    if (!megaInfo) return;
    if (isMega) {
      // Revert to base forme, restore the ability we saved
      // Hardcode: Floette-Mega demegas to Floette-Eternal, not base Floette
      const revertName = megaInfo.megaEntry.name === "Floette-Mega" ? "Floette-Eternal" : megaInfo.baseEntry.name;
      const revertEntry = pokedexMap[revertName.toLowerCase()] || megaInfo.baseEntry;
      onChange({
        ...side,
        name: revertName,
        ability: preMegaAbility.current || revertEntry.abilities?.[0]?.name || "",
      });
      preMegaAbility.current = null;
    } else {
      // Remember current ability before switching to mega
      preMegaAbility.current = side.ability || "";
      onChange({
        ...side,
        name: megaInfo.megaEntry.name,
        ability: getMegaAbility(megaInfo.megaEntry) || "",
      });
    }
  }, [side, onChange, megaInfo, isMega]);

  const loadFromTeam = useCallback(
    (pokemon) => {
      const mon = pokedexMap?.[pokemon.name?.toLowerCase()];
      const natureObj = pokemon.nature ? NATURE_MAP[pokemon.nature] : null;
      const sp = pokemon.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      const rawStats = mon ? calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level || DEFAULT_LEVEL) : null;
      onChange({
        ...side,
        name: pokemon.name,
        item: pokemon.item,
        ability: pokemon.ability,
        moves: [...(pokemon.moves || ["", "", "", ""])],
        sp,
        nature: pokemon.nature,
        curHP: rawStats?.hp ?? null,
      });
      setShowTeamPicker(false);
    },
    [side, onChange, pokedexMap],
  );

  const loadFromNcp = useCallback(
    (pokemon, set) => {
      const ncpToCalc = { hp: "hp", at: "atk", df: "def", sa: "spa", sd: "spd", sp: "spe" };
      const sp = {};
      Object.entries(ncpToCalc).forEach(([ncp, calc]) => {
        sp[calc] = set.sps?.[ncp] || 0;
      });
      const toID = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const moves = (set.moves || ["", "", "", ""]).map((m) => toID(m));
      const itemId = toID(set.item);
      let name = pokemon;
      let ability = set.ability || "";
      if (isMegaStone(itemId) && pokedexMap) {
        const megaEntry = getMegaFormeForStone(itemId, pokedexMap);
        if (megaEntry) {
          name = megaEntry.name;
          ability = getMegaAbility(megaEntry) || ability;
        }
      }
      const mon = pokedexMap?.[name?.toLowerCase()];
      const natureObj = set.nature ? NATURE_MAP[set.nature] : null;
      const rawStats = mon ? calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level || DEFAULT_LEVEL) : null;
      onChange({
        ...side,
        name,
        item: itemId,
        ability,
        moves,
        sp,
        nature: set.nature || "",
        curHP: rawStats?.hp ?? null,
      });
      setShowNcpPicker(false);
    },
    [side, onChange, pokedexMap],
  );

  return (
    <div className="calc-side">
      <div className="calc-side-header">
        <h3>{label}</h3>
      </div>

      {/* Display card */}
      <div className="calc-display-card">
        <div
          className={`calc-display-main ${mon ? "" : "calc-display-main--empty"}`}
          onClick={() => onOpenSearch("pokemon")}
        >
          <div className="calc-load-btns">
            <button
              className="calc-team-load-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowTeamPicker(true);
              }}
            >
              Load from Team
            </button>
            <button
              className="calc-team-load-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowNcpPicker(true);
              }}
            >
              NCP Sets
            </button>
          </div>
          {mon ? (
            <div className="calc-display-inner">
              <div className="calc-sprite-wrap">
                <SpriteView mon={mon} />
              </div>
              <div className="calc-display-name">{mon.name}</div>
              <div className="calc-display-types">
                {(mon.types || []).map((t) => (
                  <TypeIcon key={t} type={t} size={18} />
                ))}
              </div>
            </div>
          ) : (
            <div className="calc-display-inner">
              <div className="calc-sprite-wrap" />
              <div className="calc-display-name">&nbsp;</div>
              <div className="calc-display-types">&nbsp;</div>
            </div>
          )}
          {megaInfo && (
            <button
              className="calc-mega-toggle"
              data-mega={isMega ? "true" : "false"}
              onClick={(e) => {
                e.stopPropagation();
                handleMegaToggle();
              }}
            />
          )}
        </div>
      </div>

      {/* Team picker modal */}
      {showTeamPicker && (
        <TeamPickerModal
          teams={loadTeams()}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
          onSelect={loadFromTeam}
          onClose={() => setShowTeamPicker(false)}
        />
      )}

      {/* NCP Set picker modal */}
      {showNcpPicker && (
        <NcpSetPickerModal
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
          onSelect={loadFromNcp}
          onClose={() => setShowNcpPicker(false)}
        />
      )}

      {/* Item */}
      <div className="calc-meta-row">
        <div className="calc-meta-section">
          <div className="se-section-header">Item</div>
          <button className="calc-meta-btn" onClick={() => onOpenSearch("item")}>
            {itemIcon && <Icon className="item-row-icon" icon={itemIcon} />}
            <span className="se-part-value">{itemData ? itemData.name : ""}</span>
          </button>
        </div>
        <div className="calc-meta-section">
          <div className="se-section-header">Ability</div>
          <button className="calc-meta-btn" onClick={() => onOpenSearch("ability")}>
            <span className="se-part-value">{side.ability || ""}</span>
          </button>
        </div>
      </div>

      {/* Moves */}
      <div className="calc-move-section">
        <div className="se-section-header">Moves</div>
        <div className="calc-moves-list">
          {(side.moves || ["", "", "", ""]).map((moveName, i) => (
            <button key={i} className="calc-move-row" onClick={() => onOpenSearch("move", i)}>
              {moveName ? (
                <>
                  <div className="calc-move-row-left">
                    <div className="calc-move-row-top">
                      {(() => {
                        const mv = getMove(moveName);
                        return mv?.type ? <TypeIcon type={mv.type} size={16} /> : null;
                      })()}
                      <span className="calc-move-row-name">
                        {(() => {
                          const mv = getMove(moveName);
                          return mv?.name || moveName;
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="calc-move-row-right">
                    {(() => {
                      const mv = getMove(moveName);
                      return mv?.category ? (
                        <CategoryIcon category={mv.category} width={20} className="calc-move-cat-icon" />
                      ) : null;
                    })()}
                    {(() => {
                      const mv = getMove(moveName);
                      if (!mv) return null;
                      const isStatus = mv.category === "Status";
                      return (
                        <>
                          <div className="calc-move-stat-cell">
                            <span className="calc-move-stat-label">BP</span>
                            <span className="calc-move-stat-value" data-no-power={isStatus || undefined}>
                              {isStatus ? "—" : mv.basePower || "—"}
                            </span>
                          </div>
                          <div className="calc-move-stat-cell">
                            <span className="calc-move-stat-label">ACC</span>
                            <span className="calc-move-stat-value">
                              {mv.accuracy === true ? "—" : (mv.accuracy ?? "—")}
                            </span>
                          </div>
                          <div className="calc-move-stat-cell">
                            <span className="calc-move-stat-label">PP</span>
                            <span className="calc-move-stat-value">{mv.pp ?? "—"}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              ) : (
                <div className="calc-move-row-left">
                  <div className="calc-move-row-top">
                    <span className="calc-move-row-name" style={{ color: "var(--muted)" }}>
                      &nbsp;
                    </span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status + Health */}
      <div className="calc-meta-row">
        <div className="calc-meta-section">
          <div className="se-section-header">Status</div>
          <select
            className="calc-status-select"
            value={side.status || ""}
            onChange={(e) => onChange({ ...side, status: e.target.value })}
          >
            <option value="">None</option>
            <option value="brn">Burn</option>
            <option value="par">Paralysis</option>
            <option value="psn">Poison</option>
            <option value="tox">Toxic</option>
            <option value="slp">Sleep</option>
            <option value="frz">Freeze</option>
          </select>
        </div>
        <div className="calc-meta-section">
          <div className="se-section-header">HP</div>
          {(() => {
            const sp = side.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
            const rawStats = mon ? calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level || DEFAULT_LEVEL) : null;
            const maxHP = rawStats?.hp ?? 1;
            const curHP = side.curHP ?? maxHP;
            return (
              <input
                className="calc-health-input"
                type="number"
                min={1}
                max={maxHP}
                value={curHP}
                onChange={(e) =>
                  onChange({ ...side, curHP: Math.max(1, Math.min(maxHP, Number(e.target.value) || maxHP)) })
                }
              />
            );
          })()}
        </div>
      </div>

      {/* Stats */}
      <div className="calc-stats-section">
        <div className="se-section-header">Stats</div>
        <button className={`calc-meta-btn calc-stats-btn`} onClick={() => onOpenSearch("stats")}>
          {mon ? (
            <div className="calc-stats-preview">
              {(() => {
                const sp = side.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
                const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
                const rawStats = calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level || DEFAULT_LEVEL);
                const modified = applyStatModifiers(rawStats, side, field, sideField);
                const finalStats = applyBoosts(modified, side.boosts);
                return STAT_KEYS.map((key) => {
                  const val = finalStats?.[key] ?? 0;
                  const [min, max] = [0, key === "hp" ? 362 : 252];
                  const pct = Math.max(0, Math.min(100, (val / max) * 100));
                  const hue = Math.min(360, Math.floor((val * 180) / max));
                  const boost = side.boosts?.[key] ?? 0;
                  const hint = natureObj?.plus === key ? "+" : natureObj?.minus === key ? "-" : null;
                  return (
                    <div key={key} className="calc-stat-preview-row">
                      <span className="calc-stat-preview-label">{STAT_LABELS[key]}</span>
                      <span className="calc-stat-sp-val">{side.sp?.[key] ?? 0}</span>
                      <span
                        className={`calc-stat-hint ${hint === "+" ? "calc-boost--plus" : hint === "-" ? "calc-boost--minus" : ""}`}
                      >
                        {hint || ""}
                      </span>
                      <div className="se-stat-bar-mini">
                        <div
                          className="se-stat-fill-mini"
                          style={{ width: pct + "%", background: `hsl(${hue},85%,45%)` }}
                        />
                      </div>
                      <span className="calc-stat-preview-val">{val}</span>
                      <span
                        className={`calc-stat-boost ${boost > 0 ? "calc-boost--plus" : boost < 0 ? "calc-boost--minus" : ""}`}
                      >
                        {boost > 0 ? `+${boost}` : boost < 0 ? boost : ""}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="calc-stats-preview">
              {STAT_KEYS.map((key) => (
                <div key={key} className="calc-stat-preview-row">
                  <span className="calc-stat-preview-label">{STAT_LABELS[key]}</span>
                  <span className="calc-stat-sp-val">0</span>
                  <span className="calc-stat-hint" />
                  <div className="se-stat-bar-mini">
                    <div className="se-stat-fill-mini" style={{ width: "0%", background: "var(--border)" }} />
                  </div>
                  <span className="calc-stat-preview-val">0</span>
                  <span className="calc-stat-boost" />
                </div>
              ))}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------- Shared search panels ---------- */

function ItemSearchPanel({ onSelect, selectedKey, regulation }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const rowHeight = useRowHeight();

  useEffect(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);
  const allItems = useMemo(
    () =>
      getAllItems()
        .filter((i) => isItemLegal(i._key, regulation))
        .map((i) => ({ ...i, _lcName: i.name.toLowerCase() })),
    [regulation],
  );
  const filtered = useMemo(() => {
    if (!search) return allItems;
    const q = search.toLowerCase();
    return allItems.filter((i) => i._lcName.includes(q));
  }, [allItems, search]);
  const getKey = useCallback((i) => i._key, []);
  const renderItem = useCallback((i) => <ItemGridRow i={i} />, []);

  const headers = useMemo(
    () => [{ nosort: true }, { nosort: true }, { nosort: true, label: "Name" }, { nosort: true, label: "Description" }],
    [],
  );

  return (
    <>
      <div className="calc-pokemon-search-input-row">
        <SearchInput ref={searchRef} className="input" value={search} onChange={setSearch} />
      </div>
      <div className="calc-pokemon-search-results">
        <VirtualTable
          headers={headers}
          gridClass="items-grid"
          items={filtered}
          rowHeight={rowHeight}
          renderItem={renderItem}
          selectedKey={selectedKey}
          getKey={getKey}
          onSelect={(i) => onSelect(i._key)}
          emptyText="No items match."
        />
      </div>
    </>
  );
}

function AbilitySearchPanel({ mon, side, onChange, selectedKey, onAdvance }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);
  const abilities = useMemo(() => {
    if (!mon?.abilities) return [];
    return mon.abilities.map((ab) => {
      const details = getAbilityByName(ab.name);
      return { ...ab, details, _key: ab.name };
    });
  }, [mon]);
  const filtered = useMemo(() => {
    if (!search) return abilities;
    const q = search.toLowerCase();
    return abilities.filter((a) => a.name.toLowerCase().includes(q));
  }, [abilities, search]);

  return (
    <>
      <div className="calc-pokemon-search-input-row">
        <SearchInput ref={searchRef} className="input" value={search} onChange={setSearch} />
      </div>
      <div className="calc-pokemon-search-results">
        <div className="calc-ability-list">
          {filtered.map((ab) => (
            <button
              key={ab._key}
              className={`calc-search-item ${selectedKey === ab._key ? "calc-search-item--active" : ""}`}
              onClick={() => {
                onChange({ ...side, ability: ab.name });
                setSearch("");
                onAdvance("move");
              }}
            >
              <div className="se-ability-header">
                <span className="se-ability-name">{ab.name}</span>
                {ab.hidden && <span className="se-ability-hidden">Hidden</span>}
              </div>
              {ab.details && <div className="se-ability-desc">{ab.details.shortDesc || ab.details.desc}</div>}
            </button>
          ))}
          {filtered.length === 0 && <div className="calc-search-empty">No abilities</div>}
          {side.ability && (
            <button
              className="calc-search-item calc-ability-clear"
              onClick={() => {
                onChange({ ...side, ability: undefined });
                setSearch("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function MoveSearchPanel({ side, onChange, moveSlot, moveFilters, setMoveFilters, pokedexMap, regulation, onAdvance }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const mon = side.name ? pokedexMap[side.name.toLowerCase()] : null;
  const legalMoves = useMemo(
    () => (mon ? getLearnset(mon.key || mon.name?.toLowerCase(), regulation) : null),
    [mon, regulation],
  );

  // Refocus and clear search when moveSlot changes
  useEffect(() => {
    setSearch("");
    setMoveFilters({ categories: [], moveTypes: [] });
    requestAnimationFrame(() => searchRef.current?.focus());
  }, [moveSlot]);

  // Initial focus on mount
  useEffect(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);

  const refocusSearch = useCallback(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);

  const addFilter = useCallback(
    (category, value) => {
      setMoveFilters((f) => ({ ...f, [category]: [...f[category], value] }));
      refocusSearch();
    },
    [setMoveFilters, refocusSearch],
  );

  const removeFilter = useCallback(
    (category, value) => {
      setMoveFilters((f) => ({ ...f, [category]: f[category].filter((v) => v !== value) }));
      refocusSearch();
    },
    [setMoveFilters, refocusSearch],
  );

  const handleMoveSelect = useCallback(
    (moveKey) => {
      const moves = [...(side.moves || ["", "", "", ""])];
      moves[moveSlot] = moveKey;
      onChange({ ...side, moves });
      setSearch("");
      setMoveFilters({ categories: [], moveTypes: [] });
      if (moveSlot < 3) {
        onAdvance("move", moveSlot + 1);
      } else {
        onAdvance("stats");
      }
    },
    [side, onChange, moveSlot, setMoveFilters, onAdvance],
  );

  return (
    <>
      <div className="calc-pokemon-search-input-row">
        <SearchInput ref={searchRef} className="input" value={search} onChange={setSearch} />
      </div>
      <FilterChipsBar
        entries={[
          ...moveFilters.categories.map((c) => ({ category: "categories", value: c })),
          ...moveFilters.moveTypes.map((t) => ({ category: "moveTypes", value: t })),
        ]}
        onRemove={removeFilter}
        onClear={() => setMoveFilters({ categories: [], moveTypes: [] })}
      />
      <div className="calc-pokemon-search-results">
        <MovesList
          regulation={regulation}
          search={search}
          filters={moveFilters}
          addFilter={addFilter}
          removeFilter={removeFilter}
          setSearch={setSearch}
          onMoveSelect={handleMoveSelect}
          legalMoves={legalMoves}
        />
      </div>
    </>
  );
}

/* ---------- Shared search wrapper ---------- */

function SharedSearchPanel({
  searchPart,
  target,
  moveSlot,
  side,
  onChange,
  allPokemon,
  pokedexMap,
  onClear,
  onAdvance,
  regulation,
  field,
}) {
  const mon = side.name ? pokedexMap[side.name.toLowerCase()] : null;
  const [moveFilters, setMoveFilters] = useState({ categories: [], moveTypes: [] });
  const panelRef = useRef(null);
  const sideField = target === "attacker" ? field.attackerSide || {} : field.defenderSide || {};

  // Reset move filters when switching to move search
  useEffect(() => {
    if (searchPart === "move") setMoveFilters({ categories: [], moveTypes: [] });
  }, [searchPart]);

  // Scroll panel into view when search part changes
  useEffect(() => {
    if (searchPart && panelRef.current) {
      panelRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [searchPart, target]);

  if (!searchPart || !target) return null;

  const needsPokemon = searchPart !== "pokemon" && !mon;

  return (
    <div className="calc-shared-search" ref={panelRef}>
      {searchPart === "pokemon" && (
        <PokemonSearchPanelInline
          target={target}
          allPokemon={allPokemon}
          side={side}
          onChange={onChange}
          onAdvance={onAdvance}
          regulation={regulation}
          pokedexMap={pokedexMap}
        />
      )}
      {needsPokemon && <div className="calc-search-empty">Select a Pokemon</div>}
      {searchPart === "item" && mon && (
        <ItemSearchPanel
          onSelect={(key) => {
            onChange({ ...side, item: key });
            onAdvance("ability");
          }}
          selectedKey={side.item}
          regulation={regulation}
        />
      )}
      {searchPart === "ability" && mon && (
        <AbilitySearchPanel
          mon={mon}
          side={side}
          onChange={onChange}
          selectedKey={side.ability}
          onAdvance={onAdvance}
        />
      )}
      {searchPart === "move" && mon && (
        <MoveSearchPanel
          side={side}
          onChange={onChange}
          moveSlot={moveSlot}
          moveFilters={moveFilters}
          setMoveFilters={setMoveFilters}
          pokedexMap={pokedexMap}
          regulation={regulation}
          onAdvance={onAdvance}
        />
      )}
      {searchPart === "stats" && mon && (
        <CalcStatsPanel side={side} mon={mon} onChange={onChange} field={field} sideField={sideField} />
      )}
    </div>
  );
}

function PokemonSearchPanelInline({ target, allPokemon, side, onChange, onAdvance, regulation, pokedexMap }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ types: [], moves: [], abilities: [] });
  const searchRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);

  const handleSelect = useCallback(
    (p) => {
      // Check if this is a mega forme
      const isMegaForme = p.forme && p.forme.startsWith("Mega");
      const megaStone = isMegaForme ? getStoneForForme(p, pokedexMap) : null;
      const megaAbility = isMegaForme ? getMegaAbility(p) : null;
      const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
      const rawStats = p.baseStats
        ? calcFinalStatsSP(
            p.baseStats,
            { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            natureObj,
            side.level || DEFAULT_LEVEL,
          )
        : null;

      onChange({
        ...emptySide,
        name: p.name,
        level: side.level,
        nature: side.nature,
        curHP: rawStats?.hp ?? null,
        ...(megaStone ? { item: megaStone } : {}),
        ...(megaAbility ? { ability: megaAbility } : {}),
      });

      // Skip to moves if mega forme selected
      onAdvance(isMegaForme ? "move" : "item");
    },
    [side, onChange, onAdvance, pokedexMap],
  );

  const refocusSearch = useCallback(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);

  const addFilter = useCallback(
    (category, value) => {
      setFilters((f) => (f[category].includes(value) ? f : { ...f, [category]: [...f[category], value] }));
      refocusSearch();
    },
    [refocusSearch],
  );

  const removeFilter = useCallback(
    (category, value) => {
      setFilters((f) => ({ ...f, [category]: f[category].filter((v) => v !== value) }));
      refocusSearch();
    },
    [refocusSearch],
  );

  const chipEntries = useMemo(
    () => [
      ...filters.types.map((t) => ({ category: "types", value: t })),
      ...filters.moves.map((m) => ({ category: "moves", value: m })),
      ...filters.abilities.map((a) => ({ category: "abilities", value: a })),
    ],
    [filters],
  );

  return (
    <>
      <div className="calc-pokemon-search-input-row">
        <SearchInput ref={searchRef} className="input" value={search} onChange={setSearch} />
      </div>
      <FilterChipsBar
        entries={chipEntries}
        onRemove={removeFilter}
        onClear={() => setFilters({ types: [], moves: [], abilities: [] })}
      />
      <div className="calc-pokemon-search-results">
        {search.trim() ? (
          <GlobalSearch
            allPokemon={allPokemon}
            regulation={regulation}
            search={search}
            filters={filters}
            addFilter={addFilter}
            removeFilter={removeFilter}
            setSearch={setSearch}
            onPokemonSelect={handleSelect}
          />
        ) : (
          <Pokedex
            allPokemon={allPokemon}
            regulation={regulation}
            search=""
            filters={
              filters.types.length > 0 || filters.moves.length > 0 || filters.abilities.length > 0 ? filters : undefined
            }
            onPokemonSelect={handleSelect}
          />
        )}
      </div>
    </>
  );
}

/* ---------- Result + Field ---------- */

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function formatRolls(res) {
  if (!res?.hitRolls?.length) return null;
  if (res.isMultiHit) {
    return `(${res.hitRolls.map((arr, i) => `${ordinal(i + 1)} hit: ${arr.join(", ")}`).join("; ")})`;
  }
  return `(${res.hitRolls[0].join(", ")})`;
}

function ResultMoveRow({
  side,
  index,
  name,
  res,
  isSelected,
  onSelectSlot,
  critOverrides,
  onChangeCrit,
  hitsOverrides,
  onChangeHits,
  rageFistOverrides,
  onChangeRageFistHits,
  lastRespectsOverrides,
  onChangeLastRespects,
}) {
  const mv = name ? getMove(name) : null;
  const rText = res?.recoil?.text?.replace(/recoil damage/g, "recoil") || null;
  const hText = res?.recovery?.text?.replace(/recovered/g, "healed") || null;
  const critKey = `${side}-${index}`;
  const crit = !!critOverrides[critKey];
  const isLastRespects = name === "lastrespects";
  const isMultiHit =
    (mv?.multihit != null &&
      (Array.isArray(mv.multihit) ? mv.multihit[1] > 1 : mv.multihit > 1)) ||
    (res?.maxHits || 1) > 1;
  const isRageFist = name === "ragefist";
  const maxHits = res?.maxHits || 1;
  return (
    <div
      className={`result-move-row ${res ? "" : "result-move-row--empty"} ${isSelected ? "result-move-row--selected" : ""}`}
      onClick={() => name && onSelectSlot({ side, index })}
    >
      <span className="result-move-left">
        {mv && <TypeIcon type={mv.type} size={16} />}
        <span className="result-move-name">{mv?.name || name || "(No Move)"}</span>
        {res && (
          <span className="result-row-controls" onClick={(e) => e.stopPropagation()}>
            <button
              className={`result-row-crit ${crit ? "result-row-crit--active" : ""}`}
              onClick={() => onChangeCrit(side, index, !crit)}
            >
              Crit
            </button>
            {isMultiHit && (
              <span className="result-row-hits">
                <span className="result-row-hits-label">Hits</span>
                <button
                  className="result-row-hits-btn"
                  disabled={(hitsOverrides[critKey] ?? maxHits) <= 1}
                  onClick={() => onChangeHits(side, index, Math.max(1, (hitsOverrides[critKey] ?? maxHits) - 1))}
                >
                  −
                </button>
                <span className="result-row-hits-value">
                  {hitsOverrides[critKey] ?? maxHits} / {maxHits}
                </span>
                <button
                  className="result-row-hits-btn"
                  disabled={(hitsOverrides[critKey] ?? maxHits) >= maxHits}
                  onClick={() => {
                    const next = Math.min(maxHits, (hitsOverrides[critKey] ?? maxHits) + 1);
                    onChangeHits(side, index, next >= maxHits ? null : next);
                  }}
                >
                  +
                </button>
              </span>
            )}
            {isRageFist && (
              <span className="result-row-hits">
                <span className="result-row-hits-label">Hits</span>
                <button
                  className="result-row-hits-btn"
                  disabled={(rageFistOverrides[critKey] ?? 0) <= 0}
                  onClick={() => onChangeRageFistHits(side, index, Math.max(0, (rageFistOverrides[critKey] ?? 0) - 1))}
                >
                  −
                </button>
                <span className="result-row-hits-value">{rageFistOverrides[critKey] ?? 0}</span>
                <button
                  className="result-row-hits-btn"
                  disabled={(rageFistOverrides[critKey] ?? 0) >= 6}
                  onClick={() => onChangeRageFistHits(side, index, Math.min(6, (rageFistOverrides[critKey] ?? 0) + 1))}
                >
                  +
                </button>
                <span className="result-row-hits-bp">BP: {50 + (rageFistOverrides[critKey] ?? 0) * 50}</span>
              </span>
            )}
            {isLastRespects && (
              <span className="result-row-hits">
                <span className="result-row-hits-label">Fainted</span>
                <button
                  className="result-row-hits-btn"
                  disabled={(lastRespectsOverrides[critKey] ?? 0) <= 0}
                  onClick={() => onChangeLastRespects(side, index, Math.max(0, (lastRespectsOverrides[critKey] ?? 0) - 1))}
                >
                  −
                </button>
                <span className="result-row-hits-value">{lastRespectsOverrides[critKey] ?? 0}</span>
                <button
                  className="result-row-hits-btn"
                  disabled={(lastRespectsOverrides[critKey] ?? 0) >= 5}
                  onClick={() => onChangeLastRespects(side, index, Math.min(5, (lastRespectsOverrides[critKey] ?? 0) + 1))}
                >
                  +
                </button>
                <span className="result-row-hits-bp">BP: {50 + (lastRespectsOverrides[critKey] ?? 0) * 50}</span>
              </span>
            )}
          </span>
        )}
      </span>
      <span className="result-move-right">
        <span className="result-move-range">{res ? `${res.minPct} - ${res.maxPct}%` : "0 - 0%"}</span>
        {hText && <span className="result-move-recovery">{hText}</span>}
        {rText && <span className="result-move-recoil">{rText}</span>}
      </span>
    </div>
  );
}

function weatherAffectsDamage(weather, moveType) {
  if (!weather || !moveType) return false;
  if (weather === "Sun") return moveType === "Fire" || moveType === "Water";
  if (weather === "Rain") return moveType === "Water" || moveType === "Fire";
  return false;
}
function terrainAffectsDamage(terrain, moveType) {
  if (!terrain || !moveType) return false;
  if (terrain === "Electric") return moveType === "Electric";
  if (terrain === "Grassy") return moveType === "Grass";
  if (terrain === "Misty") return moveType === "Dragon";
  if (terrain === "Psychic") return moveType === "Psychic";
  return false;
}

function ResultDisplay({
  result,
  attacker,
  defender,
  attackerMon,
  defenderMon,
  field,
  itemsMap,
  selectedSlot,
  onSelectSlot,
  hitsOverrides,
  onChangeHits,
  critOverrides,
  onChangeCrit,
  rageFistOverrides,
  onChangeRageFistHits,
  lastRespectsOverrides,
  onChangeLastRespects,
}) {
  const [copied, setCopied] = useState(false);
  const padTo4 = (moves) => {
    const padded = [...moves];
    while (padded.length < 4) padded.push({ name: "", result: null });
    return padded.slice(0, 4);
  };

  // Build rows from each side's selected moves, attaching any calc result so the
  // moves stay populated (showing 0-0 damage) even before both sides exist.
  const atkMoves = (attacker?.moves || ["", "", "", ""]).map((name, i) => ({
    name,
    result: result?.attackerMoves?.[i]?.result || null,
  }));
  const defMoves = (defender?.moves || ["", "", "", ""]).map((name, i) => ({
    name,
    result: result?.defenderMoves?.[i]?.result || null,
  }));

  const paddedAtk = padTo4(atkMoves);
  const paddedDef = padTo4(defMoves);
  const selectedSide = selectedSlot?.side;
  const selectedIdx = selectedSlot?.index ?? 0;
  const isAtkSelected = selectedSide !== "defender";
  const atkSide = isAtkSelected ? attacker : defender;
  const defSide = isAtkSelected ? defender : attacker;
  const selectedRes = selectedSide === "defender"
    ? paddedDef[selectedIdx]?.result || paddedDef.find((m) => m.result)?.result || null
    : paddedAtk[selectedIdx]?.result || paddedAtk.find((m) => m.result)?.result || null;
  const selectedDesc = selectedRes?.desc || "";
  const recoilText = selectedRes?.recoil?.text?.replace(/recoil damage/g, "recoil") || null;
  const recoveryText = selectedRes?.recovery?.text?.replace(/recovered/g, "healed") || null;
  const rollsText = formatRolls(selectedRes);
  const selEntry = selectedSide === "defender" ? paddedDef[selectedIdx] : paddedAtk[selectedIdx];
  const selMoveName = selEntry?.name || "";
  const selMove = selMoveName ? getMove(selMoveName) : null;
  const isStatusMove = selMove?.category === "Status";
  const atkMatch = selectedDesc.match(/(\d+)\s+(Atk|SpA)/);
  const defStatMatch = selectedDesc.match(/(\d+)\s+HP\s*\/\s*(\d+)\s+(Def|SpD)/);
  const bpMatch = selectedDesc.match(/\((\d+)\s*BP\)/);
  const bp = bpMatch ? bpMatch[1] : (selMove?.basePower ?? null);
  const atkStat = atkMatch ? `${atkMatch[1]} ${atkMatch[2]}` : null;
  const defHP = defStatMatch ? defStatMatch[1] : null;
  const defDef = defStatMatch ? defStatMatch[2] : null;
  const defDefLabel = defStatMatch ? defStatMatch[3] : null;
  const atkNatureKey = atkMatch ? { Atk: "atk", SpA: "spa" }[atkMatch[2]] : null;
  const defNatureKey = defDefLabel ? { Def: "def", SpD: "spd" }[defDefLabel] : null;
  const atkNatureObj = atkSide.nature ? NATURE_MAP[atkSide.nature] : null;
  const defNatureObj = defSide.nature ? NATURE_MAP[defSide.nature] : null;
  const atkStatMark =
    atkNatureObj && atkNatureKey
      ? atkNatureObj.plus === atkNatureKey
        ? "+"
        : atkNatureObj.minus === atkNatureKey
          ? "-"
          : ""
      : "";
  const defStatMark =
    defNatureObj && defNatureKey
      ? defNatureObj.plus === defNatureKey
        ? "+"
        : defNatureObj.minus === defNatureKey
          ? "-"
          : ""
      : "";
  const itemName = (atkSide.item && itemsMap?.[atkSide.item]?.name) || atkSide.item || "—";

  // Calc-affecting field/status factors, filtered to those relevant to this move.
  const moveCat = selMove?.category;
  const isPhysical = moveCat === "Physical";
  const isSpecial = moveCat === "Special";
  const atkFieldSide = (isAtkSelected ? field?.attackerSide : field?.defenderSide) || {};
  const defFieldSide = (isAtkSelected ? field?.defenderSide : field?.attackerSide) || {};
  const atkFactors = [];
  const defFactors = [];
  if (atkFieldSide.isHelpingHand) atkFactors.push({ label: "Helping Hand", kind: "boost" });
  if (atkFieldSide.isPowerTrick && isPhysical) atkFactors.push({ label: "Power Trick", kind: "boost" });
  if (atkSide.status === "brn" && isPhysical) atkFactors.push({ label: "Burn", kind: "status" });
  if (defFieldSide.isReflect && isPhysical) defFactors.push({ label: "Reflect", kind: "reduce" });
  if (defFieldSide.isLightScreen && isSpecial) defFactors.push({ label: "Light Screen", kind: "reduce" });
  if (defFieldSide.isAuroraVeil) defFactors.push({ label: "Aurora Veil", kind: "reduce" });
  if (defFieldSide.isFriendGuard) defFactors.push({ label: "Friend Guard", kind: "reduce" });
  const fieldFactors = [];
  const moveType = selMove?.type;
  if (field?.weather && weatherAffectsDamage(field.weather, moveType))
    fieldFactors.push({ label: field.weather, kind: "weather" });
  if (field?.terrain && terrainAffectsDamage(field.terrain, moveType))
    fieldFactors.push({ label: `${field.terrain} Terrain`, kind: "terrain" });
  const koChance = selectedRes?.kochance || null;

  // Other calc text signals from the result object.
  const isForcedCrit = !!selectedRes?.isCrit;
  const isMultiHitMove = !!selectedRes?.isMultiHit;
  let multiHitLabel = null;
  if (isMultiHitMove) {
    const mh = selMove?.multihit;
    if (Array.isArray(mh)) multiHitLabel = `${mh[0]}–${mh[1]} hits`;
    else if (typeof mh === "number" && mh > 1) multiHitLabel = `${mh} hits`;
    else multiHitLabel = `${selectedRes?.maxHits ?? 1} hits`;
  }
  const copyText = `${selectedDesc}${recoilText || recoveryText ? ` ${recoilText || recoveryText}` : ""}`;
  return (
    <div className="result-display">
      <div className="result-columns">
        <div className="result-col">
          <div className="result-col-header result-col-header--mon">
            {attackerMon ? (
              <ModalIcon mon={attackerMon} />
            ) : (
              <span className="result-col-icon-ph">?</span>
            )}
            <span className={`result-col-name${attackerMon ? "" : " result-col-name--empty"}`}>
              {attackerMon?.name || "No Pokémon"}
            </span>
            <span className="result-col-types">
              {(attackerMon?.types || []).map((t) => (
                <TypeIcon key={t} type={t} size={14} />
              ))}
            </span>
          </div>
          {paddedAtk.map(({ name, result: res }, i) => (
            <ResultMoveRow
              key={i}
              side="attacker"
              index={i}
              name={name}
              res={res}
              isSelected={selectedSlot?.side === "attacker" && selectedSlot?.index === i}
              onSelectSlot={onSelectSlot}
              critOverrides={critOverrides}
              onChangeCrit={onChangeCrit}
              hitsOverrides={hitsOverrides}
              onChangeHits={onChangeHits}
              rageFistOverrides={rageFistOverrides}
              onChangeRageFistHits={onChangeRageFistHits}
              lastRespectsOverrides={lastRespectsOverrides}
              onChangeLastRespects={onChangeLastRespects}
            />
          ))}
        </div>
        <div className="result-col">
          <div className="result-col-header result-col-header--mon">
            {defenderMon ? (
              <ModalIcon mon={defenderMon} />
            ) : (
              <span className="result-col-icon-ph">?</span>
            )}
            <span className={`result-col-name${defenderMon ? "" : " result-col-name--empty"}`}>
              {defenderMon?.name || "No Pokémon"}
            </span>
            <span className="result-col-types">
              {(defenderMon?.types || []).map((t) => (
                <TypeIcon key={t} type={t} size={14} />
              ))}
            </span>
          </div>
          {paddedDef.map(({ name, result: res }, i) => (
            <ResultMoveRow
              key={i}
              side="defender"
              index={i}
              name={name}
              res={res}
              isSelected={selectedSlot?.side === "defender" && selectedSlot?.index === i}
              onSelectSlot={onSelectSlot}
              critOverrides={critOverrides}
              onChangeCrit={onChangeCrit}
              hitsOverrides={hitsOverrides}
              onChangeHits={onChangeHits}
              rageFistOverrides={rageFistOverrides}
              onChangeRageFistHits={onChangeRageFistHits}
              lastRespectsOverrides={lastRespectsOverrides}
              onChangeLastRespects={onChangeLastRespects}
            />
          ))}
        </div>
      </div>
      {selectedRes && (
        <div
          className="result-detail"
          onClick={() => {
            navigator.clipboard.writeText(copyText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          title="Click to copy"
        >
          <div className="result-detail-head">
            {selMove && <TypeIcon type={selMove.type} size={20} />}
            {selMove && <CategoryIcon category={selMove.category} width={18} />}
            <span className="result-detail-move">{selMove?.name || selMoveName}</span>
            <span className="result-detail-head-right">
              {bp != null && !isStatusMove && <span className="result-detail-bp">{bp} BP</span>}
              {isStatusMove && <span className="result-detail-bp">Status</span>}
              {isForcedCrit && <span className="result-detail-badge result-detail-badge--crit">Crit</span>}
              {multiHitLabel && (
                <span className="result-detail-badge result-detail-badge--multi">{multiHitLabel}</span>
              )}
            </span>
          </div>
          {fieldFactors.length > 0 && !isStatusMove && (
            <div className="result-detail-field">
              {fieldFactors.map((f) => (
                <span key={f.label} className={`result-factor-chip result-factor-chip--${f.kind}`}>
                  {f.label}
                </span>
              ))}
            </div>
          )}
          {!isStatusMove && (
            <div className="result-detail-cols">
            <div className="result-detail-box">
              <span className="result-detail-label">Attacker</span>
              <span className="result-detail-value">{atkSide.name}</span>
              <span className="result-detail-sub">
                {!isStatusMove &&
                  (atkStat ? (
                    <>
                      {atkStat}
                      {atkStatMark && (
                        <span className={`result-nature-mark calc-boost--${atkStatMark === "+" ? "plus" : "minus"}`}>
                          {atkStatMark}
                        </span>
                      )}
                    </>
                  ) : (
                    ""
                  ))}
                {atkSide.ability ? ` · ${atkSide.ability}` : ""}
                {atkSide.item ? ` · ${itemName}` : ""}
                {atkSide.nature ? ` · ${atkSide.nature}` : ""}
              </span>
              {atkFactors.length > 0 && (
                <span className="result-detail-factors">
                  {atkFactors.map((f) => (
                    <span key={f.label} className={`result-factor-chip result-factor-chip--${f.kind}`}>
                      {f.label}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <div className="result-detail-box">
              <span className="result-detail-label">Defender</span>
              <span className="result-detail-value">{defSide.name}</span>
              <span className="result-detail-sub">
                {defHP ? `${defHP} HP` : ""}
                {defDef ? (
                  <>
                    {" / "}
                    {defDef} {defDefLabel}
                    {defStatMark && (
                      <span className={`result-nature-mark calc-boost--${defStatMark === "+" ? "plus" : "minus"}`}>
                        {defStatMark}
                      </span>
                    )}
                  </>
                ) : (
                  ""
                )}
                {defSide.nature ? ` · ${defSide.nature}` : ""}
              </span>
              {defFactors.length > 0 && (
                <span className="result-detail-factors">
                  {defFactors.map((f) => (
                    <span key={f.label} className={`result-factor-chip result-factor-chip--${f.kind}`}>
                      {f.label}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
          )}
          {!isStatusMove ? (
            <div className="result-detail-dmg">
              <span className="result-detail-range">
                {selectedRes.minPct}–{selectedRes.maxPct}%
              </span>
              <span className="result-detail-raw">
                {selectedRes.min}–{selectedRes.max} dmg
              </span>
              {koChance && <span className="result-detail-ko">{koChance}</span>}
            </div>
          ) : (
            <div className="result-detail-dmg result-detail-dmg--status">Status move — no damage</div>
          )}
          {(recoilText || recoveryText) && (
            <div className="result-detail-extra">
              {recoveryText && <span className="result-detail-recovery">{recoveryText}</span>}
              {recoilText && <span className="result-detail-recoil">{recoilText}</span>}
            </div>
          )}
          {rollsText && !isStatusMove && <div className="result-detail-rolls">{rollsText}</div>}
          {copied && <span className="result-detail-copied">Copied!</span>}
        </div>
      )}
    </div>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button className={`field-toggle-btn ${active ? "field-toggle-btn--active" : ""}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function SideFieldToggles({ side, onChange, label }) {
  const set = (key, val) => onChange({ ...side, [key]: val });
  const toggle = (key) => set(key, !side[key]);

  return (
    <div className="field-side-toggles">
      <div className="field-side-label">{label}</div>
      <div className="field-side-row">
        <ToggleButton active={!!side.isReflect} onClick={() => toggle("isReflect")}>
          Reflect
        </ToggleButton>
        <ToggleButton active={!!side.isLightScreen} onClick={() => toggle("isLightScreen")}>
          Light Screen
        </ToggleButton>
        <ToggleButton active={!!side.isAuroraVeil} onClick={() => toggle("isAuroraVeil")}>
          Aurora Veil
        </ToggleButton>
      </div>
      <div className="field-side-row">
        <ToggleButton active={!!side.isHelpingHand} onClick={() => toggle("isHelpingHand")}>
          Helping Hand
        </ToggleButton>
        <ToggleButton active={!!side.isTailwind} onClick={() => toggle("isTailwind")}>
          Tailwind
        </ToggleButton>
        <ToggleButton active={!!side.isPowerTrick} onClick={() => toggle("isPowerTrick")}>
          Power Trick
        </ToggleButton>
        <ToggleButton active={!!side.isFriendGuard} onClick={() => toggle("isFriendGuard")}>
          Friend Guard
        </ToggleButton>
      </div>
    </div>
  );
}

function FieldOptions({ field, onChange, regulation, onRegulationChange }) {
  const setField = (key, val) => onChange({ ...field, [key]: val });
  const toggleField = (key) => setField(key, !field[key]);

  const setAttackerSide = (side) => onChange({ ...field, attackerSide: side });
  const setDefenderSide = (side) => onChange({ ...field, defenderSide: side });

  return (
    <div className="field-options">
      <div className="field-options-row">
        {/* Left side */}
        <div className="field-options-side field-options-side--left">
          <SideFieldToggles side={field.attackerSide || {}} onChange={setAttackerSide} label="Left" />
        </div>

        {/* Center: global field */}
        <div className="field-options-center">
          <div className="field-options-top-row">
            <select
              className="field-reg-select"
              value={regulation}
              onChange={(e) => onRegulationChange(e.target.value)}
            >
              {Object.entries(REGULATIONS).map(([key, reg]) => (
                <option key={key} value={key}>
                  {reg.label}
                </option>
              ))}
            </select>
            <div className="field-toggle-row">
              <ToggleButton active={field.gameType === "Singles"} onClick={() => setField("gameType", "Singles")}>
                Singles
              </ToggleButton>
              <ToggleButton active={field.gameType === "Doubles"} onClick={() => setField("gameType", "Doubles")}>
                Doubles
              </ToggleButton>
            </div>
          </div>

          <div className="field-options-groups">
            <div className="field-toggle-row">
              {["Sun", "Rain", "Sand", "Snow"].map((w) => (
                <ToggleButton
                  key={w}
                  active={field.weather === w}
                  onClick={() => setField("weather", field.weather === w ? undefined : w)}
                >
                  {w}
                </ToggleButton>
              ))}
            </div>

            <div className="field-toggle-row">
              {["Electric", "Grassy", "Misty", "Psychic"].map((t) => (
                <ToggleButton
                  key={t}
                  active={field.terrain === t}
                  onClick={() => setField("terrain", field.terrain === t ? undefined : t)}
                >
                  {t}
                </ToggleButton>
              ))}
            </div>

            <div className="field-toggle-row">
              <ToggleButton active={!!field.isMagicRoom} onClick={() => toggleField("isMagicRoom")}>
                Magic Room
              </ToggleButton>
              <ToggleButton active={!!field.isWonderRoom} onClick={() => toggleField("isWonderRoom")}>
                Wonder Room
              </ToggleButton>
              <ToggleButton active={!!field.isGravity} onClick={() => toggleField("isGravity")}>
                Gravity
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="field-options-side field-options-side--right">
          <SideFieldToggles side={field.defenderSide || {}} onChange={setDefenderSide} label="Right" />
        </div>
      </div>
    </div>
  );
}

/* ---------- LocalStorage persistence ---------- */

const STORAGE_KEY = "vgc-calc-state";
const STORAGE_TTL = 30 * 60 * 1000; // 30 minutes

function loadCalcState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > STORAGE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveCalcState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* quota exceeded, ignore */
  }
}

/* ---------- Main page ---------- */

export default function CalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [allPokemon, setAllPokemon] = useState([]);
  const [pokedexMap, setPokedexMap] = useState({});
  const [itemsMap, setItemsMap] = useState({});

  const saved = useMemo(() => loadCalcState(), []);

  const [attacker, setAttacker] = useState(saved?.attacker || { ...emptySide });
  const [defender, setDefender] = useState(saved?.defender || { ...emptySide });

  const [field, setField] = useState(
    saved?.field || {
      gameType: "Doubles",
      weather: undefined,
      terrain: undefined,
      isGravity: false,
      isMagicRoom: false,
      isWonderRoom: false,
      attackerSide: {},
      defenderSide: {},
    },
  );

  const [regulation, setRegulation] = useState(saved?.regulation || DEFAULT_REG);

  const [result, setResult] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState({ side: "attacker", index: 0 });
  const [hitsOverrides, setHitsOverrides] = useState({});
  const [critOverrides, setCritOverrides] = useState({});
  const [rageFistOverrides, setRageFistOverrides] = useState({});
  const [lastRespectsOverrides, setLastRespectsOverrides] = useState({});
  const [error, setError] = useState(null);
  const [view, setView] = useState("l");

  // Refs to avoid stale closures in the calculation callback
  const attackerRef = useRef(attacker);
  const defenderRef = useRef(defender);
  const fieldRef = useRef(field);
  const hitsOverridesRef = useRef(hitsOverrides);
  const critOverridesRef = useRef(critOverrides);
  const rageFistOverridesRef = useRef(rageFistOverrides);
  const lastRespectsOverridesRef = useRef(lastRespectsOverrides);
  attackerRef.current = attacker;
  defenderRef.current = defender;
  fieldRef.current = field;
  hitsOverridesRef.current = hitsOverrides;
  critOverridesRef.current = critOverrides;
  rageFistOverridesRef.current = rageFistOverrides;
  lastRespectsOverridesRef.current = lastRespectsOverrides;

  // Shared search state: which side + which part + which move slot
  const [searchTarget, setSearchTarget] = useState(null); // "attacker" | "defender"
  const [searchPart, setSearchPart] = useState(null); // "pokemon" | "item" | "ability" | "move"
  const [moveSlot, setMoveSlot] = useState(0); // which move slot (0-3)

  // Persist state to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCalcState({ attacker, defender, field, regulation });
    }, 500);
    return () => clearTimeout(timer);
  }, [attacker, defender, field, regulation]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pokemon, calcData] = await Promise.all([
          loadPokedex(),
          getData(),
          loadMoves(),
          loadLearnsets(regulation),
        ]);
        if (cancelled) return;
        const pMap = {};
        for (const p of pokemon) pMap[p.name.toLowerCase()] = p;
        const items = getAllItems();
        const iMap = {};
        for (const item of items) iMap[item._key] = item;
        setAllPokemon(pokemon);
        setPokedexMap(pMap);
        setItemsMap(iMap);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load damage calculator: " + err.message);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadLearnsets(regulation).catch(() => {});
  }, [regulation]);

  const doCalculate = useCallback(async () => {
    const a = attackerRef.current;
    const d = defenderRef.current;
    const f = fieldRef.current;
    if (!a.name || !d.name) return;
    setError(null);
    try {
      // Apply "+1 All Stats" from side toggles as boosts
      const applyAllStatsBoost = (side, sideState) => {
        if (!sideState?.isAllStats) return side;
        const boosts = { ...side.boosts };
        for (const stat of ["atk", "def", "spa", "spd", "spe"]) {
          boosts[stat] = (boosts[stat] || 0) + 1;
        }
        return { ...side, boosts };
      };
      const atkSide = applyAllStatsBoost(a, f.attackerSide);
      const defSide = applyAllStatsBoost(d, f.defenderSide);

      const hits = hitsOverridesRef.current || {};
      const crits = critOverridesRef.current || {};
      const rageFists = rageFistOverridesRef.current || {};
      const lastRespects = lastRespectsOverridesRef.current || {};

      // Calculate damage for all attacker moves
      const atkMoves = a.moves || ["", "", "", ""];
      const atkResults = await Promise.all(
        atkMoves.map(async (m, i) => {
          if (!m) return null;
          try {
            return await calculateDamage(atkSide, defSide, m, f, 1, {
              hits: hits[`attacker-${i}`],
              crit: crits[`attacker-${i}`],
              rageFistHits: rageFists[`attacker-${i}`],
              lastRespects: lastRespects[`attacker-${i}`],
            });
          } catch {
            return null;
          }
        }),
      );

      // Calculate damage for all defender moves
      const defMoves = d.moves || ["", "", "", ""];
      const defResults = await Promise.all(
        defMoves.map(async (m, i) => {
          if (!m) return null;
          try {
            return await calculateDamage(defSide, atkSide, m, f, 0, {
              hits: hits[`defender-${i}`],
              crit: crits[`defender-${i}`],
              rageFistHits: rageFists[`defender-${i}`],
              lastRespects: lastRespects[`defender-${i}`],
            });
          } catch {
            return null;
          }
        }),
      );

      setResult({
        attackerMoves: atkMoves.map((m, i) => ({ name: m, result: atkResults[i] })),
        defenderMoves: defMoves.map((m, i) => ({ name: m, result: defResults[i] })),
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
      setResult(null);
    }
  }, []); // stable — reads latest via refs

  useEffect(() => {
    if (attacker.name && defender.name && !loading) {
      doCalculate();
    }
  }, [attacker, defender, field, loading, hitsOverrides, critOverrides, rageFistOverrides, lastRespectsOverrides]); // doCalculate is stable so excluded

  const openSearch = useCallback(
    (part) => {
      setSearchPart(part);
      if (!searchTarget) setSearchTarget("attacker");
    },
    [searchTarget],
  );

  const clearSearch = useCallback(() => {
    setSearchPart(null);
    setSearchTarget(null);
  }, []);

  const advanceSearch = useCallback((part, slot) => {
    setSearchPart(part);
    if (slot !== undefined) setMoveSlot(slot);
  }, []);

  // The side currently being searched
  const activeSide = searchTarget === "attacker" ? attacker : defender;
  const setActiveSide = searchTarget === "attacker" ? setAttacker : setDefender;

  if (loading) return <div className="loading-text">Loading damage calculator...</div>;

  return (
    <div className="calculator-page">
      <ResultDisplay
        result={result}
        attacker={attacker}
        defender={defender}
        attackerMon={attacker.name ? pokedexMap[attacker.name.toLowerCase()] : null}
        defenderMon={defender.name ? pokedexMap[defender.name.toLowerCase()] : null}
        field={field}
        itemsMap={itemsMap}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        hitsOverrides={hitsOverrides}
        onChangeHits={(side, idx, val) =>
          setHitsOverrides((prev) => ({ ...prev, [`${side}-${idx}`]: val }))
        }
        critOverrides={critOverrides}
        onChangeCrit={(side, idx, val) =>
          setCritOverrides((prev) => ({ ...prev, [`${side}-${idx}`]: val }))
        }
        rageFistOverrides={rageFistOverrides}
        onChangeRageFistHits={(side, idx, val) =>
          setRageFistOverrides((prev) => ({ ...prev, [`${side}-${idx}`]: val }))
        }
        lastRespectsOverrides={lastRespectsOverrides}
        onChangeLastRespects={(side, idx, val) =>
          setLastRespectsOverrides((prev) => ({ ...prev, [`${side}-${idx}`]: val }))
        }
      />
      {error && <div className="error-text">{error}</div>}

      <div className="calc-view-toggle">
        <button className={`calc-view-btn ${view === "l" ? "calc-view-btn--active" : ""}`} onClick={() => setView("l")}>
          Left
        </button>
        <button className={`calc-view-btn ${view === "f" ? "calc-view-btn--active" : ""}`} onClick={() => setView("f")}>
          Field
        </button>
        <button className={`calc-view-btn ${view === "r" ? "calc-view-btn--active" : ""}`} onClick={() => setView("r")}>
          Right
        </button>
      </div>

      <div className="calc-layout" data-view={view}>
        <div className="calc-field-bar">
          <FieldOptions
            field={field}
            onChange={setField}
            regulation={regulation}
            onRegulationChange={setRegulation}
          />
        </div>
        <CalcPokemonSide
          label="Left"
          side={attacker}
          onChange={setAttacker}
          onOpenSearch={(part, slot) => {
            setSearchTarget("attacker");
            setSearchPart(part);
            if (slot !== undefined) setMoveSlot(slot);
          }}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
          field={field}
        />
        <CalcPokemonSide
          label="Right"
          side={defender}
          onChange={setDefender}
          onOpenSearch={(part, slot) => {
            setSearchTarget("defender");
            setSearchPart(part);
            if (slot !== undefined) setMoveSlot(slot);
          }}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
          field={field}
        />
      </div>

      <SharedSearchPanel
        searchPart={searchPart}
        target={searchTarget}
        moveSlot={moveSlot}
        side={activeSide}
        onChange={setActiveSide}
        allPokemon={allPokemon}
        pokedexMap={pokedexMap}
        onClear={clearSearch}
        onAdvance={advanceSearch}
        regulation={regulation}
        field={field}
      />
    </div>
  );
}
