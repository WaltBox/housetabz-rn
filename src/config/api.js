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

  // Set cache data with TTL (enhanced for backend optimization)
  set(key, data, ttlMinutes = 5, cacheStatus = null) {
    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, { 
      data, 
      expiry, 
      cacheStatus,
      timestamp: Date.now()
    });
    console.log(`📦 Cache SET: ${key} (TTL: ${ttlMinutes}min) ${cacheStatus ? `[Backend: ${cacheStatus}]` : ''}`);
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

// Add response interceptor with enhanced error handling and performance monitoring
apiClient.interceptors.response.use(
  (response) => {
    // Enhanced performance monitoring for optimized endpoints
    if (response.config.url?.includes('/dashboard/user/')) {
      const performanceData = {
        status: response.status,
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        url: response.config.url,
        // New performance headers from backend optimization
        cacheStatus: response.headers['x-cache-status'],
        responseTime: response.headers['x-response-time'],
        timestamp: new Date().toISOString()
      };
      
      console.log('📡 Dashboard API Response:', performanceData);
      
      // Log performance metrics for monitoring
      if (performanceData.cacheStatus) {
        console.log(`⚡ Cache ${performanceData.cacheStatus} - Response time: ${performanceData.responseTime}ms`);
      }
      
      // Track performance metrics
      performanceMonitor.trackRequest(
        performanceData.url, 
        performanceData.cacheStatus, 
        performanceData.responseTime
      );
      
      // Track cache hit rate for analytics
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('Dashboard API Performance', performanceData);
      }
    }
    return response;
  },
  (error) => {
    // Enhanced error logging and handling
    const errorInfo = {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      hadAuthHeader: !!error.config?.headers?.Authorization,
      timestamp: new Date().toISOString()
    };

    console.log('=== INTERCEPTOR TRIGGERED ===');
    console.log('Status:', errorInfo.status);
    console.log('Error message:', errorInfo.message);
    console.log('URL:', errorInfo.url);

    // Specific error handling
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🚨 AUTHENTICATION ERROR:', errorInfo);
    } else if (error.response?.status === 500) {
      console.error('🚨 SERVER ERROR:', errorInfo);
      // Log database errors specifically
      if (errorInfo.message?.includes('column') && errorInfo.message?.includes('does not exist')) {
        console.error('💾 DATABASE SCHEMA ERROR - Missing column:', errorInfo.message);
      }
    } else if (error.response?.status === 503) {
      console.error('🚨 SERVICE UNAVAILABLE:', errorInfo);
      console.error('🔧 Server is under high load or maintenance');
    } else if (!error.response) {
      console.error('🌐 NETWORK ERROR:', {
        message: error.message,
        url: errorInfo.url,
        code: error.code
      });
    }

    // Track errors for monitoring
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('API Error', errorInfo);
    }

    return Promise.reject(error);
  }
);

// ======= CACHED API FUNCTIONS =======

// ✅ NEW: Unified App Data Endpoint - Single call for all dashboard data
export const getAppUserInfo = async (userId, options = {}) => {
  const cacheKey = cache.generateKey(`/api/app/userinfo/${userId}`, options);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('⚡ Using cached app user info');
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('🚀 UNIFIED: Fetching complete app data (sub-500ms target)...');
    console.log('🔗 API Base URL:', API_URL);
    console.log('🎯 Full endpoint:', `${API_URL}/api/app/userinfo/${userId}`);
    
    const response = await apiClient.get(`/api/app/userinfo/${userId}`, { params: options });
    
    // Validate response structure
    if (!response.data.success) {
      throw new Error(response.data.error || 'API returned success: false');
    }
    
    console.log('📊 Unified App Data Response:', {
      status: response.status,
      success: response.data.success,
      dataKeys: Object.keys(response.data.data || {}),
      partnersCount: response.data.data?.partners?.length || 0,
      tasksCount: response.data.data?.tasks?.length || 0,
      billSubmissionsCount: response.data.data?.billSubmissions?.length || 0,
      userChargesCount: response.data.data?.userCharges?.length || 0,
      unpaidBillsCount: response.data.data?.unpaidBills?.length || 0,
      houseServicesCount: response.data.data?.houseServices?.length || 0,
      notificationsCount: response.data.data?.notifications?.length || 0,
      cacheStatus: response.headers['x-cache-status'],
      responseTime: response.headers['x-response-time'],
      payloadSize: JSON.stringify(response.data).length
    });
    
    // Enhanced performance tracking
    if (response.headers['x-cache-status'] || response.headers['x-response-time']) {
      performanceMonitor.trackRequest(
        `/api/app/userinfo/${userId}`, 
        response.headers['x-cache-status'], 
        parseInt(response.headers['x-response-time']) || 0
      );
    }
    
    // Cache the response for 3 minutes (respecting backend cache optimization)
    cache.set(cacheKey, response.data, 3, response.headers['x-cache-status']);
    
    return response.data;
  });
};

