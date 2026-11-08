import { supabase } from "@/lib/supabaseClient";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AppSettings = {
  id: number;
  nom_application: string;
  logo_url: string | null;
  favicon_url: string | null;
  couleur_principale: string;
  email_contact: string | null;
  email_support: string | null;
  langue: string;
  fuseau: string;
  mode_maintenance: boolean;
  updated_at: string | null;
};

export type AppSettingsDraft = {
  nom_application: string;
  couleur_principale: string;
  email_contact: string;
  email_support: string;
  langue: string;
  fuseau: string;
  mode_maintenance: boolean;
};

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const APP_LANGUAGES: { value: string; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "ar", label: "Arabe" },
];

export const APP_TIMEZONES: { value: string; label: string }[] = [
  { value: "Africa/Douala", label: "Douala · Afrique centrale (GMT+1)" },
  { value: "Africa/Abidjan", label: "Abidjan · Afrique de l'Ouest (GMT)" },
  { value: "Africa/Dakar", label: "Dakar · Afrique de l'Ouest (GMT)" },
  { value: "Africa/Lagos", label: "Lagos · Afrique de l'Ouest (GMT+1)" },
  { value: "Africa/Nairobi", label: "Nairobi · Afrique de l'Est (GMT+3)" },
  { value: "Africa/Casablanca", label: "Casablanca · Maghreb (GMT+1)" },
  { value: "Europe/Paris", label: "Paris · Europe (GMT+1)" },
  { value: "America/Montreal", label: "Montréal · Amérique du Nord (GMT-5)" },
];

export const COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "Émeraude", hex: "#0f766e" },
  { label: "Olive", hex: "#4d7c0f" },
  { label: "Terracotta", hex: "#c2410c" },
  { label: "Ambre", hex: "#b45309" },
  { label: "Bordeaux", hex: "#9f1239" },
  { label: "Ardoise", hex: "#334155" },
  { label: "Bronze", hex: "#8a6a3f" },
  { label: "Bleu historique", hex: "#3b5bdb" },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: 1,
  nom_application: "FinBuilder AI",
  logo_url: null,
  favicon_url: null,
  couleur_principale: "#3b5bdb",
  email_contact: null,
  email_support: null,
  langue: "fr",
  fuseau: "Africa/Douala",
  mode_maintenance: false,
  updated_at: null,
};

/* ------------------------------------------------------------------ */
/* Couleur : conversion hexadécimal vers les jetons OKLCH              */
/* ------------------------------------------------------------------ */

type Oklch = { l: number; c: number; h: number };

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

export function hexToOklch(hex: string): Oklch | null {
  if (!isHexColor(hex)) return null;
  const int = parseInt(hex.trim().slice(1), 16);
  const r = srgbToLinear(((int >> 16) & 255) / 255);
  const g = srgbToLinear(((int >> 8) & 255) / 255);
  const b = srgbToLinear((int & 255) / 255);

  const longR = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const midG = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const shortB = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const l = 0.2104542553 * longR + 0.793617785 * midG - 0.0040720468 * shortB;
  const a = 1.9779984951 * longR - 2.428592205 * midG + 0.4505937099 * shortB;
  const bb = 0.0259040371 * longR + 0.7827717662 * midG - 0.808675766 * shortB;

  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return {
    l: Number.isFinite(l) ? l : 0.5,
    c: Number.isFinite(c) ? c : 0.12,
    h: Number.isFinite(h) ? h : 250,
  };
}

/** Construit les onze nuances `primary-*` à partir de la couleur choisie. */
export function buildPrimaryScale(hex: string): Record<string, string> | null {
  const base = hexToOklch(hex);
  if (!base) return null;

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const steps: Record<string, [number, number]> = {
    "50": [Math.min(base.l + 0.48, 0.985), 0.2],
    "100": [Math.min(base.l + 0.42, 0.965), 0.32],
    "200": [Math.min(base.l + 0.32, 0.935), 0.5],
    "300": [Math.min(base.l + 0.2, 0.885), 0.7],
    "400": [Math.min(base.l + 0.09, 0.8), 0.9],
    "500": [base.l, 1],
    "600": [Math.max(base.l - 0.07, 0.28), 1],
    "700": [Math.max(base.l - 0.15, 0.24), 0.95],
    "800": [Math.max(base.l - 0.23, 0.2), 0.86],
    "900": [Math.max(base.l - 0.31, 0.17), 0.76],
    "950": [Math.max(base.l - 0.39, 0.15), 0.66],
  };

  const scale: Record<string, string> = {};
  Object.entries(steps).forEach(([step, [lightness, chromaRatio]]) => {
    const token = `--primary-${step}`;
    scale[token] = `${clamp(lightness, 0.12, 0.99).toFixed(4)} ${(base.c * chromaRatio).toFixed(
      4,
    )} ${base.h.toFixed(2)}`;
  });
  return scale;
}

