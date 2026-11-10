import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSyncedReload } from "@/hooks/useDataSync";
import { fichesEducation } from "@/mocks/education";
import type { Fiche } from "@/lib/education";
import type { GoalEntry } from "@/lib/goals";
import {
  buildNotificationFeed,
  type NotifExpenseRow,
  type NotifIncomeRow,
  type NotifProjectRow,
  type NotificationCategory,
} from "@/lib/notifications";
import NotificationSummary from "@/pages/app/notifications/components/NotificationSummary";
import NotificationFilters from "@/pages/app/notifications/components/NotificationFilters";
import NotificationCard from "@/pages/app/notifications/components/NotificationCard";
import ReminderSettings from "@/pages/app/notifications/components/ReminderSettings";
import PushSettings from "@/pages/app/notifications/components/PushSettings";
import BudgetWeaknessCard from "@/pages/app/notifications/components/BudgetWeaknessCard";
import AnnouncementCard from "@/pages/app/notifications/components/AnnouncementCard";
import {
  ALERTS_SEEN_EVENT,
  writeAlertsSeen,
} from "@/lib/attention";
import {
  fetchMyAnnouncements,
  readAnnouncementsSeen,
  writeAnnouncementsSeen,
  type AnnouncementRow,
} from "@/lib/announcement";

const fiches = fichesEducation as Fiche[];

type FilterValue = "toutes" | "urgent" | "budget" | "objectif" | "epargne";

const defaultChannels: Record<NotificationCategory, boolean> = {
  objectif: true,
  budget: true,
  epargne: true,
};

function readDismissed(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readChannels(key: string): Record<NotificationCategory, boolean> {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as Partial<Record<NotificationCategory, boolean>>) : null;
    if (!parsed) return defaultChannels;
    return {
      objectif: parsed.objectif !== false,
      budget: parsed.budget !== false,
      epargne: parsed.epargne !== false,
    };
  } catch {
    return defaultChannels;
  }
}

