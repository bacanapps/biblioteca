/* sw.js – Biblioteca da AIDS PWA Service Worker */
const VERSION = "v202512111201";
const CACHE_NAME = `biblioteca-cache-${VERSION}`;

// Only same-origin assets
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",

  // CSS
  "./assets/css/tokens.css",
  "./assets/css/theme.css",
  "./assets/css/app.css",
  "./assets/css/books-detail.css",

  // Images
  "./assets/img/hero.png",

  // Data
  "./data/presentation.json",
  "./data/books.json"
];

/* Install: pre-cache app shell */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_URLS);
        await self.skipWaiting();
      } catch (error) {
        console.error("Service Worker installation failed:", error);
      }
    })()
  );
});

/* Activate: clean up old caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) =>
          k.startsWith("biblioteca-cache-") && k !== CACHE_NAME
            ? caches.delete(k)
            : undefined
        )
      );
      await self.clients.claim();
    })()
  );
});

/* Helper: check if request is for JSON data */
function isJson(req) {
  try {
    const p = new URL(req.url).pathname;
    return (
      p.endsWith("/data/presentation.json") ||
      p.endsWith("/data/books.json") ||
      p.endsWith("/data/faq.json")
    );
  } catch {
    return false;
  }
}

/* Fetch strategy */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Let cross-origin (CDNs) bypass the SW
  if (!sameOrigin) {
    return;
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
          return (
            cached ||
            new Response("{}", {
              status: 200,
              headers: { "Content-Type": "application/json" }
            })
          );
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
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        if (req.mode === "navigate") {
          const shell = await caches.match("./index.html");
          if (shell) return shell;
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Offline"
        });
      }
    })()
  );
});
