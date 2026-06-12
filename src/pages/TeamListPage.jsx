import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeamCard from "../components/TeamCard.jsx";
import { loadTeams, createTeam } from "../lib/teams.js";
import { loadPokedex } from "../lib/pokedex.js";
import { getAllItems } from "../lib/items.js";
import { REGULATIONS, DEFAULT_REG } from "../lib/regulations.js";

export default function TeamListPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [pokedexMap, setPokedexMap] = useState({});
  const [itemsMap, setItemsMap] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPokedex().then((pokedex) => {
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
    }).catch(() => {
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    setTeams(loadTeams());
  }, []);

  const handleNewTeam = useCallback(() => {
    createTeam("New Team", DEFAULT_REG);
    setTeams(loadTeams());
  }, []);

  const handleOpenTeam = useCallback((team) => {
    navigate(`/teambuilder/${team.id}`);
  }, [navigate]);

  if (!loaded) {
    return <div className="loading-text">Loading…</div>;
  }

  return (
    <div className="team-list-page">
      <div className="team-list-header">
        <h2 className="team-list-title">My Teams</h2>
      </div>
      <div className="team-list">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            pokedexMap={pokedexMap}
            itemsMap={itemsMap}
            regulationLabel={REGULATIONS[team.regulation]?.label}
            onClick={handleOpenTeam}
          />
        ))}
        <button className="team-card team-card-new" onClick={handleNewTeam}>
          + New Team
        </button>
      </div>
    </div>
  );
}
