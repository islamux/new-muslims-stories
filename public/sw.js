const CACHE_NAME = 'new-muslim-stories-v0.1.0';
const OFFLINE_URL = '/offline';

// Critical resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/en',
  '/ar',
  '/offline',
  '/manifest.json'
];

// Install event - Precache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch event - Handle network requests with caching strategy
self.addEventListener('fetch', (event) => {
  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first for navigation
          const networkResponse = await fetch(event.request);

          // Cache successful responses
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          // Network failed, try cache
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);

          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page for HTML requests
          if ((event.request.headers.get('accept') ?? '').includes('text/html')) {
            const offlineResponse = await cache.match(OFFLINE_URL);
            if (offlineResponse) {
              return offlineResponse;
            }
          }

          throw error;
        }
      })()
    );
    return;
  }

  // Handle story data requests (JSON/API)
  if (event.request.url.includes('/stories/') || event.request.url.includes('stories')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
            })
            .catch(() => {
              // Silently fail for background updates
            });

          return cachedResponse;
        }

        // No cache, try network
        try {
          const networkResponse = await fetch(event.request);

          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }

          return networkResponse;
        } catch {
          // Return offline page or error response
          return new Response('Content not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        }
      })()
    );
    return;
  }

  // Handle static resources (CSS, JS, images, fonts)
  if (
    event.request.url.includes('.css') ||
    event.request.url.includes('.js') ||
    event.request.url.includes('.png') ||
    event.request.url.includes('.jpg') ||
    event.request.url.includes('.svg') ||
    event.request.url.includes('.ico') ||
    event.request.url.includes('/_next/')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);

          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          // Return a fallback for missing images
          if (event.request.url.includes('.png') || event.request.url.includes('.jpg')) {
            return new Response('', {
              status: 204
            });
          }

          throw error;
        }
      })()
    );
    return;
  }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New story available',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Read Story',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('New Muslim Stories', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        const client = clients.find((c) => c.visibilityState === 'visible');
        if (client) {
          client.focus();
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-stories') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();

        // Retry failed requests
        return Promise.all(
          requests.map((request) =>
            fetch(request).catch(() => request)
          )
        );
      })()
    );
  }
});
