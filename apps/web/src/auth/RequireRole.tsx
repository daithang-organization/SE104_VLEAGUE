import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

type RequireRoleProps = {
  allow: string[];
  children: ReactNode;
};

/**
 * Protects routes that require specific roles.
 * Redirects to /login if not authenticated, or /403 if role not allowed.
 */
export function RequireRole({ allow, children }: RequireRoleProps) {
  const { user, isAuthed } = useAuth();

  if (!isAuthed || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
