// src/screens/JoinHouseScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const JoinHouseScreen = ({ navigation }) => {
  const [houseCode, setHouseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth(); // Added setUser from AuthContext

  const handleJoinHouse = async () => {
    if (!houseCode) {
      Alert.alert('Error', 'Please enter a house code');
      return;
    }
    try {
      setLoading(true);
      // Call the join-house endpoint
      const response = await axios.put(`${API_URL}/api/users/${user.id}/join-house`, { house_code: houseCode });
      
      // Update both AsyncStorage and the React state
      const updatedUser = response.data.user;
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser); // Update the in-memory state via context
      
      Alert.alert('Success', 'You have successfully joined the house!');
      // Reset navigation so that AppNavigator rechecks auth state
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } catch (error) {
      console.error('Error joining house:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while joining the house'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Join a House</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter House Code"
        value={houseCode}
        onChangeText={setHouseCode}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleJoinHouse}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Join House</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#34d399',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#34d399',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JoinHouseScreen;