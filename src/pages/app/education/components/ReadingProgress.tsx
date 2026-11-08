import type { Fiche } from "@/lib/education";

type ReadingProgressProps = {
  total: number;
  readCount: number;
  modulesCovered: number;
  modulesTotal: number;
  nextFiche: Fiche | null;
  onOpenNext: () => void;
  onReset: () => void;
};

export default function ReadingProgress({
  total,
  readCount,
  modulesCovered,
  modulesTotal,
  nextFiche,
  onOpenNext,
  onReset,
}: ReadingProgressProps) {
  const percent = total > 0 ? Math.round((readCount / total) * 100) : 0;

  return (
    <section className="flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Votre progression
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Une fiche par jour suffit à changer vos réflexes.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-800">
          {readCount}/{total}
        </span>
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-foreground-500">
          <span>Fiches lues</span>
          <span className="font-semibold text-foreground-900">{percent} %</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-background-100">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-background-100 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
            Modules explorés
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground-950">
            {modulesCovered}/{modulesTotal}
          </p>
        </div>
        <div className="rounded-md bg-secondary-100 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary-700">
            Temps de lecture
          </p>
          <p className="mt-0.5 text-sm font-semibold text-secondary-900">{readCount * 4} min</p>
        </div>
      </div>

      <div className="mt-4 flex-1 rounded-md border border-dashed border-background-300 px-3.5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
          Prochaine lecture
        </p>
        {nextFiche ? (
          <>
            <p className="mt-1 text-xs font-semibold leading-snug text-foreground-900">
              {nextFiche.titre}
            </p>
            <button
              type="button"
              onClick={onOpenNext}
              className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary-700 hover:text-primary-800"
            >
              Ouvrir la fiche
              <i className="ri-arrow-right-line text-xs" />
            </button>
          </>
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-foreground-500">
            Toutes les fiches sont lues. Revenez-y pour préparer un nouveau projet.
          </p>
        )}
      </div>

      {readCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 self-start whitespace-nowrap text-[10px] font-medium text-foreground-400 transition-colors hover:text-foreground-700"
        >
          <i className="ri-restart-line text-[10px]" />
          Réinitialiser ma progression
        </button>
      )}
    </section>
  );
}