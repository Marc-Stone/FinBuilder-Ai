import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/pages/app/components/AppSidebar";
import AppTopbar from "@/pages/app/components/AppTopbar";
import AppMobileNav from "@/pages/app/components/AppMobileNav";
import WelcomeDigest from "@/pages/app/components/WelcomeDigest";
import FinancialProfileGate from "@/pages/app/components/FinancialProfileGate";
import { DataSyncProvider } from "@/hooks/useDataSync";
import { FinancialProfileProvider } from "@/hooks/useFinancialProfile";
import { FinancialDataProvider } from "@/hooks/useFinancialData";

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <DataSyncProvider>
      <FinancialProfileProvider>
      <FinancialDataProvider>
      <div className="min-h-screen w-full bg-background-100">
        <a href="#contenu-principal" className="skip-link">
          Aller au contenu principal
        </a>
        <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-h-screen w-full flex-col lg:pl-[264px]">
          <AppTopbar onOpenMenu={() => setMobileOpen(true)} />
          <main
            id="contenu-principal"
            className="w-full flex-1 px-4 py-6 md:px-8 md:py-8"
          >
            <Outlet />
          </main>
          <footer className="w-full border-t border-background-200 bg-background-50 px-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-4 md:px-8 lg:pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-foreground-500">© 2026 FinBuilder AI — Build your financial future</p>
              <p className="text-[11px] text-foreground-400">
                Les conseils générés ne remplacent pas un conseil financier professionnel.
              </p>
            </div>
          </footer>
        </div>
        <AppMobileNav onOpenMenu={() => setMobileOpen(true)} />
        <WelcomeDigest />
        <FinancialProfileGate />
      </div>
      </FinancialDataProvider>
      </FinancialProfileProvider>
    </DataSyncProvider>
  );
}