/**
 * whitedavid23 - Progressive Web App Service Worker
 * Enterprise caching strategies: Network-First for APIs & Navigations,
 * Stale-While-Revalidate for Static Assets, Offline SPA Shell Fallback.
 */

const CACHE_VERSION = 'v1.0.0';
const APP_SHELL_CACHE = `whitedavid23-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `whitedavid23-static-${CACHE_VERSION}`;
const API_CACHE = `whitedavid23-api-${CACHE_VERSION}`;

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/favicon-32x32.png',
  '/favicon-64x64.png',
  '/favicon-192x192.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/login.png'
];

// 1. Install Event: Cache App Shell & Skip Waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      // Use individual caching so single resource failure never breaks service worker installation
      const promises = APP_SHELL_ASSETS.map(async (asset) => {
        try {
          const response = await fetch(asset, { cache: 'no-cache' });
          if (response.ok) {
            await cache.put(asset, response);
          }
        } catch (err) {
          console.warn(`[PWA SW] Pre-cache failed for ${asset}:`, err.message);
        }
      });
      await Promise.all(promises);
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up outdated caches & take immediate control
self.addEventListener('activate', (event) => {
  const currentCaches = [APP_SHELL_CACHE, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('whitedavid23-') && !currentCaches.includes(cacheName)) {
            console.log(`[PWA SW] Deleting obsolete cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intelligent multi-tier caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle HTTP/HTTPS requests
  if (!url.protocol.startsWith('http')) return;

  // Passthrough video streaming / Range requests (Safari & Chrome video range requests)
  if (request.headers.get('range') || url.pathname.includes('/videos/') || url.pathname.endsWith('.mp4') || url.pathname.endsWith('.m3u8')) {
    return;
  }

  // Non-GET requests (POST, PUT, DELETE) - always go to network
  if (request.method !== 'GET') {
    return;
  }

  // A. Navigation Requests (HTML Pages / Client-Side SPA Routes)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, cache a clone for offline use
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Try to serve requested page from cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          // Try serving the SPA root '/'
          const appShell = await caches.match('/');
          if (appShell) return appShell;

          // Fallback to offline.html
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;

          return new Response('Offline - whitedavid23', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        })
    );
    return;
  }

  // B. API Requests (/api/*) - Network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    // Avoid caching sensitive auth routes like login, register, logout, otp
    const isAuthRoute = url.pathname.includes('/auth') || 
                        url.pathname.includes('/login') || 
                        url.pathname.includes('/register') || 
                        url.pathname.includes('/payment') ||
                        url.pathname.includes('/order');
    if (isAuthRoute) {
      return; // Direct network
    }

    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'You are currently offline. Please check your internet connection.',
            isOffline: true 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // C. Static Assets (JS, CSS, Images, Fonts, Icons) - Stale-While-Revalidate
  const isStaticAsset = 
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('res.cloudinary.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// 4. Communication Channel: Listen for commands from the client app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.startsWith('whitedavid23-')) {
          caches.delete(name);
        }
      });
    });
  }
});
