const CACHE_NAME = 'notes-app-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/assets/images/favicon-32x32.png',
  '/assets/images/favicon-192x192.png',
  '/assets/images/favicon-512x512.png',
  '/assets/images/favicon-maskable-192x192.png',
  '/assets/images/favicon-maskable-512x512.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/logo.svg',
  '/assets/images/icon-home.svg',
  '/assets/images/icon-archive.svg',
  '/assets/images/icon-tag.svg',
  '/assets/images/icon-search.svg',
  '/assets/images/icon-settings.svg',
  '/assets/images/icon-plus.svg',
  '/assets/images/icon-delete.svg',
  '/assets/images/icon-restore.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets could not be precached:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation requests: Network first, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Other assets: Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchRes) => {
          if (
            event.request.method === 'GET' &&
            fetchRes.status === 200 &&
            fetchRes.type === 'basic'
          ) {
            const resToCache = fetchRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, resToCache);
            });
          }
          return fetchRes;
        })
      );
    })
  );
});
