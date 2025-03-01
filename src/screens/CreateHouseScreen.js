// src/screens/CreateHouseScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CreateHouseScreen = ({ navigation }) => {
  const [houseData, setHouseData] = useState({
    name: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [loading, setLoading] = useState(false);
  const { user, updateUserHouse } = useAuth();

  const handleCreateHouse = async () => {
    // Basic validation for required fields
    if (!houseData.name || !houseData.city || !houseData.state || !houseData.zip_code) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // Prepare payload with the new fields plus creator_id from the current user
      const payload = { ...houseData, creator_id: user.id };

      // Post new house to your API on localhost:3004
      const response = await axios.post('http://localhost:3004/api/houses', payload);
      // Assuming the response returns the created house in response.data.house
      const createdHouse = response.data.house;
      
      // Update the user's houseId using your AuthContext function
      await updateUserHouse(createdHouse.id);
      
      Alert.alert('Success', 'House created and joined successfully!');
      // Force a navigation reset so the AppNavigator rechecks the user state
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } catch (error) {
      console.error('Error creating house:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred'
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

      <Text style={styles.title}>Create a House</Text>
      <TextInput
        style={styles.input}
        placeholder="House Name"
        value={houseData.name}
        onChangeText={(text) => setHouseData({ ...houseData, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={houseData.city}
        onChangeText={(text) => setHouseData({ ...houseData, city: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="State (e.g., TX)"
        value={houseData.state}
        onChangeText={(text) => setHouseData({ ...houseData, state: text.toUpperCase() })}
        maxLength={2}
      />
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        value={houseData.zip_code}
        onChangeText={(text) => setHouseData({ ...houseData, zip_code: text })}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateHouse}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create House</Text>
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

export default CreateHouseScreen;
