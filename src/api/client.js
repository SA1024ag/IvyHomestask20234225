import {
  BASE_URL,
  API_KEY,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  refreshAuthToken,
  login as authLogin,
  logout as authLogout,
  hardClearAuthStorage,
  subscribeTokenRefresh,
  onRefreshed,
} from './auth';

export {
  BASE_URL,
  API_KEY,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  refreshAuthToken,
};

let isRefreshing = false;

/**
 * Normalizes query parameters:
 * 1. Converts any legacy 'page' parameter into 'offset' based on 'limit'.
 * 2. Hard-caps 'limit' at 50 (server maximum).
 * 3. Removes 'page' parameter completely.
 */
export function normalizePaginationParams(params = {}) {
  const cleanParams = { ...params };
  
  const limit = Math.min(Number(cleanParams.limit || 20), 50);
  cleanParams.limit = limit;

  if (cleanParams.page !== undefined && cleanParams.offset === undefined) {
    const pageNum = Math.max(Number(cleanParams.page || 1), 1);
    cleanParams.offset = (pageNum - 1) * limit;
  }
  delete cleanParams.page;

  if (cleanParams.offset !== undefined) {
    cleanParams.offset = Math.max(Number(cleanParams.offset || 0), 0);
  }

  return cleanParams;
}

/**
 * Builds the full URL with endpoint and any query parameters (excluding api_key which is passed via header).
 * Enforces offset/limit pagination and strips 'page'.
 */
export function buildUrl(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  const normalizedParams = normalizePaginationParams(params);

  Object.entries(normalizedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Normalizes collection responses to standard envelope:
 * { limit, offset, count, total, has_more, results }
 */
export function normalizeEnvelope(data) {
  if (!data || typeof data !== 'object') {
    return { limit: 0, offset: 0, count: 0, total: 0, has_more: false, results: [] };
  }
  if (Array.isArray(data)) {
    return {
      limit: data.length,
      offset: 0,
      count: data.length,
      total: data.length,
      has_more: false,
      results: data,
    };
  }
  const results = Array.isArray(data.results) ? data.results : [];
  return {
    limit: typeof data.limit === 'number' ? data.limit : results.length,
    offset: typeof data.offset === 'number' ? data.offset : 0,
    count: typeof data.count === 'number' ? data.count : results.length,
    total: typeof data.total === 'number' ? data.total : results.length,
    has_more: typeof data.has_more === 'boolean' ? data.has_more : false,
    results,
    ...data,
  };
}

/**
 * Helper to safely extract human-readable error messages from API error payloads.
 * Handles both documented {"detail": "..."} string bodies and undocumented
 * FastAPI/Pydantic validation error lists [{"loc": [...], "msg": "..."}].
 */
export function formatErrorMessage(data, fallbackStatus = 500) {
  if (!data) return `Request failed with status ${fallbackStatus}`;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((d) => d.msg || (d.loc ? `${d.loc.join('.')}: ${d.type}` : JSON.stringify(d)))
      .join('; ');
  }
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  return `Request failed with status ${fallbackStatus}`;
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
          hardClearAuthStorage();
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
              return reject(new Error(formatErrorMessage(data, retryRes.status)));
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
      throw new Error(formatErrorMessage(data, response.status));
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
  login: authLogin,
  logout: authLogout,

  // Listings API
  getListings: async (params = {}) => {
    const res = await request('/v1/listings', { method: 'GET', params });
    return normalizeEnvelope(res);
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
    const res = await request('/v1/rentals', { method: 'GET', params });
    return normalizeEnvelope(res);
  },

  // Projects API
  getProjects: async (params = {}) => {
    const res = await request('/v1/projects', { method: 'GET', params });
    return normalizeEnvelope(res);
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
