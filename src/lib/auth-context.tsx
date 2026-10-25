'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  routes,
  type SessionUser,
  type AuthSession,
  type LoginRequest,
  type ActivateRequest,
} from '@hca/contracts';
import { call, setAccessToken } from './api';

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<AuthSession>;
  activate: (data: ActivateRequest) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUserEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_CACHE_KEY = 'hca_user_cache_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      return cached ? (JSON.parse(cached) as SessionUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const saveUser = useCallback((u: SessionUser | null) => {
    setUser(u);
    if (typeof window === 'undefined') return;
    try {
      if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_CACHE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await call(routes.auth.refresh, {});
      setAccessToken(res.accessToken);
      saveUser(res.user);
      return true;
    } catch {
      setAccessToken(null);
      saveUser(null);
      return false;
    }
  }, [saveUser]);

  useEffect(() => {
    // Attempt session refresh on mount
    void refreshSession().finally(() => {
      setLoading(false);
    });
  }, [refreshSession]);

  const login = async (data: LoginRequest): Promise<AuthSession> => {
    const res = await call(routes.auth.login, { body: data });
    setAccessToken(res.accessToken);
    saveUser(res.user);
    return res;
  };

  const activate = async (data: ActivateRequest): Promise<AuthSession> => {
    const res = await call(routes.auth.activate, { body: data });
    setAccessToken(res.accessToken);
    saveUser(res.user);
    return res;
  };

  const logout = async (): Promise<void> => {
    try {
      await call(routes.auth.logout, {});
    } catch {
      /* ignore */
    } finally {
      setAccessToken(null);
      saveUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const updateUserEmail = async (email: string): Promise<void> => {
    await call(routes.auth.setEmail, { body: { email } });
    if (user) {
      saveUser({ ...user, email, emailVerified: false, needsEmail: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        activate,
        logout,
        refreshSession,
        updateUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
