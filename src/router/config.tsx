import { Suspense, lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import RouteFallback from "@/components/base/RouteFallback";
import AuthGuard from "@/components/feature/AuthGuard";
import AdminGuard from "@/components/feature/AdminGuard";
import MaintenanceGate from "@/components/feature/MaintenanceGate";
import RequireAdminPermission from "@/components/feature/RequireAdminPermission";

/* Les pages sont chargées à la demande : la page d'accueil publique ne télécharge
   plus le code de l'espace personnel ni celui de la console d'administration. */
const Home = lazy(() => import("@/pages/home/page"));
const FeaturesPage = lazy(() => import("@/pages/features/page"));
const GuidePage = lazy(() => import("@/pages/guide/page"));
const AboutPage = lazy(() => import("@/pages/about/page"));
const LegalNoticePage = lazy(() => import("@/pages/legal/mentions-legales/page"));
const PrivacyPolicyPage = lazy(() => import("@/pages/legal/confidentialite/page"));
const TermsPage = lazy(() => import("@/pages/legal/cgu/page"));
const LoginPage = lazy(() => import("@/pages/auth/login/page"));
const SignupPage = lazy(() => import("@/pages/auth/signup/page"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password/page"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password/page"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const AppShell = lazy(() => import("@/pages/app/components/AppShell"));
const DashboardPage = lazy(() => import("@/pages/app/page"));
const ProfilePage = lazy(() => import("@/pages/app/profile/page"));
const FinancialProfilePage = lazy(() => import("@/pages/app/profil-financier/page"));
const IncomePage = lazy(() => import("@/pages/app/income/page"));
const ExpensesPage = lazy(() => import("@/pages/app/expenses/page"));
const BudgetPage = lazy(() => import("@/pages/app/budget/page"));
const GoalsPage = lazy(() => import("@/pages/app/goals/page"));
const ProjectsPage = lazy(() => import("@/pages/app/projects/page"));
const AssistantPage = lazy(() => import("@/pages/app/assistant/page"));
const LogementPage = lazy(() => import("@/pages/app/logement/page"));
const SimulationsPage = lazy(() => import("@/pages/app/simulations/page"));
const ReportsPage = lazy(() => import("@/pages/app/reports/page"));
const EducationPage = lazy(() => import("@/pages/app/education/page"));
const NotificationsPage = lazy(() => import("@/pages/app/notifications/page"));

const AdminShell = lazy(() => import("@/pages/admin/components/AdminShell"));
const AdminOverviewPage = lazy(() => import("@/pages/admin/page"));
const AdminUsersPage = lazy(() => import("@/pages/admin/utilisateurs/page"));
const AdminContentsPage = lazy(() => import("@/pages/admin/contenus/page"));
const AdminAnnouncementsPage = lazy(() => import("@/pages/admin/annonces/page"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/parametres/page"));
const AdminRolesPage = lazy(() => import("@/pages/admin/roles/page"));
const AdminJournalPage = lazy(() => import("@/pages/admin/journal/page"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "/fonctionnalites",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <FeaturesPage />
      </Suspense>
    ),
  },
  {
    path: "/mode-demploi",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <GuidePage />
      </Suspense>
    ),
  },
  {
    path: "/a-propos",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: "/mentions-legales",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <LegalNoticePage />
      </Suspense>
    ),
  },
  {
    path: "/confidentialite",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <PrivacyPolicyPage />
      </Suspense>
    ),
  },
  {
    path: "/cgu",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <TermsPage />
      </Suspense>
    ),
  },
  {
    path: "/offres",
    element: <Navigate to="/mode-demploi" replace />,
  },
  {
    path: "/tarifs",
    element: <Navigate to="/mode-demploi" replace />,
  },
  {
    path: "/connexion",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/inscription",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <SignupPage />
      </Suspense>
    ),
  },
  {
    path: "/mot-de-passe-oublie",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: "/reinitialiser-mot-de-passe",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: "/app",
    element: (
      <AuthGuard>
        <MaintenanceGate>
          <Suspense fallback={<RouteFallback />}>
            <AppShell />
          </Suspense>
        </MaintenanceGate>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "revenus",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <IncomePage />
          </Suspense>
        ),
      },
      {
        path: "depenses",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <ExpensesPage />
          </Suspense>
        ),
      },
      {
        path: "budget",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <BudgetPage />
          </Suspense>
        ),
      },
      {
        path: "objectifs",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <GoalsPage />
          </Suspense>
        ),
      },
      {
        path: "projets",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: "assistant",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <AssistantPage />
          </Suspense>
        ),
      },
      {
        path: "logement",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <LogementPage />
          </Suspense>
        ),
      },
      {
        path: "simulations",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <SimulationsPage />
          </Suspense>
        ),
      },
      {
        path: "rapports",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <ReportsPage />
          </Suspense>
        ),
      },
      {
        path: "education",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <EducationPage />
          </Suspense>
        ),
      },
      {
        path: "notifications",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <NotificationsPage />
          </Suspense>
        ),
      },
      {
        path: "profil",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "profil-financier",
        element: (
          <Suspense fallback={<RouteFallback variant="section" />}>
            <FinancialProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <Suspense fallback={<RouteFallback />}>
          <AdminShell />
        </Suspense>
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <RequireAdminPermission permission="dashboard">
            <Suspense fallback={<RouteFallback variant="section" />}>
              <AdminOverviewPage />
            </Suspense>
          </RequireAdminPermission>
        ),
      },
      {
        path: "utilisateurs",
        element: (
          <RequireAdminPermission permission="users">
            <Suspense fallback={<RouteFallback variant="section" />}>
              <AdminUsersPage />
            </Suspense>
          </RequireAdminPermission>
        ),
      },
      {
        path: "contenus",
        element: (
          <RequireAdminPermission permission="contents">
            <Suspense fallback={<RouteFallback variant="section" />}>
              <AdminContentsPage />
            </Suspense>
          </RequireAdminPermission>
        ),
      },
      {
        path: "annonces",
        element: (
          <RequireAdminPermission permission="notifications">
            <Suspense fallback={<RouteFallback variant="section" />}>
              <AdminAnnouncementsPage />
            </Suspense>
          </RequireAdminPermission>
        ),
      },
      {
        path: "parametres",
        element: (
          <RequireAdminPermission permission="settings">
            <Suspense fallback={<RouteFallback variant="section" />}>
              <AdminSettingsPage />
            </Suspense>
          </RequireAdminPermission>
        ),
      },
      {
        path: "roles",
        element: (
          <RequireAdminPermission permission="security">
            <Suspense fallback={<RouteFallback variant="section" />}>
              <AdminRolesPage />
            </Suspense>
          </RequireAdminPermission>
        ),
      },
      {
        path: "journal",
        element: (
          <RequireAdminPermission permission="audit">
            <Suspense fallback={<RouteFallback variant="section" />}>
              <AdminJournalPage />
            </Suspense>
          </RequireAdminPermission>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
];

export default routes;