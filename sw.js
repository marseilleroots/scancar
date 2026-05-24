const CACHE_NAME = 'scancar-v12';
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
    '/manifest.json',
    '/assets/favicon.svg',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
    '/mentions-legales.html',
    '/confidentialite.html',
    '/cgu.html',
    '/cookies.html'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    // Ne pas cacher les appels API (Netlify ou Vercel)
    if (e.request.url.includes('/.netlify/functions/')) return;
    if (e.request.url.includes('/api/')) return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            const fetched = fetch(e.request).then(resp => {
                if (resp && resp.status === 200) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return resp;
            }).catch(() => cached);
            return cached || fetched;
        })
    );
});
