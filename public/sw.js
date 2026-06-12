const CACHE_NAME = "pokemon-tools-v1";
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/favicon-16.png",
  "/icons/favicon-32.png",
  "/icons/icon-64.png",
  "/icons/icon-128.png",
  "/icons/icon-180.png",
  "/icons/icon-256.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)),
  );
});
