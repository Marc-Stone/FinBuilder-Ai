import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  displayUserName,
  exportUsersCsv,
  fetchAdminUsers,
  formatAdminNumber,
  recordAdminAction,
  type AdminUserRow,
} from "@/lib/admin";
import UserFilters from "@/pages/admin/utilisateurs/components/UserFilters";
import UserTable from "@/pages/admin/utilisateurs/components/UserTable";
import UserDetailModal from "@/pages/admin/utilisateurs/components/UserDetailModal";

export default function AdminUsersPage() {
  const { profile, session } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("tous");
  const [country, setCountry] = useState("tous");
  const [sort, setSort] = useState("recent");
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [notice, setNotice] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchAdminUsers();
      setUsers(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "La liste des comptes n'a pas pu être chargée.",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const countries = useMemo(() => {
    const unique = new Set<string>();
    users.forEach((user) => {
      if (user.pays && user.pays.trim()) unique.add(user.pays.trim());
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "fr"));
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = users.filter((user) => {
      if (role !== "tous" && user.role !== role) return false;
      if (country !== "tous" && (user.pays ?? "") !== country) return false;
      if (!term) return true;
      const haystack = [user.prenom, user.nom, user.email, user.telephone, user.pays]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });

    return [...rows].sort((a, b) => {
      if (sort === "nom") {
        return displayUserName(a).localeCompare(displayUserName(b), "fr");
      }
      const diff = new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
      return sort === "ancien" ? diff : -diff;
    });
  }, [users, search, role, country, sort]);

  const stats = useMemo(() => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    return {
      total: users.length,
      admins: users.filter((user) => user.role === "admin" || Boolean(user.admin_role_id)).length,
      countries: countries.length,
      newThisMonth: users.filter((user) => user.date_creation >= startOfMonth).length,
    };
  }, [users, countries.length]);

  const handleReset = () => {
    setSearch("");
    setRole("tous");
    setCountry("tous");
    setSort("recent");
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    exportUsersCsv(filtered);
    recordAdminAction({
      action: "export_utilisateurs",
      cible: `${filtered.length} compte(s)`,
      email: profile?.email ?? null,
      userId: session?.user?.id ?? null,
      details: { recherche: search, role, pays: country, tri: sort },
    });
  };

  const handleExportPdf = async () => {
    if (filtered.length === 0 || exportingPdf) return;
    setExportingPdf(true);
    setNotice("");
    try {
      const { exportUsersPdf } = await import("@/lib/adminUsersPdf");
      exportUsersPdf(
        filtered,
        { search, role, country, sort },
        stats,
        profile?.email ?? "",
      );
      setNotice(`L'annuaire de ${filtered.length} compte(s) a été exporté en PDF.`);
      recordAdminAction({
        action: "export_utilisateurs",
        cible: `${filtered.length} compte(s)`,
        email: profile?.email ?? null,
        userId: session?.user?.id ?? null,
        details: { format: "pdf", recherche: search, role, pays: country, tri: sort },
      });
    } catch {
      setNotice("L'export PDF a échoué. Veuillez réessayer.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSelect = (user: AdminUserRow) => {
    setNotice("");
    setSelected(user);
    recordAdminAction({
      action: "consultation_utilisateur",
      cible: user.email ?? user.id,
      email: profile?.email ?? null,
      userId: session?.user?.id ?? null,
    });
  };

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Administration
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Tous les comptes FinBuilder
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Recherchez un utilisateur, filtrez par pays ou par rôle, ouvrez sa fiche ou exportez la
              liste complète en CSV ou en PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-wait disabled:opacity-70"
            >
              <i className={loading ? "ri-loader-4-line animate-spin text-xs" : "ri-refresh-line text-xs"} />
              Actualiser
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={filtered.length === 0 || exportingPdf}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className={exportingPdf ? "ri-loader-4-line animate-spin text-xs" : "ri-file-pdf-2-line text-xs"} />
              {exportingPdf ? "Génération…" : "Exporter PDF"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="ri-download-2-line text-xs" />
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Comptes", value: stats.total, icon: "ri-group-line" },
            { label: "Accès console", value: stats.admins, icon: "ri-shield-keyhole-line" },
            { label: "Pays", value: stats.countries, icon: "ri-global-line" },
            { label: "Nouveaux ce mois", value: stats.newThisMonth, icon: "ri-user-add-line" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-background-200 bg-background-50 px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <i className={`${item.icon} text-[11px] text-primary-600`} />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                  {item.label}
                </p>
              </div>
              <p className="mt-1 text-base font-semibold leading-none text-foreground-950">
                {formatAdminNumber(item.value)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">Comptes indisponibles</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-accent-800">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
          <i className="ri-checkbox-circle-line mt-0.5 text-base text-primary-700" />
          <p className="text-xs leading-relaxed text-primary-800">{notice}</p>
        </div>
      )}

      <UserFilters
        search={search}
        onSearch={setSearch}
        role={role}
        onRole={setRole}
        country={country}
        onCountry={setCountry}
        countries={countries}
        sort={sort}
        onSort={setSort}
        resultCount={filtered.length}
        onReset={handleReset}
      />

      {loading && users.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[58px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
      ) : (
        <UserTable users={filtered} onSelect={handleSelect} />
      )}

      <p className="text-[11px] leading-relaxed text-foreground-400">
        L'administration peut consulter un compte et le supprimer si nécessaire. Les comptes
        administrateurs sont protégés : leur accès à la console doit d'abord être retiré. Les
        données financières personnelles restent privées.
      </p>

      {selected && (
        <UserDetailModal
          user={selected}
          canDelete={selected.role !== "admin" && !selected.admin_role_id}
          onClose={() => setSelected(null)}
          onDeleted={() => {
            const label = selected.email ?? displayUserName(selected);
            setSelected(null);
            setNotice(`Le compte ${label} et ses données financières ont été supprimés.`);
            setReloadKey((value) => value + 1);
          }}
        />
      )}
    </div>
  );
}