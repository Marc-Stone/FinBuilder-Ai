import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeamMessages } from "@/hooks/useTeamMessages";
import { useAlertFeed } from "@/hooks/useAlertFeed";
import { announcementTypeMeta } from "@/lib/announcement";
import {
  hasSeenNotificationDigestToday,
  isNotificationSoundEnabled,
  markNotificationDigestSeen,
  playNotificationChime,
} from "@/lib/attention";
import type { NotificationSeverity } from "@/lib/notifications";

const alertBubbles: Record<NotificationSeverity, string> = {
  urgent: "bg-accent-100 text-accent-900",
  attention: "bg-accent-50 text-accent-900",
  info: "bg-secondary-100 text-secondary-900",
  good: "bg-primary-100 text-primary-800",
};

type DigestItem = {
  key: string;
  title: string;
  body: string;
  icon: string;
  bubble: string;
  onOpen: () => void;
};

/**
 * Résumé d'accueil : à la première visite de la journée, l'application
 * interpelle l'utilisateur par son prénom et lui résume ses notifications.
 * Une seule apparition par jour et par compte, et seulement s'il y a
 * réellement quelque chose à signaler.
 */
export default function WelcomeDigest() {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const userId = session?.user?.id ?? null;

  const { unread: unreadMessages, loading: messagesLoading, markSeen } = useTeamMessages(userId);
  const { unread: unreadAlerts, loading: alertsLoading, markSeen: markAlertSeen } = useAlertFeed();

  const [visible, setVisible] = useState(false);
  const handled = useRef(false);

  const firstName = profile?.prenom?.trim() || profile?.nom?.trim().split(" ")[0] || "";
  const total = unreadMessages.length + unreadAlerts.length;
  const loading = messagesLoading || alertsLoading;

  useEffect(() => {
    if (!userId || handled.current || loading) return;
    if (total === 0) return;
    if (hasSeenNotificationDigestToday(userId)) {
      handled.current = true;
      return;
    }

    handled.current = true;
    markNotificationDigestSeen(userId);
    setVisible(true);
    if (isNotificationSoundEnabled(userId)) playNotificationChime();
  }, [userId, loading, total]);

  if (!visible) return null;

  const items: DigestItem[] = [
    ...unreadMessages.map((message) => {
      const meta = announcementTypeMeta(message.type);
      return {
        key: `message-${message.id}`,
        title: message.titre,
        body: message.message,
        icon: meta.icon,
        bubble: meta.bubble,
        onOpen: () => {
          markSeen(message.id);
          setVisible(false);
          navigate("/app/notifications");
        },
      };
    }),
    ...unreadAlerts.map((alert) => ({
      key: `alerte-${alert.id}`,
      title: alert.title,
      body: alert.message,
      icon: alert.icon,
      bubble: alertBubbles[alert.severity],
      onOpen: () => {
        markAlertSeen(alert.id);
        setVisible(false);
        navigate(alert.to);
      },
    })),
  ];

  const close = () => setVisible(false);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-40 animate-fade-in sm:left-auto sm:w-[380px]"
    >
      <div className="rounded-lg border border-background-200 bg-background-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-800">
            <i className="ri-sparkling-2-line text-base" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-700">
              Résumé du jour
            </p>
            <h3
              className="mt-0.5 text-sm font-semibold leading-snug text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {firstName ? `Bonjour ${firstName}` : "Bonjour"}
            </h3>
            <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-600">
              Vous avez {total} notification{total > 1 ? "s" : ""} qui mérite
              {total > 1 ? "nt" : ""} votre attention aujourd'hui.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer le résumé"
            className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-background-100 hover:text-foreground-700"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        <ul className="mt-3 space-y-1.5">
          {items.slice(0, 3).map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={item.onOpen}
                className="flex w-full cursor-pointer items-start gap-2 rounded-md border border-background-200 px-2.5 py-2 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/40"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded ${item.bubble}`}
                >
                  <i className={`${item.icon} text-[11px]`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold text-foreground-950">
                    {item.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-[10px] leading-relaxed text-foreground-500">
                    {item.body}
                  </span>
                </span>
                <i className="ri-arrow-right-s-line mt-1 shrink-0 text-xs text-foreground-400" />
              </button>
            </li>
          ))}
        </ul>

        {total > 3 && (
          <p className="mt-2 text-[10px] font-medium text-foreground-500">
            + {total - 3} autre{total - 3 > 1 ? "s" : ""} notification
            {total - 3 > 1 ? "s" : ""} dans le centre
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              navigate("/app/notifications");
            }}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3 py-2 text-[11px] font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-notification-3-line text-xs" />
            Voir mes notifications
          </button>
          <button
            type="button"
            onClick={close}
            className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}