import 'react-native-gesture-handler';
import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import Constants from 'expo-constants';

const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY || 'your_publishable_key_here';

const App = () => {
  return (
    <AuthProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <AppNavigator />
      </StripeProvider>
    </AuthProvider>
  );
};

export default App;