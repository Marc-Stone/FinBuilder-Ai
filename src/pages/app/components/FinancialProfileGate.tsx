import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import FinancialProfileWizard from "@/pages/app/profil-financier/components/FinancialProfileWizard";

const DISMISS_KEY = "finbuilder-financial-profile-dismissed";

export default function FinancialProfileGate() {
  const { loading, hasProfile } = useFinancialProfile();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const onDedicatedPage = location.pathname.startsWith("/app/profil-financier");

  if (loading || hasProfile || dismissed || onDedicatedPage) return null;

  return (
      <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-foreground-950/50 px-4 py-8 md:items-center">
        <div className="w-full max-w-[620px] animate-fade-up rounded-lg border border-background-200 bg-background-50 p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-500 text-background-50">
                <i className="ri-user-star-line text-base" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-400">
                  Bienvenue sur FinBuilder AI
                </p>
                <p className="text-sm font-semibold text-foreground-950">
                  Personnalisons votre expérience
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => {
                setDismissed(true);
                try {
                  window.sessionStorage.setItem(DISMISS_KEY, "1");
                } catch {
                  // stockage indisponible : la fenêtre reste simplement fermée pour la session
                }
              }}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>

          <FinancialProfileWizard
            variant="modal"
            onSaved={() => setDismissed(true)}
            onCancel={() => {
              setDismissed(true);
              try {
                window.sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {
                // ignoré
              }
            }}
          />
        </div>
      </div>
  );
}