import { useMemo, useState, useCallback } from "react";
import Sprite from "./Sprite.jsx";
import Icon from "./Icon.jsx";
import TypeIcon from "./TypeIcon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Modal from "./Modal.jsx";
import AbilityDetail from "./AbilityDetail.jsx";
import MoveDetail from "./MoveDetail.jsx";
import { getLargeSprite, getIcon } from "../lib/sprite.js";
import { getAbilityByName } from "../lib/abilities.js";
import { getMovesWithDetails } from "../lib/learnsets.js";
import { STAT_CONFIG } from "../lib/constants.js";
import { statTier, statRangeAtLevel, DEFAULT_LEVEL, MIN_LEVEL, MAX_LEVEL } from "../lib/stats.js";
import { formatAcc, formatPower, bst } from "../lib/utils.js";
import NameWithExt from "./NameWithExt.jsx";

export default function PokemonEntry({ pokemon, regulation, allPokemon = [] }) {
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);

  const sprite = useMemo(() => getLargeSprite(pokemon), [pokemon]);
  const fallbackIcon = useMemo(() => getIcon(pokemon), [pokemon]);
  const [spriteFailed, setSpriteFailed] = useState(false);
  const handleSpriteError = useCallback(() => setSpriteFailed(true), []);
  const abilities = useMemo(
    () =>
      (pokemon.abilities || []).map((a) => ({
        ...a,
        details: getAbilityByName(a.name),
      })),
    [pokemon],
  );
  const moves = useMemo(() => getMovesWithDetails(pokemon.key, regulation), [pokemon, regulation]);

  const safeLevel = useMemo(
    () => Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, parseInt(level, 10) || DEFAULT_LEVEL)),
    [level],
  );

  const statRows = useMemo(() => {
    if (!pokemon.baseStats) return null;
    return STAT_CONFIG.map(({ key, label }) => {
      const value = pokemon.baseStats[key] ?? null;
      const tier = statTier(value);
      const pct = value == null ? 0 : Math.max(0, Math.min(100, (value / 255) * 100));
      const range = statRangeAtLevel(value, key === "hp", safeLevel);
      return { key, label, value, tier, pct, range };
    });
  }, [pokemon, safeLevel]);

  const bstValue = pokemon.baseStats ? bst(pokemon.baseStats) : null;
  const bstSums = useMemo(() => {
    if (!statRows) return null;
    const sums = [0, 0, 0, 0];
    for (const r of statRows) {
      for (let i = 0; i < 4; i++) sums[i] += r.range[i] ?? 0;
    }
    return sums;
  }, [statRows]);

  return (
    <div className="entry">
      <header className="entry-header">
        <div className="entry-sprite-wrap">
          {sprite && !spriteFailed ? (
            <Sprite
              sprite={sprite}
              className="entry-sprite"
              alt={pokemon.name}
              loading="eager"
              onError={handleSpriteError}
            />
          ) : (
            fallbackIcon && (
              <Icon
                className="entry-sprite-icon"
                icon={fallbackIcon}
                style={{ ...fallbackIcon.css, width: 40, height: 30, zoom: 3 }}
              />
            )
          )}
        </div>
        <div className="entry-headline">
          <div className="entry-num">#{String(pokemon.num).padStart(4, "0")}</div>
          <h2 className="entry-name" id="entry-name">
            <NameWithExt name={pokemon.name} />
          </h2>
          <div className="entry-types">
            {(pokemon.types || []).map((t) => (
              <span key={t} className="entry-type">
                <TypeIcon type={t} size={22} />
                <span className="entry-type-name">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="entry-body">
        <section className="entry-section">
          <div className="entry-stats">
            <div className="entry-stat entry-stat-header">
              <h3 className="entry-section-title">Base Stats</h3>
              <span className="entry-stat-range-label">Min&minus;</span>
              <span className="entry-stat-range-label">Min</span>
              <span className="entry-stat-range-label">Max</span>
              <span className="entry-stat-range-label">Max+</span>
            </div>
            {statRows &&
              statRows.map(({ key, label, value, tier, pct, range }) => (
                <div key={key} className="entry-stat">
                  <span className="entry-stat-name">{label}</span>
                  <span className="entry-stat-label">{value ?? "?"}</span>
                  <div className="entry-stat-bar">
                    <div className={`entry-stat-fill tier-${tier}`} style={{ width: pct + "%" }} />
                  </div>
                  {range.map((v, i) => (
                    <span key={i} className="entry-stat-range">
                      {v ?? "?"}
                    </span>
                  ))}
                </div>
              ))}
            {statRows && (
              <div className="entry-stat entry-stat-bst">
                <span className="entry-stat-name">BST</span>
                <span className="entry-stat-label">{bstValue ?? "?"}</span>
                <div className="entry-stat-bar entry-stat-bar-empty" />
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <label className="entry-level-input-wrap">
                  <span className="entry-level-input-label">Level</span>
                  <input
                    className="input entry-level-input"
                    type="number"
                    inputMode="numeric"
                    min={MIN_LEVEL}
                    max={MAX_LEVEL}
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    onBlur={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!Number.isFinite(n)) setLevel(DEFAULT_LEVEL);
                      else setLevel(Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, n)));
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </section>

        <section className="entry-section">
          <h3 className="entry-section-title">Abilities</h3>
          {abilities.length === 0 && <div className="entry-muted">No abilities</div>}
          <ul className="entry-abilities">
            {abilities.map((a) => {
              const desc = a.details?.shortDesc || a.details?.desc || "No description available.";
              return (
                <li
                  key={a.name}
                  className="entry-ability entry-link"
                  onClick={() => setSelectedAbility(a.details ? { ...a.details, _key: a.name } : null)}
                  tabIndex={0}
                  role="button"
                >
                  <div className="entry-ability-head">
                    <span className="entry-ability-name">{a.name}</span>
                    {a.hidden && <span className="entry-ability-tag">Hidden</span>}
                  </div>
                  <p className="entry-ability-desc">{desc}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="entry-section">
          <h3 className="entry-section-title">
            Learnsets <span className="entry-count">({moves.length})</span>
          </h3>
          {moves.length === 0 ? (
            <div className="entry-muted">No moves in this regulation's learnset.</div>
          ) : (
            <div className="entry-moves-wrap">
              {moves.map((m) => (
                <div
                  key={m.id}
                  className="vt-row moves-grid entry-move-row"
                  onClick={() => setSelectedMove({ ...m, _key: m.id })}
                  tabIndex={0}
                  role="button"
                >
                  <div className="vt-cell vt-spacer"></div>
                  <div className="vt-cell vt-sprite">{m.type ? <TypeIcon type={m.type} size={28} /> : null}</div>
                  <div className="vt-cell vt-name move-name">{m.name}</div>
                  <div className="vt-cell vt-cat">
                    {m.category ? (
                      <span className="entry-move-cat" data-category={String(m.category).toLowerCase()}>
                        <CategoryIcon category={m.category} width={20} />
                      </span>
                    ) : null}
                  </div>
                  <div
                    className="vt-cell vt-move-stat"
                    data-no-power={(m.category && String(m.category).toLowerCase() === "status") || undefined}
                  >
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
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal open={!!selectedAbility} onClose={() => setSelectedAbility(null)} labelledBy="ability-name">
        {selectedAbility && <AbilityDetail ability={selectedAbility} regulation={regulation} allPokemon={allPokemon} />}
      </Modal>

      <Modal open={!!selectedMove} onClose={() => setSelectedMove(null)} labelledBy="move-name">
        {selectedMove && <MoveDetail move={selectedMove} regulation={regulation} allPokemon={allPokemon} />}
      </Modal>
    </div>
  );
}
