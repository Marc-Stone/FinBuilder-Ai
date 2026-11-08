import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useDataSync } from "@/hooks/useDataSync";
import { ALERTS_SEEN_EVENT, readAlertChannels, readAlertsSeen, writeAlertsSeen } from "@/lib/attention";
import type { GoalEntry } from "@/lib/goals";
import {
  buildNotificationFeed,
  type AppNotification,
  type NotifExpenseRow,
  type NotifIncomeRow,
  type NotifProjectRow,
} from "@/lib/notifications";

type AlertFeedState = {
  alerts: AppNotification[];
  seen: string[];
  loading: boolean;
  devise: string;
};

/**
 * Cache partagé des alertes financières (budget, objectifs, épargne, projets).
 * La cloche, le badge du menu et le résumé d'accueil lisent tous ce même état :
 * une seule série de requêtes est envoyée pour toute l'application.
 */
let cachedUserId: string | null = null;
let cachedState: AlertFeedState = { alerts: [], seen: [], loading: true, devise: "FCFA" };
let inFlight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach((listener) => listener());
}

function setState(patch: Partial<AlertFeedState>) {
  cachedState = { ...cachedState, ...patch };
  emit();
}

function syncSeen(userId: string) {
  if (cachedUserId !== userId) return;
  setState({ seen: readAlertsSeen(userId) });
}

async function loadAlertFeed(userId: string, devise: string): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const [incomeResult, expenseResult, goalResult, projectResult] = await Promise.all([
        supabase.from("income").select("id, montant, date"),
        supabase.from("expenses").select("id, montant, date, categorie, description"),
        supabase
          .from("goals")
          .select(
            "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note",
          ),
        supabase
          .from("projects")
          .select("id, nom, statut, budget_total, montant_finance, date_fin, etapes"),
      ]);

      if (incomeResult.error) throw incomeResult.error;
      if (expenseResult.error) throw expenseResult.error;
      if (goalResult.error) throw goalResult.error;
      if (projectResult.error) throw projectResult.error;
      if (cachedUserId !== userId) return;

      const feed = buildNotificationFeed({
        income: (incomeResult.data ?? []) as NotifIncomeRow[],
        expenses: (expenseResult.data ?? []) as NotifExpenseRow[],
        goals: (goalResult.data ?? []) as GoalEntry[],
        projects: (projectResult.data ?? []) as NotifProjectRow[],
        devise,
      });

      const channels = readAlertChannels(userId);
      const alerts = feed.notifications.filter((item) => channels[item.category] !== false);
      setState({ alerts, seen: readAlertsSeen(userId), loading: false, devise });
    } catch {
      if (cachedUserId === userId) setState({ alerts: [], loading: false, devise });
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function useAlertFeed() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id ?? null;
  const devise = profile?.devise ?? "FCFA";
  const { version } = useDataSync();
  const versionRef = useRef(version);
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((value) => value + 1);
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      cachedUserId = null;
      cachedState = { alerts: [], seen: [], loading: false, devise };
      emit();
      return;
    }

    if (cachedUserId !== userId) {
      cachedUserId = userId;
      cachedState = { alerts: [], seen: readAlertsSeen(userId), loading: true, devise };
      emit();
    } else {
      syncSeen(userId);
    }

    void loadAlertFeed(userId, devise);

    const handleSeen = () => syncSeen(userId);
    const handleFocus = () => {
      syncSeen(userId);
      void loadAlertFeed(userId, devise);
    };

    window.addEventListener(ALERTS_SEEN_EVENT, handleSeen);
    window.addEventListener("storage", handleSeen);
    window.addEventListener("focus", handleFocus);
    const timer = window.setInterval(() => {
      void loadAlertFeed(userId, devise);
    }, 60000);

    return () => {
      window.removeEventListener(ALERTS_SEEN_EVENT, handleSeen);
      window.removeEventListener("storage", handleSeen);
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(timer);
    };
  }, [userId, devise]);

  useEffect(() => {
    if (!userId) return;
    if (versionRef.current === version) return;
    versionRef.current = version;
    void loadAlertFeed(userId, devise);
  }, [version, userId, devise]);

  const markSeen = useCallback((id: string) => {
    if (!cachedUserId) return;
    writeAlertsSeen(cachedUserId, [...cachedState.seen, id]);
  }, []);

  const markAllSeen = useCallback(() => {
    if (!cachedUserId) return;
    writeAlertsSeen(
      cachedUserId,
      [...cachedState.seen, ...cachedState.alerts.map((alert) => alert.id)],
    );
  }, []);

  const refresh = useCallback(() => {
    if (!cachedUserId) return;
    syncSeen(cachedUserId);
    void loadAlertFeed(cachedUserId, cachedState.devise);
  }, []);

  const unread = cachedState.alerts.filter((alert) => !cachedState.seen.includes(alert.id));

  return {
    alerts: cachedState.alerts,
    unread,
    unreadCount: unread.length,
    loading: cachedState.loading,
    markSeen,
    markAllSeen,
    refresh,
  };
}