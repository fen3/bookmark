/* 星愿卡牌 - 离线缓存（联网时优先取最新，断网时回退缓存） */
const CACHE_NAME = 'card-game-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './game.js',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    './icon-180.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
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

    event.respondWith(
        fetch(req)
            .then(res => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => { });
                }
                return res;
            })
            .catch(() => {
                return caches.match(req).then(hit => {
                    if (hit) return hit;
                    if (req.mode === 'navigate') return caches.match('./index.html');
                    return Response.error();
                });
            })
    );
});
