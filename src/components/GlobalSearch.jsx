import { memo, useCallback, useMemo, useState } from "react";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";
import PokemonEntry from "./PokemonEntry.jsx";
import PokedexTable from "./PokedexTable.jsx";
import SectionHeader from "./SectionHeader.jsx";
import { getPool } from "../lib/regulations.js";
import { getAllMoves, isMoveLegal } from "../lib/moves.js";
import { getAllAbilities, isAbilityLegal } from "../lib/abilities.js";
import { getLearnset } from "../lib/learnsets.js";
import { displayName, formatPower, formatAcc, buildAliasSet, matchesAlias } from "../lib/utils.js";
import { TYPES } from "../lib/constants.js";

const PokemonRow = memo(function PokemonRow({ p }) {
  const abilities = p.abilities || [];
  const visibleAbilities = abilities.filter((a) => !a.hidden);
  const hiddenAbilities = abilities.filter((a) => a.hidden);
  return (
    <div className="global-search-row" style={{ display: "grid", gridTemplateColumns: "48px 1fr 72px 1fr 1fr", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon className="row-icon" icon={p.icon} />
      </div>
      <div className="vt-cell vt-name">{p.name}</div>
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
        {hiddenAbilities.length === 0
          ? <span className="muted">—</span>
          : hiddenAbilities.map((a) => (
              <span key={a.name} className="ab hidden">{displayName(a.name)}</span>
            ))}
      </div>
    </div>
  );
});

const TypeRow = memo(function TypeRow({ t, active }) {
  return (
    <div className={`global-search-row${active ? " filter-active" : ""}`} style={{ display: "grid", gridTemplateColumns: "48px 1fr", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TypeIcon type={t} size={28} />
      </div>
      <div className="vt-cell vt-name">{t}</div>
    </div>
  );
});

const MoveRow = memo(function MoveRow({ m, active }) {
  return (
    <div className={`global-search-row${active ? " filter-active" : ""}`} style={{ display: "grid", gridTemplateColumns: "48px 160px 56px 56px 44px 56px 1fr", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
    </div>
  );
});

const AbilityRow = memo(function AbilityRow({ a, active }) {
  return (
    <div className={`global-search-row${active ? " filter-active" : ""}`} style={{ display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center", gap: "8px" }}>
      <div className="vt-cell vt-name">{a.name}</div>
      <div className="vt-cell vt-desc">{a.shortDesc || a.desc || "\u2014"}</div>
    </div>
  );
});

export default function GlobalSearch({ allPokemon, regulation, search, filters, addFilter, removeFilter, setSearch }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const regPool = useMemo(() => getPool(allPokemon, regulation), [allPokemon, regulation]);

  const hasActiveFilters = filters.types.length > 0 || filters.moves.length > 0 || filters.abilities.length > 0;
  const filtersOnly = hasActiveFilters && !search.trim();

  const pokemon = useMemo(() => {
    const { q, aliasSet } = buildAliasSet(search);
    let filtered = q
      ? regPool.filter((p) => matchesAlias(p, q, aliasSet))
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
  }, [regPool, search, filters, regulation]);

  const types = useMemo(
    () => TYPES
      .filter((t) => !search.trim() || t.includes(search.trim().toLowerCase()))
      .sort((a, b) => a.localeCompare(b)),
    [search],
  );

  const moves = useMemo(() => {
    const all = getAllMoves();
    const { q, aliasSet } = buildAliasSet(search);
    return all
      .filter((m) => isMoveLegal(m._key, regulation))
      .map((m) => ({ ...m, _lcName: m.name.toLowerCase() }))
      .filter((m) => !q || matchesAlias(m, q, aliasSet))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [regulation, search]);

  const abilities = useMemo(() => {
    const all = getAllAbilities();
    const { q, aliasSet } = buildAliasSet(search);
    return all
      .filter((a) => isAbilityLegal(a._key, regulation))
      .map((a) => ({ ...a, _lcName: a.name.toLowerCase() }))
      .filter((a) => !q || matchesAlias(a, q, aliasSet))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [regulation, search]);

  const handlePokemonClick = useCallback((p) => {
    setSelectedPokemon((cur) => (cur && cur.key === p.key ? null : p));
  }, []);

  const toggleFilter = useCallback((category, value) => {
    setSearch("");
    if (filters[category].includes(value)) {
      removeFilter(category, value);
    } else {
      addFilter(category, value);
    }
  }, [addFilter, removeFilter, setSearch, filters]);

  const handleTypeClick = useCallback((t) => {
    toggleFilter("types", t);
  }, [toggleFilter]);

  const handleMoveClick = useCallback((m) => {
    toggleFilter("moves", m._key);
  }, [toggleFilter]);

  const handleAbilityClick = useCallback((a) => {
    toggleFilter("abilities", a.name);
  }, [toggleFilter]);

  return (
    <div className="global-search tab-panel active">
      {pokemon.length > 0 && (
        <div className="global-search-section">
          {!filtersOnly && <SectionHeader label="Pokemon" count={pokemon.length} />}
          <div className="global-search-results">
            {pokemon.map((p) => (
              <div key={p.key} onClick={() => handlePokemonClick(p)} role="button" tabIndex={0}>
                <PokemonRow p={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!filtersOnly && types.length > 0 && (
        <div className="global-search-section">
          <SectionHeader label="Types" count={types.length} />
          <div className="global-search-results">
            {types.map((t) => (
              <div key={t} onClick={() => handleTypeClick(t)} role="button" tabIndex={0}>
                <TypeRow t={t} active={filters.types.includes(t)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!filtersOnly && moves.length > 0 && (
        <div className="global-search-section">
          <SectionHeader label="Moves" count={moves.length} />
          <div className="global-search-results">
            {moves.map((m) => (
              <div key={m._key} onClick={() => handleMoveClick(m)} role="button" tabIndex={0}>
                <MoveRow m={m} active={filters.moves.includes(m._key)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!filtersOnly && abilities.length > 0 && (
        <div className="global-search-section">
          <SectionHeader label="Abilities" count={abilities.length} />
          <div className="global-search-results">
            {abilities.map((a) => (
              <div key={a._key} onClick={() => handleAbilityClick(a)} role="button" tabIndex={0}>
                <AbilityRow a={a} active={filters.abilities.includes(a.name)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {pokemon.length === 0 && (filtersOnly || (types.length === 0 && moves.length === 0 && abilities.length === 0)) && (
        <div className="empty-state">
          {filtersOnly ? "No Pokemon match the active filters." : "No results found."}
        </div>
      )}

      <Modal open={!!selectedPokemon} onClose={() => setSelectedPokemon(null)} labelledBy="entry-name">
        {selectedPokemon && (
          <PokemonEntry pokemon={selectedPokemon} regulation={regulation} allPokemon={allPokemon} />
        )}
      </Modal>
    </div>
  );
}
