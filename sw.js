/* Service worker de Dólar PesoPro: abre más rápido y funciona mejor con mala señal.
   - Páginas, estilos y scripts: primero la red (así siempre ves la última versión) y si no hay señal, lo guardado.
   - Imágenes: guardadas, se actualizan en segundo plano.
   - Videos y todo lo externo (Firebase, fuentes): no se tocan. */
var V = 'pp-v20261020b', SHELL = ['./', 'index.html', 'style.css', 'app.js', 'themes.js', 'firebase-config.js', 'manifest.webmanifest',
  'assets/logo.webp', 'assets/justo.webp', 'assets/boris.webp', 'assets/icon-192.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || r.headers.has('range') || /\.(mp4|webm|mov|mp3)$/i.test(u.pathname) || r.destination === 'video' || r.destination === 'audio') return;
  var isImg = r.destination === 'image' || /\.(webp|png|jpg|jpeg|svg)$/i.test(u.pathname);
  if (isImg) {
    e.respondWith(caches.open(V).then(function (c) {
      return c.match(r).then(function (hit) {
        var net = fetch(r).then(function (res) { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
    return;
  }
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
    return res;
  }).catch(function () { return caches.match(r, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); }); }));
});

/* Avisos push (Firebase Cloud Messaging, mensajes de solo datos) */
self.addEventListener('push', function (e) {
  var d = {}; try { var j = e.data && e.data.json(); d = (j && (j.data || j)) || {}; } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || 'Dólar PesoPro', { body: d.body || 'La cotización cambió.', icon: 'assets/icon-192.png', badge: 'assets/icon-192.png', tag: 'pp-rate', renotify: true, data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close(); var u = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow(u);
  }));
});
