import { useEffect, useState, useSyncExternalStore } from "react";
import {
  canPromptInstall,
  isIosDevice,
  isStandaloneMode,
  promptInstall,
  subscribeInstallState,
} from "@/lib/pwa";

/**
 * Bouton « Installer » permanent du Profil.
 * L'événement d'installation de Chrome est capturé dès le démarrage par src/lib/pwa.ts
 * (il n'est émis qu'une fois, bien avant l'ouverture de cette page) : on le lit ici.
 */
export default function InstallAppCard() {
  const canPrompt = useSyncExternalStore(subscribeInstallState, canPromptInstall, () => false);
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState("");
  const ios = isIosDevice();

  useEffect(() => {
    const handleInstalled = () => {
      setInstalled(true);
      setMessage("FinBuilder AI est installé sur votre téléphone.");
    };
    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, []);

  const handleInstall = async () => {
    if (!canPrompt) {
      setShowHelp(true);
      return;
    }

    setShowHelp(false);
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      setInstalled(true);
      setMessage("Installation lancée. L'icône apparaît sur votre écran d'accueil.");
    } else if (outcome === "dismissed") {
      setMessage("Installation annulée. Vous pouvez réessayer depuis le menu de votre navigateur.");
    } else {
      setShowHelp(true);
    }
  };

  const handleHelp = () => {
    setShowHelp((current) => !current);
    setMessage("");
  };

  if (installed) {
    return (
      <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <i className="ri-smartphone-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-950">Application installée</p>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-600">
              FinBuilder AI s'ouvre désormais comme une application, en plein écran, depuis l'icône
              de votre écran d'accueil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <i className="ri-smartphone-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-950">
              Installer FinBuilder AI sur votre téléphone
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-600">
              Ajoutez l'application à votre écran d'accueil : elle s'ouvre en plein écran, sans
              barre d'adresse, comme une application classique.
            </p>
            {message && (
              <p role="status" className="mt-2 text-xs leading-relaxed text-primary-700">
                {message}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 sm:w-auto"
        >
          <i className="ri-download-2-line text-base" />
          Installer
        </button>
      </div>

      {showHelp && (
        <div className="mt-4 rounded-md border border-background-200 bg-background-100 px-3.5 py-3 text-xs leading-relaxed text-foreground-700">
          <p className="font-semibold text-foreground-900">
            {ios ? "Sur iPhone / iPad" : "Sur Android"}
          </p>
          {ios ? (
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Ouvrez FinBuilder AI dans Safari.</li>
              <li>
                Touchez le bouton <span className="font-semibold">Partager</span> (le carré avec une
                flèche).
              </li>
              <li>
                Choisissez <span className="font-semibold">Sur l'écran d'accueil</span>, puis
                confirmez.
              </li>
            </ol>
          ) : (
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Ouvrez FinBuilder AI dans Chrome.</li>
              <li>
                Touchez le menu <span className="font-semibold">⋮</span> en haut à droite.
              </li>
              <li>
                Choisissez <span className="font-semibold">Installer l'application</span> (ou
                « Ajouter à l'écran d'accueil »), puis confirmez.
              </li>
            </ol>
          )}
          <p className="mt-2 text-foreground-500">
            L'installation en un clic n'est proposée que sur les navigateurs compatibles (Chrome
            sur Android notamment).
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleHelp}
        className="tap-target mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800"
      >
        <i className="ri-question-line text-sm" />
        {showHelp ? "Masquer l'aide" : "Comment faire sur mon téléphone ?"}
      </button>
    </div>
  );
}
