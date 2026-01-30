import { message } from 'antd';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getRefreshToken, setAccessToken, setRefreshToken } from '../lib/api';
import type { AuthContextValue, User } from './auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

// Decode JWT payload to extract user info
function decodeJwtPayload(token: string): { sub: string; email: string; role: string } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, _setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthed = !!accessToken && !!user;

  // Apply session state
  function applySession(at: string | null, u: User | null, rt?: string | null) {
    _setAccessToken(at);
    setAccessToken(at);
    setUser(u);
    if (rt !== undefined) {
      setRefreshToken(rt);
    }
  }

  // Login with email/password
  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken: at, refreshToken: rt, user: userData } = res.data;
    applySession(at, userData, rt);
  };

  // Logout
  const logout = async () => {
    const rt = getRefreshToken();
    try {
      if (rt) {
        await api.post('/auth/logout', { refreshToken: rt });
      }
    } finally {
      applySession(null, null, null);
    }
  };

  // Handle session expired event from api.ts interceptor
  useEffect(() => {
    const handler = () => {
      applySession(null, null, null);
      message.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  // On app load: try to restore session using refresh token
  useEffect(() => {
    const bootstrap = async () => {
      const rt = getRefreshToken();
      if (!rt) {
        setIsInitialized(true);
        return;
      }

      try {
        const res = await api.post('/auth/refresh', { refreshToken: rt });
        const newAccessToken = res.data.accessToken as string;

        // Decode JWT to get user info
        const payload = decodeJwtPayload(newAccessToken);
        if (payload) {
          const u: User = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
          };
          applySession(newAccessToken, u);
        } else {
          applySession(null, null, null);
        }
      } catch {
        applySession(null, null, null);
      } finally {
        setIsInitialized(true);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, isAuthed, login, logout }),
    [user, accessToken, isAuthed],
  );

  // Show loading state while checking session
  if (!isInitialized) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <span>Loading...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
