/* Blockplan – Offline-Modus. Beim ersten Besuch werden alle Dateien gespeichert,
   danach läuft die Seite auch ohne Internet. Neue Versionen werden im Hintergrund geladen.
   Nach Änderungen an Dateien die Versionsnummer erhöhen. */
const VERSION = 'blockplan-2.1.1';
const FILES = [
  './', 'index.html', 'legal.html', 'manifest.webmanifest',
  'vendor/three.min.js', 'vendor/OrbitControls.js', 'vendor/fonts/fonts.css',
  'js/config.js', 'js/i18n.js', 'js/blocks.js', 'js/builds.js', 'js/builds-community.js', 'js/builds-mega.js', 'js/builds-secret.js', 'js/builds-special.js',
  'js/formats.js', 'js/viewer.js', 'js/app.js',
  'js/i18n/en.js', 'js/i18n/es.js', 'js/i18n/fr.js', 'js/i18n/tr.js', 'js/i18n/pl.js',
  'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
  }));
});