// ✅ DEPRECATED: Legacy Progressive Loading - Phase 1: Initial Dashboard Load (300ms)
export const getDashboardInitialData = async (userId, options = {}) => {
  const cacheKey = cache.generateKey(`/api/dashboard/user/${userId}`, options);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('⚡ Using cached initial dashboard data');
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('🚀 PHASE 1: Fetching initial dashboard data (300ms target)...');
    console.log('🔗 API Base URL:', API_URL);
    console.log('🎯 Full endpoint:', `${API_URL}/api/dashboard/user/${userId}`);
    
    const response = await apiClient.get(`/api/dashboard/user/${userId}`, { params: options });
    
    console.log('📊 Phase 1 Dashboard Response:', {
      status: response.status,
      loadingStrategy: response.data?.meta?.loadingStrategy,
      backgroundPrefetch: response.data?.meta?.backgroundPrefetch,
      partnersCount: response.data?.partners?.length || 0,
      pendingChargesCount: response.data?.pendingCharges?.length || 0,
      summaryKeys: Object.keys(response.data?.summary || {}),
      dataKeys: Object.keys(response.data || {}),
      cacheStatus: response.headers['x-cache-status'],
      responseTime: response.headers['x-response-time']
    });
    
    // Cache the response for 3 minutes
    cache.set(cacheKey, response.data, 3, response.headers['x-cache-status']);
    
    return response.data;
  });
};

