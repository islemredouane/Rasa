// Rasa service worker.
//
// Strategy
//   Pages (navigations)        network first → saved copy → offline page
//   Images                     cache first (kept to the most recent 150)
//   Site CSS / JS / data       stale-while-revalidate (CSS precached for offline)
//   Google Fonts               stale-while-revalidate (so the site still renders offline)
//   /api/*, POST, other hosts  not touched
//
// Shipping a change: bump VERSION so old caches are cleared on the next visit.
const VERSION = "rasa-ac4fe22bc9";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;
const IMAGES = `${VERSION}-images`;
const MAX_IMAGES = 150;

const PRECACHE_URLS = [
  "/",
  "/events",
  "/literature",
  "/art",
  "/music",
  "/chess",
  "/activities",
  "/charity",
  "/registrations",
  "/noregistrations",
  "/literature/arabic",
  "/literature/english",
  "/literature/french",
  "/offline",
  "/manifest.webmanifest",
  "/css/activities.css?v=c3d38238ad",
  "/css/arabic.css?v=74dc32fe74",
  "/css/art.css?v=9a9332541f",
  "/css/charity.css?v=64a2222b4f",
  "/css/chess.css?v=804d2f366e",
  "/css/english.css?v=0a37388c0a",
  "/css/events.css?v=3be96af4ab",
  "/css/french.css?v=0a37388c0a",
  "/css/index.css?v=8fdb82d35a",
  "/css/literature.css?v=5f205091e1",
  "/css/music.css?v=178c1bd761",
  "/css/noregistrations.css?v=3e70354c9c",
  "/css/registrations.css?v=6842638926",
  "/js/mobile-nav.js?v=8be4e2105b",
  "/js/events.js?v=fd0faa91f5",
  "/js/pwa.js?v=50e3fcbef8",
  "/js/book-reader.js?v=8e908f0860",
  "/data/events.js?v=5b6f431e2c",
  "/rasa-logo.png",
  "/rasa-favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

const CDN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(event));
    return;
  }

  if (request.destination === "image" && sameOrigin) {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  if (sameOrigin || CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirstPage(event) {
  const { request } = event;
  const cache = await caches.open(RUNTIME);
  try {
    const preloaded = await event.preloadResponse;
    const response = preloaded || (await fetch(request));
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const url = new URL(request.url);
    return (
      (await caches.match(request, { ignoreSearch: true })) ||
      (await caches.match(url.pathname.replace(/\.html$/, "").replace(/\/index$/, "/") || "/", { ignoreSearch: true })) ||
      (await caches.match("/offline"))
    );
  }
}

async function cacheFirstImage(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(IMAGES);
      await cache.put(request, response.clone());
      trimCache(IMAGES, MAX_IMAGES);
    }
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => {
      // opaque (cross-origin, no-cors) responses are fine to keep for the CDN script and fonts
      if (response && (response.ok || response.type === "opaque")) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}
