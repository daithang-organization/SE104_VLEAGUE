import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { ErrorBoundary, TableSkeleton } from './components';

// ── Auth pages (small, loaded eagerly for fast first paint) ──
import ForbiddenPage from './pages/ForbiddenPage';
import LoginPage from './pages/LoginPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import RegisterPage from './pages/RegisterPage';

// ── All other pages are lazy-loaded ──
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Public pages
const PublicStandingsPage = lazy(() => import('./pages/public/PublicStandingsPage'));
const PublicSchedulePage = lazy(() => import('./pages/public/PublicSchedulePage'));
const PublicResultsPage = lazy(() => import('./pages/public/PublicResultsPage'));

// Protected pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const TeamDetailPage = lazy(() => import('./pages/TeamDetailPage'));
const PlayersPage = lazy(() => import('./pages/PlayersPage'));
const PlayerDetailPage = lazy(() => import('./pages/PlayerDetailPage'));
const StadiumsPage = lazy(() => import('./pages/StadiumsPage'));
const StadiumDetailPage = lazy(() => import('./pages/StadiumDetailPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const SeasonsPage = lazy(() => import('./pages/SeasonsPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const MatchDetailPage = lazy(() => import('./pages/MatchDetailPage'));
const StandingsPage = lazy(() => import('./pages/StandingsPage'));
const HeadToHeadPage = lazy(() => import('./pages/HeadToHeadPage'));
const RegulationsPage = lazy(() => import('./pages/RegulationsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const SessionsPage = lazy(() => import('./pages/SessionsPage'));

const AppShell = lazy(() => import('./shell/AppShell'));
const PublicLayout = lazy(() => import('./shell/PublicLayout'));

function SuspenseFallback() {
  return (
    <div style={{ padding: 40 }}>
      <TableSkeleton />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Public routes - Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Public routes - V-League (no auth required) */}
          <Route element={<PublicLayout />}>
            <Route path="/public/standings" element={<PublicStandingsPage />} />
            <Route path="/public/schedule" element={<PublicSchedulePage />} />
            <Route path="/public/results" element={<PublicResultsPage />} />
          </Route>

          {/* Protected routes - wrapped in AppShell */}
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:id" element={<PlayerDetailPage />} />
            <Route path="/stadiums" element={<StadiumsPage />} />
            <Route path="/stadiums/:id" element={<StadiumDetailPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/seasons" element={<SeasonsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/head-to-head" element={<HeadToHeadPage />} />
            <Route path="/regulations" element={<RegulationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
