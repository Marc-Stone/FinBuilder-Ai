import { formatMoney } from "@/lib/finance";
import { createPosteId, posteTone, type ProjectPoste } from "@/lib/projects";

type ProjectPostesEditorProps = {
  postes: ProjectPoste[];
  onChange: (postes: ProjectPoste[]) => void;
  devise: string;
  budgetTotal: number;
  onApplyTemplate: () => void;
  templateHint: string;
  error?: string;
};

function toNumber(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export default function ProjectPostesEditor({
  postes,
  onChange,
  devise,
  budgetTotal,
  onApplyTemplate,
  templateHint,
  error,
}: ProjectPostesEditorProps) {
  const alloue = postes.reduce((total, poste) => total + (Number(poste.prevu) || 0), 0);
  const reste = budgetTotal - alloue;
  const couverture = budgetTotal > 0 ? Math.min((alloue / budgetTotal) * 100, 100) : 0;

  const update = (id: string, patch: Partial<ProjectPoste>) => {
    onChange(postes.map((poste) => (poste.id === id ? { ...poste, ...patch } : poste)));
  };

  const remove = (id: string) => {
    onChange(postes.filter((poste) => poste.id !== id));
  };

  const add = () => {
    onChange([
      ...postes,
      { id: createPosteId(), libelle: "", categorie: "autre", prevu: 0, depense: 0 },
    ]);
  };

  return (
    <div className="min-w-0 rounded-md border border-background-200 bg-background-100/50 p-3 md:p-3.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground-900">Répartition budgétaire par poste</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
            Détaillez votre enveloppe. La somme des postes peut être inférieure au budget, FinBuilder
            affiche alors le reste à répartir.
          </p>
        </div>
        <button
          type="button"
          onClick={onApplyTemplate}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-2.5 py-1.5 text-[11px] font-semibold text-primary-800 transition-colors hover:bg-primary-100"
        >
          <i className="ri-magic-line text-xs" />
          Répartition recommandée
        </button>
      </div>

      <p className="mt-2 truncate text-[10px] text-foreground-400" title={templateHint}>
        {templateHint}
      </p>

      <div className="mt-3 hidden grid-cols-[1fr_108px_108px_32px] items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400 sm:grid">
        <span>Poste</span>
        <span className="text-right">Prévu</span>
        <span className="text-right">Dépensé</span>
        <span />
      </div>

      <ul className="mt-1.5 space-y-2">
        {postes.map((poste, index) => (
          <li
            key={poste.id}
            className="grid grid-cols-1 gap-2 rounded-md border border-background-200 bg-background-50 p-2 sm:grid-cols-[1fr_108px_108px_32px] sm:items-center"
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${posteTone(index)}`} />
              <input
                type="text"
                name={`poste_libelle_${index}`}
                value={poste.libelle}
                maxLength={60}
                onChange={(event) => update(poste.id, { libelle: event.target.value })}
                placeholder="Terrain, main-d'œuvre, matériel…"
                className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs text-foreground-950 placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-foreground-400 sm:hidden">
                Prévu
              </label>
              <input
                type="text"
                inputMode="numeric"
                name={`poste_prevu_${index}`}
                value={poste.prevu ? String(poste.prevu) : ""}
                onChange={(event) => update(poste.id, { prevu: toNumber(event.target.value) })}
                placeholder="0"
                className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-right text-xs font-semibold text-foreground-950 placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-foreground-400 sm:hidden">
                Dépensé
              </label>
              <input
                type="text"
                inputMode="numeric"
                name={`poste_depense_${index}`}
                value={poste.depense ? String(poste.depense) : ""}
                onChange={(event) => update(poste.id, { depense: toNumber(event.target.value) })}
                placeholder="0"
                className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-right text-xs text-foreground-800 placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <button
              type="button"
              onClick={() => remove(poste.id)}
              aria-label={`Supprimer le poste ${poste.libelle || index + 1}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center justify-self-end rounded-md border border-background-200 text-foreground-500 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-800"
            >
              <i className="ri-delete-bin-line text-sm" />
            </button>
          </li>
        ))}
      </ul>

      {postes.length === 0 && (
        <p className="mt-2 rounded-md border border-dashed border-background-300 px-3 py-3 text-[11px] leading-relaxed text-foreground-500">
          Aucun poste pour le moment. Ajoutez-les un par un ou appliquez la répartition recommandée
          pour votre type de projet.
        </p>
      )}

      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-dashed border-background-300 bg-background-50 px-3 py-2 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
      >
        <i className="ri-add-line text-sm" />
        Ajouter un poste
      </button>

      <div className="mt-3 rounded-md bg-background-50 px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px]">
          <span className="font-medium text-foreground-600">
            Alloué : <strong className="font-semibold text-foreground-900">{formatMoney(alloue, devise)}</strong>
          </span>
          <span className="font-medium text-foreground-600">
            Enveloppe : <strong className="font-semibold text-foreground-900">{formatMoney(budgetTotal, devise)}</strong>
          </span>
          <span
            className={`font-semibold ${reste < 0 ? "text-accent-700" : "text-primary-700"}`}
          >
            {reste >= 0 ? `Reste ${formatMoney(reste, devise)}` : `Dépassement ${formatMoney(Math.abs(reste), devise)}`}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              reste < 0 ? "bg-accent-500" : "bg-primary-500"
            }`}
            style={{ width: `${Math.max(couverture, alloue > 0 ? 2 : 0)}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-accent-700">
          <i className="ri-error-warning-line mt-0.5 text-sm" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}