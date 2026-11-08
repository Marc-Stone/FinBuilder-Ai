/**
 * Ce que l'application retient localement pour « interpeller » l'utilisateur :
 * alertes déjà lues, rappels actifs, préférence de son et résumé du jour.
 * Les clés sont les mêmes que celles du centre de notifications, afin que les
 * deux écrans restent toujours d'accord sur ce qui a été lu.
 */

export type AlertChannel = "objectif" | "budget" | "epargne";

export type AlertChannels = Record<AlertChannel, boolean>;

export const ALERTS_SEEN_EVENT = "finbuilder:alertes-seen";

const DEFAULT_CHANNELS: AlertChannels = {
  objectif: true,
  budget: true,
  epargne: true,
};

export function alertsSeenStorageKey(userId: string): string {
  return `finbuilder_notifs_dismissed_v1:${userId}`;
}

export function alertChannelsStorageKey(userId: string): string {
  return `finbuilder_notifs_channels_v1:${userId}`;
}

export function notificationSoundStorageKey(userId: string): string {
  return `finbuilder_notifs_sound_v1:${userId}`;
}

export function notificationDigestStorageKey(userId: string): string {
  return `finbuilder_notifs_digest_v1:${userId}`;
}

function readStringArray(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function readAlertsSeen(userId: string | null | undefined): string[] {
  if (!userId) return [];
  return readStringArray(alertsSeenStorageKey(userId));
}

export function writeAlertsSeen(userId: string, ids: string[]): void {
  try {
    window.localStorage.setItem(alertsSeenStorageKey(userId), JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Stockage indisponible : l'état reste en mémoire.
  }
  window.dispatchEvent(new CustomEvent(ALERTS_SEEN_EVENT));
}

export function readAlertChannels(userId: string | null | undefined): AlertChannels {
  if (!userId) return DEFAULT_CHANNELS;
  try {
    const raw = window.localStorage.getItem(alertChannelsStorageKey(userId));
    const parsed = raw
      ? (JSON.parse(raw) as Partial<Record<AlertChannel, boolean>>)
      : null;
    if (!parsed) return DEFAULT_CHANNELS;
    return {
      objectif: parsed.objectif !== false,
      budget: parsed.budget !== false,
      epargne: parsed.epargne !== false,
    };
  } catch {
    return DEFAULT_CHANNELS;
  }
}

export function isNotificationSoundEnabled(userId: string | null | undefined): boolean {
  if (!userId) return false;
  try {
    return window.localStorage.getItem(notificationSoundStorageKey(userId)) !== "off";
  } catch {
    return true;
  }
}

export function setNotificationSoundEnabled(userId: string, enabled: boolean): void {
  try {
    window.localStorage.setItem(notificationSoundStorageKey(userId), enabled ? "on" : "off");
  } catch {
    // Stockage indisponible : la préférence reste en mémoire pour la session.
  }
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function hasSeenNotificationDigestToday(userId: string | null | undefined): boolean {
  if (!userId) return true;
  try {
    return window.localStorage.getItem(notificationDigestStorageKey(userId)) === todayKey();
  } catch {
    return false;
  }
}

export function markNotificationDigestSeen(userId: string): void {
  try {
    window.localStorage.setItem(notificationDigestStorageKey(userId), todayKey());
  } catch {
    // Stockage indisponible : le résumé pourra réapparaître au rechargement.
  }
}

let audioContext: AudioContext | null = null;

/**
 * Petit carillon à deux notes, généré par le navigateur (aucun fichier son).
 * Le navigateur peut le bloquer avant la première interaction : on l'ignore
 * silencieusement, l'effet visuel sur la cloche restant toujours visible.
 */
export function playNotificationChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioCtor();
    }
    const context = audioContext;
    if (context.state === "suspended") {
      void context.resume();
    }

    const start = context.currentTime + 0.03;
    [880, 1174.66].forEach((frequency, index) => {
      const at = start + index * 0.16;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.05, at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.55);
    });
  } catch {
    // Son indisponible : on ne bloque jamais l'interface pour cela.
  }
}