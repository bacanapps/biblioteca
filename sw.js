// sw.js
const CACHE_NAME = "biblioteca-cache-v1";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",

  // Add any same-origin assets you want available offline:
  "./assets/img/hero.png",
  "./data/presentation.json",
  "./data/books.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? undefined : caches.delete(k))))
    )
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // cache-first
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
            return res;
          })
          .catch(() => caches.match("./index.html"));
      })
    );
  } else {
    // network-first for cross-origin; don’t precache CDNs
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});