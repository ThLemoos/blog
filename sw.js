// Service worker do blog.
// Estratégia: REDE PRIMEIRO. Com internet, o app sempre busca a versão mais nova
// (ignorando o cache do navegador); sem internet, usa a última cópia guardada.
// Assim, tudo que você publicar no GitHub aparece no app instalado.
const CACHE = 'nosso-blog-v1';
const CORE = ['./', 'index.html', 'posts/post-2.html', 'css/style.css', 'css/carta.css', 'css/post2.css',
  'js/main.js', 'js/charada.js', 'js/carta.js', 'js/post2.js', 'js/pwa.js', 'img/foto.jpg',
  'manifest.webmanifest', 'img/icons/icon-192.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(new Request(u, { cache: 'reload' }))))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  // Firebase / Google APIs: nunca interceptar (dados ao vivo)
  if (!mesmaOrigem && !/(fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com)$/.test(url.hostname)) return;

  if (mesmaOrigem) {
    // rede primeiro, sempre ignorando o cache HTTP do navegador
    e.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'no-cache' });
        if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (err) {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') return (await caches.match('index.html')) || Response.error();
        return Response.error();
      }
    })());
  } else {
    // fontes e three.js: cache primeiro (não mudam)
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') (await caches.open(CACHE)).put(req, res.clone());
      return res;
    })());
  }
});
