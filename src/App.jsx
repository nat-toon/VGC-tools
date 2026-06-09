import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import SearchInput from "./components/SearchInput.jsx";
import ViewSelector from "./components/ViewSelector.jsx";
import TypeIcon from "./components/TypeIcon.jsx";
import CategoryIcon from "./components/CategoryIcon.jsx";
import { getMove } from "./lib/moves.js";

const Pokedex = lazy(() => import("./components/Pokedex.jsx"));
const TypesList = lazy(() => import("./components/TypesList.jsx"));
const MovesList = lazy(() => import("./components/MovesList.jsx"));
const ItemsList = lazy(() => import("./components/ItemsList.jsx"));
const AbilitiesList = lazy(() => import("./components/AbilitiesList.jsx"));
const GlobalSearch = lazy(() => import("./components/GlobalSearch.jsx"));
import { loadPokedex } from "./lib/pokedex.js";
import { loadMoves } from "./lib/moves.js";
import { loadLearnsets } from "./lib/learnsets.js";
import { REGULATIONS, DEFAULT_REG } from "./lib/regulations.js";
import { REG_KEY } from "./lib/constants.js";

const CATEGORY_COLORS = {
  physical: "#ed6744",
  special: "#60acf1",
  status: "#959899",
};

export default function App() {
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
  const [filters, setFilters] = useState({ types: [], moves: [], abilities: [], categories: [], moveTypes: [] });

  const hasActiveFilters = filters.types.length > 0 || filters.moves.length > 0 || filters.abilities.length > 0 || filters.categories.length > 0 || filters.moveTypes.length > 0;

  const removeFilter = useCallback((category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ types: [], moves: [], abilities: [], categories: [], moveTypes: [] });
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

  function handleRegulationChange(newReg) {
    setRegulation(newReg);
    localStorage.setItem(REG_KEY, newReg);
  }

  const isSearching = search.trim().length > 0;

  return (
    <>
      <Header />
      <main>
        <div className="pokedex-search-row">
          <SearchInput
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
            {filters.types.map((t) => (
              <span key={`type-${t}`} className="filter-chip filter-chip-type" onClick={() => removeFilter("types", t)} role="button" tabIndex={0}>
                <TypeIcon type={t} size={16} />
              </span>
            ))}
            {filters.moves.map((m) => {
              const moveData = getMove(m);
              return (
                <span key={`move-${m}`} className="filter-chip filter-chip-move" onClick={() => removeFilter("moves", m)} role="button" tabIndex={0}>
                  <span className="filter-chip-label">{moveData?.name || m}</span>
                </span>
              );
            })}
            {filters.abilities.map((a) => (
              <span key={`ability-${a}`} className="filter-chip filter-chip-ability" onClick={() => removeFilter("abilities", a)} role="button" tabIndex={0}>
                <span className="filter-chip-label">{a}</span>
              </span>
            ))}
            {filters.categories.map((c) => (
              <span key={`category-${c}`} className="filter-chip filter-chip-category" onClick={() => removeFilter("categories", c)} role="button" tabIndex={0}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "3px", background: CATEGORY_COLORS[c.toLowerCase()] || "transparent", padding: "1px 3px" }}>
                  <CategoryIcon category={c} width={16} />
                </span>
              </span>
            ))}
            {filters.moveTypes.map((t) => (
              <span key={`movetype-${t}`} className="filter-chip filter-chip-type" onClick={() => removeFilter("moveTypes", t)} role="button" tabIndex={0}>
                <TypeIcon type={t} size={16} />
              </span>
            ))}
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
              setFilters={setFilters}
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
                <MovesList regulation={regulation} search={search} allPokemon={allPokemon} onViewChange={setView} filters={filters} setFilters={setFilters} setSearch={setSearch} />
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
      </main>
    </>
  );
}
