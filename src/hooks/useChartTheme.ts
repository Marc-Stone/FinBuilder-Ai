import { useEffect, useState } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";

type ChartTheme = {
  primary: string;
  accent: string;
  grid: string;
  tick: string;
  surface: string;
  border: string;
};

const FALLBACK_THEME: ChartTheme = {
  primary: "oklch(0.546 0.245 263)",
  accent: "oklch(0.736 0.166 22)",
  grid: "oklch(0.953 0.011 252)",
  tick: "oklch(0.522 0.019 264)",
  surface: "oklch(1 0 0)",
  border: "oklch(0.953 0.011 252)",
};

/**
 * Couleurs des graphiques lues depuis les variables du StyleSystem.
 * Ainsi les courbes, les axes et les infobulles restent lisibles et cohérents
 * après un changement de palette depuis les paramètres de l'application.
 */
export function useChartTheme(): ChartTheme {
  const { settings } = useAppSettings();
  const [theme, setTheme] = useState<ChartTheme>(FALLBACK_THEME);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => {
      const raw = styles.getPropertyValue(name).trim();
      return raw ? `oklch(${raw})` : fallback;
    };

    setTheme({
      primary: read("--primary-500", FALLBACK_THEME.primary),
      accent: read("--accent-500", FALLBACK_THEME.accent),
      grid: read("--background-200", FALLBACK_THEME.grid),
      tick: read("--foreground-500", FALLBACK_THEME.tick),
      surface: read("--background-50", FALLBACK_THEME.surface),
      border: read("--background-200", FALLBACK_THEME.border),
    });
  }, [settings.couleur_principale]);

  return theme;
}

export type { ChartTheme };