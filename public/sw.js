/* FinBuilder AI — Service Worker
 *
 * Règles de sécurité (ne pas assouplir) :
 *  - Seules les ressources STATIQUES du même domaine sont mises en cache
 *    (shell HTML, JS, CSS, polices, icônes). Elles ne contiennent aucune donnée personnelle.
 *  - Aucune requête vers Supabase (REST, Auth, Storage, Realtime, Edge Functions)
 *    ni vers une API tierce n'est interceptée : elles partent toujours au réseau,
 *    protégées par la session et les règles RLS.
 *  - Aucune requête portant un en-tête Authorization n'est mise en cache.
 *  - Seules les requêtes GET sont concernées ; POST/PATCH/DELETE ne sont jamais touchées.
 *
 * Stratégies :
 *  - Navigation : réseau d'abord (délai court), shell en cache si réseau lent/absent.
 *  - /assets/* (fichiers hashés, immuables) : cache d'abord.
 *  - Autres statiques (icônes, polices locales) : cache puis rafraîchissement en arrière-plan.
 */

/* Remplacés au build par le plugin Vite « finbuilder-pwa » (vite.config.ts). */
const BUILD_ID = "__FB_BUILD_ID__";
const BUILD_PRECACHE = /* __FB_PRECACHE__ */ [];

const CACHE_PREFIX = "finbuilder";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${BUILD_ID}`;
const ASSET_CACHE = `${CACHE_PREFIX}-assets-${BUILD_ID}`;
const MAX_RUNTIME_ENTRIES = 120;
const NAVIGATION_TIMEOUT_MS = 4000;

const SCOPE = self.registration.scope;
const toUrl = (path) => new URL(path, SCOPE).href;

const APP_SHELL_URL = toUrl("./");
const OFFLINE_URL = toUrl("offline.html");

const SHELL_URLS = [
  APP_SHELL_URL,
  OFFLINE_URL,
  toUrl("manifest.json"),
  toUrl("icons/icon-192.png"),
  toUrl("icons/icon-512.png"),
  toUrl("icons/apple-touch-icon.png"),
];

/* ---------- Garde-fous : ce qui ne doit JAMAIS passer par le cache ---------- */

const SENSITIVE_PATH = /\/(rest|auth|storage|realtime|functions|graphql)\/v\d/i;

function isNeverCache(request, url) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) return true; // Supabase, CDN, API tierces
  if (request.headers.has("authorization")) return true;
  if (SENSITIVE_PATH.test(url.pathname)) return true;
  if (url.pathname.endsWith("/sw.js")) return true;
  if (url.pathname.endsWith(".map")) return true;
  return false;
}

/* ---------- Installation / activation ---------- */

async function precache(cacheName, urls) {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload", credentials: "same-origin" });
        if (response && response.ok && response.type === "basic") {
          await cache.put(url, response);
        }
      } catch {
        /* ressource indisponible : l'installation continue */
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await precache(SHELL_CACHE, SHELL_URLS);
      await precache(ASSET_CACHE, BUILD_PRECACHE.map(toUrl));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {
          /* non supporté */
        }
      }
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(`${CACHE_PREFIX}-`))
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.origin && event.origin !== self.location.origin) return;
  const data = event.data;
  if (data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ---------- Stratégies ---------- */

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

function canStore(response) {
  if (!response || !response.ok || response.type !== "basic") return false;
  const cacheControl = response.headers.get("Cache-Control") || "";
  return !/no-store|private/i.test(cacheControl);
}

async function handleNavigation(event) {
  const cache = await caches.open(SHELL_CACHE);

  const network = (async () => {
    const preload = await event.preloadResponse;
    const response = preload || (await fetch(event.request));
    if (canStore(response)) {
      // Une SPA ne sert qu'un seul document : on ne garde que le shell.
      cache.put(APP_SHELL_URL, response.clone()).catch(() => {});
    }
    return response;
  })();

  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), NAVIGATION_TIMEOUT_MS),
    );
    return await Promise.race([network, timeout]);
  } catch {
    const cached = await cache.match(APP_SHELL_URL);
    if (cached) {
      event.waitUntil(network.catch(() => undefined));
      return cached;
    }
    try {
      return await network;
    } catch {
      const offline = await cache.match(OFFLINE_URL);
      return (
        offline ||
        new Response("Hors connexion", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    }
  }
}

async function cacheFirst(event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(event.request);
  if (cached) return cached;

  const response = await fetch(event.request);
  if (canStore(response)) {
    event.waitUntil(
      cache
        .put(event.request, response.clone())
        .then(() => trimCache(ASSET_CACHE, MAX_RUNTIME_ENTRIES + BUILD_PRECACHE.length))
        .catch(() => {}),
    );
  }
  return response;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(event.request);

  const network = fetch(event.request)
    .then((response) => {
      if (canStore(response)) {
        cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  const response = await network;
  return response || new Response("", { status: 504, statusText: "Ressource indisponible" });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (isNeverCache(request, url)) return; // le navigateur gère : réseau direct

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (!["script", "style", "font", "image", "manifest"].includes(request.destination)) return;

  if (url.pathname.includes("/assets/")) {
    event.respondWith(cacheFirst(event));
    return;
  }

  event.respondWith(staleWhileRevalidate(event));
});

/* ---------- Notifications Web Push ----------
 * Format de charge utile attendu (JSON) :
 *   { "title": "...", "body": "...", "url": "/app/budget", "tag": "budget", "type": "budget_depasse" }
 * Le contenu affiché sur l'écran verrouillé doit rester générique : pas de montants
 * ni de détails financiers (voir supabase/functions/send-push).
 */

const DEFAULT_ICON = toUrl("icons/icon-192.png");

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = typeof payload.title === "string" && payload.title ? payload.title : "FinBuilder AI";
  const options = {
    body: typeof payload.body === "string" ? payload.body : "",
    icon: DEFAULT_ICON,
    badge: DEFAULT_ICON,
    tag: typeof payload.tag === "string" ? payload.tag : undefined,
    renotify: Boolean(payload.tag),
    data: { url: typeof payload.url === "string" ? payload.url : "/app/notifications" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // N'ouvre que des pages de l'application (pas de redirection externe).
  let target = toUrl("app/notifications");
  try {
    const candidate = new URL(event.notification.data?.url || "", SCOPE);
    if (candidate.origin === self.location.origin) target = candidate.href;
  } catch {
    /* URL invalide : page par défaut */
  }

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch {
              /* navigation refusée : la fenêtre reste au premier plan */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  // Le navigateur a renouvelé l'abonnement : l'application le ré-enregistrera
  // au prochain lancement (voir src/lib/push.ts → syncPushSubscription).
  event.waitUntil(Promise.resolve());
});
