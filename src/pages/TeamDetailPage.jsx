import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PokemonSlotEditor from "../components/PokemonSlotEditor.jsx";
import TypeIcon from "../components/TypeIcon.jsx";
import Icon from "../components/Icon.jsx";
import Sprite from "../components/Sprite.jsx";
import Modal from "../components/Modal.jsx";
import { getTeam, updateTeam } from "../lib/teams.js";
import { loadPokedex } from "../lib/pokedex.js";
import { getAllItems } from "../lib/items.js";
import { loadMoves, getMove, getAllMoves } from "../lib/moves.js";
import { loadLearnsets } from "../lib/learnsets.js";
import { REGULATIONS } from "../lib/regulations.js";
import { getLargeSprite, getIcon, getItemIcon } from "../lib/sprite.js";
import { STAT_CONFIG, NATURE_MAP } from "../lib/constants.js";
import { calcFinalStatsSP, statRangeSP, DEFAULT_LEVEL } from "../lib/stats.js";
import { exportTeam, importTeam } from "../lib/showdown.js";

export default function TeamDetailPage() {
  const { id, slot } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [allPokemon, setAllPokemon] = useState([]);
  const [pokedexMap, setPokedexMap] = useState({});
  const [itemsMap, setItemsMap] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [failedSprites, setFailedSprites] = useState({});
  const nameInputRef = useRef(null);
  const editingSlot = slot !== undefined ? Number(slot) : null;
  const [showImportExport, setShowImportExport] = useState(false);
  const [modalText, setModalText] = useState("");
  const [importErrors, setImportErrors] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    Promise.all([loadPokedex(), loadMoves()])
      .then(([pokedex]) => {
        setAllPokemon(pokedex);
        const pMap = {};
        for (const p of pokedex) {
          pMap[p.name.toLowerCase()] = p;
        }
        setPokedexMap(pMap);
        const items = getAllItems();
        const iMap = {};
        for (const item of items) {
          iMap[item._key] = item;
        }
        setItemsMap(iMap);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = getTeam(id);
    if (t) {
      setTeam(t);
      loadLearnsets(t.regulation).catch(() => {});
    }
  }, [id, loaded]);

  const handleSlotUpdate = useCallback((slotIdx, updates) => {
    setTeam((prev) => {
      if (!prev) return prev;
      const pokemon = prev.pokemon.map((s, i) => {
        if (i !== slotIdx) return s;
        return { ...s, ...updates };
      });
      const updated = { ...prev, pokemon, updatedAt: Date.now() };
      updateTeam(prev.id, { pokemon });
      return updated;
    });
  }, []);

  const handleMoveSlot = useCallback((fromIdx, direction) => {
    setTeam((prev) => {
      if (!prev) return prev;
      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= prev.pokemon.length) return prev;
      const pokemon = [...prev.pokemon];
      [pokemon[fromIdx], pokemon[toIdx]] = [pokemon[toIdx], pokemon[fromIdx]];
      const updated = { ...prev, pokemon, updatedAt: Date.now() };
      updateTeam(prev.id, { pokemon });
      return updated;
    });
  }, []);

  const handleDeleteSlot = useCallback((slotIdx) => {
    setTeam((prev) => {
      if (!prev) return prev;
      const pokemon = prev.pokemon.map((s, i) => {
        if (i !== slotIdx) return s;
        return { name: null, item: null, ability: null, moves: [null, null, null, null], sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, nature: null };
      });
      const updated = { ...prev, pokemon, updatedAt: Date.now() };
      updateTeam(prev.id, { pokemon });
      return updated;
    });
  }, []);

  const handleNameEdit = useCallback(() => {
    setEditName(team.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [team]);

  const handleNameSave = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== team.name) {
      updateTeam(team.id, { name: trimmed });
      setTeam((prev) => prev ? { ...prev, name: trimmed } : prev);
    }
    setEditingName(false);
  }, [editName, team]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setEditingName(false);
    }
  }, [handleNameSave]);

  const handleRegChange = useCallback((e) => {
    const newReg = e.target.value;
    updateTeam(team.id, { regulation: newReg });
    setTeam((prev) => prev ? { ...prev, regulation: newReg } : prev);
    loadLearnsets(newReg).catch(() => {});
  }, [team]);

  const handleOpenModal = useCallback(() => {
    const text = exportTeam(team, pokedexMap, getAllItems(), getAllMoves() || []);
    setModalText(text);
    setImportErrors([]);
    setShowImportExport(true);
  }, [team, pokedexMap]);

  const handleApply = useCallback(() => {
    const allItems = getAllItems();
    const allMovesArr = getAllMoves() || [];
    const result = importTeam(modalText, pokedexMap, allItems, allMovesArr);
    if (result.pokemon.length > 0) {
      updateTeam(team.id, { pokemon: result.pokemon });
      setTeam((prev) => prev ? { ...prev, pokemon: result.pokemon, updatedAt: Date.now() } : prev);
      setImportErrors(result.errors);
      if (result.errors.length === 0) {
        setShowImportExport(false);
      }
    } else {
      setImportErrors(result.errors.length > 0 ? result.errors : ["No Pokemon could be parsed from the input."]);
    }
  }, [modalText, pokedexMap, team]);

  const handleCancel = useCallback(() => {
    setShowImportExport(false);
    setImportErrors([]);
  }, []);

  if (!loaded) {
    return <div className="loading-text">Loading…</div>;
  }

  if (!team) {
    return (
      <div className="pd-not-found">
        <p>Team not found.</p>
        <button className="pd-back-btn" onClick={() => navigate("/teambuilder")}></button>
      </div>
    );
  }

  if (editingSlot !== null) {
    return (
      <div className="team-detail-page">
        <div className="pd-header">
          <button className="pd-back-btn" onClick={() => navigate(`/teambuilder/${id}`)}>
            Back
          </button>
          <div className="pd-slot-row">
            {team.pokemon.map((s, i) => {
              const mon = s.name ? pokedexMap[s.name.toLowerCase()] : null;
              const icon = mon ? getIcon(mon) : null;
              return (
                <button
                  key={i}
                  className={`pd-slot-pill${i === editingSlot ? " pd-slot-active" : ""}`}
                  onClick={() => navigate(`/teambuilder/${id}/${i}`)}
                >
                  {icon && <span className="pd-slot-pill-icon" style={icon.css} />}
                  <span className="pd-slot-pill-name">{mon ? mon.baseSpecies || s.name : `#${i + 1}`}</span>
                </button>
              );
            })}
          </div>
        </div>
        <PokemonSlotEditor
          slot={team.pokemon[editingSlot]}
          slotIndex={editingSlot}
          allPokemon={allPokemon}
          pokedexMap={pokedexMap}
          itemsMap={itemsMap}
          regulation={team.regulation}
          onUpdate={handleSlotUpdate}
        />
      </div>
    );
  }

  return (
    <div className="team-detail-page">
      <div className="pd-header">
        <button className="pd-back-btn" onClick={() => navigate("/teambuilder")}>
          Back
        </button>
        <div className="pd-header-info">
          {editingName ? (
            <input
              ref={nameInputRef}
              className="pd-team-name-input"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              maxLength={40}
            />
          ) : (
            <h2 className="pd-team-name" onClick={handleNameEdit} title="Click to rename">
              {team.name}
            </h2>
          )}
          <select
            className="pd-team-reg-select"
            value={team.regulation}
            onChange={handleRegChange}
          >
            {Object.entries(REGULATIONS).map(([key, reg]) => (
              <option key={key} value={key}>{reg.label}</option>
            ))}
          </select>
          <button className="pd-import-export-btn" onClick={handleOpenModal}>
            Import / Export
          </button>
        </div>
      </div>

      <Modal open={showImportExport} onClose={handleCancel} labelledBy="import-export-title">
        <div className="sd-modal-body">
          <h3 id="import-export-title">Import / Export Team</h3>
          <textarea
            ref={textareaRef}
            className="sd-textarea"
            value={modalText}
            onChange={(e) => setModalText(e.target.value)}
            rows={14}
          />
          {importErrors.length > 0 && (
            <div className="sd-errors">
              {importErrors.map((err, i) => (
                <p key={i} className="sd-error">{err}</p>
              ))}
            </div>
          )}
          <div className="sd-modal-actions">
            <button className="sd-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="sd-btn sd-btn--primary" onClick={handleApply}>
              Apply
            </button>
          </div>
        </div>
      </Modal>

      <div className="pd-pokemon-list">
        {team.pokemon.map((slot, i) => {
          const mon = slot.name ? pokedexMap[slot.name.toLowerCase()] : null;
          const natureObj = slot.nature ? NATURE_MAP[slot.nature] : null;
          let previewStats = null;
          if (mon?.baseStats) {
            const sp = slot.sp || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            previewStats = calcFinalStatsSP(mon.baseStats, sp, natureObj, slot.level ?? DEFAULT_LEVEL);
          }
          return (
            <div
              key={i}
              className="pd-pokemon-slot pd-pokemon-slot--clickable"
              onClick={() => navigate(`/teambuilder/${id}/${i}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/teambuilder/${id}/${i}`); }}
              tabIndex={0}
              role="button"
            >
              <div className="pd-slot-actions">
                <button
                  className="pd-slot-action"
                  onClick={(e) => { e.stopPropagation(); handleMoveSlot(i, -1); }}
                  disabled={i === 0}
                  title="Move up"
                >▲</button>
                <button
                  className="pd-slot-action"
                  onClick={(e) => { e.stopPropagation(); handleMoveSlot(i, 1); }}
                  disabled={i === team.pokemon.length - 1}
                  title="Move down"
                >▼</button>
                <button
                  className="pd-slot-action pd-slot-action--delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteSlot(i); }}
                  title="Clear slot"
                >×</button>
              </div>
              {mon ? (
                <div className="se-display">
                  <div className="se-left">
                    <div className="se-left-top">
                      <div className="se-sprite">
                        {(() => {
                          const sprite = getLargeSprite(mon);
                          const icon = getIcon(mon);
                          if (failedSprites[i] || !sprite) return <span className="pd-pokemon-icon" style={icon?.css} />;
                          return (
                            <Sprite
                              sprite={sprite}
                              className="pd-pokemon-img"
                              alt={mon.name}
                              loading="lazy"
                              onError={() => setFailedSprites((prev) => ({ ...prev, [i]: true }))}
                            />
                          );
                        })()}
                      </div>
                      <div className="se-display-info">
                        <div className="se-display-name">{mon.name}</div>
                        <div className="se-display-types">
                          {(mon.types || []).map((t) => (
                            <TypeIcon key={t} type={t} size={16} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="se-meta">
                    <div className="se-section-header se-item">Item</div>
                    <div className="se-part se-info-btn se-item">
                      {(() => {
                        const itemData = slot.item ? itemsMap[slot.item] : null;
                        const icon = itemData ? getItemIcon(itemData.spritenum) : null;
                        return (
                          <>
                            {icon && <Icon className="item-row-icon" icon={icon} />}
                            <span className="se-part-value">{itemData ? itemData.name : ""}</span>
                          </>
                        );
                      })()}
                    </div>
                    <div className="se-section-header se-ability">Ability</div>
                    <div className="se-part se-info-btn se-ability">
                      <span className="se-part-value">{slot.ability || ""}</span>
                    </div>
                    <div className="se-section-header se-moves">Moves</div>
                    {(slot.moves || [null, null, null, null]).map((m, mi) => {
                      const move = m ? getMove(m) : null;
                      return (
                        <div key={mi} className="se-part se-move-btn">
                          {move ? (
                            <>
                              <TypeIcon type={move.type} size={14} />
                              <span className="se-move-name">{move.name}</span>
                            </>
                          ) : (
                            <span className="se-part-label"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="se-right">
                    <div className="se-section-header">Stats</div>
                    <div className="se-part se-stats-btn">
                      <div className="se-stats-spread">
                        {STAT_CONFIG.map(({ key, label }) => {
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
                              <span className="se-stat-value">
                                {previewStats?.[key] != null && previewStats[key] !== 0 ? previewStats[key] : ""}
                              </span>
                              <span
                                className={`se-stat-hint ${hint === "+" ? "se-stat-hint--plus" : hint === "-" ? "se-stat-hint--minus" : ""}`}
                              >
                                {hint || ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pd-slot-empty">Empty Slot #{i + 1}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
