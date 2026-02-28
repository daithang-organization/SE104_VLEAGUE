import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import ForbiddenPage from './pages/ForbiddenPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HeadToHeadPage from './pages/HeadToHeadPage';
import LoginPage from './pages/LoginPage';
import MatchDetailPage from './pages/MatchDetailPage';
import MatchesPage from './pages/MatchesPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import PlayersPage from './pages/PlayersPage';
import ProfilePage from './pages/ProfilePage';
import PublicResultsPage from './pages/public/PublicResultsPage';
import PublicSchedulePage from './pages/public/PublicSchedulePage';
import PublicStandingsPage from './pages/public/PublicStandingsPage';
import RegisterPage from './pages/RegisterPage';
import RegulationsPage from './pages/RegulationsPage';
import ReportsPage from './pages/ReportsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SchedulePage from './pages/SchedulePage';
import SeasonsPage from './pages/SeasonsPage';
import SessionsPage from './pages/SessionsPage';
import StadiumDetailPage from './pages/StadiumDetailPage';
import StadiumsPage from './pages/StadiumsPage';
import StandingsPage from './pages/StandingsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import TeamsPage from './pages/TeamsPage';
import UsersPage from './pages/UsersPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AppShell from './shell/AppShell';
import PublicLayout from './shell/PublicLayout';

export default function App() {
  return (
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
  );
}
