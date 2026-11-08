import { useState, type FormEvent } from "react";
import { createPosteId, type ProjectDocument } from "@/lib/projects";

type ProjectDocumentsSectionProps = {
  documents: ProjectDocument[];
  onChange: (documents: ProjectDocument[]) => void;
  disabled?: boolean;
};

function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export default function ProjectDocumentsSection({
  documents,
  onChange,
  disabled,
}: ProjectDocumentsSectionProps) {
  const [nom, setNom] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanNom = nom.trim();
    if (cleanNom.length < 2) {
      setError("Donnez un nom au document (devis, contrat, facture…).");
      return;
    }
    setError("");
    onChange([...documents, { id: createPosteId(), nom: cleanNom, url: normalizeUrl(url) }]);
    setNom("");
    setUrl("");
  };

  return (
    <section className="mt-4 rounded-lg border border-background-200 bg-background-50 px-3.5 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600">
            <i className="ri-folder-3-line text-sm text-secondary-700" />
            Documents du projet
          </h3>
          <p className="mt-0.5 text-[11px] text-foreground-500">
            Devis, contrats, factures : gardez les références au même endroit.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-background-300 bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
          {documents.length}
        </span>
      </div>

      {documents.length > 0 ? (
        <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex min-w-0 items-center gap-2 rounded-md border border-background-200 bg-background-100/40 px-2 py-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
                <i className="ri-file-text-line text-sm" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-foreground-900">{document.nom}</p>
                {document.url ? (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-primary-700 hover:text-primary-800"
                  >
                    Ouvrir le lien
                    <i className="ri-external-link-line text-[10px]" />
                  </a>
                ) : (
                  <p className="text-[10px] text-foreground-400">Référence sans lien</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange(documents.filter((item) => item.id !== document.id))}
                disabled={disabled}
                aria-label={`Supprimer le document ${document.nom}`}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-accent-50 hover:text-accent-800 disabled:cursor-not-allowed"
              >
                <i className="ri-close-line text-sm" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-background-300 bg-background-100/50 px-3 py-2.5 text-[11px] text-foreground-500">
          Aucun document rattaché. Ajoutez par exemple le devis du terrain ou le contrat du traiteur.
        </p>
      )}

      <form onSubmit={add} className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-[1fr_1fr_auto]">
        <div className="relative min-w-0">
          <i className="ri-file-text-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
          <input
            type="text"
            value={nom}
            onChange={(event) => setNom(event.target.value)}
            disabled={disabled}
            maxLength={70}
            placeholder="Nom du document"
            aria-label="Nom du document"
            className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 py-1.5 pl-8 pr-2.5 text-xs text-foreground-900 placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div className="relative min-w-0">
          <i className="ri-link pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={disabled}
            maxLength={300}
            placeholder="Lien (optionnel)"
            aria-label="Lien du document"
            className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 py-1.5 pl-8 pr-2.5 text-xs text-foreground-900 placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-secondary-300 bg-secondary-100 px-3 py-1.5 text-[11px] font-semibold text-secondary-900 transition-colors hover:bg-secondary-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i className="ri-attachment-2 text-sm" />
          Ajouter
        </button>
      </form>

      {error && <p className="mt-1.5 text-[10px] font-medium text-accent-800">{error}</p>}
    </section>
  );
}