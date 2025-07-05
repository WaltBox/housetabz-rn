import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { keychainHelpers, KEYCHAIN_SERVICES } from '../utils/keychainHelpers';
import { useAuth } from '../context/AuthContext';
import { useFonts } from 'expo-font';
import apiClient from '../config/api'; // Changed from axios to apiClient

const JoinHouseScreen = ({ navigation }) => {
  const [houseCode, setHouseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const handleJoinHouse = async () => {
    if (!houseCode) {
      Alert.alert('Missing Code', 'Please enter a house invitation code');
      return;
    }
    
    try {
      setLoading(true);
      // Changed to use apiClient and relative path
      const response = await apiClient.put(`/api/users/${user.id}/join-house`, { 
        house_code: houseCode 
      });
      
      const updatedUser = response.data.user;
      console.log('✅ Join house response:', {
        hasUser: !!updatedUser,
        onboarded: updatedUser?.onboarded,
        houseId: updatedUser?.houseId,
        userKeys: Object.keys(updatedUser || {})
      });
      
      // Update user's onboarding step to 'payment' after joining house
      const userWithPaymentStep = { ...updatedUser, onboarding_step: 'payment' };
      
      // Store updated user data in Keychain instead of AsyncStorage
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(userWithPaymentStep));
      setUser(userWithPaymentStep);

      Alert.alert('Success', '🏡 Welcome to your new household!');
      
      // AppNavigator will now show PaymentMethodOnboardingScreen since onboarding_step is 'payment'
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
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
      <View style={styles.circle4} />
      <View style={styles.circle5} />
      <View style={styles.circle6} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={28} color="#1e293b" />
          </TouchableOpacity>
          
          <Text style={[
            styles.title,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>Join a Household</Text>
          <Text style={[
            styles.description,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Enter your invitation code below
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          {/* Input Field */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Icon name="key-variant" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}
                placeholder="Invitation Code"
                placeholderTextColor="#9ca3af"
                value={houseCode}
                onChangeText={setHouseCode}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Join Household Button */}
          <TouchableOpacity
            style={[styles.joinButton, loading && styles.buttonDisabled]}
            onPress={handleJoinHouse}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[
                  styles.buttonText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Joining household...</Text>
              </View>
            ) : (
              <Text style={[
                styles.buttonText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Join Household</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#dff6f0',
    top: -50,
    right: -50,
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#34d399',
    bottom: 100,
    left: -75,
    opacity: 0.1,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dff6f0',
    top: 200,
    left: 50,
    opacity: 0.3,
  },
  circle4: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34d399',
    top: 120,
    right: 20,
    opacity: 0.2,
  },
  circle5: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dff6f0',
    bottom: 200,
    right: -30,
    opacity: 0.4,
  },
  circle6: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#34d399',
    top: 300,
    left: -60,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 50,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 60,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  mainSection: {
    alignItems: 'center',
    flex: 1,
  },
  inputSection: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#374151',
  },
  joinButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default JoinHouseScreen;