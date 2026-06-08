import { lazy, Suspense, useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import SearchInput from "./components/SearchInput.jsx";
import ViewSelector from "./components/ViewSelector.jsx";

const Pokedex = lazy(() => import("./components/Pokedex.jsx"));
const TypesList = lazy(() => import("./components/TypesList.jsx"));
const MovesList = lazy(() => import("./components/MovesList.jsx"));
const ItemsList = lazy(() => import("./components/ItemsList.jsx"));
const AbilitiesList = lazy(() => import("./components/AbilitiesList.jsx"));
import { loadPokedex } from "./lib/pokedex.js";
import { loadMoves } from "./lib/moves.js";
import { loadLearnsets } from "./lib/learnsets.js";
import { REGULATIONS, DEFAULT_REG } from "./lib/regulations.js";
import { REG_KEY } from "./lib/constants.js";

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

        <ViewSelector value={view} onChange={setView} />

        {!allPokemonLoaded ? (
          <div className="loading-text">Loading…</div>
        ) : (
          <Suspense fallback={<div className="loading-text">Loading…</div>}>
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
            <MovesList regulation={regulation} search={search} allPokemon={allPokemon} onViewChange={setView} />
          )}
          {view === "items" && (
            <ItemsList regulation={regulation} search={search} allPokemon={allPokemon} />
          )}
          {view === "abilities" && (
            <AbilitiesList regulation={regulation} search={search} allPokemon={allPokemon} />
          )}
        </Suspense>
        )}
      </main>
    </>
  );
}
