import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_ACTION_LABELS,
  fetchAdminLogs,
  formatAdminNumber,
  type AdminLogRow,
} from "@/lib/admin";
import LogTable from "@/pages/admin/journal/components/LogTable";

export default function AdminJournalPage() {
  const [logs, setLogs] = useState<AdminLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [resultat, setResultat] = useState("tous");
  const [action, setAction] = useState("toutes");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchAdminLogs(200);
      setLogs(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Le journal d'activité n'a pas pu être chargé.",
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const actions = useMemo(() => {
    const unique = new Set<string>();
    logs.forEach((log) => unique.add(log.action));
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "fr"));
  }, [logs]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (resultat !== "tous" && log.resultat !== resultat) return false;
      if (action !== "toutes" && log.action !== action) return false;
      if (!term) return true;
      const haystack = [
        log.action,
        ADMIN_ACTION_LABELS[log.action] ?? "",
        log.email ?? "",
        log.cible ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [logs, search, resultat, action]);

  const stats = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return {
      total: logs.length,
      today: logs.filter((log) => new Date(log.date_creation).getTime() >= startOfDay.getTime()).length,
      failures: logs.filter((log) => log.resultat === "echec").length,
      accounts: new Set(logs.map((log) => log.email ?? "inconnu")).size,
    };
  }, [logs]);

  const isFiltered = search !== "" || resultat !== "tous" || action !== "toutes";

  const handleReset = () => {
    setSearch("");
    setResultat("tous");
    setAction("toutes");
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
              Journal d'activité
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Chaque ouverture de console, consultation de fiche et export est enregistré avec son
              auteur, sa cible et son horodatage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={loading}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70"
          >
            <i className={loading ? "ri-loader-4-line animate-spin text-xs" : "ri-refresh-line text-xs"} />
            Actualiser
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Événements", value: stats.total, icon: "ri-history-line" },
            { label: "Aujourd'hui", value: stats.today, icon: "ri-calendar-line" },
            { label: "Échecs", value: stats.failures, icon: "ri-error-warning-line" },
            { label: "Comptes concernés", value: stats.accounts, icon: "ri-user-line" },
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
              <p className="text-xs font-semibold text-accent-900">Journal indisponible</p>
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

      <div className="rounded-lg border border-background-200 bg-background-50 p-3 md:p-4">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une action, un email, une cible…"
              className="w-full rounded-md border border-background-300 bg-background-50 py-2 pl-9 pr-3 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="max-w-[220px] cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400"
            >
              <option value="toutes">Toutes les actions</option>
              {actions.map((item) => (
                <option key={item} value={item}>
                  {ADMIN_ACTION_LABELS[item] ?? item}
                </option>
              ))}
            </select>

            <select
              value={resultat}
              onChange={(event) => setResultat(event.target.value)}
              className="cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400"
            >
              <option value="tous">Tous les résultats</option>
              <option value="succes">Succès</option>
              <option value="echec">Échecs</option>
            </select>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
            <i className="ri-filter-3-line text-[11px] text-primary-600" />
            {filtered.length} événement(s) affiché(s)
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-background-300 px-2.5 py-1 text-[11px] font-semibold text-foreground-600 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-close-line text-[11px]" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[58px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
      ) : (
        <LogTable logs={filtered} />
      )}

      <p className="text-[11px] leading-relaxed text-foreground-400">
        Les 200 événements les plus récents sont affichés. Le journal est en lecture seule :
        aucun événement ne peut être modifié ou supprimé depuis l'interface.
      </p>
    </div>
  );
}