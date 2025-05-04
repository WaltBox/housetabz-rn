import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL, API_ENDPOINTS } from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  // Setup axios interceptor for token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response && 
          error.response.status === 401 && 
          error.response.data?.message === 'Token expired'
        ) {
          console.log('Token expired, initiating logout');
          
          // Simply log the user out which will redirect to login
          await logout();
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedToken && storedUser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Register device token (expects a plain string).
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
      const response = await axios.post(`${API_URL}/api/users/device-token`, {
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

  // Login function. Device token registration is handled in PushNotificationHandler.
  const login = async (email, password) => {
    try {
      console.log('Attempting login...', { email });
      console.log('Using API URL:', API_URL);
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.login}`, { email, password });
      console.log('Login response:', response.data);
      const { token: authToken, data } = response.data;
      if (!authToken || !data?.user) {
        throw new Error('Invalid response structure from server');
      }
      const loggedInUser = data.user;
      await AsyncStorage.setItem('userToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(loggedInUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setUser(loggedInUser);
      setToken(authToken);
      console.log('Login successful:', loggedInUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.register}`, userData);
      const { data } = response.data;
      const { token: authToken, user: registeredUser } = data;
      if (!authToken || !registeredUser) {
        throw new Error('Invalid registration response');
      }
      await AsyncStorage.setItem('userToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(registeredUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setUser(registeredUser);
      setToken(authToken);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  const verifyResetCode = async (email, code) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.verifyResetCode}`, { 
        email, 
        code 
      });
      return response.data;
    } catch (error) {
      console.error('Code verification error:', error);
      throw error;
    }
  };
  const requestPasswordResetCode = async (email) => {
    try {
      console.log('Requesting password reset code for:', email);
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.requestResetCode}`, { email });
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
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.resetPassword}`, { 
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

  const updateUserHouse = async (houseId) => {
    try {
      const response = await axios.put(`${API_URL}/api/users/${user.id}/house`, { houseId });
      const updatedUser = response.data.user;
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error updating user house:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
    value={{
      user,
      token,
      loading,
      login,
      logout,
      register,
      updateUserHouse,
      registerDeviceToken,
      isAuthenticated: !!user,
      // Add these new methods:
      verifyResetCode,
      requestPasswordResetCode,
      resetPasswordWithCode,
    }}
  >
    {children}
  </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};