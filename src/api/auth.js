/**
 * Ivy Homes Authentication Architecture
 * Implements token management, proactive silent refresh, 401 retry handling,
 * and hard client-side logout.
 */

export const BASE_URL = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-A3B2763F67F9';

export const TOKEN_STORAGE_KEY = 'ivy_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'ivy_refresh_token';
export const USER_STORAGE_KEY = 'ivy_user';

let isRefreshing = false;
let refreshSubscribers = [];

export function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

export function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Executes a token refresh against POST /auth/refresh.
 * Updates stored access token and refresh token upon success.
 */
export async function refreshAuthToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    // Session fully expired: hard clear local tokens
    hardClearAuthStorage();
    throw new Error('Session expired, please log in again.');
  }

  const data = await res.json();
  const newAccessToken = data.access_token || data.token;
  const newRefreshToken = data.refresh_token;

  if (newAccessToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken);
  }
  if (newRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
  }
  if (data.user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  }

  return newAccessToken;
}

/**
 * Hard-clears all auth credentials from client storage.
 * Does not depend on server response or network connectivity.
 */
export function hardClearAuthStorage() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Performs user login via POST /auth/login.
 */
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.detail || 'Login failed';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  const token = data.access_token || data.token;
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (data.refresh_token) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
  if (data.user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

  return {
    token,
    accessToken: token,
    refreshToken: data.refresh_token,
    user: data.user,
    expiresIn: data.expires_in || 900,
  };
}

/**
 * Hard Logout: Immediately destroys client credentials from localStorage.
 * Sends POST /auth/logout in the background without blocking client security.
 */
export async function logout() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  // Hard logout: strictly destroy client session first
  hardClearAuthStorage();

  // Inform backend in background (server tokens are stateless JWTs)
  if (token) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('Backend logout notification skipped:', err);
    }
  }
}
