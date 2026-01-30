import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

type RequireAuthProps = {
  children: ReactNode;
};

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
