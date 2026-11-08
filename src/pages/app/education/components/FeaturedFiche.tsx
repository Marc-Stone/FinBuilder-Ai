import { getEducationModule, type Fiche } from "@/lib/education";

type FeaturedFicheProps = {
  fiche: Fiche;
  read: boolean;
  onOpen: () => void;
};

export default function FeaturedFiche({ fiche, read, onOpen }: FeaturedFicheProps) {
  return (
    <section className="relative overflow-hidden rounded-lg bg-primary-950 p-5 md:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-accent-500/15 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-accent-400/40 bg-accent-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-300">
            <i className="ri-star-line text-[10px]" />
            À lire aujourd'hui
          </span>
          <span className="text-[10px] font-medium text-background-50/60">
            {fiche.categorie} · {fiche.minutes} min · {fiche.niveau}
          </span>
          {read && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-background-50/10 px-1.5 py-0.5 text-[10px] font-semibold text-background-50">
              <i className="ri-check-line text-[10px]" />
              Déjà lue
            </span>
          )}
        </div>

        <h2
          className="mt-2.5 max-w-lg text-lg font-semibold leading-snug text-background-50 md:text-xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {fiche.titre}
        </h2>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-background-50/70 md:text-sm">
          {fiche.resume}
        </p>

        <ul className="mt-4 space-y-1.5">
          {fiche.points.slice(0, 3).map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-500 text-primary-950">
                <i className="ri-check-line text-[9px]" />
              </span>
              <p className="text-[11px] leading-relaxed text-background-50/80 md:text-xs">{point}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            Lire la fiche
            <i className="ri-arrow-right-line text-xs" />
          </button>
          {fiche.modules.slice(0, 2).map((module) => {
            const meta = getEducationModule(module);
            return (
              <span
                key={module}
                className="inline-flex items-center gap-1 rounded-full border border-background-50/20 bg-background-50/10 px-2 py-0.5 text-[10px] font-semibold text-background-50/80"
              >
                <i className={`${meta.icon} text-[10px]`} />
                {meta.short}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}