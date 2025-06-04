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
  timeout: 10000,
  withCredentials: true, // include cookies if that's your auth mechanism
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to attach auth token from Keychain
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from Keychain instead of AsyncStorage
      const token = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
