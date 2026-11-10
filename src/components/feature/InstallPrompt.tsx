import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import {
  canPromptInstall,
  isIosSafari,
  isStandaloneMode,
  promptInstall,
  subscribeInstallState,
} from "@/lib/pwa";

const DISMISS_KEY = "finbuilder:install-dismissed-at";
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 4000;

/* Pages où une bannière gênerait (saisie de mot de passe, console admin). */
const HIDDEN_PREFIXES = ["/reinitialiser-mot-de-passe", "/mot-de-passe-oublie", "/admin"];

function recentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function useInstallAvailability() {
  const canPrompt = useSyncExternalStore(subscribeInstallState, canPromptInstall, () => false);
  const [standalone] = useState(() => isStandaloneMode());
  const [iosSafari] = useState(() => isIosSafari());

  return {
    standalone,
    canPrompt: !standalone && canPrompt,
    iosManual: !standalone && iosSafari,
  };
}

/**
 * Bannière « Installer FinBuilder AI ».
 *  - Android / Chrome / Edge : bouton qui ouvre l'installation native.
 *  - iPhone / iPad (Safari) : rappel du geste « Partager → Sur l'écran d'accueil ».
 * Masquée en mode application installée et pendant 14 jours après « Plus tard ».
 */
export default function InstallPrompt() {
  const location = useLocation();
  const { canPrompt, iosManual } = useInstallAvailability();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(() => recentlyDismissed());

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const hiddenRoute = HIDDEN_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));
  if (!ready || dismissed || hiddenRoute || (!canPrompt && !iosManual)) return null;

  // Dans l'espace personnel, la barre d'onglets mobile occupe le bas de l'écran.
  const inApp = location.pathname.startsWith("/app");

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* stockage indisponible : masqué pour cette session seulement */
    }
    setDismissed(true);
  };

  const install = async () => {
    const outcome = await promptInstall();
    if (outcome !== "accepted") dismiss();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className={`fixed inset-x-3 z-50 mx-auto max-w-md animate-fade-up rounded-lg border border-background-200 bg-background-50 p-4 shadow-[0_12px_40px_-12px_rgb(15_23_42/0.35)] md:inset-x-auto md:right-6 ${
        inApp
          ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-6"
          : "bottom-[calc(1rem+env(safe-area-inset-bottom))]"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <p id="install-title" className="text-sm font-semibold text-foreground-950">
            Installer FinBuilder AI
          </p>
          {canPrompt ? (
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
              Ouvrez votre coach financier en un geste, en plein écran, depuis votre écran d'accueil.
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
              Touchez <i className="ri-share-box-line align-[-2px] text-sm text-primary-600" aria-label="Partager" />{" "}
              <strong className="font-semibold text-foreground-800">Partager</strong>, puis{" "}
              <strong className="font-semibold text-foreground-800">« Sur l'écran d'accueil »</strong>.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-400 hover:bg-background-100"
        >
          <i className="ri-close-line text-lg" />
        </button>
      </div>

      {canPrompt && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={dismiss} className="btn-ghost min-h-[44px] flex-1 px-3 py-2.5">
            Plus tard
          </button>
          <button type="button" onClick={install} className="btn-primary min-h-[44px] flex-1 px-3 py-2.5">
            <i className="ri-download-2-line text-base" />
            Installer
          </button>
        </div>
      )}
    </div>
  );
}
