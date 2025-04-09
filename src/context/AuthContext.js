// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // New state variable to store the JWT
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedToken && storedUser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        setToken(storedToken); // Set the token state
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
      const loggedInUser = data.user;
      // Store auth data
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(loggedInUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(loggedInUser);
      setToken(token); // Update token state
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
      setToken(null); // Clear token state
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
      setToken(token); // Update token state
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
        token,             // Expose the token so it can be used in other components
        setUser,
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
