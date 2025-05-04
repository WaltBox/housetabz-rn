// src/context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { user, token } = useAuth();
  
  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPref = await AsyncStorage.getItem('notificationsEnabled');
        setNotificationsEnabled(storedPref === 'true');
      } catch (error) {
        console.error('Error loading notification preferences:', error);
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
        
        // Re-register any stored token
        const savedTokenString = await AsyncStorage.getItem('deviceToken');
        if (savedTokenString && user && token) {
          const savedToken = JSON.parse(savedTokenString);
          registerTokenWithBackend(savedToken);
        }
      } else {
        // Disable notifications - mark token as inactive
        const savedTokenString = await AsyncStorage.getItem('deviceToken');
        if (savedTokenString && user && token) {
          const savedToken = JSON.parse(savedTokenString);
          deregisterTokenWithBackend(savedToken);
        }
      }
      
      // Update state and storage
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notificationsEnabled', value ? 'true' : 'false');
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
        deviceToken: deviceToken.token || deviceToken,
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
        deviceToken: deviceToken.token || deviceToken,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to deregister device token');
      }
      console.log('Device deregistered from push notifications');
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