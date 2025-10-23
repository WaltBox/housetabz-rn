// src/screens/PaymentMethodOnboardingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';
import { useFonts } from 'expo-font';
import { keychainHelpers, KEYCHAIN_SERVICES } from '../utils/keychainHelpers';

const { width, height } = Dimensions.get('window');

const PaymentMethodOnboardingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, setUser, refreshPaymentMethods } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const handleAddPaymentMethod = async (type = 'card') => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to add a payment method');
        return;
      }
      setProcessing(true);
      
      // Determine which endpoint to use based on payment method type
      const endpoint = type === 'ach' 
        ? '/api/payment-methods/setup-intent/ach'
        : '/api/payment-methods/setup-intent';

      const setupResponse = await apiClient.post(endpoint, {});
      
      const { clientSecret, setupIntentId } = setupResponse.data;
      if (!clientSecret || !setupIntentId) {
        throw new Error('No client secret or setupIntentId received');
      }
      
      // Configure Stripe PaymentSheet based on payment method type
      const paymentSheetConfig = {
        merchantDisplayName: 'HouseTabz',
        setupIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        appearance: { colors: { primary: '#34d399' } },
      };

      // For ACH, we need to specify payment method types
      if (type === 'ach') {
        paymentSheetConfig.paymentMethodTypes = ['us_bank_account'];
      }

      const initResponse = await initPaymentSheet(paymentSheetConfig);
      
      if (initResponse.error) {
        Alert.alert('Error', initResponse.error.message);
        return;
      }
      
      const presentResponse = await presentPaymentSheet();
      if (presentResponse.error) {
        if (presentResponse.error.code === 'Canceled') return;
        Alert.alert('Error', presentResponse.error.message);
        return;
      }
      
      await apiClient.post('/api/payment-methods/complete', { setupIntentId });
      
      // Refresh payment methods
      await refreshPaymentMethods();
      
      // Mark user as fully onboarded after successful payment setup
      const onboardedUser = { ...user, onboarded: true };
      await keychainHelpers.setSecureData(KEYCHAIN_SERVICES.USER_DATA, JSON.stringify(onboardedUser));
      setUser(onboardedUser);
      
      console.log('✅ User marked as onboarded after payment method setup');
      
      // Show different success messages based on payment method type
      if (type === 'ach') {
        Alert.alert('Welcome to HouseTabz!', 'Your bank account has been linked successfully. ACH payments take 3-5 business days to process but are free of charge.');
      } else {
        Alert.alert('Welcome to HouseTabz!', 'Your credit card has been added successfully.');
      }
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add payment method. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image
              source={{ uri: 'https://housetabz-assets.s3.us-east-1.amazonaws.com/assets/housetabzlogo-update.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[
              styles.appName,
              fontsLoaded && { fontFamily: 'Montserrat-Black' }
            ]}>HouseTabz</Text>
          </View>
          
          <View style={styles.partnershipBadge}>
            <Text style={[
              styles.securedText,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}>Secured with</Text>
            <View style={styles.stripeContainer}>
              <Image
                source={require('../../assets/stripe.png')}
                style={styles.stripeLogo}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <Text style={[
            styles.securityNote,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Your payment information is securely stored by Stripe. HouseTabz never sees or stores your card details.
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          <Text style={[
            styles.title,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>Add payment method</Text>
          <Text style={[
            styles.description,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Add your payment method to start sharing with your roommies.
          </Text>
          
          {/* Security icons */}
          <View style={styles.securityRow}>
            <View style={styles.securityItem}>
              <View style={styles.iconCircle}>
                <Icon name="shield-check" size={20} color="#34d399" />
              </View>
              <Text style={[
                styles.securityLabel,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Secure</Text>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.iconCircle}>
                <Icon name="flash" size={20} color="#34d399" />
              </View>
              <Text style={[
                styles.securityLabel,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Instant</Text>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.iconCircle}>
                <Icon name="check-circle" size={20} color="#34d399" />
              </View>
              <Text style={[
                styles.securityLabel,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Trusted</Text>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.paymentButtonsContainer}>
            <TouchableOpacity
              style={[styles.paymentButton, (processing || loading) && styles.buttonDisabled]}
              onPress={() => handleAddPaymentMethod('card')}
              disabled={processing || loading}
            >
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.buttonGradient}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Icon name="credit-card" size={20} color="white" />
                    <Text style={[
                      styles.paymentButtonText,
                      fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                    ]}>Add Card</Text>
                    <Text style={[
                      styles.paymentButtonFee,
                      fontsLoaded && { fontFamily: 'Poppins-Regular' }
                    ]}>3% fee</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentButton, (processing || loading) && styles.buttonDisabled]}
              onPress={() => handleAddPaymentMethod('ach')}
              disabled={processing || loading}
            >
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.buttonGradient}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Icon name="bank" size={20} color="white" />
                    <Text style={[
                      styles.paymentButtonText,
                      fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                    ]}>Add Bank</Text>
                    <Text style={[
                      styles.paymentButtonFee,
                      fontsLoaded && { fontFamily: 'Poppins-Regular' }
                    ]}>Free</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <Text style={[
            styles.disclaimer,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
           Your payment method will not be charged unless you make authorized payments.
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 50,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
  },
  partnershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  securedText: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 8,
    fontWeight: '500',
  },
  stripeContainer: {
    backgroundColor: '#635BFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stripeLogo: {
    width: 40,
    height: 14,
    tintColor: 'white',
  },
  securityNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
    lineHeight: 16,
  },
  mainSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  securityItem: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  securityLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  bottomSection: {
    alignItems: 'center',
  },
  paymentButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  paymentButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#34d399',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  paymentButtonFee: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#64748b',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default PaymentMethodOnboardingScreen;