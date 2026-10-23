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
const VERSION = "rasa-b67835d1f6";
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
  "/css/activities.css?v=891831f2e5",
  "/css/arabic.css?v=18993c0a81",
  "/css/art.css?v=9d42e6cf02",
  "/css/charity.css?v=c864c42cce",
  "/css/chess.css?v=8ecc8c3364",
  "/css/english.css?v=8a1f3bc9e3",
  "/css/events.css?v=099f1b83ef",
  "/css/french.css?v=8a1f3bc9e3",
  "/css/index.css?v=73bb3a4e9a",
  "/css/literature.css?v=e2744fda5d",
  "/css/music.css?v=40e79a39f6",
  "/css/noregistrations.css?v=a82f138907",
  "/css/registrations.css?v=a5e9274a88",
  "/js/mobile-nav.js?v=d9f0d554d1",
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
