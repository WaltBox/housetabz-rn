import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Platform, View, Text } from 'react-native';
import { keychainHelpers, KEYCHAIN_SERVICES } from '../utils/keychainHelpers';
import apiClient, { API_URL, API_ENDPOINTS } from '../config/api';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext({});

// In-memory token cache to avoid repeated Keychain access
let tokenCache = {
  accessToken: null,
  refreshToken: null,
  lastUpdated: null,
  expiresAt: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to check if cache is valid
const isCacheValid = () => {
  return tokenCache.lastUpdated && 
         tokenCache.accessToken && 
         (Date.now() - tokenCache.lastUpdated) < CACHE_DURATION;
};

// Helper to get cached or fresh token
const getCachedToken = async () => {
  // Return cached token if valid
  if (isCacheValid()) {
    console.log('Using cached token');
    return tokenCache.accessToken;
  }
  
  // Cache expired or empty, fetch from Keychain
  console.log('Fetching token from Keychain');
  try {
    const storedToken = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN);
    const storedRefreshToken = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.REFRESH_TOKEN);
    
    if (storedToken) {
      // Update cache
      tokenCache = {
        accessToken: storedToken,
        refreshToken: storedRefreshToken,
        lastUpdated: Date.now(),
        expiresAt: getTokenExpiry(storedToken)
      };
      
      return storedToken;
    }
  } catch (error) {
    console.error('Error getting token from Keychain:', error);
  }
  
  return null;
};

// Helper to update cache when tokens change
const updateTokenCache = (accessToken, refreshToken = null) => {
  tokenCache = {
    accessToken,
    refreshToken: refreshToken || tokenCache.refreshToken,
    lastUpdated: Date.now(),
    expiresAt: getTokenExpiry(accessToken)
  };
  
  console.log('Token cache updated');
};

// Helper to clear cache
const clearTokenCache = () => {
  tokenCache = {
    accessToken: null,
    refreshToken: null,
    lastUpdated: null,
    expiresAt: null
  };
  
  console.log('Token cache cleared');
};

