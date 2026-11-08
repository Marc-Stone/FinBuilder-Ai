import { getEducationModule, type Fiche } from "@/lib/education";

type FicheCardProps = {
  fiche: Fiche;
  read: boolean;
  onOpen: () => void;
};

export default function FicheCard({ fiche, read, onOpen }: FicheCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full cursor-pointer flex-col rounded-lg border border-background-200 bg-background-50 p-4 text-left transition-colors hover:border-primary-300 md:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <i className={`${fiche.icon} text-base`} />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
            {fiche.categorie}
          </span>
          {read && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-800">
              <i className="ri-check-line text-[10px]" />
              Lu
            </span>
          )}
        </div>
      </div>

      <h3
        className="mt-3 text-sm font-semibold leading-snug text-foreground-950"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {fiche.titre}
      </h3>
      <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-foreground-500">
        {fiche.resume}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        {fiche.modules.slice(0, 2).map((module) => {
          const meta = getEducationModule(module);
          return (
            <span
              key={`${fiche.id}-${module}`}
              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${meta.chip}`}
            >
              <i className={`${meta.icon} text-[10px]`} />
              {meta.short}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-background-200 pt-2.5">
        <span className="inline-flex items-center gap-2 text-[10px] font-medium text-foreground-400">
          <span className="inline-flex items-center gap-0.5">
            <i className="ri-time-line text-[10px]" />
            {fiche.minutes} min
          </span>
          <span className="h-1 w-1 rounded-full bg-background-300" />
          {fiche.niveau}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700">
          Lire
          <i className="ri-arrow-right-line text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}