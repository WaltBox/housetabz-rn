// src/screens/HouseOptionsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HouseOptionsScreen = ({ navigation }) => {
  const handleClearToken = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      Alert.alert('Token cleared!', 'The token has been removed.');
    } catch (error) {
      console.error('Error clearing token:', error);
      Alert.alert('Error', 'Failed to clear token.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose an Option</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateHouse')}
      >
        <Text style={styles.buttonText}>Create a House</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('JoinHouse')}
      >
        <Text style={styles.buttonText}>Join a House</Text>
      </TouchableOpacity>
      {/* Temporary Clear Token Button */}
      <TouchableOpacity style={styles.clearButton} onPress={handleClearToken}>
        <Text style={styles.clearButtonText}>Clear Token</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0', // match login background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#34d399',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HouseOptionsScreen;
