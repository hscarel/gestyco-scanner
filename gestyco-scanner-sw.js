/* GestyCo V45 scanner cache: performance-only; scanner code/return mechanism unchanged. */
'use strict';
const CACHE_NAME = 'gestyco-scanner-v45-assets';
const ZXING_URL = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('gestyco-scanner-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
async function cacheResponse(request, cacheName, fallbackToNetwork) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Return cache immediately; refresh quietly in the background for next launch.
    fetch(request).then(response => {
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone()).catch(()=>{});
    }).catch(()=>{});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone()).catch(()=>{});
    return response;
  } catch (e) {
    if (fallbackToNetwork) throw e;
    return new Response('Recurso no disponible sin conexión.', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
}
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.href === ZXING_URL) {
    event.respondWith(cacheResponse(req, CACHE_NAME, true));
    return;
  }
  if (url.origin === self.location.origin && req.mode === 'navigate') {
    event.respondWith(cacheResponse(req, CACHE_NAME, false));
  }
});
