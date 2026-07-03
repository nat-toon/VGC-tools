import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { calculateDamage, getData } from "../lib/damage-calc.js";
import { loadPokedex } from "../lib/pokedex.js";
import { STAT_CONFIG, NATURES, NATURE_MAP } from "../lib/constants.js";
import { calcFinalStatsSP, SP_MAX_TOTAL, SP_MAX_PER_STAT, DEFAULT_LEVEL } from "../lib/stats.js";
import { getLargeSprite, getIcon, getItemIcon } from "../lib/sprite.js";
import { getMove, getAllMoves, loadMoves } from "../lib/moves.js";
import { getLearnset, loadLearnsets } from "../lib/learnsets.js";
import { getAllItems } from "../lib/items.js";
import { getAbilityByName, getAllAbilities } from "../lib/abilities.js";
import { useRowHeight } from "../lib/hooks.js";
import Sprite from "../components/Sprite.jsx";
import Icon from "../components/Icon.jsx";
import TypeIcon from "../components/TypeIcon.jsx";
import SearchInput from "../components/SearchInput.jsx";
import FilterChipsBar from "../components/FilterChipsBar.jsx";
import VirtualTable from "../components/VirtualTable.jsx";
import Pokedex from "../components/Pokedex.jsx";
import GlobalSearch from "../components/GlobalSearch.jsx";
import MovesList from "../components/MovesList.jsx";
import ItemGridRow from "../components/rows/ItemGridRow.jsx";

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE" };

const WEATHER_OPTIONS = ["", "Sun", "Rain", "Sand", "Hail", "Snow", "Harsh Sunshine", "Heavy Rain", "Strong Winds"];
const TERRAIN_OPTIONS = ["", "Electric", "Grassy", "Psychic", "Misty"];
const STATUS_OPTIONS = ["", "brn", "frz", "par", "psn", "slp", "tox"];

const emptySide = {
  name: "",
  moves: ["", "", "", ""],
  level: 50,
  nature: "Serious",
  teraType: undefined,
  ability: undefined,
  item: undefined,
  status: undefined,
  abilityOn: false,
  sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  boosts: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
};

/* ---------- Sprite ---------- */

function SpriteView({ mon }) {
  const sprite = useMemo(() => (mon ? getLargeSprite(mon) : null), [mon]);
  const icon = useMemo(() => (mon ? getIcon(mon) : null), [mon]);
  const [failed, setFailed] = useState(false);
  if (!mon) return null;
  if (failed || !sprite) return <span className="pd-pokemon-icon" style={icon?.css} />;
  return <Sprite sprite={sprite} className="calc-sprite" alt={mon.name} loading="lazy" onError={() => setFailed(true)} />;
}

/* ---------- Stats panel ---------- */

