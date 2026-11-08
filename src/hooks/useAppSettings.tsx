import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  applyAppSettings,
  fetchAppSettings,
  DEFAULT_APP_SETTINGS,
  type AppSettings,
} from "@/lib/settings";

type AppSettingsContextValue = {
  settings: AppSettings;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const next = await fetchAppSettings();
    setSettings(next);
    applyAppSettings(next);
  }, []);

  useEffect(() => {
    let mounted = true;
    load().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({ settings, loading, refresh }),
    [settings, loading, refresh],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings doit être utilisé à l'intérieur de AppSettingsProvider");
  }
  return context;
}