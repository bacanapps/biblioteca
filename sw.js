/* sw.js — Biblioteca PWA (GitHub Pages friendly) */
const VERSION = `v${Date.now()}`; // bump each deploy to avoid stale caches
const CACHE_NAME = `biblioteca-cache-${VERSION}`;

// Only same-origin assets; do NOT list external CDNs here.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",

  // CSS (correct subpaths)
  "./assets/css/theme.css",
  "./assets/css/app.css",
  "./assets/css/books-detail.css",

  // Images
  "./assets/img/hero.png",

  // Data used by the app
  "./data/presentation.json",
  "./data/books.json"
];

/* --- Install: pre-cache app shell --- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting(); // activate new SW immediately
    })()
  );
});

/* --- Activate: clean up old caches --- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => (k.startsWith("biblioteca-cache-") && k !== CACHE_NAME) ? caches.delete(k) : undefined)
      );
      await self.clients.claim(); // control open pages ASAP
    })()
  );
});

/* Helpers */
function isJson(req) {
  try {
    const p = new URL(req.url).pathname;
    return p.endsWith("/data/presentation.json") || p.endsWith("/data/books.json") || p.endsWith("/data/faq.json");
  } catch {
    return false;
  }
}

/* --- Fetch strategy --- */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Let cross-origin (CDNs like unpkg) bypass the SW — avoid 302/opaque caching issues
  if (!sameOrigin) {
    return; // network handles it
  }

  // Network-first for JSON so content updates when online
  if (isJson(req)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req, { cache: "no-store" });
          if (fresh && fresh.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
        }
      })()
    );
    return;
  }

  // Cache-first for app shell / static assets
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        // Cache successful GETs for next time
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        // Fallback to shell for navigations; otherwise generic error
        if (req.mode === "navigate") {
          const shell = await caches.match("./index.html");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })()
  );
});