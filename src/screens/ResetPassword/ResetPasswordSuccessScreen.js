import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ResetPasswordSuccessScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#dff6f0', '#b2ece5', '#8ae4db']}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://housetabz-assets.s3.us-east-1.amazonaws.com/assets/housetabzlogo-update.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.card}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={80} color="#34d399" />
          </View>
          
          <Text style={styles.title}>Password Reset Successful</Text>
          <Text style={styles.subtitle}>
            Your password has been reset successfully. You can now log in with your new password.
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={['#34d399', '#10b981']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Return to Login</Text>
              <Icon name="login" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
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
});

export default ResetPasswordSuccessScreen;