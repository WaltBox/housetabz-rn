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

const { width, height } = Dimensions.get('window');

const PaymentMethodOnboardingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState(null);
  const [setupIntentId, setSetupIntentId] = useState(null); // ADD THIS LINE
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, token, refreshPaymentMethods } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  // Create setup intent when component mounts
  useEffect(() => {
    if (user && token) {
      console.log('User and token available, creating setup intent');
      createSetupIntent();
    } else {
      console.log('Waiting for user and token...', { user: !!user, token: !!token });
      const timeout = setTimeout(() => {
        if (!user || !token) {
          console.error('No user or token available after timeout');
          Alert.alert('Error', 'Authentication issue. Please try logging in again.');
        }
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [user, token]);

  const createSetupIntent = async () => {
    if (!token || !user) {
      console.error('Cannot create setup intent - missing token or user');
      return;
    }
    
    try {
      console.log('Creating setup intent with token:', token ? 'Token exists' : 'No token');
      console.log('User:', user ? user.id : 'No user');
      
      const response = await apiClient.post('/api/payment-methods/setup-intent', {});
      console.log('Setup intent created successfully');
      setSetupIntentClientSecret(response.data.clientSecret);
      setSetupIntentId(response.data.setupIntentId); // ADD THIS LINE
    } catch (error) {
      console.error('Error creating setup intent:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error', 
          'Please try logging out and logging back in.'
        );
      } else {
        Alert.alert('Error', 'Failed to initialize payment setup. Please try again.');
      }
    }
  };

  // ADD THIS NEW FUNCTION
  const completeSetupIntent = async () => {
    if (!setupIntentId) {
      console.error('No setupIntentId available for completion');
      return false;
    }

    try {
      console.log('Completing setup intent:', setupIntentId);
      const response = await apiClient.post('/api/payment-methods/complete', {
        setupIntentId: setupIntentId
      });
      console.log('Setup intent completed successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Error completing setup intent:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to save payment method. Please try again.'
      );
      return false;
    }
  };

  const handleGetStarted = async () => {
    if (!setupIntentClientSecret) {
      Alert.alert('Error', 'Payment setup not ready. Please try again.');
      return;
    }

    setLoading(true);
    try {
      console.log('Initializing PaymentSheet with custom styling...');
      
      // Initialize PaymentSheet with extensive customization
      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: setupIntentClientSecret,
        merchantDisplayName: 'HouseTabz',
        allowsDelayedPaymentMethods: true,
        returnURL: 'housetabz://payment-return',
        appearance: {
          colors: {
            primary: '#34d399',
            background: '#ffffff',
            componentBackground: '#f8fafc',
            componentBorder: '#34d399',
            componentDivider: '#e2e8f0',
            primaryText: '#1e293b',
            secondaryText: '#64748b',
            componentText: '#374151',
            placeholderText: '#9ca3af',
            icon: '#34d399',
            error: '#ef4444',
            danger: '#ef4444'
          },
          shapes: {
            borderRadius: 16,
            borderWidth: 2,
            shadow: {
              color: '#000000',
              opacity: 0.1,
              offset: { width: 0, height: 4 },
              blurRadius: 8
            }
          },
          primaryButton: {
            colors: {
              background: '#34d399',
              text: '#ffffff',
              border: '#34d399'
            },
            shapes: {
              borderRadius: 12,
              borderWidth: 0
            },
            typography: {
              fontWeight: '600'
            }
          }
        },
        defaultBillingDetails: {
          name: user?.username || '',
          email: user?.email || ''
        }
      });

      if (initError) {
        console.error('PaymentSheet init error:', initError);
        Alert.alert('Error', initError.message);
        return;
      }

      console.log('Presenting PaymentSheet immediately...');
      
      // Present PaymentSheet immediately
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          console.log('User canceled payment sheet');
          return;
        }
        console.error('PaymentSheet present error:', presentError);
        Alert.alert('Error', presentError.message);
        return;
      }

      console.log('PaymentSheet completed successfully');

      // REPLACE THE EXISTING COMPLETION LOGIC WITH THIS:
      // Complete the setup intent on the backend to save the payment method
      const completionSuccess = await completeSetupIntent();
      
      if (completionSuccess) {
        // Refresh payment methods to update the UI state
        await refreshPaymentMethods();
        
        // Success message - AppNavigator will handle navigation automatically
        Alert.alert('Success!', 'Payment method added successfully');
      }

    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to add payment method. Please try again.'
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
          <TouchableOpacity
            style={[styles.continueButton, (loading || !setupIntentClientSecret) && styles.buttonDisabled]}
            onPress={handleGetStarted}
            disabled={loading || !setupIntentClientSecret}
          >
            <LinearGradient
              colors={setupIntentClientSecret ? ['#34d399', '#10b981'] : ['#9ca3af', '#6b7280']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[
                    styles.buttonText,
                    fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                  ]}>Setting up...</Text>
                </View>
              ) : (
                <Text style={[
                  styles.buttonText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={[
            styles.disclaimer,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
           This card will not be charged unless you make authorized payments.
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
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#34d399',
  },
  buttonGradient: {
    flex: 1,
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
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default PaymentMethodOnboardingScreen;