/*
 * Sprite and icon URL construction for play.pokemonshowdown.com.
 *
 * Both helpers build URLs against the Showdown CDN at runtime - no
 * package, no build-time precomputation.  The species's spriteid (the
 * file name under /sprites/gen5/) is derived from `baseSpecies` +
 * `forme` the same way Showdown's Species constructor does it.  The
 * cell index in pokemonicons-sheet.png is resolved at build time by
 * scripts/parse-sprite-data.cjs + scripts/slim-showdown.cjs: the
 * default is the species's dex num, and the BattlePokemonIconIndexes
 * table in play.pokemonshowdown.com/src/battle-dex-data.ts overrides
 * that for forms (mega, gmax, alola, ...), the egg placeholder, CAP,
 * etc.  The resolved cell index is carried in slim pokedex entries
 * as `iconIndex` and consumed here.
 *
 *   - getIcon(p)        - one cell from pokemonicons-sheet.png (40x30)
 *   - getLargeSprite(p) - gen5 PNG, 96x96, pixelated
 *
 * Asset layout on the CDN:
 *   https://play.pokemonshowdown.com/sprites/gen5/{spriteid}.png
 *   https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png
 *
 * The version query string on the icon sheet (?v22) is the upstream
 * cache-buster; we keep the same value so a hard refresh after a
 * Showdown update still gets a fresh sheet.
 */

const SPRITE_BASE = "https://play.pokemonshowdown.com/sprites/";
const POKEMON_ICONS_URL = SPRITE_BASE + "pokemonicons-sheet.png?v22";
const GEN5_SPRITE_DIR = "gen5";
const SPRITE_SIZE = 96;
const ICON_W = 40;
const ICON_H = 30;
const ICONS_PER_ROW = 12;

// Showdown's toID: lowercase, strip everything but [a-z0-9].
function toID(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Mirrors the `spriteid` derivation in Showdown's Species constructor
// (battle-dex-data.ts).  Each species has a `baseSpecies` (the root
// form's display name, e.g. "Charizard") and an optional `forme`
// (e.g. "Mega-X"); the file name on the CDN is `baseId-formaid`.
// Totem forms, greninja-bond and rockruff-dusk have a couple of
// historical quirks that we replicate here.
function computeSpriteid(p) {
  const baseId = toID(p.baseSpecies || p.name);
  const formeid = (p.key === baseId ? "" : "-" + toID(p.forme || ""));
  let spriteid = baseId + formeid;
  if (spriteid.endsWith("totem")) spriteid = spriteid.slice(0, -5);
  if (spriteid === "greninja-bond") spriteid = "greninja";
  if (spriteid === "rockruff-dusk") spriteid = "rockruff";
  if (spriteid.endsWith("-")) spriteid = spriteid.slice(0, -1);
  return spriteid;
}

export function getIcon(p) {
  if (!p) return null;
  // iconIndex is the pre-resolved cell in pokemonicons-sheet.png
  // (default = dex num, with BattlePokemonIconIndexes overrides
  // applied by slim-showdown.cjs).  Fall back to the dex num if the
  // field is missing (eggs, CAP, or pre-build data).
  const ii = (typeof p.iconIndex === "number" && p.iconIndex >= 0)
    ? p.iconIndex
    : (typeof p.num === "number" ? p.num : 0);
  const top = -Math.floor(ii / ICONS_PER_ROW) * ICON_H;
  const left = -(ii % ICONS_PER_ROW) * ICON_W;
  return {
    url: POKEMON_ICONS_URL,
    left,
    top,
    css: {
      display: "inline-block",
      width: ICON_W + "px",
      height: ICON_H + "px",
      imageRendering: "pixelated",
      background:
        "transparent url(" + POKEMON_ICONS_URL + ") no-repeat scroll " +
        left + "px " + top + "px",
    },
  };
}

export function getLargeSprite(p) {
  if (!p || !p.key) return null;
  return {
    url: SPRITE_BASE + GEN5_SPRITE_DIR + "/" + computeSpriteid(p) + ".png",
    w: SPRITE_SIZE,
    h: SPRITE_SIZE,
    pixelated: true,
  };
}

const ITEM_ICONS_URL = SPRITE_BASE + "itemicons-sheet.png";
const ITEM_ICON_W = 24;
const ITEM_ICON_H = 24;
const ITEM_ICONS_PER_ROW = 16;

/*
 * Item icon.  Showdown packs every in-battle item icon into a single
 * 24x24-cell sheet at
 *   https://play.pokemonshowdown.com/sprites/itemicons-sheet.png
 * (16 cells per row, 384x1152 source).  The cell index is the
 * item's `spritenum` field - the same value Showdown's own ItemIcon
 * uses.  Falls back to nothing if the item is missing the field so
 * the caller can render a placeholder.
 */
export function getItemIcon(spritenum) {
  if (typeof spritenum !== "number" || spritenum < 0) return null;
  const left = -(spritenum % ITEM_ICONS_PER_ROW) * ITEM_ICON_W;
  const top = -Math.floor(spritenum / ITEM_ICONS_PER_ROW) * ITEM_ICON_H;
  return {
    url: ITEM_ICONS_URL,
    left,
    top,
    w: ITEM_ICON_W,
    h: ITEM_ICON_H,
    pixelated: true,
    css: {
      display: "inline-block",
      width: ITEM_ICON_W + "px",
      height: ITEM_ICON_H + "px",
      imageRendering: "pixelated",
      background:
        "transparent url(" + ITEM_ICONS_URL + ") no-repeat scroll " +
        left + "px " + top + "px",
    },
  };
}
