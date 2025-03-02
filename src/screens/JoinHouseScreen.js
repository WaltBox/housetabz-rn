import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const JoinHouseScreen = ({ navigation }) => {
  const [houseCode, setHouseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();

  const handleJoinHouse = async () => {
    if (!houseCode) {
      Alert.alert('Missing Code', 'Please enter a house invitation code');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/api/users/${user.id}/join-house`, { 
        house_code: houseCode 
      });
      
      const updatedUser = response.data.user;
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);

      Alert.alert('Success', '🏡 Welcome to your new household!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } catch (error) {
      console.error('Join house error:', error);
      Alert.alert(
        'Connection Error',
        error.response?.data?.message || 'Couldn\'t connect to household. Please check the code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#dff6f0', '#b2ece5', '#8ae4db']}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={28} color="#1e293b" />
          </TouchableOpacity>

          <Text style={styles.title}>Join a Household</Text>
          <Text style={styles.subtitle}>Enter your invitation code below</Text>

          <View style={styles.inputContainer}>
            <Icon name="key-variant" size={20} color="#4b5563" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Invitation Code"
              placeholderTextColor="#9ca3af"
              value={houseCode}
              onChangeText={setHouseCode}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleJoinHouse}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Join Household</Text>
                <Icon name="account-group" size={24} color="white" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  button: {
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 15,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default JoinHouseScreen;