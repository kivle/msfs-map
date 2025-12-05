const CACHE_NAME = 'msfs-map-cache-v4';
const GEOJSON_CACHE = 'msfs-map-geojson-v1';
const GEOJSON_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const LAYER_PATHS = ['airports', 'global_airports', 'world_updates', 'city_updates', 'photogammetry', 'pois'];
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
        .filter((k) => k !== CACHE_NAME && k !== GEOJSON_CACHE)
        .map((k) => caches.delete(k)))
    )
  );
});

function isLayerAsset(request) {
  const url = new URL(request.url);
  const scopePath = new URL(self.registration.scope).pathname;
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return false;
  if (!url.pathname.startsWith(scopePath)) return false;
  return LAYER_PATHS.some((layer) =>
    url.pathname.includes(`/${layer}/`) || url.pathname.endsWith(`/${layer}.geojson`) || url.pathname.endsWith(`/${layer}/manifest.json`)
  );
}

async function respondWithGeoJson(request) {
  const cache = await caches.open(GEOJSON_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    const cachedAt = parseInt(cached.headers.get('X-Cached-At'), 10);
    if (Number.isFinite(cachedAt) && (Date.now() - cachedAt) <= GEOJSON_MAX_AGE_MS) {
      return cached;
    }
    cache.delete(request).catch(() => {});
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const clone = networkResponse.clone();
      const headers = new Headers(clone.headers);
      headers.set('X-Cached-At', Date.now().toString());
      const stamped = new Response(clone.body, {
        status: clone.status,
        statusText: clone.statusText,
        headers
      });
      cache.put(request, stamped).catch(() => {});
    }
    return networkResponse;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (isLayerAsset(request)) {
    event.respondWith(respondWithGeoJson(request));
    return;
  }

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
