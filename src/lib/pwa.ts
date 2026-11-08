/**
 * FinBuilder AI — support PWA côté application.
 * Le manifeste et le service worker vivent dans /public (servis à la racine).
 * Ce module ne fait que les brancher, sans toucher au reste de l'application.
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

/**
 * Enregistre le service worker. Silencieux en cas d'échec :
 * l'application doit continuer à fonctionner normalement sans lui.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (typeof __IS_PREVIEW__ !== "undefined" && __IS_PREVIEW__) return;
  if (!window.isSecureContext) return;

  const start = () => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const swUrl = `${baseUrl}sw.js`;

    navigator.serviceWorker
      .register(swUrl, { scope: baseUrl })
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