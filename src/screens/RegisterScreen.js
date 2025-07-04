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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [smsConsent, setSmsConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.username || !formData.phoneNumber) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'Your passwords do not match');
      return;
    }

    // Very basic phone number validation - just check it's not empty
    if (formData.phoneNumber.trim().length < 6) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return;
    }

    // Check SMS consent
    if (!smsConsent) {
      Alert.alert('SMS Consent Required', 'Please agree to receive SMS notifications to continue. These are required for payment reminders.');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        smsConsent: smsConsent,
      });
    } catch (error) {
      Alert.alert(
        'Registration Error',
        error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[
              styles.title,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>Create Your Account</Text>
            <Text style={[
              styles.description,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>
              Join HouseTabz and share your expenses.
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainSection}>
            {/* Input Fields */}
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <Icon name="account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}
                  placeholder="Username"
                  placeholderTextColor="#9ca3af"
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="email-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}
                  placeholder="Email address"
                  placeholderTextColor="#9ca3af"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="phone-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}
                  placeholder="Phone number"
                  placeholderTextColor="#9ca3af"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock-check-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9ca3af"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>
            </View>

            {/* SMS Consent Section */}
            <TouchableOpacity 
              style={styles.consentContainer}
              onPress={() => setSmsConsent(!smsConsent)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, smsConsent && styles.checkboxChecked]}>
                {smsConsent && (
                  <Icon name="check" size={14} color="white" />
                )}
              </View>
              <Text style={[
                styles.consentText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                I agree to receive SMS notifications from HouseTabz for payment reminders
              </Text>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[
                    styles.buttonText,
                    fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                  ]}>Creating account...</Text>
                </View>
              ) : (
                <Text style={[
                  styles.buttonText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={[
                styles.dividerText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>Already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[
                styles.loginText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Sign In Instead</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    position: 'relative',
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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  mainSection: {
    alignItems: 'center',
    flex: 1,
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
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
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  registerButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 14,
    color: '#9ca3af',
    marginHorizontal: 16,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: '#34d399',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  loginText: {
    fontSize: 16,
    color: '#34d399',
    fontWeight: '600',
  },
});

export default RegisterScreen;