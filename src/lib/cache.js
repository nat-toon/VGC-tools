/*
 * Generic localStorage cache helpers, keyed + versioned per data set.
 *
 *   loadCache(key, version)        - returns parsed value or null
 *   saveCache(key, version, data)  - persists { version, data }
 */

export function loadCache(key, version) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    return cached.version === version ? cached.data : null;
  } catch {
    return null;
  }
}

export function saveCache(key, version, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ version, data }));
  } catch (e) {
    console.warn(`Failed to save cache ${key}:`, e.message);
  }
}
