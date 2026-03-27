// ============================================================
// Financer Pro — Service Worker v1.0
// Estratégia: Cache First para assets, Network First para API
// ============================================================

const CACHE_NAME   = 'financer-pro-v1';
const CACHE_STATIC = 'financer-static-v1';

// Arquivos para cache imediato (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
];

// ── INSTALL ───────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Some precache failed (ok if offline):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_STATIC && name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições para Google Apps Script (API) — sempre vai para rede
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(request).catch(() => {
      return new Response(JSON.stringify({ error: 'Sem conexão com a internet. Verifique sua rede.' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }));
    return;
  }

  // Para Google Fonts e CDN — Cache First
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_STATIC).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => cached))
    );
    return;
  }

  // Para o app em si — Cache First com fallback para rede
  if (request.method === 'GET' && (url.pathname === '/' || url.pathname.endsWith('.html'))) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then(cache => cache.put(request, clone));
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Demais requests — Network First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ── PUSH NOTIFICATIONS (futuro) ──────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Financer Pro', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: 'financer-notification',
    })
  );
});
