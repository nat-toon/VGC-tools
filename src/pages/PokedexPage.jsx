import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import SearchInput from "../components/SearchInput.jsx";
import ViewSelector from "../components/ViewSelector.jsx";
import TypeIcon from "../components/TypeIcon.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { getMove } from "../lib/moves.js";

const Pokedex = lazy(() => import("../components/Pokedex.jsx"));
const TypesList = lazy(() => import("../components/TypesList.jsx"));
const MovesList = lazy(() => import("../components/MovesList.jsx"));
const ItemsList = lazy(() => import("../components/ItemsList.jsx"));
const AbilitiesList = lazy(() => import("../components/AbilitiesList.jsx"));
const GlobalSearch = lazy(() => import("../components/GlobalSearch.jsx"));
import { loadPokedex } from "../lib/pokedex.js";
import { loadMoves } from "../lib/moves.js";
import { loadLearnsets } from "../lib/learnsets.js";
import { REGULATIONS, DEFAULT_REG } from "../lib/regulations.js";
import { REG_KEY, CATEGORY_COLORS } from "../lib/constants.js";

export default function PokedexPage() {
  const searchInputRef = useRef(null);
  const [allPokemon, setAllPokemon] = useState([]);
  const [allPokemonLoaded, setAllPokemonLoaded] = useState(false);
  const [regulation, setRegulation] = useState(() => {
    const saved = localStorage.getItem(REG_KEY);
    const valid = saved && REGULATIONS[saved] ? saved : DEFAULT_REG;
    if (valid !== saved) localStorage.setItem(REG_KEY, valid);
    return valid;
  });
  const [view, setView] = useState("pokemon");
  const [search, setSearch] = useState("");
  const [filterEntries, setFilterEntries] = useState([]);

  const filters = {
    types: filterEntries.filter((e) => e.category === "types").map((e) => e.value),
    moves: filterEntries.filter((e) => e.category === "moves").map((e) => e.value),
    abilities: filterEntries.filter((e) => e.category === "abilities").map((e) => e.value),
    categories: filterEntries.filter((e) => e.category === "categories").map((e) => e.value),
    moveTypes: filterEntries.filter((e) => e.category === "moveTypes").map((e) => e.value),
  };

  const hasActiveFilters = filterEntries.length > 0;

  const addFilter = useCallback((category, value) => {
    setFilterEntries((prev) => {
      if (prev.some((e) => e.category === category && e.value === value)) return prev;
      return [...prev, { category, value }];
    });
  }, []);

  const removeFilter = useCallback((category, value) => {
    setFilterEntries((prev) => prev.filter((e) => !(e.category === category && e.value === value)));
  }, []);

  const removeMostRecentFilter = useCallback(() => {
    setFilterEntries((prev) => prev.slice(0, -1));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterEntries([]);
  }, []);

  useEffect(() => {
    loadPokedex()
      .then((list) => {
        setAllPokemon(list);
        setAllPokemonLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setAllPokemonLoaded(true);
      });
  }, []);

  useEffect(() => {
    loadMoves().catch((err) => console.warn("moves:", err));
    loadLearnsets(regulation).catch((err) => console.warn("learnsets:", err));
  }, [regulation]);

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        if (search.length > 0) {
          setSearch((s) => s.slice(0, -1));
          searchInputRef.current?.focus();
        } else {
          removeMostRecentFilter();
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearch((s) => s + e.key);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [search, removeMostRecentFilter]);

  function handleRegulationChange(newReg) {
    setRegulation(newReg);
    localStorage.setItem(REG_KEY, newReg);
  }

  const isSearching = search.trim().length > 0;

  return (
    <>
      <div className="pokedex-search-row">
        <SearchInput
          ref={searchInputRef}
          className="input"
          value={search}
          onChange={setSearch}
        />
        <div className="toolbar-group">
          <select
            id="regSelect"
            className="select"
            value={regulation}
            onChange={(e) => handleRegulationChange(e.target.value)}
            aria-label="Regulation"
          >
            {Object.entries(REGULATIONS).map(([key, reg]) => (
              <option key={key} value={key}>{reg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-bar">
          {filterOrder.map(({ category, value }) => {
            if (category === "types") {
              return (
                <span key={`type-${value}`} className="filter-chip filter-chip-type" onClick={() => removeFilter("types", value)} role="button" tabIndex={0}>
                  <TypeIcon type={value} size={16} />
                </span>
              );
            }
            if (category === "moves") {
              const moveData = getMove(value);
              return (
                <span key={`move-${value}`} className="filter-chip filter-chip-move" onClick={() => removeFilter("moves", value)} role="button" tabIndex={0}>
                  <span className="filter-chip-label">{moveData?.name || value}</span>
                </span>
              );
            }
            if (category === "abilities") {
              return (
                <span key={`ability-${value}`} className="filter-chip filter-chip-ability" onClick={() => removeFilter("abilities", value)} role="button" tabIndex={0}>
                  <span className="filter-chip-label">{value}</span>
                </span>
              );
            }
            if (category === "categories") {
              return (
                <span key={`category-${value}`} className="filter-chip filter-chip-category" onClick={() => removeFilter("categories", value)} role="button" tabIndex={0}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "3px", background: CATEGORY_COLORS[value.toLowerCase()] || "transparent", padding: "1px 3px" }}>
                    <CategoryIcon category={value} width={16} />
                  </span>
                </span>
              );
            }
            if (category === "moveTypes") {
              return (
                <span key={`movetype-${value}`} className="filter-chip filter-chip-type" onClick={() => removeFilter("moveTypes", value)} role="button" tabIndex={0}>
                  <TypeIcon type={value} size={16} />
                </span>
              );
            }
            return null;
          })}
          <button className="filter-clear-all" onClick={clearFilters}>Clear all</button>
        </div>
      )}

      {!isSearching && !hasActiveFilters && <ViewSelector value={view} onChange={setView} />}

      {!allPokemonLoaded ? (
        <div className="loading-text">Loading…</div>
      ) : (
        <Suspense fallback={<div className="loading-text">Loading…</div>}>
        {isSearching && view === "pokemon" ? (
          <GlobalSearch
            allPokemon={allPokemon}
            regulation={regulation}
            search={search}
            filters={filters}
            addFilter={addFilter}
            removeFilter={removeFilter}
            setSearch={setSearch}
          />
        ) : hasActiveFilters && view === "pokemon" ? (
          <Pokedex
            allPokemon={allPokemon}
            regulation={regulation}
            search=""
            filters={filters}
            onViewChange={setView}
          />
        ) : (
          <>
            {view === "pokemon" && (
              <Pokedex
                allPokemon={allPokemon}
                regulation={regulation}
                search={search}
                onViewChange={setView}
              />
            )}
            {view === "types" && (
              <TypesList
                allPokemon={allPokemon}
                regulation={regulation}
                search={search}
              />
            )}
            {view === "moves" && (
              <MovesList regulation={regulation} search={search} allPokemon={allPokemon} onViewChange={setView} filters={filters} addFilter={addFilter} removeFilter={removeFilter} setSearch={setSearch} />
            )}
            {view === "items" && (
              <ItemsList regulation={regulation} search={search} allPokemon={allPokemon} />
            )}
            {view === "abilities" && (
              <AbilitiesList regulation={regulation} search={search} allPokemon={allPokemon} />
            )}
          </>
        )}
      </Suspense>
      )}
    </>
  );
}
