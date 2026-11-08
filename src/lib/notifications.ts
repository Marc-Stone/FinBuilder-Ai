import { formatMoney, getExpenseCategory, parseIsoDate } from "@/lib/finance";
import {
  aggregateExpenses,
  buildBudgetPlan,
  mergePlanWithActuals,
  resolveReferenceIncome,
  type BudgetGroupResult,
} from "@/lib/budget";
import { computeGoalProgress, formatMonths, getGoalCategory, type GoalEntry } from "@/lib/goals";
import { computeEtapesProgress, parseEtapes } from "@/lib/projects";

export type NotifIncomeRow = { id: string; montant: number; date: string };

export type NotifProjectRow = {
  id: string;
  nom: string;
  statut: string;
  budget_total?: number | null;
  montant_finance?: number | null;
  date_fin?: string | null;
  etapes?: unknown;
};

export type NotifExpenseRow = {
  id: string;
  montant: number;
  date: string;
  categorie: string;
  description?: string | null;
};

export type NotificationCategory = "objectif" | "budget" | "epargne";

export type NotificationSeverity = "urgent" | "attention" | "info" | "good";

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  icon: string;
  title: string;
  message: string;
  meta: string;
  to: string;
  actionLabel: string;
};

export type DiagnosisKey =
  | "revenus"
  | "depenses"
  | "deficit"
  | "epargne"
  | "envies"
  | "besoins"
  | "equilibre";

export type BudgetDiagnosis = {
  key: DiagnosisKey;
  label: string;
  summary: string;
  metric: string;
  tone: "risk" | "watch" | "good";
  icon: string;
  ficheIds: string[];
};

export type NotificationFeed = {
  notifications: AppNotification[];
  diagnosis: BudgetDiagnosis;
  groups: BudgetGroupResult[];
  reference: number;
  savings: number;
  savingsTarget: number;
  savingsGap: number;
  spending: number;
  income: number;
  monthsUsed: number;
  counts: Record<NotificationSeverity | "total", number>;
};

const severityWeight: Record<NotificationSeverity, number> = {
  urgent: 0,
  attention: 1,
  info: 2,
  good: 3,
};

export const channelLabels: { key: NotificationCategory; label: string; hint: string; icon: string }[] = [
  {
    key: "objectif",
    label: "Échéances d'objectifs",
    hint: "Objectifs proches de leur date limite ou en retard.",
    icon: "ri-flag-2-line",
  },
  {
    key: "budget",
    label: "Dépassements de budget",
    hint: "Postes qui dépassent la répartition recommandée.",
    icon: "ri-pie-chart-2-line",
  },
  {
    key: "epargne",
    label: "Épargne du mois",
    hint: "Rappel quand l'épargne cible n'est pas encore atteinte.",
    icon: "ri-safe-2-line",
  },
];

