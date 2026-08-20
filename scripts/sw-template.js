/*
 * Source for the service worker. `scripts/build-sw.mjs` substitutes the
 * precache list and version, then writes the result to out/sw.js.
 *
 * WHAT THIS CACHES: the built application — HTML, JS, CSS, fonts, the icon.
 * Nothing else, ever. No answer, score, deck position or session state is
 * written here or anywhere else; the app is still entirely stateless between
 * page loads. This exists so the whole thing works on a train.
 */

const VERSION = "__VERSION__";
const CACHE = `tft-cards-${VERSION}`;
const PRECACHE = __PRECACHE__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(serve(event, request, url));
});

async function serve(event, request, url) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });

  if (cached) {
    // Files under /_next/static are content-hashed, so a cached copy is the
    // only copy. Everything else gets refreshed behind the response.
    if (!url.pathname.startsWith("/_next/static/")) {
      event.waitUntil(revalidate(cache, request));
    }
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and not precached — a deep link to a page that did not exist at
    // build time. Hand back the home page rather than a browser error.
    if (request.mode === "navigate") {
      const home = await cache.match("/", { ignoreSearch: true });
      if (home) return home;
    }
    return Response.error();
  }
}

async function revalidate(cache, request) {
  try {
    const fresh = await fetch(request);
    if (fresh.ok && fresh.type === "basic") await cache.put(request, fresh);
  } catch {
    // Offline. The cached copy stands.
  }
}
