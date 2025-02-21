import 'react-native-gesture-handler';
import React from 'react';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import Constants from 'expo-constants';

const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51NK4ivCh7Bf0jit7LcAU4oNYeHQ5Oy2IGNSWdbdNP56LJ7Hwh6Cu7aDGRIDRkDRhOPIGXfLhf0utUhAi67KvBbO900PnrZ4MBE';

const App = () => {
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('./assets/fonts/Montserrat-Black.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <AuthProvider>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.housetabz"
        urlScheme="housetabz"
        threeDSecureParams={{
          backgroundColor: "#fff",
          timeout: 5,
        }}
      >
        <AppNavigator />
      </StripeProvider>
    </AuthProvider>
  );
};

export default App;
