const STORAGE_KEY = "pokemon-teams";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function emptySlot() {
  return {
    name: null,
    item: null,
    ability: null,
    moves: [null, null, null, null],
    sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    nature: null,
  };
}

export function loadTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTeams(teams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

export function createTeam(name, regulation) {
  const team = {
    id: generateId(),
    name: name || "Untitled Team",
    regulation: regulation || "all",
    pokemon: Array.from({ length: 6 }, () => emptySlot()),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const teams = loadTeams();
  teams.push(team);
  saveTeams(teams);
  return team;
}

export function updateTeam(id, updates) {
  const teams = loadTeams();
  const idx = teams.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  teams[idx] = { ...teams[idx], ...updates, updatedAt: Date.now() };
  saveTeams(teams);
  return teams[idx];
}

export function deleteTeam(id) {
  const teams = loadTeams().filter((t) => t.id !== id);
  saveTeams(teams);
}

export function moveTeam(id, direction) {
  const teams = loadTeams();
  const idx = teams.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const toIdx = idx + direction;
  if (toIdx < 0 || toIdx >= teams.length) return;
  [teams[idx], teams[toIdx]] = [teams[toIdx], teams[idx]];
  saveTeams(teams);
}

export function getTeam(id) {
  return loadTeams().find((t) => t.id === id) || null;
}
