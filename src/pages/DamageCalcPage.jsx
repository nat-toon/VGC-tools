import { Suspense, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import TypeIcon from "../components/TypeIcon.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import SearchInput from "../components/SearchInput.jsx";
import VirtualTable from "../components/VirtualTable.jsx";
import Pokedex from "../components/Pokedex.jsx";
import GlobalSearch from "../components/GlobalSearch.jsx";
import MovesList from "../components/MovesList.jsx";
import Sprite from "../components/Sprite.jsx";
import { getLargeSprite, getIcon, getItemIcon } from "../lib/sprite.js";
import { getMove } from "../lib/moves.js";
import { getLearnset } from "../lib/learnsets.js";
import { getAllItems, isItemLegal } from "../lib/items.js";
import { getAllAbilities, getAbilityByName, isAbilityLegal } from "../lib/abilities.js";
import { loadPokedex } from "../lib/pokedex.js";
import { loadMoves } from "../lib/moves.js";
import { STAT_CONFIG, NATURES, NATURE_MAP, CATEGORY_COLORS } from "../lib/constants.js";
import { calcFinalStatsSP, statRangeSP, SP_MAX_TOTAL, SP_MAX_PER_STAT, DEFAULT_LEVEL } from "../lib/stats.js";
import { calcAllDamage } from "../lib/damage.js";
import { REGULATIONS, DEFAULT_REG } from "../lib/regulations.js";
import { REG_KEY } from "../lib/constants.js";
import { useRowHeight } from "../lib/hooks.js";
import { buildAliasSet, matchesAlias } from "../lib/utils.js";

const EMPTY_SP = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const WEATHER_OPTIONS = ["", "Sun", "Rain", "Sand", "Snow"];
const TERRAIN_OPTIONS = ["", "Electric", "Grassy", "Psychic", "Misty"];

function defaultSide() {
  return {
    pokemon: null,
    moves: [null, null, null, null],
    activeMoveIdx: null,
    item: null,
    ability: null,
    nature: null,
    sp: { ...EMPTY_SP },
    boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    level: DEFAULT_LEVEL,
  };
}

/* ─── Sprite view ─── */
const SideSprite = memo(function SideSprite({ mon, onFailed }) {
  const sprite = useMemo(() => (mon ? getLargeSprite(mon) : null), [mon]);
  const icon = useMemo(() => (mon ? getIcon(mon) : null), [mon]);
  if (!mon) return null;
  if (!sprite) return <span className="pd-pokemon-icon" style={icon?.css} />;
  return <Sprite sprite={sprite} className="calc-sprite-img" alt={mon.name} loading="lazy" onError={onFailed} />;
});

/* ─── One side panel ─── */
function SidePanel({ label, side, pokedexMap, itemsMap, regulation, onOpenPicker, activePicker, onUpdate }) {
  const mon = side.pokemon ? pokedexMap[side.pokemon.toLowerCase()] : null;
  const [failed, setFailed] = useState(false);
  const sp = side.sp || EMPTY_SP;
  const natureObj = side.nature ? NATURE_MAP[side.nature] : null;
  const natureHintsRef = useRef({});

  const totalSP = useMemo(() => Object.values(sp).reduce((s, v) => s + v, 0), [sp]);
  const remainingSP = SP_MAX_TOTAL - totalSP;

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
        onUpdate({ sp: newSp, nature: newNature });
      }
    },
    [sp, side.nature, onUpdate],
  );

  const handleSpSlider = useCallback(
    (key, val) => {
      const v = Number(val);
      const newSp = { ...sp, [key]: v };
      if (Object.values(newSp).reduce((s, x) => s + x, 0) <= SP_MAX_TOTAL) {
        onUpdate({ sp: newSp });
      }
    },
    [sp, onUpdate],
  );

  const finalStats = useMemo(
    () => (mon ? calcFinalStatsSP(mon.baseStats, sp, natureObj, side.level) : null),
    [mon, sp, natureObj, side.level],
  );

  return (
    <div className="calc-side">
      <div className="calc-side-header">
        <span className="calc-side-label">{label}</span>
      </div>

      {/* Pokemon display */}
      <button
        className={`calc-field-btn calc-pokemon-btn ${activePicker?.type === "pokemon" && activePicker?.side === label ? "calc-field-btn--active" : ""}`}
        onClick={() => onOpenPicker("pokemon", label)}
      >
        {mon ? (
          <div className="calc-pokemon-display">
            <div className="calc-sprite-wrap">
              <SideSprite mon={mon} onFailed={() => setFailed(true)} />
            </div>
            <div className="calc-pokemon-info">
              <span className="calc-pokemon-name">{mon.name}</span>
              <div className="calc-pokemon-types">
                {(mon.types || []).map((t) => (
                  <TypeIcon key={t} type={t} size={16} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <span className="calc-field-placeholder">Select Pokemon</span>
        )}
      </button>

      {/* Item */}
      <button
        className={`calc-field-btn ${activePicker?.type === "item" && activePicker?.side === label ? "calc-field-btn--active" : ""}`}
        onClick={() => onOpenPicker("item", label)}
      >
        <span className="calc-field-label">Item</span>
        {(() => {
          const itemData = itemsMap && side.item ? itemsMap[side.item] : null;
          const icon = itemData ? getItemIcon(itemData.spritenum) : null;
          return (
            <span className="calc-field-value">
              {icon ? <span className="calc-item-icon" style={icon.css} /> : null}
              {itemData ? itemData.name : (side.item || "—")}
            </span>
          );
        })()}
      </button>

      {/* Ability */}
      <button
        className={`calc-field-btn ${activePicker?.type === "ability" && activePicker?.side === label ? "calc-field-btn--active" : ""}`}
        onClick={() => onOpenPicker("ability", label)}
      >
        <span className="calc-field-label">Ability</span>
        <span className="calc-field-value">{side.ability || "—"}</span>
      </button>

      {/* Nature */}
      <button
        className={`calc-field-btn ${activePicker?.type === "nature" && activePicker?.side === label ? "calc-field-btn--active" : ""}`}
        onClick={() => onOpenPicker("nature", label)}
      >
        <span className="calc-field-label">Nature</span>
        <span className="calc-field-value">
          {side.nature || "—"}
          {natureObj?.plus ? ` (+${natureObj.plus.toUpperCase()}, -${natureObj.minus.toUpperCase()})` : ""}
        </span>
      </button>

      {/* SP Stats */}
      {mon && (
        <div className="calc-stats">
          {STAT_CONFIG.map(({ key }) => {
            const base = mon.baseStats?.[key] ?? 0;
            const val = finalStats?.[key] ?? 0;
            const [min, max] = statRangeSP(key === "hp");
            const range = max - min || 1;
            const pct = Math.max(0, Math.min(100, ((val - min) / range) * 100));
            const hue = Math.min(360, Math.floor((val * 180) / max));
            const typeHint = natureHintsRef.current[key];
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
            const hint = typeHint || natureHint;
            return (
              <div key={key} className="calc-stat-row">
                <span className="calc-stat-name">{key.toUpperCase()}</span>
                <span className="calc-stat-base">{base}</span>
                <div className="calc-stat-bar">
                  <div className="calc-stat-fill" style={{ width: pct + "%", background: `hsl(${hue},85%,45%)` }} />
                </div>
                <div className="calc-stat-sp-wrap">
                  <input
                    className="calc-stat-sp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={sp[key] ?? 0}
                    onChange={(e) => handleSpChange(key, e.target.value)}
                  />
                  {hint && (
                    <span
                      className={`calc-stat-sp-hint ${hint === "+" ? "calc-stat-sp-hint--plus" : "calc-stat-sp-hint--minus"}`}
                    >
                      {hint}
                    </span>
                  )}
                </div>
                <input
                  className="calc-stat-slider"
                  type="range"
                  min={0}
                  max={SP_MAX_PER_STAT}
                  value={sp[key] ?? 0}
                  onChange={(e) => handleSpSlider(key, e.target.value)}
                />
                <span className="calc-stat-final">{val}</span>
                {key !== "hp" ? (
                  <span className="calc-stat-boost">
                    <button
                      className="calc-stat-boost-btn"
                      disabled={(side.boosts?.[key] ?? 0) <= -6}
                      onClick={() => onUpdate({ boosts: { ...side.boosts, [key]: Math.max(-6, (side.boosts?.[key] ?? 0) - 1) } })}
                    >−</button>
                    <span className={`calc-stat-boost-val ${(side.boosts?.[key] ?? 0) > 0 ? "calc-stat-boost-val--plus" : (side.boosts?.[key] ?? 0) < 0 ? "calc-stat-boost-val--minus" : ""}`}>
                      {(side.boosts?.[key] ?? 0) > 0 ? `+${side.boosts?.[key] ?? 0}` : (side.boosts?.[key] ?? 0)}
                    </span>
                    <button
                      className="calc-stat-boost-btn"
                      disabled={(side.boosts?.[key] ?? 0) >= 6}
                      onClick={() => onUpdate({ boosts: { ...side.boosts, [key]: Math.min(6, (side.boosts?.[key] ?? 0) + 1) } })}
                    >+</button>
                  </span>
                ) : (
                  <span className="calc-stat-boost" />
                )}
              </div>
            );
          })}
          <div className="calc-stats-bottom">
            <span className="calc-stats-remaining">
              Remaining: <strong>{remainingSP}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Moves */}
      <div className="calc-moves">
        {(side.moves || [null, null, null, null]).map((m, i) => {
          const move = m ? getMove(m) : null;
          const isActive = side.activeMoveIdx === i;
          return (
            <div key={i} className={`calc-move-row ${isActive ? "calc-move-row--active" : ""}`}>
              <button className="calc-move-btn" onClick={() => onUpdate({ activeMoveIdx: i })}>
                {move ? (
                  <>
                    <TypeIcon type={move.type} size={14} />
                    <span className="calc-move-name">{move.name}</span>
                    <span className="calc-move-bp">{move.basePower}</span>
                  </>
                ) : (
                  <span className="calc-field-placeholder">Move {i + 1}</span>
                )}
              </button>
              <button
                className="calc-move-edit"
                onClick={() => onOpenPicker("move", label, i)}
                aria-label={`Edit move ${i + 1}`}
              >
                ✎
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shared picker area ─── */
function PickerArea({ picker, side, sideData, pokedexMap, allPokemon, regulation, items, onSelect, onClose }) {
  const searchRef = useRef(null);
  const [search, setSearch] = useState("");
  const [filterEntries, setFilterEntries] = useState([]);
  const [moveFilters, setMoveFilters] = useState({ categories: [], moveTypes: [] });
  const rowHeight = useRowHeight();

  useEffect(() => {
    setSearch("");
    setFilterEntries([]);
    setMoveFilters({ categories: [], moveTypes: [] });
    if (picker) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [picker?.type, picker?.side, picker?.slot]);

  const filters = useMemo(
    () => ({
      types: filterEntries.filter((e) => e.category === "types").map((e) => e.value),
      moves: filterEntries.filter((e) => e.category === "moves").map((e) => e.value),
      abilities: filterEntries.filter((e) => e.category === "abilities").map((e) => e.value),
    }),
    [filterEntries],
  );

  const addFilter = useCallback((cat, val) => {
    setFilterEntries((prev) => {
      if (prev.some((e) => e.category === cat && e.value === val)) return prev;
      return [...prev, { category: cat, value: val }];
    });
  }, []);

  const removeFilter = useCallback((cat, val) => {
    setFilterEntries((prev) => prev.filter((e) => !(e.category === cat && e.value === val)));
  }, []);

  const clearFilters = useCallback(() => setFilterEntries([]), []);

  const addMoveFilter = useCallback((cat, val) => {
    setMoveFilters((f) => ({ ...f, [cat]: [...f[cat], val] }));
  }, []);

  const removeMoveFilter = useCallback((cat, val) => {
    setMoveFilters((f) => ({ ...f, [cat]: f[cat].filter((v) => v !== val) }));
  }, []);

  const clearMoveFilters = useCallback(() => {
    setMoveFilters({ categories: [], moveTypes: [] });
  }, []);

  /* All hooks must be called unconditionally before any early returns */
  const currentMon = sideData?.pokemon ? pokedexMap[sideData.pokemon.toLowerCase()] : null;

  const legalMoves = useMemo(
    () => (currentMon ? getLearnset(currentMon.key || currentMon.name?.toLowerCase(), regulation) : null),
    [currentMon, regulation],
  );

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => !q || i.name.toLowerCase().includes(q));
  }, [items, search]);

  const abilities = useMemo(() => {
    const list = currentMon?.abilities || [];
    const q = search.toLowerCase();
    return list.filter((ab) => !q || ab.name.toLowerCase().includes(q));
  }, [currentMon, search]);

  const filteredNatures = useMemo(() => {
    const q = search.toLowerCase();
    return NATURES.filter((n) => !q || n.name.toLowerCase().includes(q));
  }, [search]);

  if (!picker) return null;

  const title = {
    pokemon: `Select Pokemon for ${side}`,
    item: `Select Item for ${side}`,
    ability: `Select Ability for ${side}`,
    nature: `Select Nature for ${side}`,
    move: `Select Move ${picker.slot != null ? picker.slot + 1 : ""} for ${side}`,
  }[picker.type];

  return (
    <div className="calc-picker">
      <div className="calc-picker-header">
        <span className="calc-picker-title">{title}</span>
        <button className="calc-picker-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="calc-picker-search">
        <SearchInput ref={searchRef} className="input" value={search} onChange={setSearch} />
      </div>

      {/* Pokemon picker */}
      {picker.type === "pokemon" && (
        <>
          {filterEntries.length > 0 && (
            <div className="filter-bar">
              {filterEntries.map(({ category, value }) => {
                if (category === "types") {
                  return (
                    <span
                      key={`t-${value}`}
                      className="filter-chip filter-chip-type"
                      onClick={() => removeFilter("types", value)}
                      role="button"
                      tabIndex={0}
                    >
                      <TypeIcon type={value} size={16} />
                    </span>
                  );
                }
                return (
                  <span
                    key={`${category}-${value}`}
                    className="filter-chip"
                    onClick={() => removeFilter(category, value)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="filter-chip-label">{value}</span>
                  </span>
                );
              })}
              <button className="filter-clear-all" onClick={clearFilters}>
                Clear all
              </button>
            </div>
          )}
          <div className="calc-picker-list">
            <Suspense fallback={<div className="loading-text">Loading…</div>}>
              {search.trim() ? (
                <GlobalSearch
                  allPokemon={allPokemon}
                  regulation={regulation}
                  search={search}
                  filters={filters}
                  addFilter={addFilter}
                  removeFilter={removeFilter}
                  setSearch={setSearch}
                  onPokemonSelect={(p) => onSelect("pokemon", p.name)}
                />
              ) : (
                <Pokedex
                  allPokemon={allPokemon}
                  regulation={regulation}
                  search=""
                  filters={
                    filters.types.length > 0 || filters.moves.length > 0 || filters.abilities.length > 0
                      ? filters
                      : undefined
                  }
                  onPokemonSelect={(p) => onSelect("pokemon", p.name)}
                />
              )}
            </Suspense>
          </div>
        </>
      )}

      {/* Item picker */}
      {picker.type === "item" && (
        <div className="calc-picker-list">
          <VirtualTable
            headers={[]}
            gridClass="items-grid"
            items={filteredItems}
            rowHeight={rowHeight}
            renderItem={(i) => <ItemRow i={i} />}
            selectedKey={null}
            getKey={(i) => i._key}
            onSelect={(i) => onSelect("item", i._key)}
            emptyText="No items match."
          />
        </div>
      )}

      {/* Ability picker */}
      {picker.type === "ability" && (
        <div className="calc-picker-list calc-ability-list">
          {abilities.map((ab) => {
            const data = getAbilityByName(ab.name);
            return (
              <button
                key={ab.name}
                className={`calc-ability-option ${sideData?.ability === ab.name ? "calc-ability-option--active" : ""}`}
                onClick={() => onSelect("ability", ab.name)}
              >
                <div className="calc-ability-header">
                  <span className="calc-ability-name">{ab.name}</span>
                  {ab.hidden && <span className="calc-ability-hidden">Hidden</span>}
                </div>
                {data && <div className="calc-ability-desc">{data.shortDesc || data.desc}</div>}
              </button>
            );
          })}
          {abilities.length === 0 && <div className="calc-picker-empty">Select a Pokemon first.</div>}
        </div>
      )}

      {/* Nature picker */}
      {picker.type === "nature" && (
        <div className="calc-picker-list calc-nature-list">
          {filteredNatures.map((n) => (
            <button
              key={n.name}
              className={`calc-nature-option ${sideData?.nature === n.name ? "calc-nature-option--active" : ""}`}
              onClick={() => onSelect("nature", n.name)}
            >
              <span className="calc-nature-name">{n.name}</span>
              {n.plus && (
                <span className="calc-nature-bonus">
                  +{n.plus.toUpperCase()} / -{n.minus.toUpperCase()}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Move picker */}
      {picker.type === "move" && (
        <>
          {(moveFilters.categories.length > 0 || moveFilters.moveTypes.length > 0) && (
            <div className="filter-bar">
              {moveFilters.categories.map((c) => (
                <span
                  key={`cat-${c}`}
                  className="filter-chip filter-chip-category"
                  onClick={() => removeMoveFilter("categories", c)}
                  role="button"
                  tabIndex={0}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "3px",
                      background: CATEGORY_COLORS[c.toLowerCase()] || "transparent",
                      padding: "1px 3px",
                    }}
                  >
                    <CategoryIcon category={c} width={16} />
                  </span>
                </span>
              ))}
              {moveFilters.moveTypes.map((t) => (
                <span
                  key={`type-${t}`}
                  className="filter-chip filter-chip-type"
                  onClick={() => removeMoveFilter("moveTypes", t)}
                  role="button"
                  tabIndex={0}
                >
                  <TypeIcon type={t} size={16} />
                </span>
              ))}
              <button className="filter-clear-all" onClick={clearMoveFilters}>
                Clear all
              </button>
            </div>
          )}
          <div className="calc-picker-list">
            <MovesList
              regulation={regulation}
              search={search}
              filters={moveFilters}
              addFilter={addMoveFilter}
              removeFilter={removeMoveFilter}
              setSearch={setSearch}
              onMoveSelect={(m) => onSelect("move", m)}
              legalMoves={legalMoves}
            />
          </div>
        </>
      )}
    </div>
  );
}

const ItemRow = memo(function ItemRow({ i }) {
  const icon = getItemIcon(i.spritenum);
  return (
    <>
      <div className="vt-cell vt-spacer"></div>
      <div className="vt-cell vt-sprite">{icon ? <span className="calc-item-icon" style={icon.css} /> : null}</div>
      <div className="vt-cell vt-name">{i.name}</div>
      <div className="vt-cell vt-desc">{i.shortDesc || "—"}</div>
    </>
  );
});

function getAllMoves() {
  if (typeof window !== "undefined" && window.__movesCache) {
    return [...window.__movesCache.entries()].map(([k, v]) => ({ ...v, _key: k }));
  }
  return [];
}

/* ─── Main page ─── */
export default function DamageCalcPage() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [allPokemonLoaded, setAllPokemonLoaded] = useState(false);
  const [regulation, setRegulation] = useState(() => {
    const saved = localStorage.getItem(REG_KEY);
    return saved && REGULATIONS[saved] ? saved : DEFAULT_REG;
  });

  const [sideA, setSideA] = useState(defaultSide);
  const [sideB, setSideB] = useState(defaultSide);

  const [field, setField] = useState({
    weather: "",
    terrain: "",
    gameType: "Singles",
    isGravity: false,
    isMagicRoom: false,
    isWonderRoom: false,
  });

  const defaultSideCond = () => ({
    isSR: false,
    spikes: 0,
    isReflect: false,
    isLightScreen: false,
    isProtected: false,
    isSeeded: false,
    isSaltCured: false,
    isHelpingHand: false,
    isTailwind: false,
    isPowerTrick: false,
    isFriendGuard: false,
    isAuroraVeil: false,
    isSwitching: false,
  });

  const [sideAConditions, setSideAConditions] = useState(defaultSideCond);
  const [sideBConditions, setSideBConditions] = useState(defaultSideCond);

  const [picker, setPicker] = useState(null);
  const [activeSide, setActiveSide] = useState("A");

  /* Load data */
  useEffect(() => {
    loadPokedex()
      .then((list) => {
        setAllPokemon(list);
        setAllPokemonLoaded(true);
      })
      .catch(() => setAllPokemonLoaded(true));
  }, []);

  useEffect(() => {
    loadMoves()
      .then((map) => {
        window.__movesCache = map;
      })
      .catch(() => {});
  }, []);

  const pokedexMap = useMemo(() => {
    const m = {};
    for (const p of allPokemon) {
      m[p.name.toLowerCase()] = p;
      if (p.key) m[p.key] = p;
    }
    return m;
  }, [allPokemon]);

  const items = useMemo(() => {
    return getAllItems()
      .filter((i) => isItemLegal(i._key, regulation))
      .map((i) => ({
        ...i,
        _lcName: i.name.toLowerCase(),
      }));
  }, [regulation]);

  const itemsMap = useMemo(() => {
    const m = {};
    for (const i of items) {
      m[i._key] = i;
    }
    return m;
  }, [items]);

  /* Damage calculation */
  const damage = useMemo(
    () => calcAllDamage(sideA, sideB, { ...field, sideA: sideAConditions, sideB: sideBConditions }, getMove, pokedexMap),
    [sideA, sideB, field, sideAConditions, sideBConditions, pokedexMap],
  );

  /* Picker handlers */
  const handleOpenPicker = useCallback((type, side, slot) => {
    setActiveSide(side);
    setPicker((prev) => {
      if (prev?.type === type && prev?.side === side && prev?.slot === slot) return null;
      return { type, side, slot };
    });
  }, []);

  const handleClosePicker = useCallback(() => setPicker(null), []);

  const handleSelect = useCallback(
    (type, value) => {
      const side = activeSide;
      const setter = side === "A" ? setSideA : setSideB;

      if (type === "pokemon") {
        setter((s) => ({
          ...s,
          pokemon: value,
          item: null,
          ability: null,
          moves: [null, null, null, null],
          activeMoveIdx: null,
          sp: { ...EMPTY_SP },
          nature: null,
        }));
      } else if (type === "item") {
        setter((s) => ({ ...s, item: value }));
      } else if (type === "ability") {
        setter((s) => ({ ...s, ability: value }));
      } else if (type === "nature") {
        setter((s) => ({ ...s, nature: value }));
      } else if (type === "move") {
        setter((s) => {
          const newMoves = [...s.moves];
          newMoves[picker.slot] = value;
          return { ...s, moves: newMoves, activeMoveIdx: picker.slot };
        });
      }

      setPicker(null);
    },
    [activeSide, picker],
  );

  /* Field handlers */
  const handleWeatherChange = useCallback((e) => {
    setField((f) => ({ ...f, weather: e.target.value }));
  }, []);

  const handleTerrainChange = useCallback((e) => {
    setField((f) => ({ ...f, terrain: e.target.value }));
  }, []);

  const toggleField = useCallback((key) => {
    setField((f) => ({ ...f, [key]: !f[key] }));
  }, []);

  const setGameType = useCallback((gt) => {
    setField((f) => ({ ...f, gameType: gt }));
  }, []);

  const toggleSideCond = useCallback((side, key) => {
    const setter = side === "A" ? setSideAConditions : setSideBConditions;
    setter((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const setSpikes = useCallback((side, val) => {
    const setter = side === "A" ? setSideAConditions : setSideBConditions;
    setter((s) => ({ ...s, spikes: val }));
  }, []);

  const renderSideCond = (side, conds) => {
    const toggle = (key) => toggleSideCond(side, key);
    const btn = (key, label) => (
      <button
        key={key}
        className={`calc-cond-btn ${conds[key] ? "calc-cond-btn--active" : ""}`}
        onClick={() => toggle(key)}
      >{label}</button>
    );
    return (
      <>
        {btn("isSR", "Stealth Rock")}
        <div className="calc-spikes-row">
          <span className={`calc-cond-label ${side === "A" ? "calc-cond-label--end" : ""}`}>Spikes</span>
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              className={`calc-spikes-btn ${conds.spikes === n ? "calc-spikes-btn--active" : ""}`}
              onClick={() => setSpikes(side, n)}
            >{n}</button>
          ))}
        </div>
        {btn("isReflect", "Reflect")}
        {btn("isLightScreen", "Light Screen")}
        {btn("isProtected", "Protect")}
        {btn("isSeeded", "Leech Seed")}
        {btn("isSaltCured", "Salt Cure")}
        {btn("isHelpingHand", "Helping Hand")}
        {btn("isTailwind", "Tailwind")}
        {btn("isPowerTrick", "Power Trick")}
        {btn("isFriendGuard", "Friend Guard")}
        {btn("isAuroraVeil", "Aurora Veil")}
        {btn("isSwitching", "Switching Out")}
      </>
    );
  };

  return (
    <div className="calc-page">
      {/* Results */}
      <div className="calc-results">
        <div className="calc-results-header">Damage Calc</div>
        {damage.aToB ? (
          <div className="calc-result-row">
            <span className="calc-result-label">
              {sideA.pokemon || "A"}
              {sideA.activeMoveIdx != null && sideA.moves[sideA.activeMoveIdx]
                ? ` [${getMove(sideA.moves[sideA.activeMoveIdx])?.name || "—"}]`
                : ""}
              {" → "}
              {sideB.pokemon || "B"}
            </span>
            <span className="calc-result-damage">
              {damage.aToB.min} – {damage.aToB.max}
            </span>
            <span className="calc-result-percent">
              ({damage.aToB.percent}% – {damage.aToB.percentMax}%)
            </span>
          </div>
        ) : (
          <div className="calc-result-empty">Select a move on the left side</div>
        )}
        {damage.bToA ? (
          <div className="calc-result-row">
            <span className="calc-result-label">
              {sideB.pokemon || "B"}
              {sideB.activeMoveIdx != null && sideB.moves[sideB.activeMoveIdx]
                ? ` [${getMove(sideB.moves[sideB.activeMoveIdx])?.name || "—"}]`
                : ""}
              {" → "}
              {sideA.pokemon || "A"}
            </span>
            <span className="calc-result-damage">
              {damage.bToA.min} – {damage.bToA.max}
            </span>
            <span className="calc-result-percent">
              ({damage.bToA.percent}% – {damage.bToA.percentMax}%)
            </span>
          </div>
        ) : (
          <div className="calc-result-empty">Select a move on the right side</div>
        )}
      </div>

      {/* Two panels with field in center */}
      <div className="calc-sides">
        <SidePanel
          label="A"
          side={sideA}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
          regulation={regulation}
          onOpenPicker={handleOpenPicker}
          activePicker={picker?.side === "A" ? picker : null}
          onUpdate={(changes) => setSideA((s) => ({ ...s, ...changes }))}
        />

        {/* Field conditions */}
        <div className="calc-field-section">
          <div className="calc-field-section-title">Field</div>

          {/* Game type */}
          <div className="calc-field-row-center">
            <div className="calc-btn-group">
              {["Singles", "Doubles"].map((gt) => (
                <button
                  key={gt}
                  className={`calc-toggle-btn ${field.gameType === gt ? "calc-toggle-btn--active" : ""}`}
                  onClick={() => setGameType(gt)}
                >{gt}</button>
              ))}
            </div>
          </div>

          {/* Terrain */}
          <div className="calc-field-row-center">
            <div className="calc-btn-group">
              {TERRAIN_OPTIONS.map((t) => (
                <button
                  key={t}
                  className={`calc-toggle-btn ${field.terrain === t ? "calc-toggle-btn--active" : ""}`}
                  onClick={() => setField((f) => ({ ...f, terrain: t }))}
                >{t || "None"}</button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="calc-field-row-center">
            <div className="calc-btn-group">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w}
                  className={`calc-toggle-btn ${field.weather === w ? "calc-toggle-btn--active" : ""}`}
                  onClick={() => setField((f) => ({ ...f, weather: w }))}
                >{w || "None"}</button>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="calc-field-row-center">
            <div className="calc-btn-group">
              <button
                className={`calc-toggle-btn ${field.isMagicRoom ? "calc-toggle-btn--active" : ""}`}
                onClick={() => toggleField("isMagicRoom")}
              >Magic Room</button>
              <button
                className={`calc-toggle-btn ${field.isWonderRoom ? "calc-toggle-btn--active" : ""}`}
                onClick={() => toggleField("isWonderRoom")}
              >Wonder Room</button>
            </div>
          </div>

          {/* Gravity */}
          <div className="calc-field-row-center">
            <div className="calc-btn-group">
              <button
                className={`calc-toggle-btn ${field.isGravity ? "calc-toggle-btn--active" : ""}`}
                onClick={() => toggleField("isGravity")}
              >Gravity</button>
            </div>
          </div>

          {/* Side conditions */}
          <div className="calc-side-conditions">
            {/* Side A */}
            <div className="calc-side-cond-col">
              {renderSideCond("A", sideAConditions)}
            </div>
            {/* Side B */}
            <div className="calc-side-cond-col calc-side-cond-col--right">
              {renderSideCond("B", sideBConditions)}
            </div>
          </div>
        </div>

        <SidePanel
          label="B"
          side={sideB}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
          regulation={regulation}
          onOpenPicker={handleOpenPicker}
          activePicker={picker?.side === "B" ? picker : null}
          onUpdate={(changes) => setSideB((s) => ({ ...s, ...changes }))}
        />
      </div>

      {/* Shared picker */}
      <PickerArea
        picker={picker}
        side={activeSide}
        sideData={activeSide === "A" ? sideA : sideB}
        pokedexMap={pokedexMap}
        allPokemon={allPokemon}
        regulation={regulation}
        items={items}
        onSelect={handleSelect}
        onClose={handleClosePicker}
      />
    </div>
  );
}
