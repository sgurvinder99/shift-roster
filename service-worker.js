const CACHE = 'shift-roster-sep-oct-nov-2026-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.delete('shift-roster-sep-oct-2026-v1'),
    caches.delete('shift-roster-sep-oct-2026-v2')
  ]).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(event.request, {cache: 'no-store'});
        if (fresh.ok) {
          await cache.put('./index.html', fresh.clone());
          await cache.put('./', fresh.clone());
        }
        return fresh;
      } catch (error) {
        return (await cache.match('./index.html')) || Response.error();
      }
    })());
  } else {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
  }
});
