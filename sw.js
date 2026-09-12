// Ergün Panel - Service Worker
// Uygulamayı "Ana Ekrana Ekle" ile yükleyince, internet olmasa bile açılabilmesi için
// tüm sayfaları önbelleğe alır. Not: veri kaydı zaten localStorage üzerinden çalışıyor,
// bu dosya sadece sayfaların kendisini (html/css/js) çevrimdışı erişilebilir kılar.

const CACHE_NAME = 'ergun-panel-v6';
const FILES_TO_CACHE = [
    "./arac.css",
    "./arac.html",
    "./arac.js",
    "./blog.css",
    "./blog.html",
    "./blog.js",
    "./cari.css",
    "./cari.html",
    "./cari.js",
    "./dil.css",
    "./dil.html",
    "./dil.js",
    "./dovus.css",
    "./dovus.html",
    "./dovus.js",
    "./enstruman.css",
    "./enstruman.html",
    "./enstruman.js",
    "./et.css",
    "./et.html",
    "./et.js",
    "./fitness.css",
    "./fitness.html",
    "./fitness.js",
    "./gayrimenkul.css",
    "./gayrimenkul.html",
    "./gayrimenkul.js",
    "./gunluk.css",
    "./gunluk.html",
    "./gunluk.js",
    "./ibadet.css",
    "./ibadet.html",
    "./ibadet.js",
    "./icon-192.png",
    "./icon-512.png",
    "./index.css",
    "./index.html",
    "./index.js",
    "./kiraathane.css",
    "./kiraathane.html",
    "./kiraathane.js",
    "./kitap.css",
    "./kitap.html",
    "./kitap.js",
    "./kpss.css",
    "./kpss.html",
    "./kpss.js",
    "./ders.css",
    "./ders.html",
    "./ders.js",
    "./manav.css",
    "./manav.html",
    "./manav.js",
    "./manifest.json",
    "./oyun.css",
    "./oyun.html",
    "./oyun.js",
    "./shared.css",
    "./shared.js",
    "./spor.css",
    "./spor.html",
    "./spor.js",
    "./suru.css",
    "./suru.html",
    "./suru.js",
    "./sut.css",
    "./sut.html",
    "./sut.js",
    "./tarif.css",
    "./tarif.html",
    "./tarif.js",
    "./tarim.css",
    "./tarim.html",
    "./tarim.js",
    "./tasarim.css",
    "./tasarim.html",
    "./tasarim.js",
    "./teknoloji.css",
    "./teknoloji.html",
    "./teknoloji.js",
    "./tekstil.css",
    "./tekstil.html",
    "./tekstil.js",
    "./yatirim.css",
    "./yatirim.html",
    "./yatirim.js",
    "./yazilim.css",
    "./yazilim.html",
    "./yazilim.js",
    "./yks.css",
    "./yks.html",
    "./yks.js"
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
