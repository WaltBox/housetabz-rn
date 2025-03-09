// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (token && storedUser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login...', { email });
      console.log('Using API URL:', API_URL);
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.login}`, {
        email,
        password,
      });
      console.log('Login response:', response.data);
      const { token, data } = response.data;
      if (!token || !data?.user) {
        throw new Error('Invalid response structure from server');
      }
      const user = data.user;
      // Store auth data
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      console.log('Login successful:', user);
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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.register}`, userData);
      // Our backend returns: { success, message, data: { user, token } }
      const { data } = response.data; // data contains { user, token }
      const { token, user } = data;
      if (!token || !user) {
        throw new Error('Invalid registration response');
      }
      // Store auth data so the user is "logged in"
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updateUserHouse = async (houseId) => {
    try {
      // Update the endpoint URL to include /api
      const response = await axios.put(`${API_URL}/api/users/${user.id}/house`, { houseId });
      const updatedUser = response.data.user;
      
      // Update local state and storage with the new user data
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
        setUser, // <-- Add this
        loading,
        login,
        logout,
        register,
        updateUserHouse,
        isAuthenticated: !!user,
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
