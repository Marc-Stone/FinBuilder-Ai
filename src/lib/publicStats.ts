import { supabase } from "@/lib/supabaseClient";

export type PublicStats = {
  financialProfiles: number;
  users: number;
};

let cache: { at: number; value: PublicStats } | null = null;
let inFlight: Promise<PublicStats | null> | null = null;
const CACHE_MS = 60_000;

/**
 * Compteurs publics (page d'accueil, pages de connexion) calculés en direct par Supabase.
 * Aucune donnée personnelle : la fonction SQL `public_stats` ne renvoie que des nombres.
 * Renvoie null si la fonction n'est pas disponible (migration non appliquée, hors ligne).
 */
export async function fetchPublicStats(): Promise<PublicStats | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const { data, error } = await supabase.rpc("public_stats");
      if (error || !data) return null;
      const raw = data as { financial_profiles?: unknown; users?: unknown };
      const value: PublicStats = {
        financialProfiles: Math.max(Number(raw.financial_profiles) || 0, 0),
        users: Math.max(Number(raw.users) || 0, 0),
      };
      cache = { at: Date.now(), value };
      return value;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