// ✅ NEW: Progressive Loading - Phase 2: Background Prefetch Data with Error Handling
export const getDashboardPrefetchData = async (userId, options = {}, retryCount = 0) => {
  const cacheKey = cache.generateKey(`/api/dashboard/user/${userId}/prefetched`, options);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('⚡ Using cached prefetch data');
    return cached;
  }

  // Make request with deduplication and retry logic
  return cache.handleRequest(cacheKey, async () => {
    console.log('🔄 PHASE 2: Fetching prefetch data in background...');
    console.log('🎯 Prefetch endpoint:', `${API_URL}/api/dashboard/user/${userId}/prefetched`);
    
    try {
      const response = await apiClient.get(`/api/dashboard/user/${userId}/prefetched`, { params: options });
      
      console.log('📊 Phase 2 Prefetch Response:', {
        status: response.status,
        metaStatus: response.data?.meta?.status,
        tasksCount: response.data?.pendingTasks?.length || 0,
        transactionsCount: response.data?.recentTransactions?.length || 0,
        billSubmissionsCount: response.data?.billSubmissions?.length || 0,
        notificationsCount: response.data?.unreadNotifications?.length || 0,
        messagesCount: response.data?.urgentMessages?.length || 0,
        dataKeys: Object.keys(response.data || {}),
        cacheStatus: response.headers['x-cache-status'],
        responseTime: response.headers['x-response-time']
      });
      
      // Cache the response for 2 minutes (as specified by backend)
      cache.set(cacheKey, response.data, 2, response.headers['x-cache-status']);
      
      return response.data;
    } catch (error) {
      // Handle specific errors
      if (error.response?.status === 500 && error.response?.data?.message?.includes('column')) {
        console.error('💾 Database schema error in prefetch - skipping retry');
        throw new Error('Database schema issue: ' + error.response.data.message);
      }
      
      // Retry logic for transient errors
      if (retryCount < 2 && (error.response?.status === 503 || !error.response)) {
        console.log(`🔄 Retrying prefetch request (attempt ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Progressive delay
        return getDashboardPrefetchData(userId, options, retryCount + 1);
      }
      
      throw error;
    }
  });
};

// ✅ LEGACY: Keep old function for backward compatibility during transition
export const getDashboardData = getDashboardInitialData;

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

// Partners Screen - DEPRECATED for main use cases
// Partners are now included in dashboard response for performance
// This function should only be used when full partner details are needed
export const getPartnersData = async () => {
  console.warn('⚠️ getPartnersData is deprecated - partners are now included in dashboard response');
  
  const cacheKey = cache.generateKey('/api/partners');
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('📡 Fetching partners data from API... (consider using dashboard data instead)');
    const response = await apiClient.get('/api/partners');
    
    // Cache the response for 10 minutes (partners don't change often)
    cache.set(cacheKey, response.data, 10);
    
    return response.data;
  });
};

// Get Individual Partner Details - for ViewCompanyCard
export const getPartnerDetails = async (partnerId) => {
  const cacheKey = cache.generateKey(`/api/partners/${partnerId}`);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('📈 Using cached partner details for:', partnerId);
    return cached;
  }

  // Make request with deduplication
  return cache.handleRequest(cacheKey, async () => {
    console.log('📡 Fetching partner details from API for partner:', partnerId);
    console.log('🎯 Full endpoint:', `${API_URL}/api/partners/${partnerId}`);
    
    const response = await apiClient.get(`/api/partners/${partnerId}`);
    
    console.log('📊 Partner Details Response:', {
      status: response.status,
      partnerId: response.data?.partner?.id,
      partnerName: response.data?.partner?.name,
      hasLink: !!response.data?.partner?.link,
      hasMarketplaceCover: !!response.data?.partner?.marketplace_cover,
      hasCompanyCover: !!response.data?.partner?.company_cover,
      dataKeys: Object.keys(response.data?.partner || {})
    });
    
    // Cache the response for 10 minutes (partner details don't change often)
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
  // CRITICAL FIX: Clear NEW unified endpoint cache
  cache.clearByPattern(`/api/app/userinfo/${userId}`);
  // Also clear OLD dashboard endpoint cache (for backward compatibility)
  cache.clearByPattern(`/api/dashboard/user/${userId}`);
  // Clear charges cache for this user
  cache.clearByPattern(`/api/users/${userId}/charges`);
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

// ======= PERFORMANCE MONITORING =======

// Performance monitoring utility for backend optimization tracking
export const performanceMonitor = {
  metrics: {
    cacheHitRate: 0,
    averageResponseTime: 0,
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    responseTimeHistory: []
  },

  // Track API performance
  trackRequest(url, cacheStatus, responseTime) {
    this.metrics.totalRequests++;
    
    if (cacheStatus === 'HIT') {
      this.metrics.cacheHits++;
    } else if (cacheStatus === 'MISS') {
      this.metrics.cacheMisses++;
    }
    
    // Update cache hit rate
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (totalCacheRequests > 0) {
      this.metrics.cacheHitRate = (this.metrics.cacheHits / totalCacheRequests) * 100;
    }
    
    // Track response times
    if (responseTime) {
      const timeMs = parseInt(responseTime);
      this.metrics.responseTimeHistory.push(timeMs);
      
      // Keep only last 100 response times
      if (this.metrics.responseTimeHistory.length > 100) {
        this.metrics.responseTimeHistory.shift();
      }
      
      // Calculate average response time
      this.metrics.averageResponseTime = 
        this.metrics.responseTimeHistory.reduce((sum, time) => sum + time, 0) / 
        this.metrics.responseTimeHistory.length;
    }
    
    // Log performance alerts
    if (this.metrics.cacheHitRate < 70 && totalCacheRequests > 10) {
      console.warn(`⚠️ Low cache hit rate: ${this.metrics.cacheHitRate.toFixed(1)}%`);
    }
    
    if (responseTime && parseInt(responseTime) > 300) {
      console.warn(`⚠️ Slow response: ${responseTime}ms for ${url}`);
    }
  },

  // Get current performance summary
  getSummary() {
    return {
      ...this.metrics,
      cacheHitRate: `${this.metrics.cacheHitRate.toFixed(1)}%`,
      averageResponseTime: `${this.metrics.averageResponseTime.toFixed(0)}ms`,
      p95ResponseTime: this.getPercentile(95),
      p99ResponseTime: this.getPercentile(99)
    };
  },

  // Calculate response time percentiles
  getPercentile(percentile) {
    if (this.metrics.responseTimeHistory.length === 0) return 0;
    
    const sorted = [...this.metrics.responseTimeHistory].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return `${sorted[index] || 0}ms`;
  },

  // Reset metrics
  reset() {
    this.metrics = {
      cacheHitRate: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      responseTimeHistory: []
    };
  }
};

// Export performance monitoring
export const getPerformanceMetrics = () => performanceMonitor.getSummary();

// Invalidate cache when data changes (call after successful POST/PUT/DELETE)
export const invalidateCache = (type, id) => {
  switch (type) {
    case 'dashboard':
      cache.clearByPattern('/api/dashboard/user/');
      break;
    case 'house':
      cache.clearByPattern('/api/houses/');
      break;
    case 'user':
      clearUserCache(id);
      break;
    case 'charges':
      // Clear all charge-related cache endpoints
      if (id) {
        cache.clearByPattern(`/api/users/${id}/charges`);
      } else {
        cache.clearByPattern('/api/users/');
      }
      cache.clearByPattern('/api/payments/');
      break;
    case 'payments':
      // Clear all payment-related cache
      cache.clearByPattern('/api/payments/');
      if (id) {
        cache.clearByPattern(`/api/users/${id}/charges`);
      } else {
        cache.clearByPattern('/api/users/');
      }
      break;
    case 'houseService':
      // Clear house service cache
      cache.clearByPattern('/api/houseServices/');
      cache.clearByPattern('/api/take-over-requests/');
      break;
    case 'app':
      // Full app cache clear
      cache.clear();
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

// ==========================================
// Payment Fee Preview API
// ==========================================
/**
 * Get fee preview for payment methods
 * Returns fee percentages for card and ACH payments
 * @returns {Promise} Fee preview data with displayText for each payment method
 */
export const getFeePreview = async () => {
  try {
    const response = await apiClient.get('/api/payments/fee-preview');
    return response.data;
  } catch (error) {
    console.error('Error fetching fee preview:', error);
    // Return null on error - components should handle gracefully
    return null;
  }
};

// Export the pre-configured axios instance as default
export default apiClient;
// npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios