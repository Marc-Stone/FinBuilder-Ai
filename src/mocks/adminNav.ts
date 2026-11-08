export type AdminNavItem = {
  to: string;
  label: string;
  icon: string;
  enabled: boolean;
  permission: string;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Pilotage",
    items: [
      {
        to: "/admin",
        label: "Vue d'ensemble",
        icon: "ri-dashboard-3-line",
        enabled: true,
        permission: "dashboard",
      },
    ],
  },
  {
    title: "Gestion",
    items: [
      {
        to: "/admin/utilisateurs",
        label: "Utilisateurs",
        icon: "ri-group-line",
        enabled: true,
        permission: "users",
      },
      {
        to: "/admin/contenus",
        label: "Contenus",
        icon: "ri-article-line",
        enabled: true,
        permission: "contents",
      },
      {
        to: "/admin/annonces",
        label: "Annonces",
        icon: "ri-megaphone-line",
        enabled: true,
        permission: "notifications",
      },
      {
        to: "/admin/parametres",
        label: "Paramètres",
        icon: "ri-settings-3-line",
        enabled: true,
        permission: "settings",
      },
      {
        to: "/admin/roles",
        label: "Rôles",
        icon: "ri-shield-user-line",
        enabled: true,
        permission: "security",
      },
      {
        to: "/admin/journal",
        label: "Journal d'activité",
        icon: "ri-history-line",
        enabled: true,
        permission: "audit",
      },
    ],
  },
];