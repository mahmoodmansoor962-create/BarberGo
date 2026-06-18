const CACHE_NAME = 'barbergo-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/styles.css',
  '/manifest.json',
  '/app.js',
  '/data.js',
  '/notifications.js',
  '/ui-components.js',
  '/ui-heavy-routes.js',
  '/firebase-service.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return networkResponse;
      }).catch(() => caches.match('/'));
    })
  );
});

self.addEventListener('push', event => {
  let payload = {
    title: 'BarberGo',
    body: 'لديك تحديث جديد من BarberGo.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch (error) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data,
      vibrate: [100, 50, 100]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
