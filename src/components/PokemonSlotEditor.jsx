import { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import MovesList from "./MovesList.jsx";
import SearchInput from "./SearchInput.jsx";
import VirtualTable from "./VirtualTable.jsx";
import Pokedex from "./Pokedex.jsx";
import GlobalSearch from "./GlobalSearch.jsx";
import Icon from "./Icon.jsx";
import Sprite from "./Sprite.jsx";
import { getLargeSprite, getIcon, getItemIcon } from "../lib/sprite.js";
import { getMove } from "../lib/moves.js";
import { getAllItems, isItemLegal } from "../lib/items.js";
import { getLearnset } from "../lib/learnsets.js";
import { STAT_CONFIG, NATURES, NATURE_MAP, CATEGORY_COLORS } from "../lib/constants.js";
import { calcFinalStatsSP, statRangeSP, SP_MAX_TOTAL, SP_MAX_PER_STAT, DEFAULT_LEVEL } from "../lib/stats.js";
import { getAbilityByName } from "../lib/abilities.js";
import { buildAliasSet, matchesAlias } from "../lib/utils.js";
import { useRowHeight } from "../lib/hooks.js";

const SpriteView = memo(function SpriteView({ mon, failed, onFailed }) {
  const sprite = useMemo(() => (mon ? getLargeSprite(mon) : null), [mon]);
  const icon = useMemo(() => (mon ? getIcon(mon) : null), [mon]);
  if (!mon) return null;
  if (failed || !sprite) return <span className="pd-pokemon-icon" style={icon?.css} />;
  return <Sprite sprite={sprite} className="pd-pokemon-img" alt={mon.name} loading="lazy" onError={onFailed} />;
});

function fmtStat(v) {
  if (!Number.isFinite(v)) return "";
  return v === 0 ? "" : v;
}

const STAT_LABELS = {
  hp: "HP",
  atk: "Attack",
  def: "Defense",
  spa: "Sp. Atk",
  spd: "Sp. Def",
  spe: "Speed",
};

function StatsPanel({ mon, slot, slotIndex, onUpdate }) {
  const level = slot.level ?? DEFAULT_LEVEL;
  const sp = slot.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const natureObj = slot.nature ? NATURE_MAP[slot.nature] : null;
  const natureHintsRef = useRef({});

  const totalSP = useMemo(() => Object.values(sp).reduce((s, v) => s + v, 0), [sp]);
  const remainingSP = SP_MAX_TOTAL - totalSP;

  const finalStats = useMemo(
    () => (mon ? calcFinalStatsSP(mon.baseStats, sp, natureObj, level) : null),
    [mon, sp, natureObj, level],
  );

  const handleNatureChange = useCallback(
    (e) => onUpdate(slotIndex, { nature: e.target.value || null }),
    [slotIndex, onUpdate],
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

      let newNature = slot.nature;
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
        onUpdate(slotIndex, { sp: newSp, nature: newNature });
      }
    },
    [slotIndex, sp, slot.nature, onUpdate],
  );

  const handleSpSlider = useCallback(
    (key, val) => {
      const v = Number(val);
      const newSp = { ...sp, [key]: v };
      if (Object.values(newSp).reduce((s, x) => s + x, 0) <= SP_MAX_TOTAL) {
        onUpdate(slotIndex, { sp: newSp });
      }
    },
    [slotIndex, sp, onUpdate],
  );

  return (
    <div className="se-stats-panel">
      {/* Headers */}
      <div className="se-stats-headers">
        <span className="se-stats-head-left">Base</span>
        <span className="se-stats-head-right">Points</span>
      </div>

      {/* Stat rows */}
      {STAT_CONFIG.map(({ key }) => {
        const base = mon?.baseStats?.[key] ?? 0;
        const value = finalStats?.[key] ?? 0;
        const [min, max] = statRangeSP(key === "hp");
        const range = max - min || 1;
        const pct = Math.max(0, Math.min(100, ((value - min) / range) * 100));
        const hue = Math.min(360, Math.floor((value * 180) / max));
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
          <div key={key} className="se-stats-full-row">
            <span className="se-stats-name">{STAT_LABELS[key]}</span>
            <span className="se-stats-base">{base}</span>
            <div className="se-stats-bar">
              <div className="se-stats-fill" style={{ width: pct + "%", background: `hsl(${hue},85%,45%)` }} />
            </div>
            <div className="se-stats-sp-wrap">
              <input
                className="se-stats-sp-number"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={sp[key] ?? 0}
                onChange={(e) => handleSpChange(key, e.target.value)}
              />
              {hint && (
                <span
                  className={`se-stats-sp-hint ${hint === "+" ? "se-stats-sp-hint--plus" : "se-stats-sp-hint--minus"}`}
                >
                  {hint}
                </span>
              )}
            </div>
            <input
              className="se-stats-sp-slider"
              type="range"
              min={0}
              max={SP_MAX_PER_STAT}
              value={sp[key] ?? 0}
              onChange={(e) => handleSpSlider(key, e.target.value)}
            />
            <span className="se-stats-final">{value}</span>
          </div>
        );
      })}

      {/* Bottom: Nature left, Remaining right */}
      <div className="se-stats-bottom">
        <label className="se-stats-nature-row">
          <span className="se-stats-nature-label">Nature:</span>
          <select className="se-stats-nature-select" value={slot.nature || ""} onChange={handleNatureChange}>
            <option value="">—</option>
            {NATURES.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
                {n.plus ? ` (+${n.plus.toUpperCase()}, -${n.minus.toUpperCase()})` : ""}
              </option>
            ))}
          </select>
        </label>
        <span className={`se-stats-remaining ${remainingSP === 0 ? "se-stats-sp-full" : ""}`}>
          Remaining: <strong>{remainingSP}</strong>
        </span>
      </div>

      <p className="se-stats-tip">
        Protip: You can also set natures by typing <kbd>+</kbd> and <kbd>-</kbd> next to a stat.
      </p>
    </div>
  );
}