function monthKeyOf(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

function round(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function buildDiagnosis({
  referenceIncome,
  currentIncome,
  spending,
  savings,
  savingsTarget,
  groups,
  devise,
}: {
  referenceIncome: number;
  currentIncome: number;
  spending: number;
  savings: number;
  savingsTarget: number;
  groups: BudgetGroupResult[];
  devise: string;
}): BudgetDiagnosis {
  const share = (value: number) =>
    referenceIncome > 0 ? Math.round((value / referenceIncome) * 100) : 0;

  if (referenceIncome <= 0) {
    return {
      key: "revenus",
      label: "Aucun revenu de référence",
      summary:
        "Sans revenu enregistré, il est impossible de comparer vos dépenses à une cible. Ajoutez au moins un revenu du mois pour activer le diagnostic.",
      metric: "Diagnostic en attente",
      tone: "watch",
      icon: "ri-arrow-down-line",
      ficheIds: ["regle-50-30-20", "revenus-irreguliers"],
    };
  }

  if (spending <= 0) {
    return {
      key: "depenses",
      label: "Pas encore de dépenses saisies",
      summary:
        "Votre revenu est enregistré mais aucune dépense ne l'est. Le point faible ne peut pas être identifié tant que vos sorties ne sont pas suivies.",
      metric: `${formatMoney(referenceIncome, devise)} de revenus seuls`,
      tone: "watch",
      icon: "ri-arrow-up-line",
      ficheIds: ["depenses-invisibles", "regle-50-30-20"],
    };
  }

  if (currentIncome > 0 && spending > currentIncome) {
    return {
      key: "deficit",
      label: "Dépenses au-dessus des revenus",
      summary: `Ce mois-ci, vous avez dépensé ${formatMoney(spending - currentIncome, devise)} de plus que ce que vous avez encaissé. Réduire un poste non essentiel reste la correction la plus rapide.`,
      metric: `${share(spending)} % du revenu de référence`,
      tone: "risk",
      icon: "ri-error-warning-line",
      ficheIds: ["payer-soi-meme", "depenses-invisibles"],
    };
  }

  const envies = groups.find((group) => group.meta.key === "envies");
  const besoins = groups.find((group) => group.meta.key === "besoins");
  const enviesShare = envies ? share(envies.reel) : 0;
  const besoinsShare = besoins ? share(besoins.reel) : 0;
  const enviesTarget = envies ? envies.meta.percent : 30;
  const besoinsTarget = besoins ? besoins.meta.percent : 50;
  const savingsShare = share(savings);

  if (savings < savingsTarget * 0.6) {
    return {
      key: "epargne",
      label: "Épargne trop faible pour vos objectifs",
      summary: `Vous avez épargné ${formatMoney(savings, devise)} sur une cible de ${formatMoney(savingsTarget, devise)}. C'est l'écart le plus coûteux : chaque mois sans épargne repousse vos projets.`,
      metric: `${savingsShare} % épargné · cible 20 %`,
      tone: savings <= 0 ? "risk" : "watch",
      icon: "ri-safe-2-line",
      ficheIds: ["payer-soi-meme", "epargne-mensuelle"],
    };
  }

  if (enviesShare > enviesTarget + 2) {
    return {
      key: "envies",
      label: "Envies & confort au-dessus de la cible",
      summary: `Vos dépenses non essentielles représentent ${enviesShare} % de votre revenu pour une cible de ${enviesTarget} %. C'est le poste le plus facile à ajuster sans toucher à l'essentiel.`,
      metric: `${formatMoney(envies?.reel ?? 0, devise)} ce mois-ci`,
      tone: "watch",
      icon: "ri-shopping-bag-3-line",
      ficheIds: ["depenses-invisibles", "regle-50-30-20"],
    };
  }

  if (besoinsShare > besoinsTarget + 5) {
    return {
      key: "besoins",
      label: "Besoins essentiels trop lourds",
      summary: `Vos charges essentielles absorbent ${besoinsShare} % de votre revenu pour une cible de ${besoinsTarget} %. La marge de manœuvre se joue sur les charges fixes et le logement.`,
      metric: `${formatMoney(besoins?.reel ?? 0, devise)} ce mois-ci`,
      tone: "watch",
      icon: "ri-home-heart-line",
      ficheIds: ["regle-50-30-20", "taux-endettement"],
    };
  }

  if (savings < savingsTarget) {
    return {
      key: "epargne",
      label: "Épargne juste sous la cible",
      summary: `Vous êtes à ${formatMoney(savings, devise)} d'épargne pour une cible de ${formatMoney(savingsTarget, devise)}. Un petit ajustement mensuel suffit à combler l'écart.`,
      metric: `${savingsShare} % épargné · cible 20 %`,
      tone: "watch",
      icon: "ri-safe-2-line",
      ficheIds: ["payer-soi-meme", "fonds-urgence"],
    };
  }

  return {
    key: "equilibre",
    label: "Budget équilibré",
    summary: `Vos trois blocs respectent la répartition 50 / 30 / 20 et vous épargnez ${savingsShare} % de vos revenus. Le prochain levier est de faire travailler cette épargne.`,
    metric: `${savingsShare} % épargné ce mois-ci`,
    tone: "good",
    icon: "ri-award-line",
    ficheIds: ["interets-composes", "objectif-ou-projet"],
  };
}

export function buildNotificationFeed({
  income,
  expenses,
  goals,
  projects = [],
  devise,
  now = new Date(),
}: {
  income: NotifIncomeRow[];
  expenses: NotifExpenseRow[];
  goals: GoalEntry[];
  projects?: NotifProjectRow[];
  devise: string;
  now?: Date;
}): NotificationFeed {
  const currentKey = monthKeyOf(now);

  const incomeByMonth: Record<string, number> = {};
  income.forEach((row) => {
    const key = monthKeyOf(parseIsoDate(row.date));
    incomeByMonth[key] = (incomeByMonth[key] ?? 0) + (Number(row.montant) || 0);
  });

  const currentIncome = income
    .filter((row) => monthKeyOf(parseIsoDate(row.date)) === currentKey)
    .reduce((total, row) => total + (Number(row.montant) || 0), 0);

  const resolved = resolveReferenceIncome(incomeByMonth, currentIncome);
  const referenceIncome = resolved.reference > 0 ? resolved.reference : currentIncome;

  const monthExpenses = expenses.filter(
    (row) => monthKeyOf(parseIsoDate(row.date)) === currentKey,
  );
  const actual = aggregateExpenses(monthExpenses);
  const plan = mergePlanWithActuals(buildBudgetPlan(referenceIncome), actual);

  const savings = round(actual.parGroupe.epargne);
  const savingsTarget = round(referenceIncome * 0.2);
  const savingsGap = Math.max(savingsTarget - savings, 0);
  const spending = round(actual.total);

  const notifications: AppNotification[] = [];

  // 1. Budget overruns, group by group.
  plan.groups
    .filter((group) => group.meta.key !== "epargne" && group.recommande > 0)
    .forEach((group) => {
      if (group.reel <= group.recommande * 1.02) return;

      const over = round(group.reel - group.recommande);
      const ratio = group.reel / group.recommande;
      const worst = plan.lines
        .filter((line) => line.group === group.meta.key)
        .sort((a, b) => b.ecart - a.ecart)[0];

      notifications.push({
        id: `budget-${group.meta.key}`,
        category: "budget",
        severity: ratio >= 1.2 ? "urgent" : "attention",
        icon: group.meta.icon,
        title: `${group.meta.label} : ${formatMoney(over, devise)} au-dessus de la cible`,
        message: `Vous avez dépensé ${formatMoney(group.reel, devise)} pour une enveloppe recommandée de ${formatMoney(group.recommande, devise)}${
          worst && worst.ecart > 0 ? `. Poste le plus en écart : ${worst.label} (+${formatMoney(worst.ecart, devise)})` : ""
        }.`,
        meta: `${Math.round(ratio * 100)} % de la cible`,
        to: "/app/budget",
        actionLabel: "Voir mon budget",
      });
    });

  // 1bis. Dépassement poste par poste (ex. « budget Transport dépassé de 12 % »).
  plan.lines
    .filter(
      (line) =>
        line.categorie !== "epargne" &&
        line.recommande > 0 &&
        line.reel > line.recommande * 1.05,
    )
    .forEach((line) => {
      const depassement = Math.round(
        ((line.reel - line.recommande) / line.recommande) * 100,
      );
      const meta = getExpenseCategory(line.categorie);

      notifications.push({
        id: `budget-poste-${line.categorie}`,
        category: "budget",
        severity: depassement >= 30 ? "urgent" : "attention",
        icon: meta.icon,
        title: `Vous avez dépassé votre budget ${line.label} de ${depassement} %`,
        message: `${formatMoney(line.reel, devise)} dépensés pour une cible de ${formatMoney(
          line.recommande,
          devise,
        )}, soit ${formatMoney(line.reel - line.recommande, devise)} au-dessus de votre budget.
        `.trim(),
        meta: `${depassement} % au-dessus de la cible`,
        to: "/app/budget",
        actionLabel: "Ajuster ce poste",
      });
    });

  // 2. Monthly savings reminder.
  if (referenceIncome > 0 && savings < savingsTarget) {
    notifications.push({
      id: "epargne-mois",
      category: "epargne",
      severity: savings <= 0 ? "urgent" : savings < savingsTarget * 0.5 ? "attention" : "info",
      icon: "ri-safe-2-line",
      title:
        savings <= 0
          ? "Aucune épargne enregistrée ce mois-ci"
          : `Épargne du mois : ${formatMoney(savings, devise)} sur ${formatMoney(savingsTarget, devise)}`,
      message:
        savings <= 0
          ? `La cible est de ${formatMoney(savingsTarget, devise)} (20 % de vos revenus). Enregistrez votre virement d'épargne pour ne pas perdre ce mois.`
          : `Il manque ${formatMoney(savingsGap, devise)} pour atteindre la cible de 20 %. Complétez la différence avant la fin du mois.`,
      meta: `Restant : ${formatMoney(savingsGap, devise)}`,
      to: "/app/depenses",
      actionLabel: "Enregistrer une épargne",
    });
  } else if (referenceIncome > 0 && savings >= savingsTarget) {
    notifications.push({
      id: "epargne-atteinte",
      category: "epargne",
      severity: "good",
      icon: "ri-check-double-line",
      title: `Épargne du mois atteinte : ${formatMoney(savings, devise)}`,
      message: `Vous avez dépassé la cible de 20 % de vos revenus. Affectez cette épargne à un objectif pour qu'elle finance réellement un projet.`,
      meta: "Objectif mensuel réalisé",
      to: "/app/objectifs",
      actionLabel: "Affecter à un objectif",
    });
  }

  // 3. Goal deadlines.
  goals.forEach((goal) => {
    const progress = computeGoalProgress(goal, now);
    if (progress.atteint) return;

    const category = getGoalCategory(goal.categorie);
    const base = {
      id: `objectif-${goal.id}`,
      category: "objectif" as const,
      icon: category.icon,
      to: "/app/objectifs",
      actionLabel: "Ajuster l'objectif",
      meta: `${category.label} · ${Math.round(progress.progression)} % financé`,
    };

    if (progress.statutAffiche === "retard") {
      notifications.push({
        ...base,
        severity: "urgent",
        title: `Échéance dépassée : ${goal.nom}`,
        message: `Il reste ${formatMoney(progress.restant, devise)} à financer et la date cible est passée. Décalez l'échéance ou augmentez votre épargne mensuelle.`,
      });
      return;
    }

    if (progress.moisRestants > 0 && progress.moisRestants <= 2) {
      notifications.push({
        ...base,
        severity: "urgent",
        title: `Plus que ${formatMonths(progress.moisRestants)} pour « ${goal.nom} »`,
        message: `Pour tenir la date, il faut épargner ${formatMoney(progress.epargneMensuelle, devise)} par mois. Reste à financer : ${formatMoney(progress.restant, devise)}.`,
      });
      return;
    }

    if (progress.moisRestants > 0 && progress.moisRestants <= 6) {
      notifications.push({
        ...base,
        severity: "attention",
        title: `Échéance proche : ${goal.nom}`,
        message: `Encore ${formatMonths(progress.moisRestants)} et ${formatMoney(progress.restant, devise)} à financer, soit ${formatMoney(progress.epargneMensuelle, devise)} par mois.`,
      });
      return;
    }

    if (!goal.date_limite) {
      notifications.push({
        ...base,
        severity: "info",
        title: `Donnez une échéance à « ${goal.nom} »`,
        message: `Sans date limite, impossible de calculer votre effort mensuel et de vous rappeler l'échéance. Fixez une cible dans le temps.`,
        meta: `${category.label} · sans échéance`,
      });
    }
  });

  // 4. Projets : clôture et échéance proche.
  projects.forEach((project) => {
    const budget = Number(project.budget_total) || 0;
    const etapes = parseEtapes(project.etapes);
    const steps = computeEtapesProgress(etapes);

    if (project.statut === "termine") {
      notifications.push({
        id: `projet-termine-${project.id}`,
        category: "objectif",
        severity: "good",
        icon: "ri-checkbox-circle-line",
        title: `Projet terminé : ${project.nom}`,
        message: `Bravo, votre projet est clôturé${
          budget > 0 ? ` pour une enveloppe de ${formatMoney(budget, devise)}` : ""
        }. Pensez à rattacher la prochaine épargne à un nouvel objectif.`,
        meta: "Projet abouti",
        to: "/app/projets",
        actionLabel: "Voir mes projets",
      });
      return;
    }

    if (project.date_fin) {
      const deadline = parseIsoDate(project.date_fin);
      const days = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 60) {
        notifications.push({
          id: `projet-echeance-${project.id}`,
          category: "objectif",
          severity: days <= 15 ? "urgent" : "attention",
          icon: "ri-calendar-check-line",
          title: `Échéance du projet « ${project.nom} » dans ${days} jour${days > 1 ? "s" : ""}`,
          message: `${steps.termines}/${steps.total || 0} étapes terminées. Vérifiez ce qu'il reste à faire et les dépenses à engager avant la date prévue.`,
          meta: "Échéance de projet",
          to: "/app/projets",
          actionLabel: "Ouvrir le projet",
        });
      }
    }
  });

  // 5. Monthly deficit.
  if (currentIncome > 0 && spending > currentIncome) {
    notifications.push({
      id: "deficit-mois",
      category: "budget",
      severity: "urgent",
      icon: "ri-error-warning-line",
      title: `Déficit de ${formatMoney(spending - currentIncome, devise)} ce mois-ci`,
      message: `Vos dépenses dépassent vos revenus encaissés. Réduisez un poste non essentiel plutôt que de puiser dans votre épargne.`,
      meta: `${formatMoney(spending, devise)} dépensés`,
      to: "/app/depenses",
      actionLabel: "Voir mes dépenses",
    });
  }

  notifications.sort((a, b) => severityWeight[a.severity] - severityWeight[b.severity]);

  const counts = {
    urgent: notifications.filter((item) => item.severity === "urgent").length,
    attention: notifications.filter((item) => item.severity === "attention").length,
    info: notifications.filter((item) => item.severity === "info").length,
    good: notifications.filter((item) => item.severity === "good").length,
    total: notifications.length,
  };

  return {
    notifications,
    diagnosis: buildDiagnosis({
      referenceIncome,
      currentIncome,
      spending,
      savings,
      savingsTarget,
      groups: plan.groups,
      devise,
    }),
    groups: plan.groups,
    reference: referenceIncome,
    savings,
    savingsTarget,
    savingsGap,
    spending,
    income: currentIncome,
    monthsUsed: resolved.monthsUsed,
    counts,
  };
}

export const severityMeta: Record<
  NotificationSeverity,
  { label: string; icon: string; dot: string; chip: string; card: string }
> = {
  urgent: {
    label: "Urgent",
    icon: "ri-alarm-warning-line",
    dot: "bg-accent-500",
    chip: "border-accent-300 bg-accent-100 text-accent-900",
    card: "border-accent-200 bg-accent-50/60",
  },
  attention: {
    label: "À surveiller",
    icon: "ri-error-warning-line",
    dot: "bg-accent-400",
    chip: "border-accent-200 bg-accent-50 text-accent-900",
    card: "border-background-200 bg-background-50",
  },
  info: {
    label: "Pour information",
    icon: "ri-information-line",
    dot: "bg-secondary-500",
    chip: "border-secondary-200 bg-secondary-100 text-secondary-900",
    card: "border-background-200 bg-background-50",
  },
  good: {
    label: "Bonne nouvelle",
    icon: "ri-checkbox-circle-line",
    dot: "bg-primary-500",
    chip: "border-primary-200 bg-primary-50 text-primary-800",
    card: "border-primary-200 bg-primary-50/50",
  },
};