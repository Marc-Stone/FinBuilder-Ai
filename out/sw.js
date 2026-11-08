/* FinBuilder AI — Service Worker
 * Stratégie prudente : le réseau reste prioritaire pour la navigation,
 * le cache ne sert que de secours hors connexion.
 * Aucune requête vers Supabase / API n'est interceptée ni mise en cache.
 */

const CACHE_PREFIX = "finbuilder";
const CACHE_VERSION = "v1";
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;

const SCOPE = self.registration.scope;
const APP_SHELL_URL = new URL("./", SCOPE).href;
const OFFLINE_URL = new URL("offline.html", SCOPE).href;

const PRECACHE_URLS = [APP_SHELL_URL, OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response && response.ok) {
              await cache.put(url, response.clone());
            }
          } catch {
            /* ressource indisponible : on continue */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const isCacheableAsset = (request, url) => {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.endsWith("/sw.js")) return false;
  if (request.destination === "document") return false;
  return ["script", "style", "font", "image"].includes(request.destination);
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Tout ce qui n'est pas du même domaine (Supabase, polices, API) part au réseau.
  if (url.origin !== self.location.origin) return;

  // Navigation : réseau d'abord, cache en secours seulement si hors connexion.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(APP_SHELL_URL, response.clone()).catch(() => {});
          }
          return response;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          const cached = (await cache.match(request)) || (await cache.match(APP_SHELL_URL));
          if (cached) return cached;
          const offline = await cache.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response("Hors connexion", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      })(),
    );
    return;
  }

  if (!isCacheableAsset(request, url)) return;

  // Ressources statiques : on sert vite, on rafraîchit en arrière-plan.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      const network = fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        })
        .catch(() => undefined);

      if (cached) return cached;

      const response = await network;
      if (response) return response;

      return new Response("", { status: 504, statusText: "Ressource indisponible" });
    })(),
  );
});