/**
 * FinBuilder AI — notifications Web Push (côté navigateur).
 *
 * Architecture :
 *   1. L'utilisateur active les notifications (geste explicite requis, surtout sur iOS).
 *   2. Le navigateur crée un abonnement Push (clé VAPID publique) → enregistré dans
 *      la table Supabase `push_subscriptions`, protégée par RLS (user_id = auth.uid()).
 *   3. Côté serveur, la fonction Edge `send-push` (clé VAPID privée, rôle service)
 *      envoie les alertes : budget dépassé, objectif atteint, rappel, conseil du Coach IA.
 *   4. Le service worker (public/sw.js) affiche la notification et ouvre la bonne page au clic.
 *
 * iOS : le Web Push n'est disponible qu'à partir d'iOS 16.4 ET uniquement
 * quand l'application est installée sur l'écran d'accueil.
 */
import { supabase } from "@/lib/supabaseClient";
import { isIosDevice, isStandaloneMode } from "@/lib/pwa";

export type PushNotificationType =
  | "budget_depasse"
  | "objectif_atteint"
  | "rappel_financier"
  | "conseil_coach";

export type PushSupport =
  | "supported"
  | "unsupported"
  | "ios-needs-install"
  | "not-configured";

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_PUBLIC_VAPID_PUBLIC_KEY as string | undefined) ?? "";

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  if (isIosDevice() && !isStandaloneMode()) return "ios-needs-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  if (!window.isSecureContext) return "unsupported";
  if (!VAPID_PUBLIC_KEY) return "not-configured";
  return "supported";
}

export function getNotificationPermission(): "default" | "denied" | "granted" | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration();
  return existing ?? null;
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  const registration = await getRegistration();
  if (!registration?.pushManager) return null;
  return registration.pushManager.getSubscription();
}

async function saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!json.endpoint || !p256dh || !auth) throw new Error("Abonnement push incomplet.");

  // La politique RLS n'autorise que user_id = auth.uid() : impossible d'écrire pour un autre compte.
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent.slice(0, 255),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );
  if (error) throw error;
}

/** Demande la permission puis abonne l'appareil. Doit être appelé depuis un clic. */
export async function enablePushNotifications(userId: string): Promise<"granted" | "denied" | "error"> {
  if (getPushSupport() !== "supported") return "error";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));
    await saveSubscription(userId, subscription);
    return "granted";
  } catch (error) {
    console.error("[push] abonnement impossible", error);
    return "error";
  }
}

export async function disablePushNotifications(): Promise<void> {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe().catch(() => false);
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

/**
 * À appeler après connexion : ré-enregistre l'abonnement existant
 * (renouvelé par le navigateur, ou appareil partagé entre deux comptes).
 */
export async function syncPushSubscription(userId: string): Promise<void> {
  if (getPushSupport() !== "supported" || Notification.permission !== "granted") return;
  try {
    const subscription = await getCurrentSubscription();
    if (subscription) await saveSubscription(userId, subscription);
  } catch {
    /* table absente ou hors ligne : réessayé au prochain lancement */
  }
}

/** Notification locale de test (aucune donnée financière). */
export async function showTestNotification(): Promise<void> {
  const registration = await getRegistration();
  if (!registration || Notification.permission !== "granted") return;
  await registration.showNotification("FinBuilder AI", {
    body: "Les notifications sont activées sur cet appareil.",
    icon: `${import.meta.env.BASE_URL}icons/icon-192.png`,
    badge: `${import.meta.env.BASE_URL}icons/icon-192.png`,
    tag: "test",
    data: { url: "/app/notifications" },
  });
}
