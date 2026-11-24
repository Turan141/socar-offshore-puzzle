const CACHE_NAME = 'socar-offshore-v16';

const PRECACHE_URLS = [
  './',
  './index.html',
  './fonts/montserrat.css',
  './fonts/montserrat-0.woff2',
  './fonts/montserrat-1.woff2',
  './fonts/montserrat-2.woff2',
  './fonts/montserrat-3.woff2',
  './fonts/montserrat-4.woff2',
  './vendor/three/build/three.module.js',
  './vendor/three/examples/jsm/loaders/GLTFLoader.js',
  './vendor/three/examples/jsm/utils/BufferGeometryUtils.js',
  './assets/platform_kit.glb',
  './assets/marine_v2.glb',
  './assets/offshore/base.glb',
  './assets/offshore/buildings.glb',
  './assets/offshore/pieces.glb',
  './assets/onshore/base.glb',
  './assets/onshore/buildings.glb',
  './assets/onshore/pieces.glb',
  './assets/kacalka/base.glb',
  './assets/kacalka/buildings.glb',
  './assets/kacalka/pieces.glb',
  './assets/refinery/base.glb',
  './assets/refinery/buildings.glb',
  './assets/refinery/pieces.glb',
  './assets/green/base.glb',
  './assets/green/buildings.glb',
  './assets/green/pieces.glb',
  './assets/terminal/base.glb',
  './assets/terminal/buildings.glb',
  './assets/terminal/pieces.glb',
  './sfx/invalid.wav',
  './sfx/lose.wav',
  './sfx/move.wav',
  './sfx/pickup.wav',
  './sfx/place.wav',
  './sfx/rotate.wav',
  './sfx/select.wav',
  './sfx/star.wav',
  './sfx/start.wav',
  './sfx/tick.wav',
  './sfx/win.wav',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(PRECACHE_URLS.map(u => fetch(u, { cache: 'no-cache' }).then(r => cache.put(u, r)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const p = url.pathname;
  if (p.includes('/vendor/') || p.includes('/fonts/') || p.includes('/assets/') || p.includes('/sfx/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(c =>
        c.match(req, { ignoreSearch: true }).then(cached => {
          if (cached) return cached;
          return fetch(req).then(resp => {
            if (resp && resp.ok) c.put(req, resp.clone());
            return resp;
          });
        })
      )
    );
    return;
  }

  // Network-first fallback-to-cache for HTML / navigation requests
  event.respondWith(
    fetch(req)
      .then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return resp;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(c => c || caches.match('./index.html')))
  );
});
