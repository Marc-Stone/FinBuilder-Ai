import { Link } from "react-router-dom";
import { getEducationModule } from "@/lib/education";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_STYLES,
  formatContentDate,
  parseFichePayload,
  type ContentRow,
} from "@/lib/content";

type ContentTableProps = {
  rows: ContentRow[];
  busyId: string | null;
  onPreview: (row: ContentRow) => void;
  onEdit: (row: ContentRow) => void;
  onToggleStatus: (row: ContentRow) => void;
  onDelete: (row: ContentRow) => void;
};

export default function ContentTable({
  rows,
  busyId,
  onPreview,
  onEdit,
  onToggleStatus,
  onDelete,
}: ContentTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-4 py-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-400">
          <i className="ri-article-line text-xl" />
        </span>
        <p className="mt-2.5 text-sm font-semibold text-foreground-950">Aucune fiche ne correspond</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
          Modifiez vos filtres, ou créez une nouvelle fiche pour alimenter la bibliothèque
          d'éducation financière.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="hidden grid-cols-12 gap-2 border-b border-background-200 bg-background-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500 lg:grid">
        <span className="col-span-5">Fiche</span>
        <span className="col-span-2">Catégorie</span>
        <span className="col-span-2">Statut</span>
        <span className="col-span-2">Mise à jour</span>
        <span className="col-span-1 text-right">Actions</span>
      </div>

      <ul className="divide-y divide-background-200">
        {rows.map((row) => {
          const payload = parseFichePayload(row.contenu);
          const meta = getEducationModule(payload.module);
          const busy = busyId === row.id;
          const published = row.statut === "publie";

          return (
            <li
              key={row.id}
              className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-background-100/60 lg:grid-cols-12 lg:items-center lg:gap-2"
            >
              <div className="flex min-w-0 items-start gap-2.5 lg:col-span-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <i className={`${payload.icon} text-base`} />
                </span>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onPreview(row)}
                    className="block cursor-pointer truncate text-left text-sm font-semibold text-foreground-950 transition-colors hover:text-primary-800"
                  >
                    {row.titre}
                  </button>
                  <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-foreground-500">
                    {row.resume || "Résumé à compléter"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${meta.chip}`}
                    >
                      <i className={`${meta.icon} text-[10px]`} />
                      {meta.short}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-foreground-400">
                      <i className="ri-time-line text-[10px]" />
                      {payload.minutes} min
                    </span>
                    <span className="text-[10px] font-medium text-foreground-400">
                      · {payload.niveau}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
                  {row.categorie ?? "Non classée"}
                </span>
              </div>

              <div className="lg:col-span-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    CONTENT_STATUS_STYLES[row.statut] ?? CONTENT_STATUS_STYLES.brouillon
                  }`}
                >
                  <i
                    className={
                      published ? "ri-check-line text-[10px]" : "ri-draft-line text-[10px]"
                    }
                  />
                  {CONTENT_STATUS_LABELS[row.statut] ?? row.statut}
                </span>
                {published && row.date_publication && (
                  <p className="mt-0.5 text-[10px] text-foreground-400">
                    depuis le {formatContentDate(row.date_publication)}
                  </p>
                )}
              </div>

              <div className="text-[11px] font-medium text-foreground-600 lg:col-span-2">
                {formatContentDate(row.updated_at)}
              </div>

              <div className="flex items-center gap-1 lg:col-span-1 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onPreview(row)}
                  aria-label="Aperçu de la fiche"
                  title="Aperçu"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-foreground-950"
                >
                  <i className="ri-eye-line text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  aria-label="Modifier la fiche"
                  title="Modifier"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-primary-800"
                >
                  <i className="ri-edit-line text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleStatus(row)}
                  disabled={busy}
                  aria-label={published ? "Retirer la fiche" : "Publier la fiche"}
                  title={published ? "Retirer de la bibliothèque" : "Publier"}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                    busy
                      ? "cursor-wait text-foreground-300"
                      : published
                        ? "cursor-pointer text-foreground-500 hover:bg-accent-50 hover:text-accent-800"
                        : "cursor-pointer text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                  }`}
                >
                  <i
                    className={
                      busy
                        ? "ri-loader-4-line animate-spin text-sm"
                        : published
                          ? "ri-arrow-go-back-line text-sm"
                          : "ri-send-plane-line text-sm"
                    }
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  disabled={busy}
                  aria-label="Supprimer la fiche"
                  title="Supprimer"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-accent-50 hover:text-accent-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="ri-delete-bin-line text-sm" />
                </button>
                {published && (
                  <Link
                    to={row.url || meta.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ouvrir dans l'application"
                    title="Voir dans l'application"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-foreground-950"
                  >
                    <i className="ri-external-link-line text-sm" />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}