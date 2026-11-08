import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import type { FinancialProfileType } from "@/lib/financialProfiles";

export type FinancialProfileRow = {
  id: string;
  user_id: string;
  profile_type: FinancialProfileType;
  monthly_income: number;
  income_type: string | null;
  family_size: number;
  financial_goals: string[];
  created_at: string;
  updated_at: string;
};

export type FinancialProfileInput = {
  profile_type: FinancialProfileType;
  monthly_income: number;
  income_type: string | null;
  family_size: number;
  financial_goals: string[];
};

const PROFILE_SELECT =
  "id, user_id, profile_type, monthly_income, income_type, family_size, financial_goals, created_at, updated_at";

type RawRow = Omit<FinancialProfileRow, "financial_goals" | "monthly_income"> & {
  financial_goals: string[] | null;
  monthly_income: number | string | null;
};

function normalizeRow(row: RawRow | null): FinancialProfileRow | null {
  if (!row) return null;
  return {
    ...row,
    monthly_income: Number(row.monthly_income) || 0,
    financial_goals: Array.isArray(row.financial_goals) ? row.financial_goals : [],
  };
}

type FinancialProfileContextValue = {
  financialProfile: FinancialProfileRow | null;
  loading: boolean;
  error: string;
  hasProfile: boolean;
  save: (input: FinancialProfileInput) => Promise<{ ok: boolean; error: string }>;
  reload: () => Promise<void>;
};

const FinancialProfileContext = createContext<FinancialProfileContextValue | undefined>(undefined);

export function FinancialProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [financialProfile, setFinancialProfile] = useState<FinancialProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!userId) {
      setFinancialProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from("financial_profiles")
        .select(PROFILE_SELECT)
        .eq("user_id", userId)
        .maybeSingle();
      if (fetchError) throw fetchError;
      setFinancialProfile(normalizeRow((data as RawRow) ?? null));
    } catch (loadError) {
      setFinancialProfile(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger votre profil financier.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (input: FinancialProfileInput) => {
      if (!userId) {
        return { ok: false, error: "Session expirée. Reconnectez-vous." };
      }
      try {
        const { data, error: saveError } = await supabase
          .from("financial_profiles")
          .upsert(
            {
              user_id: userId,
              profile_type: input.profile_type,
              monthly_income: Math.max(Math.round(input.monthly_income), 0),
              income_type: input.income_type,
              family_size: Math.max(Math.round(input.family_size), 1),
              financial_goals: input.financial_goals,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .select(PROFILE_SELECT)
          .maybeSingle();

        if (saveError) throw saveError;
        setFinancialProfile(normalizeRow((data as RawRow) ?? null));
        setError("");
        return { ok: true, error: "" };
      } catch (saveFailure) {
        const message =
          saveFailure instanceof Error
            ? saveFailure.message
            : "Enregistrement impossible. Réessayez.";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [userId],
  );

  const value = useMemo<FinancialProfileContextValue>(
    () => ({
      financialProfile,
      loading,
      error,
      hasProfile: Boolean(financialProfile),
      save,
      reload: load,
    }),
    [financialProfile, loading, error, save, load],
  );

  return (
    <FinancialProfileContext.Provider value={value}>{children}</FinancialProfileContext.Provider>
  );
}

export function useFinancialProfile() {
  const context = useContext(FinancialProfileContext);
  if (!context) {
    throw new Error("useFinancialProfile doit être utilisé dans FinancialProfileProvider");
  }
  return context;
}