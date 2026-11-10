/**
 * FinBuilder AI — support PWA côté application.
 * Le manifeste (manifest.json) et le service worker (sw.js) vivent dans /public.
 * Ce module les branche et expose l'état d'installation, sans toucher au reste de l'application.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;

  const displayMode = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  return displayMode || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const isIpadOs = navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1;

  return /iPad|iPhone|iPod/.test(ua) || isIpadOs;
}

/** Safari iOS est le seul navigateur iOS capable d'« Ajouter à l'écran d'accueil » de façon fiable. */
export function isIosSafari(): boolean {
  if (!isIosDevice()) return false;
  const ua = navigator.userAgent || "";
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV/i.test(ua);
}

/* ---------- Invite d'installation (Android / Chrome / Edge) ---------- */

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export function subscribeInstallState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null && !installed;
}

export function wasInstalledThisSession(): boolean {
  return installed;
}

/** Ouvre la boîte de dialogue native d'installation. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const event = deferredPrompt;
  if (!event) return "unavailable";
  deferredPrompt = null; // un événement ne peut servir qu'une seule fois
  notify();
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch {
    return "dismissed";
  }
}

/**
 * À appeler le plus tôt possible : `beforeinstallprompt` peut être émis
 * avant le montage de React.
 */
function captureInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // on affiche notre propre bouton « Installer FinBuilder AI »
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    notify();
  });
}

/* ---------- Mises à jour ---------- */

/**
 * Après un déploiement, un onglet resté ouvert peut demander un fichier JS
 * qui n'existe plus. Vite émet alors `vite:preloadError` : on recharge une seule fois.
 */
function recoverFromStaleChunks(): void {
  const KEY = "finbuilder:chunk-reload";
  window.addEventListener("vite:preloadError", (event) => {
    if (window.sessionStorage.getItem(KEY) === "1") return;
    window.sessionStorage.setItem(KEY, "1");
    event.preventDefault();
    window.location.reload();
  });
  window.addEventListener("load", () => {
    window.setTimeout(() => window.sessionStorage.removeItem(KEY), 10_000);
  });
}

/**
 * Enregistre le service worker. Silencieux en cas d'échec :
 * l'application doit continuer à fonctionner normalement sans lui.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;

  captureInstallPrompt();
  recoverFromStaleChunks();

  if (!("serviceWorker" in navigator)) return;
  if (typeof __IS_PREVIEW__ !== "undefined" && __IS_PREVIEW__) return;
  if (!window.isSecureContext) return; // HTTPS obligatoire (localhost toléré pour le dev)
  if (import.meta.env.DEV) return; // pas de cache en développement (HMR)

  const start = () => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const swUrl = `${baseUrl}sw.js`;

    navigator.serviceWorker
      .register(swUrl, { scope: baseUrl, updateViaCache: "none" })
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              registration.waiting?.postMessage("SKIP_WAITING");
            }
          });
        });

        // Vérifie les mises à jour quand l'app revient au premier plan (usage mobile).
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        });
      })
      .catch(() => {
        /* pas de PWA : aucun impact sur l'application */
      });
  };

  if (document.readyState === "complete") {
    start();
  } else {
    window.addEventListener("load", start, { once: true });
  }
}

export type { BeforeInstallPromptEvent };
