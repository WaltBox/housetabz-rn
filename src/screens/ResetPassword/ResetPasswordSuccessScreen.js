import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

const ResetPasswordSuccessScreen = ({ navigation }) => {
  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  return (
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
      <View style={styles.circle4} />
      <View style={styles.circle5} />
      <View style={styles.circle6} />
      
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successSection}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={80} color="#34d399" />
          </View>
          
          <Text style={[
            styles.title,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>Password Reset Successful</Text>
          <Text style={[
            styles.description,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Your password has been reset successfully. You can now log in with your new password.
          </Text>
        </View>

        {/* Button Section */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[
              styles.buttonText,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>Return to Login</Text>
          </TouchableOpacity>
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
    paddingTop: 80,
    paddingBottom: 50,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#bbf7d0',
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
    paddingHorizontal: 20,
  },
  buttonSection: {
    alignItems: 'center',
  },
  loginButton: {
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
});

export default ResetPasswordSuccessScreen;