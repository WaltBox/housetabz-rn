import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext'; 
import AppNavigator from './src/navigation/AppNavigator';
import Constants from 'expo-constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform, DeviceEventEmitter } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useAuth } from './src/context/AuthContext';
import { keychainHelpers, KEYCHAIN_SERVICES } from './src/utils/keychainHelpers';

// Import custom loading screen
import HouseTabzLoadingScreen from './src/components/HouseTabzLoadingScreen';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Use your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51NK4ivCh7Bf0jit7LcAU4oNYeHQ5Oy2IGNSWdbdNP56LJ7Hwh6Cu7aDGRIDRkDRhOPIGXfLhf0utUhAi67KvBbO900PnrZ4MBE';

const App = () => {
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('./assets/fonts/Montserrat-Black.ttf'),
    'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
    'Quicksand-Bold': require('./assets/fonts/Quicksand-Bold.ttf'),
  });

  // Show custom loading screen while fonts load
  if (!fontsLoaded) {
    return <HouseTabzLoadingScreen message="Loading fonts..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Separate component to access useAuth hook
const AppContent = () => {
  const { loading } = useAuth();

  // Show custom loading screen while auth is loading
  if (loading) {
    return <HouseTabzLoadingScreen />;
  }

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.housetabz"
      urlScheme="housetabz"
      threeDSecureParams={{
        backgroundColor: "#fff",
        timeout: 5,
      }}
    >
      <PushNotificationHandler>
        <AppNavigator />
      </PushNotificationHandler>
    </StripeProvider>
  );
};

// PushNotificationHandler component
const PushNotificationHandler = ({ children }) => {
  const { user, token } = useAuth();
  const [deviceToken, setDeviceToken] = useState(null);
  const isConfigured = useRef(false);

  // Listen to the native event "remoteNotificationsRegistered" for the token
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('remoteNotificationsRegistered', (data) => {
      if (data && data.deviceToken) {
        const tokenString = data.deviceToken.replace(/[<\s>]/g, '');
        console.log('Received native push token:', tokenString);
        keychainHelpers.setSecureData(KEYCHAIN_SERVICES.DEVICE_TOKEN, tokenString)
          .then(() => setDeviceToken(tokenString))
          .catch(err => console.error('Keychain error:', err));
      }
    });
    return () => subscription.remove();
  }, []);

  // Configure push notifications
  useEffect(() => {
    if (isConfigured.current) return;
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel',
          channelName: 'Default channel',
          channelDescription: 'Default notification channel',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }

    isConfigured.current = true;
    return () => {
      PushNotification.unregister();
    };
  }, []);

  // On mount, load any saved token, and if logged in, register it
  useEffect(() => {
    const loadSavedToken = async () => {
      try {
        const savedToken = await keychainHelpers.getSecureData(KEYCHAIN_SERVICES.DEVICE_TOKEN);
        if (savedToken) {
          console.log('Loaded saved device token from Keychain:', savedToken);
          setDeviceToken(savedToken);
          if (user && token) {
            console.log('User is logged in, registering token with backend');
            registerTokenWithBackend(savedToken);
          }
        }
      } catch (error) {
        console.error('Error loading saved token from Keychain:', error);
      }
    };
    loadSavedToken();
  }, [user, token]);

  // When the user and token are available, register the device token
  useEffect(() => {
    if (user && token && deviceToken) {
      console.log('Both user and device token available, registering with backend');
      registerTokenWithBackend(deviceToken);
    }
  }, [user, token, deviceToken]);

  // Function to register token with backend
  const registerTokenWithBackend = (tokenString) => {
    if (!user || !token) {
      console.log('Cannot register device token - user not authenticated');
      return;
    }
    console.log('Registering token with backend:', tokenString);
    fetch('https://api.housetabz.com/api/users/device-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceToken: tokenString,
        deviceType: Platform.OS,
      }),
    })
      .then(response => {
        console.log('Registration response status:', response.status);
        return response.text();
      })
      .then(text => console.log('Registration response:', text))
      .catch(error => console.error('Registration error:', error));
  };

  return <>{children}</>;
};

export default App;