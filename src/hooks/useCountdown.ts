import { useEffect, useState } from "react";

export type Countdown = {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  due: boolean;
  label: string;
};

function buildCountdown(target: number | null): Countdown {
  if (target === null) {
    return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, due: false, label: "—" };
  }

  const diff = Math.max(0, target - Date.now());
  const totalSeconds = Math.round(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (totalSeconds <= 0) {
    return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, due: true, label: "imminente" };
  }

  let label = "";
  if (days > 0) {
    label = `${days} j ${hours} h ${minutes} min`;
  } else if (hours > 0) {
    label = `${hours} h ${minutes} min ${String(seconds).padStart(2, "0")} s`;
  } else {
    label = `${minutes} min ${String(seconds).padStart(2, "0")} s`;
  }

  return { totalSeconds, days, hours, minutes, seconds, due: false, label };
}

function targetToStamp(iso: string | null): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * Compte à rebours vivant vers une échéance.
 * `null` signifie « aucune échéance » : le libellé reste un tiret.
 */
export function useCountdown(iso: string | null, onDue?: () => void): Countdown {
  const stamp = targetToStamp(iso);
  const [value, setValue] = useState<Countdown>(() => buildCountdown(stamp));

  useEffect(() => {
    setValue(buildCountdown(stamp));
    if (stamp === null) return () => undefined;

    const tick = () => {
      const next = buildCountdown(stamp);
      setValue(next);
      if (next.due) window.clearInterval(timer);
    };

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [stamp]);

  useEffect(() => {
    if (!value.due || !onDue) return;
    onDue();
    // On ne déclenche le rappel qu'une seule fois par échéance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.due, stamp]);

  return value;
}