function CalcStatsPanel({ side, mon, onChange }) {
  const sp = side.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
  const natureHintsRef = useRef({});

  const totalSP = useMemo(() => Object.values(sp).reduce((s, v) => s + v, 0), [sp]);
  const remainingSP = SP_MAX_TOTAL - totalSP;

  const finalStats = useMemo(
    () => (mon ? calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level || DEFAULT_LEVEL) : null),
    [mon, sp, natureObj, side.level],
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
              <input className="calc-ev-input" type="number" inputMode="numeric" value={spVal}
                onChange={(e) => handleSpChange(key, e.target.value)} min={0} max={SP_MAX_PER_STAT} title="SP" />
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
              <button className="calc-boost-btn" disabled={(side.boosts?.[key] ?? 0) <= -6}
                onClick={() => {
                  const b = { ...side.boosts, [key]: Math.max(-6, (side.boosts?.[key] ?? 0) - 1) };
                  onChange({ ...side, boosts: b });
                }}>-</button>
              <span className={`calc-boost-val ${(side.boosts?.[key] ?? 0) > 0 ? "calc-boost--plus" : (side.boosts?.[key] ?? 0) < 0 ? "calc-boost--minus" : ""}`}>
                {(side.boosts?.[key] ?? 0) > 0 ? `+${side.boosts?.[key]}` : (side.boosts?.[key] ?? 0)}
              </span>
              <button className="calc-boost-btn" disabled={(side.boosts?.[key] ?? 0) >= 6}
                onClick={() => {
                  const b = { ...side.boosts, [key]: Math.min(6, (side.boosts?.[key] ?? 0) + 1) };
                  onChange({ ...side, boosts: b });
                }}>+</button>
            </div>
            <span className="se-stats-final">{value}</span>
            {hint && key !== "hp" && (
              <span className={`se-stats-sp-hint ${hint === "+" ? "se-stats-sp-hint--plus" : "se-stats-sp-hint--minus"}`}>
                {hint}
              </span>
            )}
          </div>
        );
      })}
      <div className="se-stats-bottom">
        <label className="se-stats-nature-row">
          <span className="se-stats-nature-label">Nature:</span>
          <select className="se-stats-nature-select" value={side.nature || "Serious"}
            onChange={handleNatureChange}>
            {NATURES.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}{n.plus ? ` (+${n.plus.toUpperCase()}, -${n.minus.toUpperCase()})` : ""}
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

/* ---------- Side card ---------- */

