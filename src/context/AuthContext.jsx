import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  apiClient,
  refreshAuthToken,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  TOKEN_SAVED_AT_KEY,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshTimerRef = useRef(null);

  // Helper to schedule proactive token refresh before 15-minute token expires (every 12 minutes)
  const scheduleTokenRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!refreshToken) return;

    // The access token expires at 15 minutes (900,000 ms). We target 12 minutes (720,000 ms).
    const TARGET_REFRESH_INTERVAL = 12 * 60 * 1000;
    const savedAt = Number(localStorage.getItem(TOKEN_SAVED_AT_KEY) || Date.now());
    const elapsed = Math.max(0, Date.now() - savedAt);
    const delay = Math.max(5000, TARGET_REFRESH_INTERVAL - elapsed);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        console.log('[Auth] Proactively refreshing access token...');
        const newToken = await refreshAuthToken();
        setToken(newToken);
        scheduleTokenRefresh();
      } catch (err) {
        console.warn('[Auth] Proactive refresh failed:', err);
      }
    }, delay);
  }, []);

  // Initialize session from storage and listen for session events / tab wakeups
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    if (storedToken) {
      setToken(storedToken);
      if (storedRefreshToken) {
        scheduleTokenRefresh();
      }
    }
    setIsLoading(false);

    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      setError('Your session has expired. Please log in again.');
    };

    // When returning to the tab after sleep or background inactivity, check if token needs immediate refresh
    const handleWakeup = () => {
      const rfToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (!rfToken) return;
      const savedAt = Number(localStorage.getItem(TOKEN_SAVED_AT_KEY) || 0);
      const elapsed = Date.now() - savedAt;
      // If 11+ minutes have elapsed, trigger immediate refresh before 15-minute expiration
      if (elapsed >= 11 * 60 * 1000) {
        scheduleTokenRefresh();
      }
    };

    window.addEventListener('ivy-session-expired', handleSessionExpired);
    window.addEventListener('focus', handleWakeup);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleWakeup();
      }
    });

    return () => {
      window.removeEventListener('ivy-session-expired', handleSessionExpired);
      window.removeEventListener('focus', handleWakeup);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleTokenRefresh]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.login(email, password);
      setToken(data.token);
      setUser(data.user);
      scheduleTokenRefresh();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    try {
      await apiClient.logout();
    } finally {
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
