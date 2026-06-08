import { ENTRIES } from "../data/items.js";
import { getRegulation, isItemLegalInRegulation } from "./regulations.js";

const ITEMS = new Map(Object.entries(ENTRIES));

export function getAllItems() {
  return [...ITEMS.entries()].map(([k, v]) => ({ ...v, _key: k }));
}

export function isItemLegal(id, regulation) {
  const reg = getRegulation(regulation);
  if (reg.items) return reg.items.has(id);
  const item = ITEMS.get(id);
  if (!item) return false;
  return isItemLegalInRegulation(item, regulation);
}
