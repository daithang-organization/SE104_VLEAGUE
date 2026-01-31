import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import ForbiddenPage from './pages/ForbiddenPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ReportsPage from './pages/ReportsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SessionsPage from './pages/SessionsPage';
import StandingsPage from './pages/StandingsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AppShell from './shell/AppShell';

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

      {/* Protected routes - wrapped in AppShell */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        {/* Add more protected routes here */}
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
