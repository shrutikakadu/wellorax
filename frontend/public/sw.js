// Wellora PWA Service Worker v2
const CACHE_NAME = "wellora-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install: cache static assets
self.addEventListener("install", (e) => {
  console.log("[SW] Installing Wellora service worker...");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Cache addAll partial failure:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener("activate", (e) => {
  console.log("[SW] Activating Wellora service worker...");
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first, fallback to network, fallback to offline page
self.addEventListener("fetch", (e) => {
  // Skip non-GET and chrome-extension requests
  if (e.request.method !== "GET" || e.request.url.startsWith("chrome-extension")) return;
  
  // Skip API calls — always go network for fresh data
  if (e.request.url.includes("/api/") || e.request.url.includes("googleapis")) {
    e.respondWith(fetch(e.request).catch(() => new Response("", { status: 503 })));
    return;
  }

  // For page navigations — serve index.html for SPA routing
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match("/index.html").then((cached) => cached || fetch(e.request))
    );
    return;
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match("/index.html"));
    })
  );
});

// Handle push notifications (future feature)
self.addEventListener("push", (e) => {
  const data = e.data?.json() || { title: "Wellora", body: "You have a new notification!" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" }
    })
  );
});

// Notification click: open app
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || "/"));
});
