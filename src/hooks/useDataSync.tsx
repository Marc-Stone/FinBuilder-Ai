import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

type ReloadOptions = { silent?: boolean };

type DataSyncValue = {
  version: number;
  notifyChange: () => void;
};

const DataSyncContext = createContext<DataSyncValue | null>(null);

const fallbackValue: DataSyncValue = {
  version: 0,
  notifyChange: () => undefined,
};

/**
 * Centralise la fraîcheur des données financières de l'application.
 * Chaque enregistrement (revenu, dépense, objectif, projet, profil) prévient
 * toutes les vues montées : elles se rechargent en silence, sans squelette.
 */
export function DataSyncProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const lastBump = useRef(0);

  const notifyChange = useCallback(() => {
    lastBump.current = Date.now();
    setVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      if (now - lastBump.current < 900) return;
      lastBump.current = now;
      setVersion((current) => current + 1);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const value = useMemo<DataSyncValue>(
    () => ({ version, notifyChange }),
    [version, notifyChange],
  );

  return <DataSyncContext.Provider value={value}>{children}</DataSyncContext.Provider>;
}

export function useDataSync(): DataSyncValue {
  return useContext(DataSyncContext) ?? fallbackValue;
}

/**
 * Recharge les données quand une autre partie de l'application les a modifiées.
 * Le rechargement est silencieux : l'écran ne repasse pas par son squelette.
 */
export function useSyncedReload(reload: (options?: ReloadOptions) => void) {
  const { version } = useDataSync();
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  const seen = useRef(version);

  useEffect(() => {
    if (seen.current === version) return;
    seen.current = version;
    reloadRef.current({ silent: true });
  }, [version]);
}