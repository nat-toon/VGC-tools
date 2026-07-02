import { useCallback, useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import PokemonEntry from "./PokemonEntry.jsx";
import VirtualTable from "./VirtualTable.jsx";
import SectionHeader from "./SectionHeader.jsx";
import PokemonGridRow from "./rows/PokemonGridRow.jsx";
import TypeGridRow from "./rows/TypeGridRow.jsx";
import MoveGridRow from "./rows/MoveGridRow.jsx";
import AbilityGridRow from "./rows/AbilityGridRow.jsx";
import { getPool } from "../lib/regulations.js";
import { getAllMoves, isMoveLegal } from "../lib/moves.js";
import { getAllAbilities, isAbilityLegal } from "../lib/abilities.js";
import { getLearnset, areLearnsetsLoaded } from "../lib/learnsets.js";
import { buildAliasSet, matchesAlias } from "../lib/utils.js";
import { TYPES } from "../lib/constants.js";
import { useRowHeight } from "../lib/hooks.js";

export default function GlobalSearch({ allPokemon, regulation, search, filters, addFilter, removeFilter, setSearch, onPokemonSelect, learnsetsLoaded = true }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const rowHeight = useRowHeight();

  const regPool = useMemo(() => getPool(allPokemon, regulation), [allPokemon, regulation]);

  const hasActiveFilters = filters.types.length > 0 || filters.moves.length > 0 || filters.abilities.length > 0;
  const filtersOnly = hasActiveFilters && !search.trim();

  const { q: searchQ, aliasSet: searchAliasSet } = useMemo(() => buildAliasSet(search), [search]);

  const pokemon = useMemo(() => {
    let filtered = searchQ
      ? regPool.filter((p) => matchesAlias(p, searchQ, searchAliasSet))
      : regPool;

    if (filters.types.length > 0) {
      filtered = filtered.filter((p) =>
        filters.types.every((t) => (p.types || []).includes(t))
      );
    }

    if (filters.moves.length > 0 && areLearnsetsLoaded(regulation)) {
      filtered = filtered.filter((p) => {
        const learnset = getLearnset(p.key, regulation);
        return Array.isArray(learnset) && filters.moves.every((m) => learnset.includes(m));
      });
    }

    if (filters.abilities.length > 0) {
      filtered = filtered.filter((p) =>
        filters.abilities.some((a) =>
          (p.abilities || []).some((pa) => pa.name && pa.name.toLowerCase() === a.toLowerCase())
        )
      );
    }

    return filtered.sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));
  }, [regPool, searchQ, searchAliasSet, filters, regulation, learnsetsLoaded]);

  const types = useMemo(
    () => TYPES
      .filter((t) => !searchQ || t.includes(searchQ))
      .sort((a, b) => a.localeCompare(b)),
    [searchQ],
  );

  const moves = useMemo(() => {
    const all = getAllMoves();
    return all
      .filter((m) => isMoveLegal(m._key, regulation))
      .map((m) => ({ ...m, _lcName: m.name.toLowerCase() }))
      .filter((m) => !searchQ || matchesAlias(m, searchQ, searchAliasSet))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [regulation, searchQ, searchAliasSet]);

  const abilities = useMemo(() => {
    const all = getAllAbilities();
    return all
      .filter((a) => isAbilityLegal(a._key, regulation))
      .map((a) => ({ ...a, _lcName: a.name.toLowerCase() }))
      .filter((a) => !searchQ || matchesAlias(a, searchQ, searchAliasSet))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [regulation, searchQ, searchAliasSet]);

  const toggleFilter = useCallback((category, value) => {
    setSearch("");
    if (filters[category].includes(value)) {
      removeFilter(category, value);
    } else {
      addFilter(category, value);
    }
  }, [addFilter, removeFilter, setSearch, filters]);

  const handlePokemonClick = useCallback((p) => {
    if (onPokemonSelect) {
      onPokemonSelect(p);
    } else {
      setSelectedPokemon((cur) => (cur && cur.key === p.key ? null : p));
    }
  }, [onPokemonSelect]);

  const handleTypeClick = useCallback((t) => {
    toggleFilter("types", t);
  }, [toggleFilter]);

  const handleMoveFilter = useCallback((m) => {
    toggleFilter("moves", m._key);
  }, [toggleFilter]);

  const handleAbilityFilter = useCallback((a) => {
    toggleFilter("abilities", a.name);
  }, [toggleFilter]);

  const getPokemonKey = useCallback((p) => p.key, []);
  const renderPokemonRow = useCallback((p) => <PokemonGridRow p={p} />, []);

  const getTypeKey = useCallback((t) => t, []);
  const renderTypeRow = useCallback((t) => <TypeGridRow t={t} />, []);

  const getMoveKey = useCallback((m) => m._key, []);
  const renderMoveRow = useCallback((m) => <MoveGridRow m={m} />, []);

  const getAbilityKey = useCallback((a) => a._key, []);
  const renderAbilityRow = useCallback((a) => <AbilityGridRow a={a} />, []);

  const pokemonHeaders = useMemo(() => [
    { nosort: true },
    { nosort: true },
    { label: "Name" },
    { nosort: true, label: "Type", className: "text-left" },
    { nosort: true, label: "Abilities", style: { gridColumn: "span 2" } },
    ...["hp", "atk", "def", "spa", "spd", "spe"].map((key) => {
      const label = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE" }[key];
      return { nosort: true, label };
    }),
    { nosort: true, label: "BST" },
  ], []);

  const typeHeaders = useMemo(() => [
    { nosort: true },
    { nosort: true },
    { nosort: true, label: "Name" },
  ], []);

  const moveHeaders = useMemo(() => [
    { nosort: true },
    { nosort: true },
    { nosort: true, label: "Name" },
    { nosort: true, label: "Cat" },
    { nosort: true, label: "BP" },
    { nosort: true, label: "PP" },
    { nosort: true, label: "Acc" },
    { nosort: true, label: "Description" },
  ], []);

  const abilityHeaders = useMemo(() => [
    { nosort: true },
    { nosort: true, label: "Name" },
    { nosort: true, label: "Description" },
  ], []);

  return (
    <div className="global-search tab-panel active">
      {pokemon.length > 0 && (
        <div className="global-search-section">
          {!filtersOnly && <SectionHeader label="Pokemon" count={pokemon.length} />}
          <div className="global-search-results">
            <VirtualTable
              headers={pokemonHeaders}
              gridClass="pkmn-grid"
              items={pokemon}
              rowHeight={rowHeight}
              renderItem={renderPokemonRow}
              selectedKey={selectedPokemon?.key}
              getKey={getPokemonKey}
              onSelect={handlePokemonClick}
              emptyText=""
            />
          </div>
        </div>
      )}

      {!filtersOnly && types.length > 0 && (
        <div className="global-search-section">
          <SectionHeader label="Types" count={types.length} />
          <div className="global-search-results">
            <VirtualTable
              headers={typeHeaders}
              gridClass="types-grid"
              items={types}
              rowHeight={44}
              renderItem={renderTypeRow}
              selectedKey={null}
              getKey={getTypeKey}
              onSelect={handleTypeClick}
              emptyText=""
            />
          </div>
        </div>
      )}

      {!filtersOnly && moves.length > 0 && (
        <div className="global-search-section">
          <SectionHeader label="Moves" count={moves.length} />
          <div className="global-search-results">
            <VirtualTable
              headers={moveHeaders}
              gridClass="moves-grid"
              items={moves}
              rowHeight={rowHeight}
              renderItem={renderMoveRow}
              selectedKey={null}
              getKey={getMoveKey}
              onSelect={handleMoveFilter}
              emptyText=""
            />
          </div>
        </div>
      )}

      {!filtersOnly && abilities.length > 0 && (
        <div className="global-search-section">
          <SectionHeader label="Abilities" count={abilities.length} />
          <div className="global-search-results">
            <VirtualTable
              headers={abilityHeaders}
              gridClass="abilities-grid"
              items={abilities}
              rowHeight={rowHeight}
              renderItem={renderAbilityRow}
              selectedKey={null}
              getKey={getAbilityKey}
              onSelect={handleAbilityFilter}
              emptyText=""
            />
          </div>
        </div>
      )}

      {pokemon.length === 0 && (filtersOnly || (types.length === 0 && moves.length === 0 && abilities.length === 0)) && (
        <div className="empty-state">
          {filtersOnly ? "No Pokemon match the active filters." : "No results found."}
        </div>
      )}

      {!onPokemonSelect && (
        <Modal open={!!selectedPokemon} onClose={() => setSelectedPokemon(null)} labelledBy="entry-name">
          {selectedPokemon && (
            <PokemonEntry pokemon={selectedPokemon} regulation={regulation} allPokemon={allPokemon} />
          )}
        </Modal>
      )}
    </div>
  );
}
