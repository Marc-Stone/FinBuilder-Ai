import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { disablePushNotifications, syncPushSubscription } from "@/lib/push";

export type Profile = {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  pays: string | null;
  devise: string | null;
  avatar_url: string | null;
  role: string;
  admin_role_id?: string | null;
  date_creation: string;
  updated_at: string;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const userId = session?.user?.id;

  const fetchProfile = useCallback(async (id: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      setProfile((data as Profile) ?? null);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    fetchProfile(userId);
    // Notifications push : ré-associe l’abonnement de cet appareil au compte connecté.
    void syncPushSubscription(userId);
  }, [userId, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    await fetchProfile(userId);
  }, [userId, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      // Appareil partagé : on retire l’abonnement push avant de quitter la session (RLS).
      await disablePushNotifications().catch(() => {});
      await supabase.auth.signOut();
    } catch {
      // La session peut déjà être invalide (compte supprimé) : on nettoie l'état local.
    } finally {
      setProfile(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, profile, loading, profileLoading, signOut, refreshProfile }),
    [session, profile, loading, profileLoading, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
}

export function getDisplayName(profile: Profile | null) {
  if (!profile) return "";
  const parts = [profile.prenom, profile.nom].filter(Boolean);
  return parts.join(" ") || profile.email || "";
}

export function getInitials(profile: Profile | null) {
  if (!profile) return "FB";
  const first = profile.prenom?.trim().charAt(0) ?? "";
  const last = profile.nom?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;
  if (profile.email) return profile.email.charAt(0).toUpperCase();
  return "FB";
}