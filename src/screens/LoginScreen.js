import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    // Dismiss keyboard first to prevent UI jumps
    Keyboard.dismiss();
    
    try {
      setLoading(true);
      
      // Perform the login - this should set the token in AuthContext
      await login(email, password);
      
      // The AuthContext and AppNavigator will handle the rest
      // No need to manually check payment methods here since
      // AppNavigator will do it automatically
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login';
  
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error';
      } else if (error.request) {
        errorMessage = 'Could not connect to server';
      } else {
        errorMessage = error.message || errorMessage;
      }
  
      Alert.alert('Login Failed', errorMessage);
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
          <View style={styles.logoSection}>
            <Image
              source={{ uri: 'https://housetabz-assets.s3.us-east-1.amazonaws.com/assets/housetabzlogo-update.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[
              styles.welcomeText,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>Welcome to </Text>
            <Text style={[
              styles.appName,
              fontsLoaded && { fontFamily: 'Montserrat-Black' }
            ]}>HouseTabz</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          <Text style={[
            styles.description,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Sign in to access your HouseTabz
          </Text>
          
          {/* Input Fields */}
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
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!loading}
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[
                  styles.buttonText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Signing in...</Text>
              </View>
            ) : (
              <Text style={[
                styles.buttonText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.forgotButton, loading && styles.linkDisabled]}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={[
              styles.forgotText,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>Forgot your password?</Text>
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
            style={[styles.registerButton, loading && styles.linkDisabled]}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={[
              styles.registerText,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>Create new account</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 50,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1f2937',
    textAlign: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 16,
    textAlign: 'center',
  },
  mainSection: {
    alignItems: 'center',
    paddingVertical: 20,
    flex: 1,
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
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputSection: {
    width: '100%',
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
  bottomSection: {
    alignItems: 'center',
  },
  loginButton: {
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
  forgotButton: {
    paddingVertical: 12,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
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
  registerButton: {
    borderWidth: 2,
    borderColor: '#34d399',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  registerText: {
    fontSize: 16,
    color: '#34d399',
    fontWeight: '600',
  },
  linkDisabled: {
    opacity: 0.5,
  },
  spacer: {
    flex: 1,
  },
});

export default LoginScreen;