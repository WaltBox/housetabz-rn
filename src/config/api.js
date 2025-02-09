// src/config/api.js
import { Platform } from 'react-native';

// For iOS simulator
const LOCAL_API_URL = 'http://localhost:3004';

// For Android emulator
const ANDROID_API_URL = 'http://10.0.2.2:3004';

// For physical device, use your computer's IP address
// const PHYSICAL_DEVICE_API_URL = 'http://192.168.1.xxx:3004';

export const API_URL = Platform.select({
  ios: LOCAL_API_URL,
  android: ANDROID_API_URL,
  // Add your physical device URL if needed
});

export const API_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  user: '/api/users',
};