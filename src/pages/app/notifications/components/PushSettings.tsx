import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  disablePushNotifications,
  enablePushNotifications,
  getCurrentSubscription,
  getNotificationPermission,
  getPushSupport,
  showTestNotification,
} from "@/lib/push";

const topics = [
  { icon: "ri-error-warning-line", label: "Dépassement de budget" },
  { icon: "ri-flag-2-line", label: "Objectif atteint" },
  { icon: "ri-calendar-check-line", label: "Rappels financiers" },
  { icon: "ri-sparkling-2-line", label: "Conseils du Coach IA" },
];

/**
 * Activation des notifications push sur l'appareil courant.
 * Les notifications affichées restent génériques (aucun montant sur l'écran verrouillé).
 */
export default function PushSettings() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [support] = useState(() => getPushSupport());
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (support !== "supported") return;
    let active = true;
    getCurrentSubscription()
      .then((subscription) => {
        if (active) setEnabled(Boolean(subscription) && getNotificationPermission() === "granted");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [support]);

  const toggle = async () => {
    if (!userId || busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (enabled) {
        await disablePushNotifications();
        setEnabled(false);
        setMessage("Notifications désactivées sur cet appareil.");
      } else {
        const result = await enablePushNotifications(userId);
        if (result === "granted") {
          setEnabled(true);
          setMessage("Notifications activées.");
          void showTestNotification();
        } else if (result === "denied") {
          setMessage("Autorisation refusée. Vous pouvez la réactiver dans les réglages du navigateur.");
        } else {
          setMessage("Activation impossible pour le moment. Réessayez plus tard.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  let hint: string | null = null;
  if (support === "ios-needs-install") {
    hint = "Sur iPhone, installez d'abord FinBuilder AI sur l'écran d'accueil (Partager → « Sur l'écran d'accueil »), puis ouvrez l'app depuis son icône.";
  } else if (support === "unsupported") {
    hint = "Ce navigateur ne prend pas en charge les notifications push.";
  } else if (support === "not-configured") {
    hint = "Les notifications push seront bientôt disponibles.";
  } else if (getNotificationPermission() === "denied") {
    hint = "Les notifications sont bloquées pour ce site dans les réglages du navigateur.";
  }

  const canToggle = support === "supported" && getNotificationPermission() !== "denied";

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground-950">Notifications sur cet appareil</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
            Recevez vos alertes même quand l'application est fermée.
          </p>
        </div>
        <i className="ri-smartphone-line mt-0.5 shrink-0 text-lg text-primary-600" aria-hidden="true" />
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-1.5">
        {topics.map((topic) => (
          <li
            key={topic.label}
            className="flex min-w-0 items-center gap-1.5 rounded-md bg-background-100 px-2 py-1.5 text-[11px] font-medium text-foreground-700"
          >
            <i className={`${topic.icon} shrink-0 text-xs text-primary-600`} aria-hidden="true" />
            <span className="truncate">{topic.label}</span>
          </li>
        ))}
      </ul>

      {hint ? (
        <p className="mt-3 rounded-md border border-background-200 bg-background-100 px-3 py-2.5 text-[11px] leading-relaxed text-foreground-600">
          {hint}
        </p>
      ) : null}

      {canToggle && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy || !userId}
          aria-pressed={enabled}
          className={`${enabled ? "btn-ghost" : "btn-primary"} mt-3 min-h-[44px] w-full disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <i className={enabled ? "ri-notification-off-line" : "ri-notification-3-line"} />
          {busy ? "Un instant…" : enabled ? "Désactiver les notifications" : "Activer les notifications"}
        </button>
      )}

      {message ? (
        <p role="status" className="mt-2 text-[11px] leading-relaxed text-foreground-500">
          {message}
        </p>
      ) : null}
    </section>
  );
}
