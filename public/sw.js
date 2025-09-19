// Service Worker for faster navigation and offline support
const CACHE_NAME = 'swachh-bharat-v1';

// Assets to cache immediately on install
const PRE_CACHE_URLS = [
  '/',
  '/dashboard',
  '/report',
  '/shop',
  '/leaderboard',
  '/impact',
  '/profile',
  '/course',
  '/education',
  '/training',
  '/facilities',
  '/wow',
  '/community'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching important routes');
        return cache.addAll(PRE_CACHE_URLS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim()) // Take control of all clients
  );
});

// Fetch event - serve from cache first for speed, then update cache from network
self.addEventListener('fetch', event => {
  // Only cache same-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // HTML navigation requests - use network-first for fresh content
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response before using it
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache successful responses
                if (responseToCache.status === 200) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return caches.match(event.request);
          })
      );
    } 
    // For all other requests (images, scripts, etc) - use cache-first for speed
    else {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              // Return cached response immediately
              // Fetch update in background
              fetch(event.request)
                .then(response => {
                  // Update the cache with fresh content
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      if (response.status === 200) {
                        cache.put(event.request, response);
                      }
                    });
                })
                .catch(() => {
                  // Ignore network failures for background updates
                });
              
              return cachedResponse;
            }
            
            // If not in cache, fetch from network
            return fetch(event.request)
              .then(response => {
                if (!response || response.status !== 200) {
                  return response;
                }
                
                // Clone the response before using it
                const responseToCache = response.clone();
                
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
                
                return response;
              });
          })
      );
    }
  }
});
