// src/utils/keychainHelpers.js
import * as SecureStore from 'expo-secure-store';

// Keychain service names for different data types
export const KEYCHAIN_SERVICES = {
  ACCESS_TOKEN: 'housetabz_access_token',
  REFRESH_TOKEN: 'housetabz_refresh_token', 
  USER_DATA: 'housetabz_user_data',
  DEVICE_TOKEN: 'housetabz_device_token',
};

export const keychainHelpers = {
  // Store data in secure store
  async setSecureData(service, data) {
    try {
      await SecureStore.setItemAsync(service, data);
      console.log(`✅ Stored ${service} in SecureStore`);
    } catch (error) {
      console.error(`❌ Error storing ${service}:`, error);
      throw error;
    }
  },

  // Get data from secure store
  async getSecureData(service) {
    try {
      const data = await SecureStore.getItemAsync(service);
      return data;
    } catch (error) {
      console.error(`❌ Error retrieving ${service}:`, error);
      return null;
    }
  },

  // Remove data from secure store
  async removeSecureData(service) {
    try {
      await SecureStore.deleteItemAsync(service);
      console.log(`✅ Removed ${service} from SecureStore`);
    } catch (error) {
      console.error(`❌ Error removing ${service}:`, error);
    }
  },

  // Clear all auth data
  async clearAllAuthData() {
    console.log('🧹 Clearing all auth data from SecureStore...');
    await Promise.all([
      keychainHelpers.removeSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN),
      keychainHelpers.removeSecureData(KEYCHAIN_SERVICES.REFRESH_TOKEN),
      keychainHelpers.removeSecureData(KEYCHAIN_SERVICES.USER_DATA),
    ]);
  },

  // Legacy support - for existing code that expects AsyncStorage pattern
  async getAuthToken() {
    return await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN);
  },

  async setAuthToken(token) {
    return await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.ACCESS_TOKEN, token);
  },
};