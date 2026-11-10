import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import {
  DEFAULT_BUDGET_RULE,
  isBudgetRule,
  readBudgetRule,
  subscribeBudgetRule,
  writeBudgetRule,
  type BudgetRule,
} from "@/lib/budget";

/**
 * Choix fait sur cet appareil mais pas encore confirmé par Supabase (envoi en cours,
 * ou échec hors ligne) : tant qu'il existe, l'ancienne valeur du profil ne doit pas l'écraser.
 */
const pendingRule = new Map<string, BudgetRule>();

/**
 * Règle de répartition choisie par l'utilisateur (50/30/20 ou 80/20).
 * Partagée par toute l'application : budget, tableau de bord, alertes, conseils.
 *
 * Synchronisation :
 *  - la copie locale (appareil) assure un affichage instantané, même hors ligne ;
 *  - la colonne `profiles.budget_rule` (Supabase, protégée par RLS) fait foi
 *    et permet de retrouver son choix sur tous ses appareils.
 * Si la colonne n'existe pas encore (migration non appliquée), seule la copie locale est utilisée.
 */
export function useBudgetRule() {
  const { session, profile, refreshProfile } = useAuth();
  const userId = session?.user?.id ?? null;
  const remoteRule = isBudgetRule(profile?.budget_rule) ? profile.budget_rule : null;

  // À la connexion (ou si le choix a changé sur un autre appareil), le profil fait foi.
  useEffect(() => {
    if (!userId || !remoteRule) return;
    const pending = pendingRule.get(userId);
    if (pending) {
      if (pending === remoteRule) pendingRule.delete(userId); // confirmé par le serveur
      return;
    }
    if (readBudgetRule(userId) !== remoteRule) writeBudgetRule(userId, remoteRule);
  }, [userId, remoteRule]);

  const rule = useSyncExternalStore(
    subscribeBudgetRule,
    () => readBudgetRule(userId),
    () => DEFAULT_BUDGET_RULE,
  );

  const setRule = useCallback(
    async (next: BudgetRule) => {
      if (!userId) return;
      pendingRule.set(userId, next);
      writeBudgetRule(userId, next); // effet immédiat dans toute l'application

      const { error } = await supabase
        .from("profiles")
        .update({ budget_rule: next })
        .eq("id", userId);

      // Échec (hors ligne, migration absente) : le choix reste valable sur cet appareil.
      if (!error) await refreshProfile();
    },
    [userId, refreshProfile],
  );

  return { rule, setRule };
}
