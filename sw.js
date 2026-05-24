const CACHE_NAME = 'scancar-v15';
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

    const url = e.request.url;
    // Ne touche surtout PAS aux endpoints dynamiques — laisse le navigateur faire
    if (url.includes('/api/') ||
        url.includes('/.netlify/functions/') ||
        url.includes('rapidapi.com') ||
        url.includes('apiplaqueimmatriculation.com') ||
        url.includes('pagead2.googlesyndication') ||
        url.includes('googletagmanager')) {
        return;
    }

    const uobj = new URL(url);
    const isAppFile = /\.(html|js|css)$/.test(uobj.pathname) || uobj.pathname === '/';

    if (isAppFile) {
        e.respondWith(
            fetch(e.request).then(resp => {
                if (resp && resp.status === 200) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return resp;
            }).catch(async () => {
                const cached = await caches.match(e.request);
                return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
            })
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(resp => {
                if (resp && resp.status === 200) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return resp;
            }).catch(() => new Response('', { status: 504 }));
        })
    );
});

self.addEventListener('message', (e) => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
