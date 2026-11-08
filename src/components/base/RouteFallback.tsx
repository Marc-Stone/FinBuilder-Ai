type RouteFallbackProps = {
  variant?: "page" | "section";
  label?: string;
};

/**
 * Écran d'attente affiché pendant le chargement à la demande d'une page.
 * Volontairement très léger (aucune image, aucune animation lourde).
 */
export default function RouteFallback({ variant = "page", label = "Chargement…" }: RouteFallbackProps) {
  if (variant === "section") {
    return (
      <div className="w-full space-y-3" role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <div className="h-[120px] animate-pulse rounded-lg bg-background-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[104px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
        <div className="h-[260px] animate-pulse rounded-lg bg-background-200" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-background-50"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-500 text-background-50">
          <i className="ri-line-chart-line text-lg" />
        </span>
        <p className="text-xs font-medium text-foreground-500">{label}</p>
      </div>
    </div>
  );
}