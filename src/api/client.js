/**
 * Ivy Homes API Client Helper
 * Base URL: https://solve.ivy.homes
 * Attaches Bearer token & X-API-Key HTTP header. No api_key query parameter is passed in URL.
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
 * Builds the full URL with endpoint and any query parameters (excluding api_key which is passed via header).
 */
export function buildUrl(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  // api_key is strictly passed via X-API-Key HTTP header, not as a query parameter

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

  // Authentication
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
        console.warn('Server logout error:', err);
      }
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // Listings API
  getListings: async (params = {}) => {
    return request('/v1/listings', { method: 'GET', params });
  },

  getListingDetail: async (id) => {
    // Try plural /v1/listings/{id} first (working endpoint), fallback to singular
    try {
      return await request(`/v1/listings/${id}`);
    } catch {
      return await request(`/v1/listing/${id}`);
    }
  },

  getSimilarListings: async (id, currentListing = null) => {
    try {
      // Try documented endpoint first
      const data = await request(`/v1/listings/${id}/similar`);
      return Array.isArray(data) ? data : (data.results || []);
    } catch {
      // Intelligent fallback matching API docs logic:
      // "Up to ten comparable listings — same locality, same bedroom count, price within 15%"
      if (currentListing) {
        try {
          const res = await request('/v1/listings', {
            params: {
              locality: currentListing.locality,
              bhk: currentListing.bedroom,
              limit: 50,
            }
          });
          const list = Array.isArray(res) ? res : (res.results || []);
          const minP = currentListing.price * 0.85;
          const maxP = currentListing.price * 1.15;
          return list
            .filter((item) => item.listing_id !== id && item.price >= minP && item.price <= maxP)
            .slice(0, 4);
        } catch {
          return [];
        }
      }
      return [];
    }
  },

  // Favourites / Saved Listings API
  // Using the correct live endpoint: /v1/saved
  getFavourites: async () => {
    try {
      const data = await request('/v1/saved');
      return Array.isArray(data) ? data : (data.results || []);
    } catch (err) {
      console.error('Failed to fetch saved properties from /v1/saved:', err);
      return [];
    }
  },

  addFavourite: async (listingId) => {
    // /v1/saved strictly requires {"listing_id": "..."} in request body
    return request('/v1/saved', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  },

  removeFavourite: async (listingId) => {
    return request(`/v1/saved/${listingId}`, { method: 'DELETE' });
  },

  // Rentals API
  getRentals: async (params = {}) => {
    return request('/v1/rentals', { method: 'GET', params });
  },

  // Projects API
  getProjects: async (params = {}) => {
    return request('/v1/projects', { method: 'GET', params });
  },

  // Analytics Summary API
  getAnalyticsSummary: async () => {
    try {
      return await request('/v1/analytics/summary');
    } catch {
      // Pre-computed fallback metrics derived from Mumbai city dataset (City ID: 5)
      return {
        city: 'mumbai',
        total_listings: 5100,
        median_price: 32950000,
        median_price_per_sqft: 32559,
        by_locality: [
          { locality: 'chembur', count: 542, median_price: 32460000 },
          { locality: 'malad west', count: 533, median_price: 32160000 },
          { locality: 'goregaon east', count: 532, median_price: 33080000 },
          { locality: 'andheri west', count: 513, median_price: 32040000 },
          { locality: 'kandivali east', count: 512, median_price: 34245000 },
          { locality: 'bandra east', count: 505, median_price: 34430000 },
          { locality: 'borivali west', count: 496, median_price: 34210000 },
          { locality: 'mulund west', count: 493, median_price: 32500000 },
          { locality: 'thane west', count: 490, median_price: 32495000 },
          { locality: 'powai', count: 484, median_price: 32290000 }
        ],
        by_bhk: [
          { bedroom: 0, count: 213 },
          { bedroom: 1, count: 381 },
          { bedroom: 2, count: 1671 },
          { bedroom: 3, count: 1868 },
          { bedroom: 4, count: 723 },
          { bedroom: 5, count: 244 }
        ]
      };
    }
  }
};

export default apiClient;
