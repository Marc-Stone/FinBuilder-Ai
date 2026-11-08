import { useCountdown } from "@/hooks/useCountdown";

type ScheduleCountdownProps = {
  iso: string | null;
  tone?: "accent" | "primary" | "neutral";
  className?: string;
  onDue?: () => void;
};

const TONES: Record<string, string> = {
  accent: "border-accent-300 bg-accent-50 text-accent-900",
  primary: "border-primary-200 bg-primary-50 text-primary-800",
  neutral: "border-background-300 bg-background-100 text-foreground-700",
};

export default function ScheduleCountdown({
  iso,
  tone = "accent",
  className = "",
  onDue,
}: ScheduleCountdownProps) {
  const countdown = useCountdown(iso, onDue);

  if (!iso) {
    return (
      <span
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TONES.neutral} ${className}`}
      >
        <i className="ri-calendar-line text-[10px]" />
        Diffusion programmée
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
        countdown.due ? "border-primary-300 bg-primary-100 text-primary-900" : TONES[tone]
      } ${className}`}
      title={
        countdown.due
          ? "L'heure de diffusion est atteinte : l'annonce est en cours de publication."
          : "Temps restant avant la diffusion automatique"
      }
    >
      <i className={countdown.due ? "ri-send-plane-line text-[10px]" : "ri-timer-line text-[10px]"} />
      {countdown.due ? "Diffusion imminente" : `Diffusion dans ${countdown.label}`}
    </span>
  );
}