// Helper to get token expiry
const getTokenExpiry = (token) => {
  try {
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

// Add token refresh lock to prevent race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  // Load stored user on initial mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Setup optimized axios interceptor
  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use(
      async (config) => {
        try {
          // Use cached token instead of hitting Keychain every time
          const cachedToken = await getCachedToken();
          if (cachedToken) {
            config.headers['Authorization'] = `Bearer ${cachedToken}`;
          }
          return config;
        } catch (error) {
          console.error('Error adding auth token to request:', error);
          return config;
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for automatic token refresh
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.log('=== INTERCEPTOR TRIGGERED ===');
        console.log('Status:', error.response?.status);
        console.log('Error message:', error.response?.data?.message);
        console.log('URL:', error.config?.url);
        
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          // If already refreshing, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return apiClient(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;
          
          try {
            console.log('Token expired, attempting refresh...');
            const newToken = await refreshToken();
            processQueue(null, newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            console.log('Token refresh failed, logging out');
            processQueue(refreshError, null);
            await logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      apiClient.interceptors.request.eject(interceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if token is expired by decoding it
  const isTokenExpired = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const storedRefreshToken = tokenCache.refreshToken || 
                                await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.REFRESH_TOKEN);
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/api/auth/refresh', {
        refreshToken: storedRefreshToken
      });

      const { token: newAccessToken, refreshToken: newRefreshToken, data } = response.data;
      
      // Store new tokens in Keychain
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN, newAccessToken);
      if (newRefreshToken) {
        await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.REFRESH_TOKEN, newRefreshToken);
      }
      
      // Update cache immediately
      updateTokenCache(newAccessToken, newRefreshToken);
      
      // Update apiClient default header and state
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      setToken(newAccessToken);
      
      // Update user data if provided
      if (data?.user) {
        setUser(data.user);
        await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(data.user));
      }
      
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokenCache(); // Clear cache on refresh failure
      await logout();
      throw error;
    }
  };

  const loadStoredUser = async () => {
    try {
      console.log('=== DEBUG: loadStoredUser started ===');
      setDebugInfo('Loading from Keychain...');
      
      const storedToken = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN);
      const storedUserData = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.USER_DATA);
      const storedRefreshToken = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.REFRESH_TOKEN);
      
      console.log('Keychain - token exists:', !!storedToken);
      console.log('Keychain - user exists:', !!storedUserData);
      console.log('Keychain - refresh token exists:', !!storedRefreshToken);
      
      setDebugInfo(`Keychain: Access=${!!storedToken}, User=${!!storedUserData}, Refresh=${!!storedRefreshToken}`);
      
      if (storedToken && storedUserData) {
        // Initialize cache with stored tokens
        updateTokenCache(storedToken, storedRefreshToken);
        
        const isExpired = isTokenExpired(storedToken);
        console.log('Access token is expired:', isExpired);
        setDebugInfo(`Token expired: ${isExpired}. ${isExpired ? 'Refreshing...' : 'Restoring...'}`);
        
        if (isExpired) {
          console.log('Token expired, checking for refresh token...');
          
          if (storedRefreshToken) {
            console.log('Refresh token found, attempting refresh...');
            try {
              setDebugInfo('Calling refresh API...');
              await refreshToken();
              console.log('✅ Token refreshed successfully on app startup');
              setDebugInfo('✅ Refreshed from Keychain!');
              return;
            } catch (error) {
              console.log('❌ Refresh failed on startup:', error.message);
              setDebugInfo(`❌ Refresh failed: ${error.message}`);
              await logout();
            }
          } else {
            console.log('❌ No refresh token available, logging out');
            setDebugInfo('❌ No refresh token');
            await logout();
          }
        } else {
          // Token still valid, restore session
          console.log('✅ Token still valid, restoring session');
          setDebugInfo('✅ Restored from Keychain');
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const parsedUserData = JSON.parse(storedUserData);
          console.log('🔍 Restoring user from Keychain:', JSON.stringify(parsedUserData, null, 2));
          setUser(parsedUserData);
          setToken(storedToken);
        }
      } else {
        console.log('❌ No stored tokens/user found in Keychain');
        setDebugInfo('❌ No Keychain data');
        clearTokenCache(); // Clear cache if no stored data
      }
    } catch (error) {
      console.error('❌ Error in loadStoredUser:', error);
      setDebugInfo(`❌ Error: ${error.message}`);
      clearTokenCache(); // Clear cache on error
      await logout();
    } finally {
      setLoading(false);
      // Clear debug info after 5 seconds
      setTimeout(() => setDebugInfo(''), 5000);
    }
  };

  // Manual payment method check function
  const checkPaymentMethods = async () => {
    // Get token from cache first, then state, then fallback to storage
    let currentToken = await getCachedToken() || token;
    
    if (!currentToken) {
      console.log('No token available for payment method check');
      setHasPaymentMethods(false);
      return false;
    }
  
    try {
      console.log('Checking payment methods with cached token...');
      const response = await apiClient.get('/api/payment-methods');
  
      console.log('Payment methods response:', response.data);
      
      let hasPayments = false;
      
      if (response.data.paymentMethods) {
        hasPayments = response.data.paymentMethods.length > 0;
      } else if (response.data.message === "You need a card on file") {
        hasPayments = false;
      } else {
        hasPayments = false;
      }
      
      console.log('Has payment methods:', hasPayments);
      setHasPaymentMethods(hasPayments);
      return hasPayments;
    } catch (error) {
      console.error('Error checking payment methods:', error);
      setHasPaymentMethods(false);
      return false;
    }
  };

  // Register device token
  const registerDeviceToken = async (deviceTokenData) => {
    if (!user || !token) {
      console.log('Cannot register device token - user not authenticated');
      return false;
    }
    const tokenString = typeof deviceTokenData === 'string' ? deviceTokenData : deviceTokenData.token;
    if (!tokenString) {
      console.error('Invalid device token format:', deviceTokenData);
      return false;
    }
    console.log('Registering device token with backend:', tokenString);
    try {
      const response = await apiClient.post('/api/users/device-token', {
        deviceToken: tokenString,
        deviceType: Platform.OS,
      });
      console.log('Device token registration successful:', response.status);
      return true;
    } catch (error) {
      console.error('Error registering device token:', error);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login...', { email });
      console.log('Using API URL:', API_URL);
      const response = await apiClient.post(API_ENDPOINTS.login, { email, password });
      console.log('Login response:', response.data);
      
      const { token: authToken, refreshToken: refToken, data } = response.data;
      console.log('=== DEBUG LOGIN TOKENS ===');
      console.log('Access token received:', !!authToken);
      console.log('Refresh token received:', !!refToken);
      console.log('User data received:', !!data?.user);
      
      if (!authToken || !data?.user) {
        throw new Error('Invalid response structure from server');
      }
      
      const loggedInUser = data.user;
      
      // Store tokens in Keychain (secure storage)
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN, authToken);
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(loggedInUser));
      
      if (refToken) {
        await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.REFRESH_TOKEN, refToken);
        console.log('✅ Refresh token stored in Keychain');
      } else {
        console.log('❌ No refresh token to store');
      }
      
      // Update cache immediately after login
      updateTokenCache(authToken, refToken);
      
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setUser(loggedInUser);
      setToken(authToken);
      setHasPaymentMethods(null);
      console.log('Login successful:', loggedInUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user');
      // Clear all auth data from Keychain
      await keychainHelpers.clearAllAuthData();
      
      // Clear cache
      clearTokenCache();
      
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
      setHasPaymentMethods(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.register, userData);
      const { data } = response.data;
      const { token: authToken, refreshToken: refToken, user: registeredUser } = data;
      if (!authToken || !registeredUser) {
        throw new Error('Invalid registration response');
      }
      
      // Store tokens in Keychain
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN, authToken);
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(registeredUser));
      
      if (refToken) {
        await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.REFRESH_TOKEN, refToken);
      }
      
      // Update cache immediately after registration
      updateTokenCache(authToken, refToken);
      
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setUser(registeredUser);
      setToken(authToken);
      setHasPaymentMethods(false);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Function to refresh payment method status
  const refreshPaymentMethods = async () => {
    return await checkPaymentMethods();
  };

  // Verify reset code
  const verifyResetCode = async (email, code) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.verifyResetCode, { 
        email, 
        code 
      });
      return response.data;
    } catch (error) {
      console.error('Code verification error:', error);
      throw error;
    }
  };

  // Request password reset code
  const requestPasswordResetCode = async (email) => {
    try {
      console.log('Requesting password reset code for:', email);
      const response = await apiClient.post(API_ENDPOINTS.requestResetCode, { email });
      console.log('Reset code request successful');
      return response.data;
    } catch (error) {
      console.error('Password reset code request error:', error);
      throw error;
    }
  };
  
  // Reset password with code
  const resetPasswordWithCode = async (email, code, newPassword) => {
    try {
      console.log('Attempting to reset password with code');
      const response = await apiClient.post(API_ENDPOINTS.resetPassword, { 
        email, 
        code, 
        newPassword 
      });
      console.log('Password reset successful');
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Update user house
  const updateUserHouse = async (houseId) => {
    try {
      const response = await apiClient.put(`/api/users/${user.id}/house`, { houseId });
      const updatedUser = response.data.user;
      setUser(updatedUser);
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error updating user house:', error);
      throw error;
    }
  };

  // Add function to refresh user data from server
  const refreshUserData = async () => {
    try {
      if (!user?.id || !token) {
        console.log('Cannot refresh user data - no user or token');
        return false;
      }

      console.log('🔄 Refreshing user data from server...');
      const response = await apiClient.get(`/api/users/${user.id}`);
      const freshUserData = response.data;
      
      console.log('🔍 Fresh user data from server:', JSON.stringify(freshUserData, null, 2));
      console.log('🔍 Current cached user data:', JSON.stringify(user, null, 2));
      
      // Update user state and keychain with fresh data
      setUser(freshUserData);
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(freshUserData));
      
      console.log('✅ User data refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      return false;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          token,
          loading,
          hasPaymentMethods,
          login,
          logout,
          register,
          updateUserHouse,
          refreshUserData,
          registerDeviceToken,
          checkPaymentMethods,
          refreshPaymentMethods,
          refreshToken,
          isAuthenticated: !!user,
          verifyResetCode,
          requestPasswordResetCode,
          resetPasswordWithCode,
          // Expose cache utilities for debugging
          debugInfo,
          getCachedToken,
          clearTokenCache: () => {
            clearTokenCache();
            setDebugInfo('Cache cleared manually');
          }
        }}
      >
        {children}
      </AuthContext.Provider>
    </View>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};