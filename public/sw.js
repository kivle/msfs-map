const CACHE_NAME = 'msfs-map-cache-v5';
const CORE_ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

const withScope = (path) => new URL(path, self.registration.scope).toString();
const assetsToCache = CORE_ASSETS.map(withScope);

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToCache))
  );
});

self.addEventListener('activate', (event) => {
  self.clientsClaim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== CACHE_NAME)
        .map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Always prefer network for HTML so we don't serve stale indexes that reference old bundles.
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/msfs-map/index.html'))
    );
    return;
  }

  const requestUrl = withScope(request.url);
  const isAppAsset = assetsToCache.includes(requestUrl);

  if (!isAppAsset) {
    // Defer external and dynamic requests to the browser's caching logic.
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
