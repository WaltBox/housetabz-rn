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
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SetNewPasswordScreen = ({ route, navigation }) => {
  const { email, code } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPasswordWithCode } = useAuth();
  
  const handleResetPassword = async () => {
    // Validation
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await resetPasswordWithCode(email, code, newPassword);
      // Navigate to success screen
      navigation.navigate('ResetPasswordSuccess');
    } catch (error) {
      setError('Failed to reset password. Please try again.');
      console.error('Password reset error:', error);
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
          
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Create a new password for your account
          </Text>
          
          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color="#4b5563" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#9ca3af"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Icon name="lock-check-outline" size={20} color="#4b5563" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Reset Password</Text>
                <Icon name="lock-reset" size={20} color="white" />
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
});

export default SetNewPasswordScreen;