const ItemGridRow = memo(function ItemGridRow({ i }) {
  const icon = getItemIcon(i.spritenum);
  return (
    <>
      <div className="vt-cell vt-spacer"></div>
      <div className="vt-cell vt-sprite">{icon ? <Icon className="item-row-icon" icon={icon} /> : null}</div>
      <div className="vt-cell vt-name">{i.name}</div>
      <div className="vt-cell vt-desc">{i.shortDesc || i.desc || "\u2014"}</div>
    </>
  );
});

function PokemonSlotEditor({ slot, slotIndex, allPokemon, pokedexMap, itemsMap, regulation, onUpdate }) {
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedMoveIdx, setSelectedMoveIdx] = useState(null);
  const [moveSearch, setMoveSearch] = useState("");
  const [moveFilters, setMoveFilters] = useState({ categories: [], moveTypes: [] });
  const [itemSearch, setItemSearch] = useState("");
  const [abilitySearch, setAbilitySearch] = useState("");
  const [pokemonSearch, setPokemonSearch] = useState("");
  const [pokemonFilterEntries, setPokemonFilterEntries] = useState([]);
  const rowHeight = useRowHeight();
  const mon = slot.name ? pokedexMap[slot.name.toLowerCase()] : null;
  const [failed, setFailed] = useState(false);
  const natureObj = slot.nature ? NATURE_MAP[slot.nature] : null;

  const pokemonSearchRef = useRef(null);
  const itemSearchRef = useRef(null);
  const abilitySearchRef = useRef(null);
  const moveSearchRef = useRef(null);
  const slotEditorTopRef = useRef(null);

  const focusRef = useCallback((ref) => {
    ref.current?.focus();
  }, []);

  const scrollToTopAfterKeyboard = useCallback(() => {
    const target = slotEditorTopRef.current;
    if (!target) return;

    const vp = window.visualViewport;
    if (!vp) {
      target.scrollIntoView({ block: "start" });
      return;
    }

    let lastHeight = vp.height;
    let stableCount = 0;

    const onResize = () => {
      const h = vp.height;
      if (h === lastHeight) {
        stableCount++;
        if (stableCount >= 2) {
          vp.removeEventListener("resize", onResize);
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        stableCount = 0;
        lastHeight = h;
      }
    };

    vp.addEventListener("resize", onResize);

    setTimeout(() => {
      vp.removeEventListener("resize", onResize);
      target.scrollIntoView({ block: "start" });
    }, 600);
  }, []);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (selectedPart === "pokemon") {
      focusRef(pokemonSearchRef);
      if (isMobile) scrollToTopAfterKeyboard();
    } else if (selectedPart === "item") {
      focusRef(itemSearchRef);
      if (isMobile) scrollToTopAfterKeyboard();
    } else if (selectedPart === "ability") {
      focusRef(abilitySearchRef);
      if (isMobile) scrollToTopAfterKeyboard();
    } else if (selectedPart === "move") {
      focusRef(moveSearchRef);
      if (isMobile) scrollToTopAfterKeyboard();
    }
  }, [selectedPart, selectedMoveIdx, focusRef, scrollToTopAfterKeyboard, isMobile]);

  const legalMoves = useMemo(
    () => (mon ? getLearnset(mon.key || mon.name?.toLowerCase(), regulation) : null),
    [mon, regulation],
  );

  const allItems = useMemo(() => {
    const all = getAllItems();
    return all.filter((i) => isItemLegal(i._key, regulation)).map((i) => ({ ...i, _lcName: i.name.toLowerCase() }));
  }, [regulation]);

  const filteredItems = useMemo(() => {
    const { q, aliasSet } = buildAliasSet(itemSearch);
    return allItems.filter((i) => !q || matchesAlias(i, q, aliasSet));
  }, [allItems, itemSearch]);

  const pokemonFilters = useMemo(
    () => ({
      types: pokemonFilterEntries.filter((e) => e.category === "types").map((e) => e.value),
      moves: pokemonFilterEntries.filter((e) => e.category === "moves").map((e) => e.value),
      abilities: pokemonFilterEntries.filter((e) => e.category === "abilities").map((e) => e.value),
    }),
    [pokemonFilterEntries],
  );

  const handlePokemonSelect = useCallback(
    (p) => {
      onUpdate(slotIndex, {
        name: p.name,
        item: null,
        ability: null,
        moves: [null, null, null, null],
        sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        nature: null,
      });
      setSelectedPart("item");
      setPokemonSearch("");
      setPokemonFilterEntries([]);
    },
    [slotIndex, onUpdate],
  );

  const refocusPokemonSearch = useCallback(() => {
    requestAnimationFrame(() => pokemonSearchRef.current?.focus());
  }, []);

  const addPokemonFilter = useCallback((category, value) => {
    setPokemonFilterEntries((prev) => {
      if (prev.some((e) => e.category === category && e.value === value)) return prev;
      return [...prev, { category, value }];
    });
    refocusPokemonSearch();
  }, [refocusPokemonSearch]);

  const removePokemonFilter = useCallback((category, value) => {
    setPokemonFilterEntries((prev) => prev.filter((e) => !(e.category === category && e.value === value)));
    refocusPokemonSearch();
  }, [refocusPokemonSearch]);

  const clearPokemonFilters = useCallback(() => {
    setPokemonFilterEntries([]);
    refocusPokemonSearch();
  }, [refocusPokemonSearch]);

  const refocusMoveSearch = useCallback(() => {
    requestAnimationFrame(() => moveSearchRef.current?.focus());
  }, []);

  const addMoveFilter = useCallback((category, value) => {
    setMoveFilters((f) => ({ ...f, [category]: [...f[category], value] }));
    refocusMoveSearch();
  }, [refocusMoveSearch]);

  const removeMoveFilter = useCallback((category, value) => {
    setMoveFilters((f) => ({ ...f, [category]: f[category].filter((v) => v !== value) }));
    refocusMoveSearch();
  }, [refocusMoveSearch]);

  const clearMoveFilters = useCallback(() => {
    setMoveFilters({ categories: [], moveTypes: [] });
    refocusMoveSearch();
  }, [refocusMoveSearch]);

  const handleMoveSelect = useCallback(
    (moveKey) => {
      const newMoves = [...(slot.moves || [])];
      newMoves[selectedMoveIdx] = moveKey;
      onUpdate(slotIndex, { moves: newMoves });
      setMoveSearch("");
      setMoveFilters({ categories: [], moveTypes: [] });

      if (selectedMoveIdx < 3) {
        setSelectedMoveIdx(selectedMoveIdx + 1);
      } else {
        setSelectedPart("stats");
        setSelectedMoveIdx(null);
      }
    },
    [slot.moves, selectedMoveIdx, slotIndex, onUpdate],
  );

  const handleItemSelect = useCallback(
    (item) => {
      onUpdate(slotIndex, { item: item._key });
      setSelectedPart("ability");
      setItemSearch("");
    },
    [slotIndex, onUpdate],
  );

  const previewStats = useMemo(() => {
    if (!mon?.baseStats) return null;
    const sp = slot.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    return calcFinalStatsSP(mon.baseStats, sp, natureObj, slot.level ?? DEFAULT_LEVEL);
  }, [mon, slot.sp, natureObj, slot.level]);

  return (
    <div className="slot-editor">
      <div className="slot-editor-top" ref={slotEditorTopRef}>
        <div className="se-display">
          {/* Left: Sprite + Name + Types */}
          <div className="se-left">
            <div
              className={`se-part se-left-top ${selectedPart === "pokemon" ? "se-part--active" : ""}`}
              onPointerDown={(e) => {
                e.preventDefault();
                setSelectedPart(selectedPart === "pokemon" ? null : "pokemon");
              }}
            >
              {mon && (
                <div>
                  <div className="se-sprite">
                    <SpriteView mon={mon} failed={failed} onFailed={() => setFailed(true)} />
                  </div>
                  <div className="se-display-info">
                    {mon && <div className="se-display-name">{mon.name}</div>}
                    {mon && (
                      <div className="se-display-types">
                        {(mon.types || []).map((t) => (
                          <TypeIcon key={t} type={t} size={16} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!mon && <span className="se-part-label">Select Pokemon</span>}
            </div>
          </div>

          {/* Items / Abilities / Moves */}
          <div className="se-meta">
            <div className="se-section-header se-item">Item</div>
            <button
              className={`se-part se-info-btn se-item ${selectedPart === "item" ? "se-part--active" : ""}`}
              onPointerDown={(e) => {
                e.preventDefault();
                setSelectedPart(selectedPart === "item" ? null : "item");
              }}
            >
              {(() => {
                const itemData = slot.item ? (typeof slot.item === "string" ? itemsMap[slot.item] : slot.item) : null;
                const icon = itemData ? getItemIcon(itemData.spritenum) : null;
                return (
                  <>
                    {icon && <Icon className="item-row-icon" icon={icon} />}
                    <span className="se-part-value">{itemData ? itemData.name : ""}</span>
                  </>
                );
              })()}
            </button>

            <div className="se-section-header se-ability">Ability</div>
            <button
              className={`se-part se-info-btn se-ability ${selectedPart === "ability" ? "se-part--active" : ""}`}
              onPointerDown={(e) => {
                e.preventDefault();
                setSelectedPart(selectedPart === "ability" ? null : "ability");
              }}
            >
              <span className="se-part-value">{slot.ability || ""}</span>
            </button>

            <div className="se-section-header se-moves">Moves</div>
            {(slot.moves || [null, null, null, null]).map((m, i) => {
              const move = m ? getMove(m) : null;
              const isActive = selectedPart === "move" && selectedMoveIdx === i;
              return (
                <button
                  key={i}
                  className={`se-part se-move-btn ${isActive ? "se-part--active" : ""}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setSelectedPart(selectedPart === "move" && selectedMoveIdx === i ? null : "move");
                    setSelectedMoveIdx(i);
                  }}
                >
                  {move ? (
                    <>
                      <TypeIcon type={move.type} size={14} />
                      <span className="se-move-name">{move.name}</span>
                    </>
                  ) : (
                    <span className="se-part-label"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Stats */}
          <div className="se-right">
            <div className="se-section-header">Stats</div>
            <button
              className={`se-part se-stats-btn ${selectedPart === "stats" ? "se-part--active" : ""}`}
              onPointerDown={(e) => {
                e.preventDefault();
                setSelectedPart(selectedPart === "stats" ? null : "stats");
              }}
            >
              <div className="se-stats-spread">
                {mon ? (
                  STAT_CONFIG.map(({ key, label }) => {
                    const val = previewStats?.[key] ?? mon.baseStats?.[key] ?? null;
                    const [min, max] = statRangeSP(key === "hp");
                    const pct = val == null ? 0 : Math.max(0, Math.min(100, (val / max) * 100));
                    const hue = val == null ? 0 : Math.min(360, Math.floor((val * 180) / max));
                    const hint = natureObj?.plus === key ? "+" : natureObj?.minus === key ? "-" : null;
                    return (
                      <div key={key} className="se-stat-item">
                        <span className="se-stat-label">{label}</span>
                        <div className="se-stat-bar-mini">
                          <div
                            className="se-stat-fill-mini"
                            style={{ width: pct + "%", background: `hsl(${hue},85%,45%)` }}
                          />
                        </div>
                        <span className="se-stat-value">{fmtStat(slot.sp?.[key] ?? 0)}</span>
                        <span
                          className={`se-stat-hint ${hint === "+" ? "se-stat-hint--plus" : hint === "-" ? "se-stat-hint--minus" : ""}`}
                        >
                          {hint || ""}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="se-part-value"></span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Pokemon Search Panel */}
      <div
        className="se-item-panel"
        style={{
          visibility: selectedPart === "pokemon" ? "visible" : "hidden",
          position: selectedPart === "pokemon" ? "relative" : "absolute",
          height: selectedPart === "pokemon" ? "auto" : 0,
          overflow: selectedPart === "pokemon" ? "visible" : "hidden",
          pointerEvents: selectedPart === "pokemon" ? "auto" : "none",
        }}
      >
        <div className="se-moves-search-row">
          <SearchInput ref={pokemonSearchRef} className="input" value={pokemonSearch} onChange={setPokemonSearch} />
        </div>
        {pokemonFilterEntries.length > 0 && (
          <div className="filter-bar">
            {pokemonFilterEntries.map(({ category, value }) => {
              if (category === "types") {
                return (
                  <span
                    key={`type-${value}`}
                    className="filter-chip filter-chip-type"
                    onClick={() => removePokemonFilter("types", value)}
                    role="button"
                    tabIndex={0}
                  >
                    <TypeIcon type={value} size={16} />
                  </span>
                );
              }
              if (category === "moves") {
                const moveData = getMove(value);
                return (
                  <span
                    key={`move-${value}`}
                    className="filter-chip filter-chip-move"
                    onClick={() => removePokemonFilter("moves", value)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="filter-chip-label">{moveData?.name || value}</span>
                  </span>
                );
              }
              if (category === "abilities") {
                return (
                  <span
                    key={`ability-${value}`}
                    className="filter-chip filter-chip-ability"
                    onClick={() => removePokemonFilter("abilities", value)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="filter-chip-label">{value}</span>
                  </span>
                );
              }
              return null;
            })}
            <button className="filter-clear-all" onClick={clearPokemonFilters}>
              Clear all
            </button>
          </div>
        )}
        <Suspense fallback={<div className="loading-text">Loading…</div>}>
          {pokemonSearch.trim() ? (
            <GlobalSearch
              allPokemon={allPokemon}
              regulation={regulation}
              search={pokemonSearch}
              filters={pokemonFilters}
              addFilter={addPokemonFilter}
              removeFilter={removePokemonFilter}
              setSearch={setPokemonSearch}
              onPokemonSelect={handlePokemonSelect}
            />
          ) : (
            <Pokedex
              allPokemon={allPokemon}
              regulation={regulation}
              search=""
              filters={
                pokemonFilters.types.length > 0 ||
                pokemonFilters.moves.length > 0 ||
                pokemonFilters.abilities.length > 0
                  ? pokemonFilters
                  : undefined
              }
              onPokemonSelect={handlePokemonSelect}
            />
          )}
        </Suspense>
      </div>

      {/* Expanded Item Search Panel */}
      <div
        className="se-item-panel"
        style={{
          visibility: selectedPart === "item" ? "visible" : "hidden",
          position: selectedPart === "item" ? "relative" : "absolute",
          height: selectedPart === "item" ? "auto" : 0,
          overflow: selectedPart === "item" ? "visible" : "hidden",
          pointerEvents: selectedPart === "item" ? "auto" : "none",
        }}
      >
        <div className="se-moves-search-row">
          <SearchInput ref={itemSearchRef} className="input" value={itemSearch} onChange={setItemSearch} />
        </div>
        <div className="se-item-list">
          <VirtualTable
            headers={[]}
            gridClass="items-grid"
            items={filteredItems}
            rowHeight={rowHeight}
            renderItem={(i) => <ItemGridRow i={i} />}
            selectedKey={slot.item}
            getKey={(i) => i._key}
            onSelect={handleItemSelect}
            emptyText="No items match."
          />
        </div>
      </div>

      {/* Expanded Ability Panel */}
      <div
        className="se-ability-panel"
        style={{
          visibility: selectedPart === "ability" && mon ? "visible" : "hidden",
          position: selectedPart === "ability" && mon ? "relative" : "absolute",
          height: selectedPart === "ability" && mon ? "auto" : 0,
          overflow: selectedPart === "ability" && mon ? "visible" : "hidden",
          pointerEvents: selectedPart === "ability" && mon ? "auto" : "none",
        }}
      >
        <div className="se-moves-search-row">
          <SearchInput ref={abilitySearchRef} className="input" value={abilitySearch} onChange={setAbilitySearch} />
        </div>
        {(mon?.abilities || [])
          .filter((ab) => !abilitySearch || ab.name.toLowerCase().includes(abilitySearch.toLowerCase()))
          .map((ab) => {
            const abilityData = getAbilityByName(ab.name);
            return (
              <button
                key={ab.name}
                className={`se-part se-ability-option ${slot.ability === ab.name ? "se-ability-option--active" : ""}`}
                onClick={() => {
                  onUpdate(slotIndex, { ability: ab.name });
                  setAbilitySearch("");
                  setSelectedMoveIdx(0);
                  setSelectedPart("move");
                }}
              >
                <div className="se-ability-header">
                  <span className="se-ability-name">{ab.name}</span>
                  {ab.hidden && <span className="se-ability-hidden">Hidden</span>}
                </div>
                {abilityData && <div className="se-ability-desc">{abilityData.shortDesc || abilityData.desc}</div>}
              </button>
            );
          })}
        {slot.ability && (
          <button
            className="se-part se-ability-option se-ability-clear"
            onClick={() => {
              onUpdate(slotIndex, { ability: null });
              setSelectedPart(null);
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Expanded Stats Panel */}
      {selectedPart === "stats" && mon && (
        <StatsPanel mon={mon} slot={slot} slotIndex={slotIndex} onUpdate={onUpdate} />
      )}

      {/* Expanded Move Search Panel */}
      <div
        className="se-moves-panel"
        style={{
          visibility: selectedPart === "move" && selectedMoveIdx != null ? "visible" : "hidden",
          position: selectedPart === "move" && selectedMoveIdx != null ? "relative" : "absolute",
          height: selectedPart === "move" && selectedMoveIdx != null ? "auto" : 0,
          overflow: selectedPart === "move" && selectedMoveIdx != null ? "visible" : "hidden",
          pointerEvents: selectedPart === "move" && selectedMoveIdx != null ? "auto" : "none",
        }}
      >
        <div className="se-moves-search-row">
          <SearchInput ref={moveSearchRef} className="input" value={moveSearch} onChange={setMoveSearch} />
        </div>
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
        <div className="se-moves-list">
          <MovesList
            regulation={regulation}
            search={moveSearch}
            filters={moveFilters}
            addFilter={addMoveFilter}
            removeFilter={removeMoveFilter}
            setSearch={setMoveSearch}
            onMoveSelect={handleMoveSelect}
            legalMoves={legalMoves}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(PokemonSlotEditor);