function CalcPokemonSide({ label, side, onChange, onOpenSearch, pokedexMap, itemsMap }) {
  const mon = side.name ? pokedexMap[side.name.toLowerCase()] : null;
  const itemData = side.item ? itemsMap[side.item] : null;
  const itemIcon = itemData ? getItemIcon(itemData.spritenum) : null;
  const natureObj = side.nature ? NATURE_MAP[side.nature] : null;

  return (
    <div className="calc-side">
      <div className="calc-side-header">
        <h3>{label}</h3>
      </div>

      {/* Display card */}
      <div className="calc-display-card">
        <div className="calc-display-main" onClick={() => onOpenSearch("pokemon")}>
          {mon ? (
            <div className="calc-display-inner">
              <div className="calc-sprite-wrap"><SpriteView mon={mon} /></div>
              <div className="calc-display-name">{mon.name}</div>
              <div className="calc-display-types">
                {(mon.types || []).map((t) => <TypeIcon key={t} type={t} size={18} />)}
              </div>
            </div>
          ) : (
            <span className="se-part-label">Select Pokemon</span>
          )}
        </div>
      </div>

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
        <div className="calc-moves-grid">
          {(side.moves || ["", "", "", ""]).map((moveName, i) => (
            <button key={i} className="calc-meta-btn calc-move-btn" onClick={() => onOpenSearch("move", i)}>
              {moveName ? (
                <span className="calc-move-item">
                  {(() => { const mv = getMove(moveName); return mv?.type ? <TypeIcon type={mv.type} size={16} /> : null; })()}
                  <span className="se-part-value">{(() => { const mv = getMove(moveName); return mv?.name || moveName; })()}</span>
                </span>
              ) : (
                <span className="se-part-label">Move {i + 1}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="calc-stats-section">
        <div className="se-section-header">Stats</div>
        <button
          className={`calc-meta-btn calc-stats-btn`}
          onClick={() => onOpenSearch("stats")}
        >
          {mon ? (
            <div className="calc-stats-preview">
              {(() => {
                const sp = side.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
                const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
                const finalStats = calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level || DEFAULT_LEVEL);
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
                      <span className={`calc-stat-hint ${hint === "+" ? "calc-boost--plus" : hint === "-" ? "calc-boost--minus" : ""}`}>
                        {hint || ""}
                      </span>
                      <div className="calc-stat-bar-mini">
                        <div className="calc-stat-fill-mini" style={{ width: pct + "%", background: `hsl(${hue},85%,45%)` }} />
                      </div>
                      <span className="calc-stat-preview-val">{val}</span>
                      <span className={`calc-stat-boost ${boost > 0 ? "calc-boost--plus" : boost < 0 ? "calc-boost--minus" : ""}`}>
                        {boost > 0 ? `+${boost}` : boost < 0 ? boost : ""}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <span className="se-part-value"></span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------- Shared search panels ---------- */

function ItemSearchPanel({ onSelect, selectedKey }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const rowHeight = useRowHeight();

  useEffect(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);
  const allItems = useMemo(() => getAllItems().map((i) => ({ ...i, _lcName: i.name.toLowerCase() })), []);
  const filtered = useMemo(() => {
    if (!search) return allItems;
    const q = search.toLowerCase();
    return allItems.filter((i) => i._lcName.includes(q));
  }, [allItems, search]);
  const getKey = useCallback((i) => i._key, []);
  const renderItem = useCallback((i) => <ItemGridRow i={i} />, []);

  const headers = useMemo(() => [
    { nosort: true },
    { nosort: true },
    { nosort: true, label: "Name" },
    { nosort: true, label: "Description" },
  ], []);

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
              onClick={() => { onChange({ ...side, ability: ab.name }); setSearch(""); onAdvance("move"); }}
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
              onClick={() => { onChange({ ...side, ability: undefined }); setSearch(""); }}
            >Clear</button>
          )}
        </div>
      </div>
    </>
  );
}

function MoveSearchPanel({ side, onChange, moveSlot, moveFilters, setMoveFilters, pokedexMap }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const mon = side.name ? pokedexMap[side.name.toLowerCase()] : null;
  const legalMoves = useMemo(() => mon ? getLearnset(mon.key || mon.name?.toLowerCase()) : null, [mon]);

  useEffect(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);

  const addFilter = useCallback((category, value) => {
    setMoveFilters((f) => ({ ...f, [category]: [...f[category], value] }));
  }, [setMoveFilters]);

  const removeFilter = useCallback((category, value) => {
    setMoveFilters((f) => ({ ...f, [category]: f[category].filter((v) => v !== value) }));
  }, [setMoveFilters]);

  const handleMoveSelect = useCallback((moveKey) => {
    const moves = [...(side.moves || ["", "", "", ""])];
    moves[moveSlot] = moveKey;
    onChange({ ...side, moves });
    setSearch("");
    setMoveFilters({ categories: [], moveTypes: [] });
  }, [side, onChange, moveSlot, setMoveFilters]);

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
          regulation="all"
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

function SharedSearchPanel({ searchPart, target, moveSlot, side, onChange, allPokemon, pokedexMap, onClear, onAdvance }) {
  const mon = side.name ? pokedexMap[side.name.toLowerCase()] : null;
  const [moveFilters, setMoveFilters] = useState({ categories: [], moveTypes: [] });

  // Reset move filters when switching to move search
  useEffect(() => {
    if (searchPart === "move") setMoveFilters({ categories: [], moveTypes: [] });
  }, [searchPart]);

  if (!searchPart || !target) return null;

  return (
    <div className="calc-shared-search">

      {searchPart === "pokemon" && (
        <PokemonSearchPanelInline target={target} allPokemon={allPokemon} side={side} onChange={onChange} onAdvance={onAdvance} />
      )}
      {searchPart === "item" && (
        <ItemSearchPanel onSelect={(key) => { onChange({ ...side, item: key }); onAdvance("ability"); }} selectedKey={side.item} />
      )}
      {searchPart === "ability" && mon && (
        <AbilitySearchPanel mon={mon} side={side} onChange={onChange} selectedKey={side.ability} onAdvance={onAdvance} />
      )}
      {searchPart === "move" && (
        <MoveSearchPanel side={side} onChange={onChange} moveSlot={moveSlot} moveFilters={moveFilters} setMoveFilters={setMoveFilters} pokedexMap={pokedexMap} />
      )}
      {searchPart === "stats" && mon && (
        <CalcStatsPanel side={side} mon={mon} onChange={onChange} />
      )}
    </div>
  );
}

function PokemonSearchPanelInline({ target, allPokemon, side, onChange, onAdvance }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ types: [], moves: [], abilities: [] });
  const searchRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => searchRef.current?.focus());
  }, []);

  const handleSelect = useCallback((p) => {
    onChange({
      ...emptySide,
      name: p.name,
      level: side.level,
      nature: side.nature,
    });
    onAdvance("item");
  }, [side, onChange, onAdvance]);

  const addFilter = useCallback((category, value) => {
    setFilters((f) => f[category].includes(value) ? f : { ...f, [category]: [...f[category], value] });
  }, []);

  const removeFilter = useCallback((category, value) => {
    setFilters((f) => ({ ...f, [category]: f[category].filter((v) => v !== value) }));
  }, []);

  const chipEntries = useMemo(() => [
    ...filters.types.map((t) => ({ category: "types", value: t })),
    ...filters.moves.map((m) => ({ category: "moves", value: m })),
    ...filters.abilities.map((a) => ({ category: "abilities", value: a })),
  ], [filters]);

  return (
    <>
      <div className="calc-pokemon-search-input-row">
        <SearchInput ref={searchRef} className="input" value={search} onChange={setSearch} />
      </div>
      <FilterChipsBar entries={chipEntries} onRemove={removeFilter} onClear={() => setFilters({ types: [], moves: [], abilities: [] })} />
      <div className="calc-pokemon-search-results">
        {search.trim() ? (
          <GlobalSearch
            allPokemon={allPokemon}
            regulation="all"
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
            regulation="all"
            search=""
            filters={filters.types.length > 0 || filters.moves.length > 0 || filters.abilities.length > 0 ? filters : undefined}
            onPokemonSelect={handleSelect}
          />
        )}
      </div>
    </>
  );
}

/* ---------- Result + Field ---------- */

function ResultDisplay({ result }) {
  if (!result) return null;
  return (
    <div className="result-display">
      <h3>Result</h3>
      <div className="result-damage">
        <span className="damage-range">{result.min} - {result.max}</span>
      </div>
      <div className="result-desc">{result.desc}</div>
      {result.kochance?.text && <div className="result-ko">KO Chance: {result.kochance.text}</div>}
    </div>
  );
}

function FieldOptions({ field, onChange }) {
  return (
    <div className="field-options">
      <h3>Field</h3>
      <div className="field-row inline">
        <label>Weather</label>
        <select value={field.weather || ""} onChange={(e) => onChange({ ...field, weather: e.target.value || undefined })}>
          {WEATHER_OPTIONS.map((w) => <option key={w} value={w}>{w || "None"}</option>)}
        </select>
        <label>Terrain</label>
        <select value={field.terrain || ""} onChange={(e) => onChange({ ...field, terrain: e.target.value || undefined })}>
          {TERRAIN_OPTIONS.map((t) => <option key={t} value={t}>{t || "None"}</option>)}
        </select>
        <label>Game Type</label>
        <select value={field.gameType} onChange={(e) => onChange({ ...field, gameType: e.target.value })}>
          <option value="Singles">Singles</option>
          <option value="Doubles">Doubles</option>
        </select>
      </div>
      <div className="field-row inline">
        <label>Gravity</label>
        <input type="checkbox" checked={!!field.isGravity} onChange={(e) => onChange({ ...field, isGravity: e.target.checked })} />
        <label>Magic Room</label>
        <input type="checkbox" checked={!!field.isMagicRoom} onChange={(e) => onChange({ ...field, isMagicRoom: e.target.checked })} />
        <label>Wonder Room</label>
        <input type="checkbox" checked={!!field.isWonderRoom} onChange={(e) => onChange({ ...field, isWonderRoom: e.target.checked })} />
      </div>
    </div>
  );
}

/* ---------- Main page ---------- */

export default function CalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [allPokemon, setAllPokemon] = useState([]);
  const [pokedexMap, setPokedexMap] = useState({});
  const [itemsMap, setItemsMap] = useState({});

  const [attacker, setAttacker] = useState({ ...emptySide });
  const [defender, setDefender] = useState({ ...emptySide });

  const [field, setField] = useState({
    gameType: "Singles",
    weather: undefined,
    terrain: undefined,
    isGravity: false,
    isMagicRoom: false,
    isWonderRoom: false,
  });

  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Shared search state: which side + which part + which move slot
  const [searchTarget, setSearchTarget] = useState(null); // "attacker" | "defender"
  const [searchPart, setSearchPart] = useState(null);     // "pokemon" | "item" | "ability" | "move"
  const [moveSlot, setMoveSlot] = useState(0);            // which move slot (0-3)

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pokemon, calcData] = await Promise.all([loadPokedex(), getData(), loadMoves(), loadLearnsets()]);
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
        if (!cancelled) { setError("Failed to load damage calculator: " + err.message); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const doCalculate = useCallback(async () => {
    if (!attacker.name || !defender.name) return;
    const activeMove = (attacker.moves || []).find((m) => m);
    if (!activeMove) return;
    setCalculating(true);
    setError(null);
    try {
      const res = await calculateDamage(attacker, defender, activeMove, field);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setResult(null);
    } finally {
      setCalculating(false);
    }
  }, [attacker, defender, field]);

  useEffect(() => {
    const activeMove = (attacker.moves || []).find((m) => m);
    if (attacker.name && defender.name && activeMove && !loading) {
      const timer = setTimeout(doCalculate, 300);
      return () => clearTimeout(timer);
    }
  }, [attacker, defender, field, loading, doCalculate]);

  const openSearch = useCallback((part) => {
    setSearchPart(part);
    if (!searchTarget) setSearchTarget("attacker");
  }, [searchTarget]);

  const clearSearch = useCallback(() => {
    setSearchPart(null);
    setSearchTarget(null);
  }, []);

  const advanceSearch = useCallback((part) => {
    setSearchPart(part);
  }, []);

  // The side currently being searched
  const activeSide = searchTarget === "attacker" ? attacker : defender;
  const setActiveSide = searchTarget === "attacker" ? setAttacker : setDefender;

  if (loading) return <div className="loading-text">Loading damage calculator...</div>;

  return (
    <div className="calculator-page">
      <ResultDisplay result={result} />
      {calculating && <div className="calculating">Calculating...</div>}
      {error && <div className="error-text">{error}</div>}

      <div className="calc-layout">
        <CalcPokemonSide
          label="Attacker"
          side={attacker}
          onChange={setAttacker}
          onOpenSearch={(part, slot) => { setSearchTarget("attacker"); setSearchPart(part); if (slot !== undefined) setMoveSlot(slot); }}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
        />
        <div className="calc-middle">
          <FieldOptions field={field} onChange={setField} />
        </div>
        <CalcPokemonSide
          label="Defender"
          side={defender}
          onChange={setDefender}
          onOpenSearch={(part, slot) => { setSearchTarget("defender"); setSearchPart(part); if (slot !== undefined) setMoveSlot(slot); }}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
        />
      </div>

      {/* Tab bar to switch between attacker/defender search */}
      {searchPart && (
        <div className="calc-search-tabs">
          <button
            className={`calc-search-tab ${searchTarget === "attacker" ? "calc-search-tab--active" : ""}`}
            onClick={() => setSearchTarget("attacker")}
          >Attacker</button>
          <button
            className={`calc-search-tab ${searchTarget === "defender" ? "calc-search-tab--active" : ""}`}
            onClick={() => setSearchTarget("defender")}
          >Defender</button>
        </div>
      )}

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
      />
    </div>
  );
}
