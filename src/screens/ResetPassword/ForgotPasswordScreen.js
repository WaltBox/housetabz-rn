import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordResetCode } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const handleSubmit = async () => {
    // Basic email validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await requestPasswordResetCode(email);
      // Navigate to verification screen
      navigation.navigate('VerifyResetCode', { email });
    } catch (error) {
      setError('Error sending reset code. Please try again.');
      console.error('Reset code request error:', error);
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
          ]}>Reset Password</Text>
          <Text style={[
            styles.description,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Enter your email address and we'll send you a code to reset your password
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          {/* Input Field */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {error ? (
            <Text style={[
              styles.errorText,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>{error}</Text>
          ) : null}

          {/* Send Reset Code Button */}
          <TouchableOpacity
            style={[styles.resetButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[
                  styles.buttonText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Sending code...</Text>
              </View>
            ) : (
              <Text style={[
                styles.buttonText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Send Reset Code</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[
              styles.dividerText,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[
              styles.loginText,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>Back to Login</Text>
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
    marginBottom: 40,
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
    marginBottom: 24,
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
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  resetButton: {
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

export default ForgotPasswordScreen;