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
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const VerifyResetCodeScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordResetCode, verifyResetCode } = useAuth();
  
  // Create refs for each input
  const inputRefs = useRef([]);
  
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
    <LinearGradient
      colors={['#dff6f0', '#b2ece5', '#8ae4db']}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Image
          source={{ uri: 'https://housetabz-assets.s3.us-east-1.amazonaws.com/assets/housetabzlogo-update.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.card}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={28} color="#1e293b" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {email}
          </Text>
          
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Verify Code</Text>
                <Icon name="check-circle-outline" size={20} color="white" />
              </LinearGradient>
            )}
          </TouchableOpacity>
          
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Didn't receive the code? </Text>
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={styles.linkButtonText}>Resend</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Try Different Email</Text>
            <Icon name="email-edit-outline" size={18} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    color: '#1e293b',
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  linkButtonText: {
    color: '#34d399',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 25,
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});

export default VerifyResetCodeScreen;