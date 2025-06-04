import React, { useState, useRef, useEffect } from 'react';
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

const VerifyResetCodeScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordResetCode, verifyResetCode } = useAuth();
  
  // Create refs for each input
  const inputRefs = useRef([]);

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  // Set up refs when component mounts
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);
  
  // Handle input changes and auto-focus next field
  const handleCodeChange = (text, index) => {
    // Only allow digits
    if (!/^\d*$/.test(text)) return;
    
    const newCode = [...code];
    // Only take the last character if multiple are pasted or entered
    newCode[index] = text.slice(-1);
    setCode(newCode);
    
    // Auto focus next input if current input is filled
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyPress = ({ nativeEvent }, index) => {
    // Handle backspace
    if (nativeEvent.key === 'Backspace') {
      const newCode = [...code];
      
      // If current field is empty and we're not at the first field, go back
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      } else if (code[index]) {
        // If current field has a value, clear it
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };
  
  const handleVerify = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Verify the code with your API
      await verifyResetCode(email, fullCode);
      
      // Only navigate to the next screen if verification succeeds
      navigation.navigate('SetNewPassword', { email, code: fullCode });
    } catch (error) {
      setError('Invalid or expired code. Please try again.');
      console.error('Code verification error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    try {
      setLoading(true);
      await requestPasswordResetCode(email);
      setError('');
      alert('A new verification code has been sent to your email');
    } catch (error) {
      setError('Failed to resend code. Please try again.');
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
          ]}>Verify Your Email</Text>
          <Text style={[
            styles.description,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Enter the 6-digit code sent to {email}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.codeInput,
                  fontsLoaded && { fontFamily: 'Poppins-Bold' }
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? (
            <Text style={[
              styles.errorText,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>{error}</Text>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[
                  styles.buttonText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Verifying...</Text>
              </View>
            ) : (
              <Text style={[
                styles.buttonText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.linkRow}>
            <Text style={[
              styles.linkText,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>Didn't receive the code? </Text>
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={[
                styles.linkButtonText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>Resend</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[
              styles.dividerText,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={[
              styles.secondaryButtonText,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>Try Different Email</Text>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 45,
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1f2937',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  verifyButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  linkText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkButtonText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '500',
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
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#34d399',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#34d399',
    fontWeight: '600',
  },
});

export default VerifyResetCodeScreen;