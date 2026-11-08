type HistoryPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  /** Libellé au pluriel des éléments paginés (ex. « entrées »). */
  unit?: string;
  onPageChange: (page: number) => void;
};

/**
 * Barre de pagination des historiques : précédent / suivant.
 * Elle ne s'affiche que lorsqu'il y a plus d'une page.
 */
export default function HistoryPagination({
  page,
  pageSize,
  total,
  loading = false,
  unit = "éléments",
  onPageChange,
}: HistoryPaginationProps) {
  if (total <= pageSize) return null;

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), lastPage);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  const baseButton =
    "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold transition-colors sm:min-h-0";

  return (
    <nav
      aria-label="Pagination de l'historique"
      className="flex flex-col gap-2.5 rounded-lg border border-background-200 bg-background-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-foreground-500">
        <span className="font-semibold text-foreground-950">
          {from}–{to}
        </span>{" "}
        sur {total} {unit}
        <span className="ml-2 hidden text-foreground-400 sm:inline">
          · page {current} / {lastPage}
        </span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1 || loading}
          className={`${baseButton} ${
            current <= 1 || loading
              ? "cursor-not-allowed border-background-200 bg-background-100 text-foreground-400"
              : "border-background-300 bg-background-50 text-foreground-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
          }`}
        >
          <i className="ri-arrow-left-s-line text-sm" />
          Précédent
        </button>

        <button
          type="button"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= lastPage || loading}
          className={`${baseButton} ${
            current >= lastPage || loading
              ? "cursor-not-allowed border-background-200 bg-background-100 text-foreground-400"
              : "border-primary-500 bg-primary-500 text-background-50 hover:bg-primary-600"
          }`}
        >
          Suivant
          <i className="ri-arrow-right-s-line text-sm" />
        </button>
      </div>
    </nav>
  );
}