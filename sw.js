const CACHE_NAME = 'scancar-v14';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/legal.css',
    '/js/config.js',
    '/js/app.js',
    '/js/paywall.js',
    '/js/carvertical.js',
    '/js/affiliate-tracking.js',
    '/js/vehicle-database.js',
    '/manifest.json',
    '/assets/favicon.svg',
    '/assets/icon-192.png',
    '/assets/icon-512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => null)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    // Ne JAMAIS cacher : API et endpoints dynamiques
    if (e.request.url.includes('/api/')) return;
    if (e.request.url.includes('/.netlify/functions/')) return;
    if (e.request.url.includes('rapidapi.com')) return;
    if (e.request.url.includes('apiplaqueimmatriculation.com')) return;

    // Stratégie "network-first" pour les fichiers JS/HTML/CSS — toujours dernière version si réseau OK
    const url = new URL(e.request.url);
    const isAppFile = /\.(html|js|css)$/.test(url.pathname) || url.pathname === '/';

    if (isAppFile) {
        e.respondWith(
            fetch(e.request).then(resp => {
                if (resp && resp.status === 200) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return resp;
            }).catch(() => caches.match(e.request))
        );
        return;
    }

    // Stratégie "cache-first" pour les images/icônes (rapides)
    e.respondWith(
        caches.match(e.request).then(cached => {
            return cached || fetch(e.request).then(resp => {
                if (resp && resp.status === 200) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return resp;
            });
        })
    );
});

// Permet à l'app de forcer un refresh du SW
self.addEventListener('message', (e) => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
