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
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import apiClient from '../config/api';
import { keychainHelpers, KEYCHAIN_SERVICES } from '../utils/keychainHelpers';

const CreateHouseScreen = ({ navigation }) => {
  const [houseData, setHouseData] = useState({
    name: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [loading, setLoading] = useState(false);
  const { user, setUser, updateUserHouse } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const handleCreateHouse = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    if (!houseData.name || !houseData.city || !houseData.state || !houseData.zip_code) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...houseData, creator_id: user.id };
      const response = await apiClient.post('/api/houses', payload);
      const createdHouse = response.data.house;
      
      console.log('✅ Create house response:', {
        hasHouse: !!createdHouse,
        houseId: createdHouse?.id,
        houseName: createdHouse?.name
      });
      
      await updateUserHouse(createdHouse.id);
      
      // Update user's onboarding step to 'payment' after creating house
      const userWithPaymentStep = { ...user, houseId: createdHouse.id, onboarding_step: 'payment' };
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(userWithPaymentStep));
      setUser(userWithPaymentStep);
      
      console.log('✅ After setting payment step user state:', {
        onboardingStep: userWithPaymentStep.onboarding_step,
        houseId: userWithPaymentStep.houseId
      });
      
      Alert.alert('Success', 'House created successfully! 🎉');
      
      // AppNavigator will now show PaymentMethodOnboardingScreen since onboarding_step is 'payment'
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
          ]}>Create New House</Text>
          <Text style={[
            styles.description,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Set up your house
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          {/* Input Fields */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Icon name="home-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}
                placeholder="House Name"
                placeholderTextColor="#9ca3af"
                value={houseData.name}
                onChangeText={(text) => setHouseData({ ...houseData, name: text })}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="city-variant-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}
                placeholder="City"
                placeholderTextColor="#9ca3af"
                value={houseData.city}
                onChangeText={(text) => setHouseData({ ...houseData, city: text })}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="map-marker-radius" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}
                placeholder="State (e.g., TX)"
                placeholderTextColor="#9ca3af"
                value={houseData.state}
                onChangeText={(text) => setHouseData({ ...houseData, state: text.toUpperCase() })}
                maxLength={2}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="numeric" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}
                placeholder="Zip Code"
                placeholderTextColor="#9ca3af"
                value={houseData.zip_code}
                onChangeText={(text) => setHouseData({ ...houseData, zip_code: text })}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </View>

          {/* Create House Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.buttonDisabled]}
            onPress={handleCreateHouse}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[
                  styles.buttonText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Creating house...</Text>
              </View>
            ) : (
              <Text style={[
                styles.buttonText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Create House</Text>
            )}
          </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
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
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 50,
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
    marginBottom: 16,
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
  createButton: {
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

export default CreateHouseScreen;