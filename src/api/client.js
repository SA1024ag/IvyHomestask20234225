/**
 * Ivy Homes API Client Helper
 * Base URL: https://solve.ivy.homes
 * Automatically appends api_key query param and attaches Bearer token & X-API-Key headers.
 * Includes automatic token refresh to ensure the session lasts beyond 30 minutes.
 */

export const BASE_URL = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-A3B2763F67F9';

export const TOKEN_STORAGE_KEY = 'ivy_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'ivy_refresh_token';
export const USER_STORAGE_KEY = 'ivy_user';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Builds the full URL with the mandatory api_key query param and any extra parameters.
 */
export function buildUrl(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  url.searchParams.set('api_key', API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Executes a token refresh against POST /auth/refresh
 */
export async function refreshAuthToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const url = buildUrl('/auth/refresh');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    // Clear credentials if refresh token expired or invalid
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
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
 * Core request wrapper with auto-auth, header handling, and 401 retry.
 */
export async function request(endpoint, options = {}) {
  const { params = {}, headers = {}, retryOn401 = true, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const mergedHeaders = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: mergedHeaders,
    });

    // Handle token expiration & automatic refresh
    if (response.status === 401 && retryOn401 && localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAuthToken();
          isRefreshing = false;
          onRefreshed(newToken);
        } catch (err) {
          isRefreshing = false;
          refreshSubscribers = [];
          window.dispatchEvent(new CustomEvent('ivy-session-expired'));
          throw err;
        }
      }

      // Wait for the ongoing refresh
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            const retryRes = await fetch(url, {
              ...fetchOptions,
              headers: {
                ...mergedHeaders,
                Authorization: `Bearer ${newToken}`,
              },
            });
            const data = await retryRes.json().catch(() => ({}));
            if (!retryRes.ok) {
              return reject(new Error(data.detail || `Request failed with status ${retryRes.status}`));
            }
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Convenience API client object
 */
export const apiClient = {
  get: (endpoint, params = {}) => request(endpoint, { method: 'GET', params }),
  post: (endpoint, body = {}, params = {}) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), params }),
  delete: (endpoint, params = {}) => request(endpoint, { method: 'DELETE', params }),

  // Authentication Endpoints
  login: async (email, password) => {
    const url = buildUrl('/auth/login');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed. Please verify credentials.');
    }

    const token = data.access_token || data.token;
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (data.refresh_token) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
    if (data.user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

    return {
      token,
      refreshToken: data.refresh_token,
      user: data.user,
      expiresIn: data.expires_in || 900,
    };
  },

  logout: async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      try {
        const url = buildUrl('/auth/logout');
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Server logout error (proceeding with local cleanup):', err);
      }
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};

export default apiClient;
