// Simple offline cache — MIT © 2025 Alessandro Pezzali
const CACHE = 'mathback-v1';
const ASSETS = ['.', 'index.html', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'README.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(net => {
      const copy = net.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, copy)).catch(()=>{});
      return net;
    }).catch(() => caches.match('index.html')))
  );
});