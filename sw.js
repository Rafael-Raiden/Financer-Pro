// ============================================================
// Financer Pro — Service Worker v3
// Estratégia:
//   • API (Google Apps Script) → sempre rede, nunca cache
//   • index.html               → rede primeiro (pega atualização na hora),
//                                 cache só quando estiver offline
//   • Fontes / CDN / ícones    → cache primeiro
// ============================================================

const CACHE_STATIC = 'financer-static-v3';

// Caminhos RELATIVOS ao sw.js: funciona na raiz do domínio (Vercel) e
// também em subpastas (ex.: GitHub Pages em /financer-pro/).
const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
];

// ── INSTALL ───────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) =>
      // Um arquivo que falhe (ex.: ícone ausente) não impede os demais de entrarem
      // no cache — o cache.addAll() antigo era "tudo ou nada".
      Promise.all(PRECACHE_URLS.map((url) =>
        cache.add(url).catch((err) => console.warn('[SW] Não foi possível pré-cachear', url, err))
      ))
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_STATIC).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

function guardarNoCache(request, response) {
  if (response && (response.ok || response.type === 'opaque')) {
    const clone = response.clone();
    caches.open(CACHE_STATIC).then((cache) => cache.put(request, clone)).catch(() => {});
  }
  return response;
}

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // deixa o navegador tratar

  const url = new URL(request.url);
  const host = url.hostname;

  // API do Google Apps Script — sempre rede. Dados financeiros nunca vão
  // para o cache do Service Worker.
  if (host === 'script.google.com' || host.endsWith('.googleusercontent.com')) {
    event.respondWith(fetch(request).catch(() =>
      new Response(JSON.stringify({ error: 'Sem conexão com a internet. Verifique sua rede.' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // Google Fonts e CDN — cache primeiro
  if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com' || host === 'cdnjs.cloudflare.com') {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => guardarNoCache(request, response))
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Página do app — rede primeiro. Com "cache primeiro" (versão antiga) uma
  // atualização do app só aparecia no SEGUNDO carregamento depois do deploy.
  if (request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => guardarNoCache(request, response))
        .catch(() => caches.match(request).then((cached) => cached || caches.match('index.html')))
    );
    return;
  }

  // Demais arquivos do próprio site (ícones, manifest) — cache primeiro
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => guardarNoCache(request, response))
    )
  );
});

// ── PUSH NOTIFICATIONS (futuro) ──────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch (e) { data = { body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Financer Pro', {
      body: data.body || '',
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-72.png',
      tag: 'financer-notification',
    })
  );
});
