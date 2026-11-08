import { useCallback, useEffect, useState } from "react";
import {
  ANNOUNCEMENTS_SEEN_EVENT,
  fetchMyAnnouncements,
  readAnnouncementsSeen,
  writeAnnouncementsSeen,
  type AnnouncementRow,
} from "@/lib/announcement";

type TeamMessagesState = {
  messages: AnnouncementRow[];
  seen: string[];
  loading: boolean;
};

/**
 * Cache partagé : la cloche de la barre supérieure et le menu latéral lisent
 * le même état, une seule requête est envoyée pour toute l'application.
 */
let cachedUserId: string | null = null;
let cachedState: TeamMessagesState = { messages: [], seen: [], loading: true };
let inFlight: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach((listener) => listener());
}

function setState(patch: Partial<TeamMessagesState>) {
  cachedState = { ...cachedState, ...patch };
  emit();
}

async function loadTeamMessages(userId: string): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const messages = await fetchMyAnnouncements(userId);
      if (cachedUserId !== userId) return;
      setState({ messages, loading: false });
    } catch {
      if (cachedUserId === userId) setState({ messages: [], loading: false });
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

function syncSeen(userId: string) {
  if (cachedUserId !== userId) return;
  setState({ seen: readAnnouncementsSeen(userId) });
}

export function useTeamMessages(userId: string | null | undefined) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((value) => value + 1);
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      cachedUserId = null;
      setState({ messages: [], seen: [], loading: false });
      return;
    }

    if (cachedUserId !== userId) {
      cachedUserId = userId;
      cachedState = {
        messages: [],
        seen: readAnnouncementsSeen(userId),
        loading: true,
      };
      emit();
      void loadTeamMessages(userId);
    } else {
      syncSeen(userId);
    }

    const handleSeenChange = () => syncSeen(userId);
    const handleFocus = () => {
      syncSeen(userId);
      void loadTeamMessages(userId);
    };

    window.addEventListener(ANNOUNCEMENTS_SEEN_EVENT, handleSeenChange);
    window.addEventListener("storage", handleSeenChange);
    window.addEventListener("focus", handleFocus);
    const timer = window.setInterval(() => {
      void loadTeamMessages(userId);
    }, 60000);

    return () => {
      window.removeEventListener(ANNOUNCEMENTS_SEEN_EVENT, handleSeenChange);
      window.removeEventListener("storage", handleSeenChange);
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(timer);
    };
  }, [userId]);

  const markSeen = useCallback((id: string) => {
    if (!cachedUserId) return;
    writeAnnouncementsSeen(cachedUserId, [...cachedState.seen, id]);
  }, []);

  const markAllSeen = useCallback(() => {
    if (!cachedUserId) return;
    writeAnnouncementsSeen(
      cachedUserId,
      cachedState.messages.map((message) => message.id),
    );
  }, []);

  const refresh = useCallback(() => {
    if (!cachedUserId) return;
    syncSeen(cachedUserId);
    void loadTeamMessages(cachedUserId);
  }, []);

  const unread = cachedState.messages.filter(
    (message) => !cachedState.seen.includes(message.id),
  );

  return {
    messages: cachedState.messages,
    unread,
    unreadCount: unread.length,
    loading: cachedState.loading,
    markSeen,
    markAllSeen,
    refresh,
  };
}