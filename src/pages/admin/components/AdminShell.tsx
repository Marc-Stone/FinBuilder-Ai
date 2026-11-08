import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "@/pages/admin/components/AdminSidebar";
import AdminTopbar from "@/pages/admin/components/AdminTopbar";
import { DataSyncProvider } from "@/hooks/useDataSync";
import { AdminAccessProvider } from "@/hooks/useAdminAccess";

export default function AdminShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <DataSyncProvider>
      <AdminAccessProvider>
        <div className="min-h-screen w-full bg-background-100">
          <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
          <div className="flex min-h-screen w-full flex-col lg:pl-[264px]">
            <AdminTopbar onOpenMenu={() => setMobileOpen(true)} />
            <main className="w-full flex-1 px-4 py-6 md:px-8 md:py-8">
              <Outlet />
            </main>
            <footer className="w-full border-t border-background-200 bg-background-50 px-4 py-4 md:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-foreground-500">
                  © 2026 FinBuilder AI — Console d'administration
                </p>
                <p className="text-[11px] text-foreground-400">
                  Toutes les actions sont horodatées et tracées dans le journal d'activité.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </AdminAccessProvider>
    </DataSyncProvider>
  );
}