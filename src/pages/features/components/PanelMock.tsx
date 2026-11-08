import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type PanelVariant = "income" | "expenses" | "budget" | "goals" | "projects" | "simulation" | "profile";

interface PanelMockProps {
  variant: string;
}

const incomeRows = [
  { label: "Salaire — Société Ivoire", amount: "320 000", date: "01 oct." },
  { label: "Mission freelance — refonte site", amount: "85 000", date: "12 oct." },
  { label: "Vente en ligne", amount: "45 000", date: "21 oct." },
];

const expenseRows = [
  { icon: "ri-home-4-line", label: "Logement", amount: "120 000" },
  { icon: "ri-restaurant-line", label: "Nourriture", amount: "68 000" },
  { icon: "ri-bus-2-line", label: "Transport", amount: "35 000" },
  { icon: "ri-smartphone-line", label: "Communication", amount: "12 000" },
];

const budgetRows = [
  { label: "Logement", share: 30, amount: "135 000" },
  { label: "Nourriture", share: 20, amount: "90 000" },
  { label: "Épargne", share: 20, amount: "90 000" },
  { label: "Projets", share: 10, amount: "45 000" },
  { label: "Transport", share: 10, amount: "45 000" },
  { label: "Loisirs", share: 10, amount: "45 000" },
];

const goalsRows = [
  { label: "Apport maison", progress: 68, target: "4 500 000" },
  { label: "Voiture", progress: 42, target: "3 200 000" },
  { label: "Mariage", progress: 25, target: "2 400 000" },
];

const projectRows = [
  { label: "Local commercial", amount: "500 000", share: 25 },
  { label: "Stock initial", amount: "1 000 000", share: 50 },
  { label: "Marketing & lancement", amount: "200 000", share: 10 },
  { label: "Imprévus", amount: "300 000", share: 15 },
];

const simulationRows = [
  { label: "Capacité d'épargne", before: "100 000", after: "62 000", tone: "accent" },
  { label: "Taux d'endettement", before: "0 %", after: "24 %", tone: "accent" },
  { label: "Date objectif maison", before: "Mai 2028", after: "Nov. 2028", tone: "accent" },
  { label: "Reste à vivre", before: "272 000", after: "198 000", tone: "primary" },
];

const profileTiles = [
  { label: "Étudiant", icon: "ri-graduation-cap-line" },
  { label: "Salarié", icon: "ri-briefcase-4-line" },
  { label: "Entrepreneur", icon: "ri-store-2-line" },
  { label: "Freelance", icon: "ri-computer-line" },
  { label: "Famille", icon: "ri-parent-line" },
  { label: "Retraité", icon: "ri-user-heart-line" },
];

function PanelShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="flex items-center gap-2 border-b border-background-200 bg-background-100/60 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-primary-400" />
        <span className="h-2 w-2 rounded-full bg-accent-400" />
        <span className="h-2 w-2 rounded-full bg-background-300" />
        <p className="ml-2 truncate text-[11px] font-medium text-foreground-500">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function PanelMock({ variant }: PanelMockProps) {
  const key = variant as PanelVariant;
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });

  const fade = (index: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translate3d(0, 0, 0)" : "translate3d(0, 10px, 0)",
    transition: `opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 90}ms, transform 620ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 90}ms`,
  });

  const bar = (percent: number, index: number) => ({
    width: inView ? `${percent}%` : "0%",
    transition: `width 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${120 + index * 90}ms`,
  });

  const content = (() => {
    if (key === "income") {
      return (
        <PanelShell title="Revenus · Octobre 2026">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-foreground-500">Total du mois</p>
              <p className="text-xl font-semibold text-foreground-950" style={{ fontFamily: "var(--font-heading)" }}>
                450 000 <span className="text-xs font-medium text-foreground-500">FCFA</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-800">
              <i className="ri-arrow-up-line text-xs" /> +6 %
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {incomeRows.map((row, index) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-md border border-background-200 px-3 py-2"
                style={fade(index + 1)}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground-900">{row.label}</p>
                  <p className="text-[10px] text-foreground-500">{row.date}</p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-primary-700">{row.amount}</p>
              </li>
            ))}
          </ul>
        </PanelShell>
      );
    }

    if (key === "expenses") {
      return (
        <PanelShell title="Dépenses · par catégorie">
          <ul className="space-y-2">
            {expenseRows.map((row, index) => (
              <li
                key={row.label}
                className="flex items-center gap-3 rounded-md bg-background-100/70 px-3 py-2"
                style={fade(index)}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background-50 text-primary-700">
                  <i className={`${row.icon} text-sm`} />
                </span>
                <p className="flex-1 text-xs font-medium text-foreground-900">{row.label}</p>
                <p className="text-xs font-semibold text-foreground-700">{row.amount}</p>
              </li>
            ))}
          </ul>
          <div
            className="mt-3 flex items-center justify-between rounded-md bg-accent-50 px-3 py-2"
            style={fade(5)}
          >
            <p className="text-[11px] font-medium text-accent-900">Alerte loisirs</p>
            <p className="text-[11px] text-accent-800">Budget dépassé de 7 000</p>
          </div>
        </PanelShell>
      );
    }

    if (key === "budget") {
      return (
        <PanelShell title="Budget recommandé · 450 000 FCFA">
          <ul className="space-y-2.5">
            {budgetRows.map((row, index) => (
              <li key={row.label} style={fade(index)}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground-700">{row.label}</span>
                  <span className="font-medium text-foreground-900">
                    {row.share}% · {row.amount}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                  <div className="h-full rounded-full bg-primary-500" style={bar(row.share * 2.6, index)} />
                </div>
              </li>
            ))}
          </ul>
          <div
            className="mt-3 flex items-center justify-between rounded-md bg-primary-50 px-3 py-2"
            style={fade(7)}
          >
            <p className="text-[11px] font-medium text-primary-900">Santé financière</p>
            <p className="text-[11px] font-semibold text-primary-700">82 / 100 · Solide</p>
          </div>
        </PanelShell>
      );
    }

    if (key === "goals") {
      return (
        <PanelShell title="Objectifs financiers">
          <ul className="space-y-3">
            {goalsRows.map((row, index) => (
              <li
                key={row.label}
                className="rounded-md border border-background-200 px-3 py-2.5"
                style={fade(index)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground-900">{row.label}</p>
                  <p className="text-[11px] font-semibold text-primary-700">{row.progress} %</p>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                  <div className="h-full rounded-full bg-primary-500" style={bar(row.progress, index)} />
                </div>
                <p className="mt-1.5 text-[10px] text-foreground-500">Cible : {row.target} FCFA</p>
              </li>
            ))}
          </ul>
        </PanelShell>
      );
    }

    if (key === "projects") {
      return (
        <PanelShell title="Projet · Ouvrir une boutique">
          <div className="flex items-end justify-between">
            <p className="text-[11px] text-foreground-500">Budget total</p>
            <p className="text-lg font-semibold text-foreground-950" style={{ fontFamily: "var(--font-heading)" }}>
              2 000 000 <span className="text-xs font-medium text-foreground-500">FCFA</span>
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {projectRows.map((row, index) => (
              <li key={row.label} className="flex items-center gap-3" style={fade(index)}>
                <span className="w-8 shrink-0 text-[10px] font-semibold text-accent-700">{row.share}%</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-foreground-800">{row.label}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                    <div className="h-full rounded-full bg-accent-500" style={bar(row.share * 1.6, index)} />
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-foreground-700">{row.amount}</span>
              </li>
            ))}
          </ul>
        </PanelShell>
      );
    }

    if (key === "profile") {
      return (
        <PanelShell title="Profil financier · Salarié">
          <div className="grid grid-cols-2 gap-2">
            {profileTiles.map((tile, index) => {
              const active = tile.label === "Salarié";
              return (
                <div
                  key={tile.label}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-2 ${
                    active
                      ? "border-primary-300 bg-primary-50"
                      : "border-background-200 bg-background-50"
                  }`}
                  style={fade(index)}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${
                      active ? "bg-primary-500 text-background-50" : "bg-background-100 text-primary-700"
                    }`}
                  >
                    <i className={`${tile.icon} text-[11px]`} />
                  </span>
                  <p className="truncate text-[11px] font-medium text-foreground-900">{tile.label}</p>
                  {active && <i className="ri-checkbox-circle-fill ml-auto text-[11px] text-primary-600" />}
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md bg-background-100/70 px-3 py-2">
              <p className="text-[10px] text-foreground-500">Salaire net</p>
              <p className="text-xs font-semibold text-foreground-950">450 000 FCFA</p>
            </div>
            <div className="rounded-md bg-background-100/70 px-3 py-2">
              <p className="text-[10px] text-foreground-500">Foyer</p>
              <p className="text-xs font-semibold text-foreground-950">4 personnes</p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5" style={fade(7)}>
            {["Acheter une maison", "Acheter une voiture", "Financer un voyage"].map((goal) => (
              <span
                key={goal}
                className="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-800"
              >
                {goal}
              </span>
            ))}
          </div>

          <p
            className="mt-3 rounded-md bg-background-100 px-3 py-2 text-[10px] leading-relaxed text-foreground-600"
            style={fade(8)}
          >
            Conseil : automatisez 10 à 20 % d'épargne dès la paie, puis orientez primes et heures
            supplémentaires vers vos projets d'investissement.
          </p>
        </PanelShell>
      );
    }

    return (
      <PanelShell title="Simulation · Nouveau logement à 180 000 FCFA">
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-background-200 pb-2">
          <p className="text-[10px] uppercase tracking-wide text-foreground-500">Indicateur</p>
          <p className="text-[10px] uppercase tracking-wide text-foreground-500">Avant</p>
          <p className="text-[10px] uppercase tracking-wide text-foreground-500">Après</p>
        </div>
        <ul className="mt-2 space-y-2">
          {simulationRows.map((row, index) => (
            <li
              key={row.label}
              className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2"
              style={fade(index)}
            >
              <p className="text-[11px] leading-snug text-foreground-700">{row.label}</p>
              <p className="text-[11px] font-medium leading-snug text-foreground-900">{row.before}</p>
              <p
                className={`text-[11px] font-semibold leading-snug ${
                  row.tone === "accent" ? "text-accent-700" : "text-primary-700"
                }`}
              >
                {row.after}
              </p>
            </li>
          ))}
        </ul>
        <p
          className="mt-3 rounded-md bg-background-100 px-3 py-2 text-[10px] leading-relaxed text-foreground-600"
          style={fade(4)}
        >
          Recommandation : votre taux d'endettement resterait sous la limite de 33 %, mais l'objectif
          « apport maison » glisserait de 6 mois.
        </p>
      </PanelShell>
    );
  })();

  return <div ref={ref}>{content}</div>;
}