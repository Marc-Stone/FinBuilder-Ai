import { useEffect, useState } from "react";
import { fetchPublicStats, type PublicStats } from "@/lib/publicStats";

type State =
  | { status: "loading"; stats: null }
  | { status: "ready"; stats: PublicStats }
  | { status: "unavailable"; stats: null };

/** Compteurs publics en direct, rechargés à chaque visite (cache d'une minute). */
export function usePublicStats(): State {
  const [state, setState] = useState<State>({ status: "loading", stats: null });

  useEffect(() => {
    let active = true;
    fetchPublicStats().then((stats) => {
      if (!active) return;
      setState(stats ? { status: "ready", stats } : { status: "unavailable", stats: null });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * Statistique « utilisateurs inscrits » prête à afficher (nombre réel de comptes).
 * Sans données (fonction absente, hors ligne), on garde l'ancien libellé : 6 types de profils couverts.
 */
export function useRegisteredUsersStat(): { value: string; label: string } {
  const { status, stats } = usePublicStats();
  if (status === "ready") {
    return {
      value: new Intl.NumberFormat("fr-FR").format(stats.users),
      label: stats.users > 1 ? "utilisateurs inscrits" : "utilisateur inscrit",
    };
  }
  if (status === "loading") return { value: "…", label: "utilisateurs inscrits" };
  return { value: "6", label: "profils financiers couverts" };
}
