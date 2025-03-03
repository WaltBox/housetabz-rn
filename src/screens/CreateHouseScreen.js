import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Import apiClient instead of axios
import apiClient from '../config/api';

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
    if (!houseData.name || !houseData.city || !houseData.state || !houseData.zip_code) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...houseData, creator_id: user.id };
      // Use apiClient with relative path
      const response = await apiClient.post('/api/houses', payload);
      const createdHouse = response.data.house;
      
      await updateUserHouse(createdHouse.id);
      
      Alert.alert('Success', 'House created successfully! 🎉');
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } catch (error) {
      console.error('Error creating house:', error);
      Alert.alert(
        'Creation Error',
        error.response?.data?.message || 'Something went wrong. Please try again.'
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

          <Text style={styles.title}>Create New House</Text>
          <Text style={styles.subtitle}>Set up your household headquarters</Text>

          <View style={styles.inputContainer}>
            <Icon name="home-outline" size={20} color="#4b5563" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="House Name"
              placeholderTextColor="#9ca3af"
              value={houseData.name}
              onChangeText={(text) => setHouseData({ ...houseData, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="city-variant-outline" size={20} color="#4b5563" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#9ca3af"
              value={houseData.city}
              onChangeText={(text) => setHouseData({ ...houseData, city: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="map-marker-radius" size={20} color="#4b5563" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="State (e.g., TX)"
              placeholderTextColor="#9ca3af"
              value={houseData.state}
              onChangeText={(text) => setHouseData({ ...houseData, state: text.toUpperCase() })}
              maxLength={2}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="numeric" size={20} color="#4b5563" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Zip Code"
              placeholderTextColor="#9ca3af"
              value={houseData.zip_code}
              onChangeText={(text) => setHouseData({ ...houseData, zip_code: text })}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateHouse}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Create House</Text>
                <Icon name="home-plus" size={24} color="white" />
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

export default CreateHouseScreen;