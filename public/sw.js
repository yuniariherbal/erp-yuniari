const CACHE_NAME = 'erp-yuniari-cache-v1';

// Aset statis yang WAJIB di-cache saat pertama kali buka webnya
const PRECACHE_ASSETS = [
    '/',
    '/login',
    '/favicon.png',
    '/manifest.json',
];

// Saat PWA di-install, simpan aset statis dasar ke memori HP
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Bersihkan cache versi lama saat update
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Strategi CEGAT JARINGAN: 
// 1. Coba ambil dari jaringan internet dulu (Stale-while-revalidate atau Network First).
// 2. Jika offline/gagal, ambil dari Cache. Kasir tetap lihat UI, meskipun gak bisa transaksi tanpa sinyal.
self.addEventListener('fetch', (event) => {
    // Abaikan request POST, PUT, DELETE (karena ini khusus Supabase & Server Action)
    if (event.request.method !== 'GET') return;

    // Abaikan request ke Supabase API eksternal
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http') || url.hostname.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Jangan simpan cache kalau responsnya gagal
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Salin respons asli (karena body respons hanya bisa dibaca 1x)
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response; // Berikan respons asli ke browser
            })
            .catch(() => {
                // Kalau OFFLINE (Gagal Fetch), ambil dari kotak Cache di HP!
                return caches.match(event.request);
            })
    );
});
