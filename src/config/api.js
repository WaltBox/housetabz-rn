// src/config/api.js
import { Platform } from 'react-native';
import axios from 'axios';
import { keychainHelpers, KEYCHAIN_SERVICES } from '../utils/keychainHelpers';

// Development URLs
const DEV_URLS = {
  ios: 'http://localhost:3004',
  android: 'http://10.0.2.2:3004',
  // For physical device, use your computer's IP address
  // physical: 'http://192.168.1.xxx:3004',
};

// Production URL
const PROD_URL = 'https://api.housetabz.com';

// Determine which base URL to use based on platform and environment
const getBaseUrl = () => {
  if (__DEV__) {
    // We're in development mode
    return Platform.select(DEV_URLS);
  } else {
    // We're in production mode
    return PROD_URL;
  }
};

// Create and export the base URL for external use if needed
export const API_URL = getBaseUrl();

// Create a pre-configured axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true, // include cookies if that's your auth mechanism
  headers: {
    'Content-Type': 'application/json',
  }
});

// ======= CACHING SYSTEM =======
// In-memory cache with TTL and request deduplication
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      requests: 0,
      deduplicatedRequests: 0
    };
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `${url}${paramString}`;
  }

  // Get cached data if still valid
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.misses++;
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    this.metrics.hits++;
    console.log(`📦 Cache HIT: ${key}`);
    return cached.data;
  }

  // Set cache data with TTL
  set(key, data, ttlMinutes = 5) {
    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, { data, expiry });
    console.log(`📦 Cache SET: ${key} (TTL: ${ttlMinutes}min)`);
  }

  // Clear specific cache entry
  delete(key) {
    this.cache.delete(key);
    console.log(`📦 Cache CLEAR: ${key}`);
  }

  // Clear all cache entries
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('📦 Cache CLEARED');
  }

  // Clear cache entries by pattern
  clearByPattern(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        console.log(`📦 Cache CLEAR (pattern): ${key}`);
      }
    });
  }

  // Get cache performance metrics
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total * 100).toFixed(1) : 0;
    
    return {
      ...this.metrics,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }

  // Handle request deduplication
  async handleRequest(key, requestFn) {
    this.metrics.requests++;
    
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Request DEDUPLICATED: ${key}`);
      this.metrics.deduplicatedRequests++;
      return this.pendingRequests.get(key);
    }

    // Execute request and cache the promise
    const requestPromise = requestFn();
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      this.pendingRequests.delete(key);
      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
  }
}

// Create global cache instance
const cache = new ApiCache();

// Add a request interceptor to attach auth token from Keychain
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from Keychain instead of AsyncStorage
      const token = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN);
      
      // Add detailed logging to debug authentication
      console.log('🔑 API Interceptor - Getting token from Keychain...');
      console.log('🔑 Token found:', !!token);
      console.log('🔑 Token length:', token?.length || 0);
      console.log('🔑 Request URL:', config.url);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added Authorization header to request');
        
        // Log the full authorization header (first 50 chars for security)
        console.log('🔑 Auth header preview:', config.headers.Authorization.substring(0, 50) + '...');
      } else {
        console.log('🔑 ❌ No token found in Keychain - request will be unauthenticated');
      }
      
      return config;
    } catch (error) {
      console.error('🔑 ❌ Error adding auth token to request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to log authentication errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (response.config.url?.includes('/dashboard/user/')) {
      console.log('📡 Dashboard API Response:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        url: response.config.url
      });
    }
    return response;
  },
  (error) => {
    // Log authentication errors specifically
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🚨 AUTHENTICATION ERROR:', {
        status: error.response.status,
        url: error.config?.url,
        message: error.response?.data?.message || 'Unauthorized',
        hadAuthHeader: !!error.config?.headers?.Authorization
      });
    }
    return Promise.reject(error);
  }
);

// ======= CACHED API FUNCTIONS =======

// Dashboard Screen - Cache dashboard data for 3 minutes
export const getDashboardData = async (userId, options = {}) => {
  const cacheKey = cache.generateKey(`/api/dashboard/user/${userId}`, options);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('📡 Fetching dashboard data from API...');
    const response = await apiClient.get(`/api/dashboard/user/${userId}`, { params: options });
    
    // Cache the response for 3 minutes
    cache.set(cacheKey, response.data, 3);
    
    return response.data;
  });
};

// House Services Screen - Cache house services for 5 minutes
export const getHouseServicesData = async (houseId, enhanced = true) => {
  const endpoint = enhanced 
    ? `/api/houseServices/house/${houseId}/with-data`
    : `/api/houseServices/house/${houseId}`;
  
  const cacheKey = cache.generateKey(endpoint);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('📡 Fetching house services data from API...');
    try {
      const response = await apiClient.get(endpoint);
      
      // Cache the response for 5 minutes
      cache.set(cacheKey, response.data, 5);
      
      return response.data;
    } catch (error) {
      // If enhanced endpoint fails, try basic endpoint
      if (enhanced && error.response?.status === 404) {
        console.log('📡 Enhanced endpoint failed, trying basic endpoint...');
        return getHouseServicesData(houseId, false);
      }
      throw error;
    }
  });
};

// My House Screen - Cache house tabs data for 2 minutes
export const getHouseTabsData = async (houseId) => {
  const cacheKey = cache.generateKey(`/api/houses/${houseId}/tabs-data`);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('📡 Fetching house tabs data from API...');
    try {
      const response = await apiClient.get(`/api/houses/${houseId}/tabs-data`);
      
      // Cache the response for 2 minutes (shorter TTL for financial data)
      cache.set(cacheKey, response.data, 2);
      
      return response.data;
    } catch (error) {
      // Fallback to basic house endpoint
      console.log('📡 Tabs endpoint failed, trying basic house endpoint...');
      const fallbackResponse = await apiClient.get(`/api/houses/${houseId}`);
      
      // Cache fallback response for 2 minutes
      cache.set(cacheKey, fallbackResponse.data, 2);
      
      return fallbackResponse.data;
    }
  });
};

// House Advance Summary - Cache advance summary data for 5 minutes
export const getHouseAdvanceSummaryData = async (houseId) => {
  const cacheKey = cache.generateKey(`/api/houses/${houseId}/advance-summary`);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('📡 Fetching house advance summary data from API...');
    const response = await apiClient.get(`/api/houses/${houseId}/advance-summary`);
    
    // Cache the response for 5 minutes
    cache.set(cacheKey, response.data, 5);
    
    return response.data;
  });
};

// Partners Screen - Cache partners data for 10 minutes (static content)
export const getPartnersData = async () => {
  const cacheKey = cache.generateKey('/api/partners');
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('📡 Fetching partners data from API...');
    const response = await apiClient.get('/api/partners');
    
    // Cache the response for 10 minutes (partners don't change often)
    cache.set(cacheKey, response.data, 10);
    
    return response.data;
  });
};

// ======= CACHE MANAGEMENT FUNCTIONS =======

// Clear all cache
export const clearAllCache = () => {
  cache.clear();
};

// Clear specific screen cache
export const clearScreenCache = (screenName) => {
  switch (screenName) {
    case 'dashboard':
      cache.clearByPattern('/api/dashboard/user/');
      break;
    case 'houseServices':
      cache.clearByPattern('/api/houseServices/house/');
      break;
    case 'myHouse':
      cache.clearByPattern('/api/houses/');
      break;
    case 'partners':
      cache.clearByPattern('/api/partners');
      break;
    default:
      console.warn(`Unknown screen name: ${screenName}`);
  }
};

// Clear cache for specific user
export const clearUserCache = (userId) => {
  cache.clearByPattern(`/api/dashboard/user/${userId}`);
};

// Clear cache for specific house
export const clearHouseCache = (houseId) => {
  cache.clearByPattern(`/api/houses/${houseId}`);
  cache.clearByPattern(`/api/houseServices/house/${houseId}`);
  cache.clearByPattern(`/api/houses/${houseId}/advance-summary`);
};

// Get cache performance metrics
export const getCacheMetrics = () => {
  return cache.getMetrics();
};

// Invalidate cache when data changes (call after successful POST/PUT/DELETE)
export const invalidateCache = (type, id) => {
  switch (type) {
    case 'dashboard':
      cache.clearByPattern('/api/dashboard/user/');
      break;
    case 'houseService':
      cache.clearByPattern('/api/houseServices/house/');
      break;
    case 'house':
      cache.clearByPattern('/api/houses/');
      break;
    case 'user':
      clearUserCache(id);
      break;
    default:
      console.warn(`Unknown cache invalidation type: ${type}`);
  }
};

// Log which API URL is being used (helpful during development)
console.log(`Using API URL: ${API_URL}`);

// Define API endpoints (keeping your existing structure)
export const API_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  user: '/api/users',

  requestResetCode: '/api/auth/request-reset-code',
  resetPassword: '/api/auth/reset-password-with-code',
  verifyResetCode: '/api/auth/verify-reset-code',
  // Add more endpoints as needed
};

// Export the pre-configured axios instance as default
export default apiClient;


// npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios
