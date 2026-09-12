import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  apiClient,
  refreshAuthToken,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshTimerRef = useRef(null);

  // Helper to schedule proactive token refresh before 15-minute token expires (e.g., at 12 minutes)
  const scheduleTokenRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!refreshToken) return;

    // Refresh every 12 minutes (720,000 ms) so the session seamlessly survives beyond 30+ minutes
    refreshTimerRef.current = setTimeout(async () => {
      try {
        console.log('[Auth] Proactively refreshing access token...');
        const newToken = await refreshAuthToken();
        setToken(newToken);
        scheduleTokenRefresh();
      } catch (err) {
        console.warn('[Auth] Proactive refresh failed:', err);
      }
    }, 12 * 60 * 1000);
  }, []);

  // Initialize session from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      if (storedToken) {
        setToken(storedToken);
        if (storedRefreshToken) {
          scheduleTokenRefresh();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      setError('Your session has expired. Please log in again.');
    };

    window.addEventListener('ivy-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('ivy-session-expired', handleSessionExpired);
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

export default AuthContext;
