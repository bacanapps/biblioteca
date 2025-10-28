// Service worker for Biblioteca PWA
const CACHE_NAME = "biblioteca-modern-cache-v1";
// List of local assets and remote libraries to precache
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/data/presentation.json",
  "/data/books.json",
  "/assets/img/hero.png",
  "/assets/img/book1.png",
  "/assets/img/book2.png",
  "/assets/img/book3.png",
  "/assets/img/book4.png",
  "/assets/audio/presentation.mp3",
  // External libraries
  "https://unpkg.com/react@17/umd/react.development.js",
  "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
  "https://unpkg.com/howler/dist/howler.min.js",
  "https://cdn.tailwindcss.com"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  // Serve precached resources if available
  if (PRECACHE_URLS.includes(requestUrl.pathname) || PRECACHE_URLS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return (
          response ||
          fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  } else {
    // Network first for other requests; fallback to cache if offline
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});