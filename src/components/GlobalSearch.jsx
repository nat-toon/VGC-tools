import { memo, useCallback, useMemo, useState } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";
import PokemonEntry from "./PokemonEntry.jsx";
import VirtualTable from "./VirtualTable.jsx";
import SectionHeader from "./SectionHeader.jsx";
import { getPool } from "../lib/regulations.js";
import { getAllMoves, isMoveLegal } from "../lib/moves.js";
import { getAllAbilities, isAbilityLegal } from "../lib/abilities.js";
import { getLearnset } from "../lib/learnsets.js";
import { displayName, formatPower, formatAcc, buildAliasSet, matchesAlias } from "../lib/utils.js";
import NameWithExt from "./NameWithExt.jsx";
import { STAT_CONFIG, TYPES } from "../lib/constants.js";
import { bst } from "../lib/utils.js";
import { useRowHeight } from "../lib/hooks.js";

const PokemonGridRow = memo(function PokemonGridRow({ p }) {
  const abilities = p.abilities || [];
  const visibleAbilities = [];
  const hiddenAbilities = [];
  for (const a of abilities) {
    if (a.hidden) hiddenAbilities.push(a);
    else visibleAbilities.push(a);
  }
  const total = bst(p.baseStats);
  return (
    <>
      <div className="vt-cell vt-num">#{String(p.num).padStart(4, "0")}</div>
      <div className="vt-cell vt-sprite">
        <Icon className="row-icon" icon={p.icon} />
      </div>
      <div className="vt-cell vt-name"><NameWithExt name={p.name} /></div>
      <div className="vt-cell vt-types">
        {(p.types || []).map((t) => (
          <TypeIcon key={t} type={t} size={22} />
        ))}
      </div>
      <div className="vt-cell vt-ab">
        {visibleAbilities.length === 0
          ? <span className="muted">—</span>
          : visibleAbilities.map((a) => (
              <span key={a.name} className="ab">{displayName(a.name)}</span>
            ))}
      </div>
      <div className="vt-cell vt-ab">
        {hiddenAbilities.length > 0 && hiddenAbilities.map((a) => (
              <span key={a.name} className="ab hidden">{displayName(a.name)}</span>
            ))}
      </div>
      {STAT_CONFIG.map(({ key, label }) => (
        <div key={key} className="vt-cell vt-stat">
          <div className="stat-cell-stack">
            <span className="stat-cell-label">{label}</span>
            <span className="stat-cell-value">{p.baseStats ? p.baseStats[key] : "?"}</span>
          </div>
        </div>
      ))}
      <div className="vt-cell vt-stat">
        <div className="stat-cell-stack">
          <span className="stat-cell-label">BST</span>
          <span className="stat-cell-value">{total ?? "?"}</span>
        </div>
      </div>
    </>
  );
});

const TypeGridRow = memo(function TypeGridRow({ t }) {
  return (
    <>
      <div className="vt-cell vt-spacer"></div>
      <div className="vt-cell vt-sprite">
        <TypeIcon type={t} size={28} />
      </div>
      <div className="vt-cell vt-name">{t}</div>
    </>
  );
});

const MoveGridRow = memo(function MoveGridRow({ m }) {
  return (
    <>
      <div className="vt-cell vt-spacer"></div>
      <div className="vt-cell vt-sprite">
        <TypeIcon type={m.type} size={28} />
      </div>
      <div className="vt-cell vt-name move-name">{m.name}</div>
      <div className="vt-cell vt-cat">
        {m.category ? (
          <span className="entry-move-cat" data-category={String(m.category).toLowerCase()}>
            <CategoryIcon category={m.category} width={20} />
          </span>
        ) : null}
      </div>
      <div className="vt-cell vt-move-stat" data-no-power={(m.category || "").toLowerCase() === "status" || undefined}>
        <span className="move-stat-label">BP</span>
        <span className="move-stat-value">{formatPower(m.basePower)}</span>
      </div>
      <div className="vt-cell vt-move-stat">
        <span className="move-stat-label">PP</span>
        <span className="move-stat-value">{m.pp ?? "\u2014"}</span>
      </div>
      <div className="vt-cell vt-move-stat">
        <span className="move-stat-label">Acc</span>
        <span className="move-stat-value">{formatAcc(m.accuracy)}</span>
      </div>
      <div className="vt-cell vt-desc">{m.shortDesc || m.desc || "\u2014"}</div>
    </>
  );
});

const AbilityGridRow = memo(function AbilityGridRow({ a }) {
  return (
    <>
      <div className="vt-cell vt-sprite"></div>
      <div className="vt-cell vt-name">{a.name}</div>
      <div className="vt-cell vt-desc">{a.shortDesc || a.desc || "\u2014"}</div>
    </>
  );
});

export default function GlobalSearch({ allPokemon, regulation, search, filters, addFilter, removeFilter, setSearch, onPokemonSelect }) {
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

    if (filters.moves.length > 0) {
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
  }, [regPool, searchQ, searchAliasSet, filters, regulation]);

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

  const handleMoveClick = useCallback((m) => {
    handleMoveFilter(m);
  }, [handleMoveFilter]);

  const handleAbilityFilter = useCallback((a) => {
    toggleFilter("abilities", a.name);
  }, [toggleFilter]);

  const handleAbilityClick = useCallback((a) => {
    handleAbilityFilter(a);
  }, [handleAbilityFilter]);

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
    ...STAT_CONFIG.map(({ key, label }) => ({ nosort: true, label })),
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
              onSelect={handleMoveClick}
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
              onSelect={handleAbilityClick}
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
