import React, { createContext, useContext, useMemo, useState } from 'react';
import type { AuthContextValue } from './auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'vleague_access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const value = useMemo<AuthContextValue>(() => {
    return {
      accessToken,
      login: (token) => {
        localStorage.setItem(STORAGE_KEY, token);
        setAccessToken(token);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setAccessToken(null);
      },
    };
  }, [accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
