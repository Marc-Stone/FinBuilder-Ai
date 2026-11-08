import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeamMessages } from "@/hooks/useTeamMessages";
import { useAlertFeed } from "@/hooks/useAlertFeed";
import { announcementTypeMeta, formatAnnouncementDate } from "@/lib/announcement";
import {
  isNotificationSoundEnabled,
  playNotificationChime,
  setNotificationSoundEnabled,
} from "@/lib/attention";
import type { NotificationSeverity } from "@/lib/notifications";

const alertBubbles: Record<NotificationSeverity, string> = {
  urgent: "bg-accent-100 text-accent-900",
  attention: "bg-accent-50 text-accent-900",
  info: "bg-secondary-100 text-secondary-900",
  good: "bg-primary-100 text-primary-800",
};

type BellEntry = {
  key: string;
  title: string;
  body: string;
  meta: string;
  icon: string;
  bubble: string;
  onOpen: () => void;
};

export default function NotificationBell() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = session?.user?.id ?? null;

  const {
    unread: unreadMessages,
    unreadCount: messageCount,
    loading: messagesLoading,
    markSeen,
    markAllSeen,
  } = useTeamMessages(userId);

  const {
    unread: unreadAlerts,
    unreadCount: alertCount,
    loading: alertsLoading,
    markSeen: markAlertSeen,
    markAllSeen: markAllAlertsSeen,
  } = useAlertFeed();

  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousCount = useRef<number | null>(null);

  const unreadCount = messageCount + alertCount;
  const loading = messagesLoading || alertsLoading;

  useEffect(() => {
    setSoundOn(userId ? isNotificationSoundEnabled(userId) : false);
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  /* Effet discret : la cloche s'anime (et carillonne si activé) dès qu'une
     nouvelle notification arrive pendant la session. */
  useEffect(() => {
    if (loading) return;

    if (previousCount.current === null) {
      previousCount.current = unreadCount;
      if (unreadCount > 0) setPulseKey((value) => value + 1);
      return;
    }

    if (unreadCount > previousCount.current) {
      setPulseKey((value) => value + 1);
      if (soundOn) playNotificationChime();
    }
    previousCount.current = unreadCount;
  }, [unreadCount, loading, soundOn]);

  const openNotifications = () => {
    setOpen(false);
    navigate("/app/notifications");
  };

  const toggleSound = () => {
    if (!userId) return;
    const next = !soundOn;
    setSoundOn(next);
    setNotificationSoundEnabled(userId, next);
    if (next) playNotificationChime();
  };

  const handleReadMessage = (id: string) => {
    markSeen(id);
    openNotifications();
  };

  const handleReadAlert = (id: string, to: string) => {
    markAlertSeen(id);
    setOpen(false);
    navigate(to);
  };

  const handleReadAll = () => {
    markAllSeen();
    markAllAlertsSeen();
  };

  const entries: BellEntry[] = [
    ...unreadMessages.map((message) => {
      const meta = announcementTypeMeta(message.type);
      return {
        key: `message-${message.id}`,
        title: message.titre,
        body: message.message,
        meta: formatAnnouncementDate(message.date_envoi ?? message.date_creation),
        icon: meta.icon,
        bubble: meta.bubble,
        onOpen: () => handleReadMessage(message.id),
      };
    }),
    ...unreadAlerts.map((alert) => ({
      key: `alerte-${alert.id}`,
      title: alert.title,
      body: alert.message,
      meta: alert.meta,
      icon: alert.icon,
      bubble: alertBubbles[alert.severity],
      onOpen: () => handleReadAlert(alert.id, alert.to),
    })),
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        aria-expanded={open}
        className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border transition-colors ${
          unreadCount > 0
            ? "border-accent-300 bg-accent-50 text-accent-800 hover:bg-accent-100"
            : "border-background-200 text-foreground-700 hover:border-primary-300 hover:bg-primary-50"
        }`}
      >
        {unreadCount > 0 && (
          <span
            key={`ring-${pulseKey}`}
            aria-hidden="true"
            className="bell-attention-ring pointer-events-none absolute inset-0 rounded-md"
          />
        )}
        <span key={`icon-${pulseKey}`} className="anim-bell-swing flex items-center justify-center">
          <i
            className={
              unreadCount > 0 ? "ri-notification-3-fill text-base" : "ri-notification-3-line text-base"
            }
          />
        </span>
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-[16px] items-center justify-center rounded-full bg-accent-600 px-1 py-[1px] text-[9px] font-bold leading-none text-background-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[330px] max-w-[calc(100vw-2rem)] animate-fade-in overflow-hidden rounded-lg border border-background-200 bg-background-50">
          <div className="flex items-start justify-between gap-2 border-b border-background-200 px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground-950">Notifications</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-foreground-500">
                {unreadCount > 0
                  ? `${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""} notification${
                      unreadCount > 1 ? "s" : ""
                    } à consulter`
                  : "Vous êtes à jour"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={
                  soundOn
                    ? "Désactiver le son des notifications"
                    : "Activer le son des notifications"
                }
                title={soundOn ? "Son activé" : "Son désactivé"}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                  soundOn
                    ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
                    : "border-background-300 bg-background-50 text-foreground-500 hover:border-primary-300 hover:text-primary-700"
                }`}
              >
                <i className={soundOn ? "ri-volume-up-line text-xs" : "ri-volume-mute-line text-xs"} />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleReadAll}
                  className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2 py-1 text-[10px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
                >
                  <i className="ri-check-double-line text-[11px]" />
                  Tout lire
                </button>
              )}
            </div>
          </div>

          <div className="no-scrollbar max-h-[300px] overflow-y-auto">
            {entries.length === 0 ? (
              <div className="px-3.5 py-6 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  <i className="ri-mail-check-line text-lg" />
                </span>
                <p className="mt-2 text-xs font-semibold text-foreground-900">
                  Aucune notification non lue
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-foreground-500">
                  Les messages de l'équipe et les alertes de budget apparaîtront ici dès qu'ils
                  arrivent.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-background-200">
                {entries.slice(0, 5).map((entry) => (
                  <li key={entry.key}>
                    <button
                      type="button"
                      onClick={entry.onOpen}
                      className="flex w-full cursor-pointer items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-background-100"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${entry.bubble}`}
                      >
                        <i className={`${entry.icon} text-xs`} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-semibold text-foreground-950">
                          {entry.title}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[10px] leading-relaxed text-foreground-500">
                          {entry.body}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-foreground-400">
                          <i className="ri-time-line text-[9px]" />
                          {entry.meta}
                        </span>
                      </span>
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-background-200 px-3.5 py-2.5">
            <button
              type="button"
              onClick={openNotifications}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-2 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              <i className="ri-notification-3-line text-xs" />
              Ouvrir le centre de notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}