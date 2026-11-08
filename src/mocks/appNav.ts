export type AppNavItem = {
  to: string;
  label: string;
  icon: string;
  enabled: boolean;
};

export type AppNavGroup = {
  title: string;
  items: AppNavItem[];
};

export const appNavGroups: AppNavGroup[] = [
  {
    title: "Pilotage",
    items: [
      { to: "/app", label: "Tableau de bord", icon: "ri-dashboard-3-line", enabled: true },
      { to: "/app/revenus", label: "Revenus", icon: "ri-arrow-down-line", enabled: true },
      { to: "/app/depenses", label: "Dépenses", icon: "ri-arrow-up-line", enabled: true },
      { to: "/app/budget", label: "Budget intelligent", icon: "ri-pie-chart-2-line", enabled: true },
    ],
  },
  {
    title: "Objectifs",
    items: [
      { to: "/app/objectifs", label: "Mes objectifs", icon: "ri-flag-2-line", enabled: true },
    ],
  },
  {
    title: "Projets",
    items: [
      { to: "/app/projets", label: "Mes projets", icon: "ri-building-4-line", enabled: true },
    ],
  },
  {
    title: "Assistant",
    items: [
      { to: "/app/assistant", label: "Assistant IA", icon: "ri-sparkling-line", enabled: true },
    ],
  },
  {
    title: "Outils & analyses",
    items: [
      { to: "/app/logement", label: "Conseiller logement", icon: "ri-home-5-line", enabled: true },
      { to: "/app/simulations", label: "Simulations", icon: "ri-git-branch-line", enabled: true },
      { to: "/app/education", label: "Éducation financière", icon: "ri-book-open-line", enabled: true },
      { to: "/app/rapports", label: "Rapports", icon: "ri-file-chart-line", enabled: true },
      { to: "/app/notifications", label: "Notifications", icon: "ri-notification-3-line", enabled: true },
    ],
  },
  {
    title: "Compte",
    items: [
      { to: "/app/profil", label: "Profil", icon: "ri-user-settings-line", enabled: true },
      {
        to: "/app/profil-financier",
        label: "Profil financier",
        icon: "ri-user-star-line",
        enabled: true,
      },
    ],
  },
];