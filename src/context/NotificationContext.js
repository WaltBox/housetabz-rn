// src/context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { useAuth } from './AuthContext';
import { keychainHelpers, KEYCHAIN_SERVICES } from '../utils/keychainHelpers';

const NotificationContext = createContext({});

// Additional Keychain service for notification preferences
const NOTIFICATION_PREFERENCES = 'housetabz_notification_prefs';

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { user, token } = useAuth();
  
  // Load notification preferences from Keychain
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPref = await keychainHelpers.getSecureData(NOTIFICATION_PREFERENCES);
        setNotificationsEnabled(storedPref === 'true');
      } catch (error) {
        console.error('Error loading notification preferences from Keychain:', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Toggle notifications
  const toggleNotifications = async (value) => {
    try {
      if (value) {
        // Enable notifications
        if (Platform.OS === 'ios') {
          const result = await PushNotification.requestPermissions();
          if (!result.alert) {
            return false; // Permission denied
          }
        }
        
        // Re-register any stored token from Keychain
        const savedToken = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.DEVICE_TOKEN);
        if (savedToken && user && token) {
          registerTokenWithBackend(savedToken);
        }
      } else {
        // Disable notifications - mark token as inactive
        const savedToken = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.DEVICE_TOKEN);
        if (savedToken && user && token) {
          deregisterTokenWithBackend(savedToken);
        }
      }
      
      // Update state and storage in Keychain
      setNotificationsEnabled(value);
      await keychainHelpers.setSecureData(NOTIFICATION_PREFERENCES, value ? 'true' : 'false');
      return true;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return false;
    }
  };
  
  // Register token with backend
  const registerTokenWithBackend = (deviceToken) => {
    if (!user || !token) return;
    
    fetch('https://api.housetabz.com/api/users/device-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceToken: deviceToken,
        deviceType: Platform.OS,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to register device token');
      }
      console.log('Device registered for push notifications');
    })
    .catch(error => {
      console.error('Error registering push token with backend:', error);
    });
  };
  
  // Deregister token with backend
  const deregisterTokenWithBackend = (deviceToken) => {
    if (!user || !token) return;
    
    fetch('https://api.housetabz.com/api/users/device-token', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceToken: deviceToken,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to deregister device token');
      }
      console.log('Device deregistered from push notifications');
    })
    .then(() => {
      // Also remove the device token from Keychain when deregistering
      keychainHelpers.removeSecureData(KEYCHAIN_SERVICES.DEVICE_TOKEN);
    })
    .catch(error => {
      console.error('Error deregistering push token from backend:', error);
    });
  };
  
  return (
    <NotificationContext.Provider 
      value={{
        notificationsEnabled,
        toggleNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};