export default function NotificationsPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id ?? "anonyme";
  const devise = profile?.devise ?? "FCFA";

  const dismissedKey = `finbuilder_notifs_dismissed_v1:${userId}`;
  const channelsKey = `finbuilder_notifs_channels_v1:${userId}`;

  const [income, setIncome] = useState<NotifIncomeRow[]>([]);
  const [expenses, setExpenses] = useState<NotifExpenseRow[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [projects, setProjects] = useState<NotifProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [dismissed, setDismissed] = useState<string[]>([]);
  const [channels, setChannels] = useState<Record<NotificationCategory, boolean>>(defaultChannels);
  const [filter, setFilter] = useState<FilterValue>("toutes");

  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [announcementsSeen, setAnnouncementsSeen] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(readDismissed(dismissedKey));
    setChannels(readChannels(channelsKey));
    setAnnouncementsSeen(userId === "anonyme" ? [] : readAnnouncementsSeen(userId));
  }, [dismissedKey, channelsKey, userId]);

  /* La cloche et le menu latéral écrivent le même état « lu » : on se resynchronise
     immédiatement pour qu'aucune alerte déjà lue ne reste affichée. */
  useEffect(() => {
    const syncDismissed = () => setDismissed(readDismissed(dismissedKey));
    window.addEventListener(ALERTS_SEEN_EVENT, syncDismissed);
    window.addEventListener("storage", syncDismissed);
    return () => {
      window.removeEventListener(ALERTS_SEEN_EVENT, syncDismissed);
      window.removeEventListener("storage", syncDismissed);
    };
  }, [dismissedKey]);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!userId || userId === "anonyme") {
      setLoading(false);
      return;
    }
    if (!options?.silent) setLoading(true);
    setError("");
    try {
      const [incomeResult, expenseResult, goalResult, projectsResult, announcementRows] =
        await Promise.all([
          supabase.from("income").select("id, montant, date").order("date", { ascending: false }),
          supabase
            .from("expenses")
            .select("id, montant, date, categorie, description")
            .order("date", { ascending: false }),
          supabase
            .from("goals")
            .select(
              "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note",
            )
            .order("date_limite", { ascending: true }),
          supabase
            .from("projects")
            .select("id, nom, statut, budget_total, montant_finance, date_fin, etapes")
            .order("date_creation", { ascending: false }),
          fetchMyAnnouncements(userId),
        ]);

      if (incomeResult.error) throw incomeResult.error;
      if (expenseResult.error) throw expenseResult.error;
      if (goalResult.error) throw goalResult.error;

      setIncome((incomeResult.data ?? []) as NotifIncomeRow[]);
      setExpenses((expenseResult.data ?? []) as NotifExpenseRow[]);
      setGoals((goalResult.data ?? []) as GoalEntry[]);
      setProjects((projectsResult.data ?? []) as NotifProjectRow[]);
      setAnnouncements(announcementRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Vos alertes n'ont pas pu être générées.",
      );
      setIncome([]);
      setExpenses([]);
      setGoals([]);
      setProjects([]);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  useSyncedReload(load);

  const feed = useMemo(
    () => buildNotificationFeed({ income, expenses, goals, projects, devise }),
    [income, expenses, goals, projects, devise],
  );

  const persistDismissed = useCallback(
    (next: string[]) => {
      setDismissed(next);
      if (userId === "anonyme") return;
      writeAlertsSeen(userId, next);
    },
    [userId],
  );

  const persistChannels = useCallback(
    (next: Record<NotificationCategory, boolean>) => {
      setChannels(next);
      try {
        window.localStorage.setItem(channelsKey, JSON.stringify(next));
      } catch {
        // Storage unavailable: the state simply stays in memory.
      }
    },
    [channelsKey],
  );

  const persistAnnouncementsSeen = useCallback(
    (next: string[]) => {
      setAnnouncementsSeen(next);
      if (userId === "anonyme") return;
      writeAnnouncementsSeen(userId, next);
    },
    [userId],
  );

  const visibleAnnouncements = useMemo(
    () => announcements.filter((item) => !announcementsSeen.includes(item.id)),
    [announcements, announcementsSeen],
  );

  const dismissAnnouncement = (id: string) => {
    if (announcementsSeen.includes(id)) return;
    persistAnnouncementsSeen([...announcementsSeen, id]);
  };

  const activeNotifications = useMemo(
    () =>
      feed.notifications.filter(
        (item) => channels[item.category] && !dismissed.includes(item.id),
      ),
    [feed.notifications, channels, dismissed],
  );

  const counts = useMemo(
    () => ({
      toutes: activeNotifications.length,
      urgent: activeNotifications.filter((item) => item.severity === "urgent").length,
      budget: activeNotifications.filter((item) => item.category === "budget").length,
      objectif: activeNotifications.filter((item) => item.category === "objectif").length,
      epargne: activeNotifications.filter((item) => item.category === "epargne").length,
    }),
    [activeNotifications],
  );

  const visible = useMemo(() => {
    if (filter === "toutes") return activeNotifications;
    if (filter === "urgent") return activeNotifications.filter((item) => item.severity === "urgent");
    return activeNotifications.filter((item) => item.category === filter);
  }, [activeNotifications, filter]);

  const recommended = useMemo(() => {
    const ordered = feed.diagnosis.ficheIds
      .map((id) => fiches.find((fiche) => fiche.id === id))
      .filter((fiche): fiche is Fiche => Boolean(fiche));
    if (ordered.length >= 2) return ordered.slice(0, 2);
    const fallback = fiches.filter((fiche) => !ordered.some((item) => item.id === fiche.id));
    return [...ordered, ...fallback].slice(0, 2);
  }, [feed.diagnosis.ficheIds]);

  const handleDismiss = (id: string) => {
    if (dismissed.includes(id)) return;
    persistDismissed([...dismissed, id]);
  };

  const handleDismissAll = () => {
    const ids = activeNotifications.map((item) => item.id);
    persistDismissed(Array.from(new Set([...dismissed, ...ids])));
  };

  const handleToggleChannel = (channel: NotificationCategory) => {
    persistChannels({ ...channels, [channel]: !channels[channel] });
  };

  if (loading) {
    return (
      <div className="w-full animate-fade-up space-y-4">
        <div className="h-[128px] animate-pulse rounded-lg bg-background-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[104px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="h-[360px] animate-pulse rounded-lg bg-background-200 lg:col-span-8" />
          <div className="h-[360px] animate-pulse rounded-lg bg-background-200 lg:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Centre de notifications
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ce qui mérite votre attention
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Rappels d'échéances d'objectifs, dépassements de budget et épargne manquante, générés
              à partir de vos chiffres réels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
              <i className="ri-notification-3-line text-xs text-primary-600" />
              {activeNotifications.length} alerte{activeNotifications.length > 1 ? "s" : ""} active
              {activeNotifications.length > 1 ? "s" : ""}
            </span>
            {visibleAnnouncements.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 bg-secondary-50 px-2.5 py-1 text-[11px] font-semibold text-secondary-900">
                <i className="ri-megaphone-line text-xs" />
                {visibleAnnouncements.length} message{visibleAnnouncements.length > 1 ? "s" : ""} de
                l'équipe
              </span>
            )}
            {counts.urgent > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-300 bg-accent-50 px-2.5 py-1 text-[11px] font-semibold text-accent-900">
                <i className="ri-alarm-warning-line text-xs" />
                {counts.urgent} urgente{counts.urgent > 1 ? "s" : ""}
              </span>
            )}
            <button
              type="button"
              onClick={handleDismissAll}
              disabled={activeNotifications.length === 0}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="ri-check-double-line text-xs" />
              Tout marquer comme lu
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">Impossible de générer vos alertes</p>
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

      {visibleAnnouncements.length > 0 && (
        <section className="rounded-lg border border-accent-200 bg-accent-50/60 p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-100 text-accent-900">
                <i className="ri-megaphone-line text-sm" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground-950">Messages de l'équipe</h2>
                <p className="text-[11px] text-foreground-500">
                  Annonces publiées par FinBuilder AI, à lire avant vos alertes automatiques.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => persistAnnouncementsSeen(announcements.map((item) => item.id))}
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-check-double-line text-xs" />
              Tout marquer comme lu
            </button>
          </div>

          <div className="mt-2.5 space-y-2.5">
            {visibleAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onDismiss={() => dismissAnnouncement(announcement.id)}
              />
            ))}
          </div>
        </section>
      )}

      <NotificationSummary feed={feed} devise={devise} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7 xl:col-span-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <NotificationFilters value={filter} onChange={setFilter} counts={counts} />
            {dismissed.length > 0 && (
              <button
                type="button"
                onClick={() => persistDismissed([])}
                className="inline-flex cursor-pointer items-center gap-1 self-start whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-600 transition-colors hover:border-primary-300 hover:text-primary-800 sm:self-auto"
              >
                <i className="ri-arrow-go-back-line text-xs" />
                Restaurer {dismissed.length} alerte{dismissed.length > 1 ? "s" : ""} lue
                {dismissed.length > 1 ? "s" : ""}
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-4 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <i className="ri-notification-off-line text-xl" />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-foreground-950">
                {activeNotifications.length === 0
                  ? "Aucune alerte pour le moment"
                  : "Rien dans ce filtre"}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
                {activeNotifications.length === 0
                  ? "Tout est à jour : vos objectifs ont de la marge, votre budget respecte la répartition et votre épargne du mois est enregistrée."
                  : "Essayez un autre filtre, ou restaurez les alertes que vous avez marquées comme lues."}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {filter !== "toutes" && (
                  <button
                    type="button"
                    onClick={() => setFilter("toutes")}
                    className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
                  >
                    <i className="ri-list-check text-xs" />
                    Voir toutes les alertes
                  </button>
                )}
                <Link
                  to="/app/objectifs"
                  className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
                >
                  <i className="ri-flag-2-line text-xs" />
                  Mes objectifs
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {visible.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={() => handleDismiss(notification.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 lg:col-span-5 xl:col-span-4">
          <ReminderSettings channels={channels} onToggle={handleToggleChannel} />
          <PushSettings />
          <BudgetWeaknessCard
            diagnosis={feed.diagnosis}
            feed={feed}
            fiches={recommended}
            devise={devise}
          />
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
            <i className="ri-information-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-900">Comment ces alertes sont créées</p>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
              Les messages de l'équipe sont rédigés par FinBuilder AI. Les alertes, elles, sont
              calculées depuis vos objectifs, vos dépenses et vos revenus, et disparaissent d'elles-mêmes
              dès que la situation est corrigée.
            </p>
          </div>
        </div>
        <Link
          to="/app/rapports"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
        >
          <i className="ri-file-chart-line text-xs" />
          Voir le rapport du mois
        </Link>
      </section>

      <p className="text-[11px] text-foreground-400">
        Les annonces lues, les alertes marquées comme lues et vos rappels actifs sont enregistrés sur
        cet appareil pour votre compte.
      </p>
    </div>
  );
}