import { Link } from "react-router-dom";
import type { FinancialProfileBlueprint } from "@/lib/financialProfiles";

type FinancialProfileFocusProps = {
  blueprint: FinancialProfileBlueprint;
};

export default function FinancialProfileFocus({ blueprint }: FinancialProfileFocusProps) {
  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${blueprint.bubble}`}
          >
            <i className={`${blueprint.icon} text-base`} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-400">
              Tableau de bord personnalisé · profil {blueprint.label}
            </p>
            <p
              className="mt-0.5 text-sm font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {blueprint.adviceTitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Link
            to="/app/profil-financier"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
          >
            <i className="ri-user-star-line text-xs" />
            Mon profil financier
          </Link>
          <Link
            to="/app/assistant"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-2.5 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-sparkling-line text-xs" />
            Coach IA
          </Link>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {blueprint.highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-background-200 bg-background-100/60 px-3 py-2.5"
          >
            <div className="flex items-center gap-1.5">
              <i className={`${item.icon} text-xs text-primary-700`} />
              <p className="truncate text-[11px] font-semibold text-foreground-900">{item.label}</p>
            </div>
            <p className="mt-0.5 text-[10px] leading-relaxed text-foreground-500">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}