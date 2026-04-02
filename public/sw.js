const CACHE_NAME = 'porttrip-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
];

// On install: cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// On activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // API calls: network first, fall back to cache
  if (url.hostname.includes('base44') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Tile images (maps): cache first
  if (url.hostname.includes('tile.openstreetmap') || url.hostname.includes('unpkg.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          return res;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // Static assets: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((res) => {
        caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Message: cache itinerary data on demand
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_PLAN') {
    const { urls } = event.data;
    caches.open(CACHE_NAME).then((cache) => {
      urls.forEach((url) => {
        fetch(url).then((res) => cache.put(url, res)).catch(() => {});
      });
    });
  }
});
