import {
  formatDateFr,
  formatMoney,
  getExpenseCategory,
  getPaymentMethod,
  type ExpenseEntry,
} from "@/lib/finance";

type ExpenseListProps = {
  rows: ExpenseEntry[];
  devise: string;
  loading: boolean;
  error: string;
  hasFilters: boolean;
  onRetry: () => void;
  onEdit: (entry: ExpenseEntry) => void;
  onDelete: (entry: ExpenseEntry) => void;
  onAdd: () => void;
};

export default function ExpenseList({
  rows,
  devise,
  loading,
  error,
  hasFilters,
  onRetry,
  onEdit,
  onDelete,
  onAdd,
}: ExpenseListProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-background-200 bg-background-50 p-4">
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-md bg-background-100 p-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-background-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-background-200" />
                <div className="h-2 w-1/2 animate-pulse rounded-full bg-background-200" />
              </div>
              <div className="h-3 w-20 animate-pulse rounded-full bg-background-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-accent-300 bg-accent-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
            <i className="ri-error-warning-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-900">
              Impossible de charger vos dépenses
            </p>
            <p className="mt-1 text-xs leading-relaxed text-accent-800">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              <i className="ri-refresh-line text-sm" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-5 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-700">
          <i className="ri-arrow-up-line text-2xl" />
        </span>
        <p className="mt-3 text-sm font-semibold text-foreground-950">
          {hasFilters ? "Aucune dépense ne correspond à vos filtres" : "Aucune dépense enregistrée"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
          {hasFilters
            ? "Essayez une autre période ou une autre catégorie."
            : "Notez vos sorties du mois, même les petites : c'est ainsi que l'on repère les fuites d'argent."}
        </p>
        {!hasFilters && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-add-line text-base" />
            Ajouter ma première dépense
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="hidden items-center gap-4 border-b border-background-200 bg-background-100/70 px-4 py-2.5 lg:flex">
        <p className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Dépense
        </p>
        <p className="w-[130px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Catégorie
        </p>
        <p className="w-[120px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Paiement
        </p>
        <p className="w-[130px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Date
        </p>
        <p className="w-[150px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Montant
        </p>
        <p className="w-[76px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Actions
        </p>
      </div>

      <ul className="divide-y divide-background-200">
        {rows.map((entry) => {
          const meta = getExpenseCategory(entry.categorie);
          const payment = getPaymentMethod(entry.mode_paiement);
          return (
            <li
              key={entry.id}
              className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-background-100/60 lg:flex-row lg:items-center lg:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                >
                  <i className={`${meta.icon} text-base`} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-foreground-950">
                      {entry.description}
                    </p>
                    {entry.recurrent && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
                        <i className="ri-refresh-line text-[10px]" />
                        Récurrent
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-foreground-500">
                    {entry.note ? entry.note : "Sans note"}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-foreground-400 lg:hidden">
                    <i className="ri-calendar-line text-xs" />
                    {formatDateFr(entry.date)}
                    <span className="mx-1 text-background-400">•</span>
                    <span className="font-medium text-foreground-500">{meta.label}</span>
                    <span className="mx-1 text-background-400">•</span>
                    <span className="font-medium text-foreground-500">{payment.label}</span>
                  </p>
                </div>
              </div>

              <div className="hidden w-[130px] shrink-0 lg:block">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </div>

              <div className="hidden w-[120px] shrink-0 items-center gap-1.5 lg:flex">
                <i className={`${payment.icon} text-xs text-foreground-400`} />
                <p className="truncate text-xs text-foreground-600">{payment.label}</p>
              </div>

              <div className="hidden w-[130px] shrink-0 lg:block">
                <p className="text-xs text-foreground-600">{formatDateFr(entry.date)}</p>
              </div>

              <div className="flex items-center justify-between gap-3 lg:w-[150px] lg:shrink-0 lg:justify-end">
                <p className="text-sm font-semibold text-foreground-950 lg:text-right">
                  − {formatMoney(Number(entry.montant), devise)}
                </p>

                <div className="flex shrink-0 items-center gap-1 lg:w-[76px] lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    aria-label={`Modifier ${entry.description}`}
                    title="Modifier"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-background-200 text-foreground-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 lg:h-8 lg:w-8"
                  >
                    <i className="ri-pencil-line text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(entry)}
                    aria-label={`Supprimer ${entry.description}`}
                    title="Supprimer"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-background-200 text-foreground-600 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-800 lg:h-8 lg:w-8"
                  >
                    <i className="ri-delete-bin-line text-sm" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}