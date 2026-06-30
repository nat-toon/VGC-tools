const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];

const STAT_LABEL = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };

const EV_STAT_MAP = {
  hp: "hp", HP: "hp",
  atk: "atk", Atk: "atk",
  def: "def", Def: "def",
  spa: "spa", SpA: "spa",
  spd: "spd", SpD: "spd",
  spe: "spe", Spe: "spe",
};

function emptySlot() {
  return {
    name: null,
    item: null,
    ability: null,
    moves: [],
    sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    nature: null,
  };
}

function buildItemNameMap(allItems) {
  const map = {};
  for (const item of allItems) {
    map[item.name.toLowerCase()] = item._key;
  }
  return map;
}

export function exportTeam(team, pokedexMap, allItems, allMoves) {
  const itemNameCache = {};
  const moveNameCache = {};
  const NL = "  \n";
  let out = "";

  for (const slot of team.pokemon) {
    if (!slot.name) continue;

    const mon = pokedexMap[slot.name.toLowerCase()];
    const speciesName = mon?.name || slot.name;

    out += speciesName;

    if (slot.item) {
      if (!itemNameCache[slot.item]) {
        const itemData = typeof slot.item === "string"
          ? allItems.find((i) => i._key === slot.item)
          : slot.item;
        itemNameCache[slot.item] = itemData?.name || slot.item;
      }
      out += ` @ ${itemNameCache[slot.item]}`;
    }
    out += NL;

    if (slot.ability) {
      out += `Ability: ${slot.ability}${NL}`;
    }

    const level = slot.level ?? 50;
    if (level !== 50) {
      out += `Level: ${level}${NL}`;
    }

    const sp = slot.sp || {};
    const evParts = STAT_KEYS
      .filter((k) => (sp[k] || 0) > 0)
      .map((k) => `${sp[k]} ${STAT_LABEL[k]}`);
    if (evParts.length > 0) {
      out += `EVs: ${evParts.join(" / ")}${NL}`;
    }

    if (slot.nature) {
      out += `${slot.nature} Nature${NL}`;
    }

    for (const moveKey of slot.moves || []) {
      if (!moveKey) {
        out += `-${NL}`;
        continue;
      }
      if (!moveNameCache[moveKey]) {
        const moveData = typeof moveKey === "string"
          ? allMoves.find((m) => m._key === moveKey)
          : null;
        moveNameCache[moveKey] = moveData?.name || moveKey;
      }
      out += `- ${moveNameCache[moveKey]}${NL}`;
    }

    out += NL;
  }

  return out;
}

export function importTeam(text, pokedexMap, allItems, allMoves) {
  const itemNameMap = buildItemNameMap(allItems);
  const moveNameMap = {};
  for (const move of allMoves) {
    moveNameMap[move.name.toLowerCase()] = move._key;
  }
  const pokemon = [];
  const errors = [];

  const blocks = text.split(/\n\s*\n/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    const slot = emptySlot();
    let firstContentLine = true;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === "---") continue;
      if (line.startsWith("[") && line.endsWith("]")) continue;
      if (line.startsWith("//") || line.startsWith("#")) continue;

      if (line.startsWith("- ") || line === "-") {
        const moveName = line === "-" ? "" : line.slice(2).trim();
        if (moveName) {
          const moveKey = moveNameMap[moveName.toLowerCase()];
          if (moveKey) {
            slot.moves.push(moveKey);
          } else {
            slot.moves.push(moveName);
            errors.push(`Unknown move: ${moveName}`);
          }
        }
        continue;
      }

      if (line.startsWith("Ability:")) {
        slot.ability = line.slice("Ability:".length).trim();
        continue;
      }

      if (line.startsWith("Level:")) {
        const lvl = parseInt(line.slice("Level:".length).trim(), 10);
        if (!isNaN(lvl)) slot.level = lvl;
        continue;
      }

      if (line.startsWith("Shiny:")) continue;
      if (line.startsWith("Happiness:")) continue;
      if (line.startsWith("Pokeball:")) continue;
      if (line.startsWith("Hidden Power:")) continue;
      if (line.startsWith("Dynamax Level:")) continue;
      if (line.startsWith("Gigantamax:")) continue;
      if (line.startsWith("Tera Type:")) continue;
      if (line.startsWith("IVs:")) continue;

      if (line.startsWith("EVs:")) {
        const evStr = line.slice("EVs:".length).trim();
        const parts = evStr.split("/");
        for (const part of parts) {
          const p = part.trim();
          const m = p.match(/^(\d+)\s*(.+)$/);
          if (m) {
            const val = parseInt(m[1], 10);
            const statLabel = m[2].trim();
            const statKey = EV_STAT_MAP[statLabel];
            if (statKey && val > 0) {
              slot.sp[statKey] = Math.max(0, Math.min(32, val));
            }
          }
        }
        continue;
      }

      if (/^\w+\s+Nature$/.test(line)) {
        slot.nature = line.slice(0, -" Nature".length).trim();
        continue;
      }

      // Species / name line
      if (firstContentLine) {
        firstContentLine = false;
        let nameLine = line;
        const numMatch = nameLine.match(/^\d+\.\s*/);
        if (numMatch) nameLine = nameLine.slice(numMatch[0].length);

        const atIdx = nameLine.indexOf(" @ ");
        let speciesOrNickname, itemName;
        if (atIdx !== -1) {
          speciesOrNickname = nameLine.slice(0, atIdx).trim();
          itemName = nameLine.slice(atIdx + 3).trim();
        } else {
          speciesOrNickname = nameLine;
        }

        const genderMatch = speciesOrNickname.match(/\s+\([MF]\)$/);
        if (genderMatch) speciesOrNickname = speciesOrNickname.slice(0, -genderMatch[0].length);

        const parenMatch = speciesOrNickname.match(/^(.+?)\s+\((.+)\)\s*$/);
        let pokemonName;
        if (parenMatch) {
          pokemonName = parenMatch[2].trim();
        } else {
          pokemonName = speciesOrNickname;
        }

        const mon = pokedexMap[pokemonName.toLowerCase()];
        if (mon) {
          slot.name = mon.name;
        } else {
          slot.name = pokemonName;
          errors.push(`Unknown Pokemon: ${pokemonName}`);
        }

        if (itemName) {
          const itemKey = itemNameMap[itemName.toLowerCase()];
          if (itemKey) {
            slot.item = itemKey;
          } else {
            errors.push(`Unknown item: ${itemName}`);
          }
        }
      }
    }

    while (slot.moves.length < 4) slot.moves.push(null);
    slot.moves = slot.moves.slice(0, 4);

    if (slot.name) {
      pokemon.push(slot);
    }
  }

  return { pokemon, errors };
}
