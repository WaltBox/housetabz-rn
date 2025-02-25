import 'react-native-gesture-handler';
import React from 'react';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import Constants from 'expo-constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a React Query client with default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
      cacheTime: 1000 * 60 * 10, // Cache data for 10 minutes
      refetchOnWindowFocus: false, // Don't fetch when app regains focus
      retry: 1, // Only retry failed requests once
    },
  },
});

const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51NK4ivCh7Bf0jit7LcAU4oNYeHQ5Oy2IGNSWdbdNP56LJ7Hwh6Cu7aDGRIDRkDRhOPIGXfLhf0utUhAi67KvBbO900PnrZ4MBE';

const App = () => {
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('./assets/fonts/Montserrat-Black.ttf'),
    'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default App;