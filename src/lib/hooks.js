import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { buildAliasSet, matchesAlias, sortByNameAsc } from "./utils.js";

const DESKTOP_HEIGHT = 44;
const MOBILE_HEIGHT = 32;

export function useRowHeight(desktop = DESKTOP_HEIGHT, mobile = MOBILE_HEIGHT) {
  const [height, setHeight] = useState(() =>
    window.innerWidth <= 768 ? mobile : desktop
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setHeight(e.matches ? mobile : desktop);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [desktop, mobile]);

  return height;
}

export function useMobileMedia() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/*
 * Generic search + sort state for tables that filter an item list by
 * a free-text query (resolved through the alias system) and let the
 * user cycle a single sort field among "none", field-asc, field-desc.
 *
 *   items              array of items, each must have a `name` (and
 *                      ideally a precomputed `_lcName`)
 *   search             free-text query
 *   options.defaultSort   { key } - when no sortKey is set, items are
 *                      sorted by that key ascending. Pass null to keep
 *                      the input order. Default: name ascending.
 *   options.sorter     optional comparator for the sortKey field
 *
 * Returns { filtered, sortKey, cycleSort, sortArrow } - matching the
 * previously inlined bits of AbilitiesList / ItemsList / MovesList.
 */
export function useTableSearchSort(items, search, options = {}) {
  const { defaultSort = { key: "name" }, sorter } = options;
  const [sortKey, setSortKey] = useState("");
  const sortKeyRef = useRef("");

  const filtered = useMemo(() => {
    const { q, aliasSet } = buildAliasSet(search);
    const searched = q
      ? items.filter((i) => matchesAlias(i, q, aliasSet))
      : items.slice();

    if (!sortKey) {
      if (defaultSort?.key === "name") return searched.sort(sortByNameAsc);
      return searched;
    }
    const [field, dir] = sortKey.split("-");
    const desc = dir === "desc" ? -1 : 1;
    if (sorter) return searched.sort((a, b) => desc * sorter(a, b, field));
    if (field === "name") return searched.sort((a, b) => desc * a.name.localeCompare(b.name));
    return searched;
  }, [items, search, sortKey, defaultSort?.key, sorter]);

  const cycleSort = useCallback((field) => {
    setSortKey((cur) => {
      const next = !cur || !cur.startsWith(field)
        ? field + "-asc"
        : cur.split("-")[1] === "asc" ? field + "-desc" : "";
      sortKeyRef.current = next;
      return next;
    });
  }, []);

  const sortArrow = useCallback((field) => {
    const sk = sortKeyRef.current;
    if (!sk || !sk.startsWith(field)) return null;
    return sk.split("-")[1] === "asc" ? "▲" : "▼";
  }, []);

  return { filtered, sortKey, cycleSort, sortArrow };
}