const PRIMARY_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

/**
 * Teinte d'origine du design. Tant que l'administrateur la conserve, les nuances
 * d'origine ne sont pas remplacées, afin de ne pas altérer l'identité visuelle.
 */
export const DESIGN_PRIMARY_HEX = "#3b5bdb";

/** Applique immédiatement la couleur principale à toute l'interface. */
export function applyPrimaryColor(hex: string): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const normalized = hex.trim().toLowerCase();

  if (!isHexColor(normalized)) return;

  if (normalized === DESIGN_PRIMARY_HEX) {
    PRIMARY_STEPS.forEach((step) => root.style.removeProperty(`--primary-${step}`));
    return;
  }

  const scale = buildPrimaryScale(normalized);
  if (!scale) return;
  Object.entries(scale).forEach(([token, value]) => root.style.setProperty(token, value));
}

/** Indique si la couleur est trop claire pour un fond de bouton avec texte blanc. */
export function isColorTooLight(hex: string): boolean {
  const base = hexToOklch(hex);
  return base ? base.l > 0.68 : false;
}

/* ------------------------------------------------------------------ */
/* Application des paramètres                                          */
/* ------------------------------------------------------------------ */

export function applyAppSettings(settings: AppSettings): void {
  if (typeof document === "undefined") return;
  applyPrimaryColor(settings.couleur_principale);
  document.documentElement.dataset.appName = settings.nom_application;
  const title = document.title;
  if (title.includes("FinBuilder AI")) {
    document.title = title.replace(/FinBuilder AI/g, settings.nom_application);
  }
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

const SETTINGS_COLUMNS =
  "id, nom_application, logo_url, favicon_url, couleur_principale, email_contact, email_support, langue, fuseau, mode_maintenance, updated_at";

function normalizeSettings(row: Partial<AppSettings> | null): AppSettings {
  if (!row) return DEFAULT_APP_SETTINGS;
  return {
    ...DEFAULT_APP_SETTINGS,
    ...row,
    couleur_principale:
      row.couleur_principale && isHexColor(row.couleur_principale)
        ? row.couleur_principale
        : DEFAULT_APP_SETTINGS.couleur_principale,
  };
}

/** Lecture silencieuse : retombe sur les valeurs par défaut en cas d'échec. */
export async function fetchAppSettings(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select(SETTINGS_COLUMNS)
      .eq("id", 1)
      .maybeSingle();
    if (error) return DEFAULT_APP_SETTINGS;
    return normalizeSettings(data as Partial<AppSettings> | null);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

/** Lecture stricte pour la console : remonte l'erreur à l'administrateur. */
export async function fetchAppSettingsStrict(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("admin_settings")
    .select(SETTINGS_COLUMNS)
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return normalizeSettings(data as Partial<AppSettings> | null);
}

/* ------------------------------------------------------------------ */
/* Écriture                                                            */
/* ------------------------------------------------------------------ */

export function draftFromSettings(settings: AppSettings): AppSettingsDraft {
  return {
    nom_application: settings.nom_application,
    couleur_principale: settings.couleur_principale,
    email_contact: settings.email_contact ?? "",
    email_support: settings.email_support ?? "",
    langue: settings.langue,
    fuseau: settings.fuseau,
    mode_maintenance: settings.mode_maintenance,
  };
}

export function validateSettingsDraft(draft: AppSettingsDraft): string[] {
  const errors: string[] = [];
  if (draft.nom_application.trim().length < 3) {
    errors.push("Le nom de l'application doit contenir au moins 3 caractères.");
  }
  if (draft.nom_application.trim().length > 40) {
    errors.push("Le nom de l'application ne peut pas dépasser 40 caractères.");
  }
  if (!isHexColor(draft.couleur_principale)) {
    errors.push("La couleur principale doit être un code hexadécimal, par exemple #0f766e.");
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (draft.email_contact.trim() && !emailPattern.test(draft.email_contact.trim())) {
    errors.push("L'email de contact n'est pas valide.");
  }
  if (draft.email_support.trim() && !emailPattern.test(draft.email_support.trim())) {
    errors.push("L'email de support n'est pas valide.");
  }
  return errors;
}

export async function updateAppSettings(
  draft: AppSettingsDraft,
  options?: { logoUrl?: string | null },
): Promise<void> {
  const { error } = await supabase
    .from("admin_settings")
    .update({
      nom_application: draft.nom_application.trim(),
      couleur_principale: draft.couleur_principale.trim().toLowerCase(),
      email_contact: draft.email_contact.trim() || null,
      email_support: draft.email_support.trim() || null,
      langue: draft.langue,
      fuseau: draft.fuseau,
      mode_maintenance: draft.mode_maintenance,
      ...(options && "logoUrl" in options ? { logo_url: options.logoUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;
}