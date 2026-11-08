import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ADMIN_ACTION_LABELS,
  fetchAdminOverview,
  formatAdminNumber,
  formatAdminMoney,
  formatRelative,
  recordAdminAction,
  type AdminOverviewData,
} from "@/lib/admin";
import AdminKpiCard from "@/pages/admin/components/AdminKpiCard";
import AdminBarList from "@/pages/admin/components/AdminBarList";

const ACCESS_LOG_KEY = "finbuilder_admin_access_logged";

export default function AdminOverviewPage() {
  const { profile, session } = useAuth();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const overview = await fetchAdminOverview();
      setData(overview);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Les statistiques de la plateforme n'ont pas pu être chargées.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  useEffect(() => {
    if (!profile?.email) return;
    const today = new Date().toISOString().slice(0, 10);
    if (sessionStorage.getItem(ACCESS_LOG_KEY) === today) return;
    sessionStorage.setItem(ACCESS_LOG_KEY, today);
    recordAdminAction({
      action: "acces_administration",
      cible: "console",
      email: profile.email,
      userId: session?.user?.id ?? null,
      details: { page: "vue_ensemble" },
    });
  }, [profile?.email, session?.user?.id]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const aiUsagePercent =
    data && data.aiMonthlyBudget > 0
      ? Math.min(100, Math.round((data.aiCost30d / data.aiMonthlyBudget) * 100))
      : 0;

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Administration · Phase 7
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pilotez la plateforme FinBuilder
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Comptes inscrits, répartition géographique, utilisation de l'assistant IA et actions
              récentes — tout ce qui se passe sur la plateforme, au même endroit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
              <i className="ri-calendar-line text-xs text-primary-600" />
              {today}
            </span>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70"
            >
              <i className={loading ? "ri-loader-4-line animate-spin text-xs" : "ri-refresh-line text-xs"} />
              Actualiser
            </button>
            <Link
              to="/admin/parametres"
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-settings-3-line text-xs" />
              Paramètres
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">Statistiques indisponibles</p>
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

      {loading && !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[104px] animate-pulse rounded-lg bg-background-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="h-[280px] animate-pulse rounded-lg bg-background-200 lg:col-span-7" />
            <div className="h-[280px] animate-pulse rounded-lg bg-background-200 lg:col-span-5" />
          </div>
        </div>
      ) : (
        data && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AdminKpiCard
                icon="ri-group-line"
                label="Comptes inscrits"
                value={formatAdminNumber(data.totalUsers)}
                hint="Tous les profils enregistrés"
                tone="primary"
              />
              <AdminKpiCard
                icon="ri-user-add-line"
                label="Nouveaux ce mois"
                value={formatAdminNumber(data.newThisMonth)}
                hint="Inscriptions depuis le 1er du mois"
                tone="accent"
              />
              <AdminKpiCard
                icon="ri-shield-keyhole-line"
                label="Administrateurs"
                value={formatAdminNumber(data.adminCount)}
                hint="Comptes disposant de l'accès console"
                tone="secondary"
              />
              <AdminKpiCard
                icon="ri-history-line"
                label="Actions (30 j)"
                value={formatAdminNumber(data.logs30d)}
                hint={
                  data.failures30d > 0
                    ? `${data.failures30d} échec(s) enregistré(s)`
                    : "Aucun échec enregistré"
                }
                tone="neutral"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <AdminBarList
                  title="Répartition par pays"
                  icon="ri-global-line"
                  items={data.countryBreakdown}
                  total={data.totalUsers}
                  emptyLabel="Aucun pays renseigné pour le moment."
                  tone="primary"
                />
                <AdminBarList
                  title="Devises de compte"
                  icon="ri-money-dollar-circle-line"
                  items={data.deviseBreakdown}
                  total={data.totalUsers}
                  emptyLabel="Aucune devise renseignée."
                  tone="secondary"
                />
              </div>

              <div className="space-y-3 lg:col-span-5">
                <div className="rounded-lg border border-background-200 bg-background-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-100 text-accent-800">
                      <i className="ri-sparkling-line text-sm" />
                    </span>
                    <h2 className="text-sm font-semibold text-foreground-900">Assistant IA · 30 jours</h2>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-background-100 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                        Requêtes
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-foreground-950">
                        {formatAdminNumber(data.aiRequests30d)}
                      </p>
                    </div>
                    <div className="rounded-md bg-background-100 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                        Tokens
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-foreground-950">
                        {formatAdminNumber(data.aiTokens30d)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-foreground-700">Coût estimé</span>
                      <span className="tabular-nums text-foreground-500">
                        {formatAdminMoney(data.aiCost30d)} / {formatAdminMoney(data.aiMonthlyBudget)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                      <div
                        className="h-full rounded-full bg-accent-500"
                        style={{ width: `${Math.max(aiUsagePercent, data.aiCost30d > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-foreground-500">
                      {data.aiCost30d > 0
                        ? `${aiUsagePercent} % du budget mensuel configuré consommé.`
                        : "Aucune consommation enregistrée : l'assistant fonctionne encore avec son analyse locale."}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-background-200 bg-background-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary-100 text-secondary-900">
                      <i className="ri-database-2-line text-sm" />
                    </span>
                    <h2 className="text-sm font-semibold text-foreground-900">Contenus de la plateforme</h2>
                  </div>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-center justify-between rounded-md bg-background-100 px-3 py-2">
                      <span className="text-[11px] font-medium text-foreground-700">Contenus créés</span>
                      <span className="text-xs font-semibold tabular-nums text-foreground-950">
                        {formatAdminNumber(data.contentsCount)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between rounded-md bg-background-100 px-3 py-2">
                      <span className="text-[11px] font-medium text-foreground-700">Annonces envoyées</span>
                      <span className="text-xs font-semibold tabular-nums text-foreground-950">
                        {formatAdminNumber(data.announcementsCount)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between rounded-md bg-background-100 px-3 py-2">
                      <span className="text-[11px] font-medium text-foreground-700">Abonnements suivis</span>
                      <span className="text-xs font-semibold tabular-nums text-foreground-950">
                        {formatAdminNumber(data.subscriptionCount)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="rounded-lg border border-background-200 bg-background-50 p-4 lg:col-span-12">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background-100 text-foreground-700">
                      <i className="ri-pulse-line text-sm" />
                    </span>
                    <h2 className="text-sm font-semibold text-foreground-900">Activité récente</h2>
                  </div>
                  <Link
                    to="/admin/journal"
                    className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary-700 transition-colors hover:text-primary-800"
                  >
                    Tout voir
                    <i className="ri-arrow-right-line text-xs" />
                  </Link>
                </div>

                {data.recentLogs.length === 0 ? (
                  <div className="mt-4 rounded-md border border-dashed border-background-300 px-3 py-6 text-center">
                    <i className="ri-history-line text-lg text-foreground-400" />
                    <p className="mt-1.5 text-xs font-medium text-foreground-600">
                      Aucune action enregistrée pour le moment
                    </p>
                    <p className="mt-0.5 text-[11px] text-foreground-500">
                      Les ouvertures de console et les exports apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-3 divide-y divide-background-200">
                    {data.recentLogs.map((log) => (
                      <li key={log.id} className="flex items-start gap-2.5 py-2.5">
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            log.resultat === "echec"
                              ? "bg-accent-100 text-accent-800"
                              : "bg-primary-100 text-primary-800"
                          }`}
                        >
                          <i
                            className={
                              log.resultat === "echec" ? "ri-error-warning-line text-[11px]" : "ri-check-line text-[11px]"
                            }
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground-900">
                            {ADMIN_ACTION_LABELS[log.action] ?? log.action}
                          </p>
                          <p className="truncate text-[11px] text-foreground-500">
                            {log.email ?? "Compte inconnu"}
                            {log.cible ? ` · ${log.cible}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-foreground-400">
                          {formatRelative(log.date_creation)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                to="/admin/utilisateurs"
                className="group flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-800">
                  <i className="ri-group-line text-lg" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground-900">Gérer les utilisateurs</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                    Rechercher un compte, filtrer par pays ou par rôle, exporter la liste.
                  </p>
                </div>
                <i className="ri-arrow-right-line ml-auto text-sm text-foreground-400 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/admin/contenus"
                className="group flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-accent-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-900">
                  <i className="ri-article-line text-lg" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground-900">Publier une fiche</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                    Rédiger une fiche et l'ajouter à la bibliothèque d'éducation.
                  </p>
                </div>
                <i className="ri-arrow-right-line ml-auto text-sm text-foreground-400 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/admin/annonces"
                className="group flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-secondary-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-900">
                  <i className="ri-megaphone-line text-lg" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground-900">Diffuser une annonce</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                    Envoyer un message dans le centre de notifications des utilisateurs.
                  </p>
                </div>
                <i className="ri-arrow-right-line ml-auto text-sm text-foreground-400 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/admin/roles"
                className="group flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-secondary-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-900">
                  <i className="ri-shield-user-line text-lg" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground-900">Gérer les rôles</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                    Ouvrir des accès limités à la console et ajuster les droits de chacun.
                  </p>
                </div>
                <i className="ri-arrow-right-line ml-auto text-sm text-foreground-400 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/admin/journal"
                className="group flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-foreground-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-900">
                  <i className="ri-history-line text-lg" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground-900">Consulter le journal</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                    Vérifier qui a fait quoi, quand, et repérer les échecs.
                  </p>
                </div>
                <i className="ri-arrow-right-line ml-auto text-sm text-foreground-400 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </>
        )
      )}

      <p className="text-[11px] text-foreground-400">
        {data
          ? `${formatAdminNumber(data.totalUsers)} compte(s) · ${formatAdminNumber(
              data.adminCount,
            )} administrateur(s) · ${formatAdminNumber(data.roleBreakdown.length)} rôle(s) distinct(s)`
          : "Chargement des indicateurs de la plateforme…"}
        {data && ` · ${formatAdminNumber(data.newThisMonth)} inscription(s) ce mois`}
      </p>
    </div>
  );
}