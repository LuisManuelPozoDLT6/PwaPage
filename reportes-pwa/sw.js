const STATIC = "staticv2";
const INMUTABLE = "inmutablev1";
const DYNAMIC = 'dynamicv1';
const APP_SHELL = [
    "/",
    "/index.html",
    "/js/app.js",
    "./css/styles.css", 
    "/img/honeymoon.jpg",
    "/img/ultraviolence.jpg",
    "/pages/offline.html",
    "/pages/page2.html",
  ];

const APP_SHELL_INMUTABLE = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
];

self.addEventListener('install', (e) => {
    console.log('Instalando...');
    const staticCache = caches.open(STATIC)
    .then( cache => {
        cache.addAll(APP_SHELL);
    });
    const inmutableCache = caches.open(INMUTABLE)
    .then( cache => {
        cache.addAll(APP_SHELL_INMUTABLE);  
    });
    e.waitUntil(Promise.all([staticCache, inmutableCache]));
    //e.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('Activado');
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cacheResponse) => {
            if (!navigator.onLine) {
                if (e.request.url.includes('/pages/page2.html')) {
                    return caches.match('/pages/offline.html');
                }
            }
            if (cacheResponse) {
                return cacheResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                const dynamicCache = caches.open(DYNAMIC).then((cache) => {
                    cache.put(e.request, networkResponse.clone());
                });
                return networkResponse;
            }).catch(() => {
                return caches.match('/pages/offline.html');
            });
        })
    );
});


