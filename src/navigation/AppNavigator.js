import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ResetPassword/ForgotPasswordScreen';
import VerifyResetCodeScreen from '../screens/ResetPassword/VerifyResetCodeScreen';
import ResetPasswordSuccessScreen from '../screens/ResetPassword/ResetPasswordSuccessScreen';
import SetNewPasswordScreen from '../screens/ResetPassword/SetNewPasswordScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Onboarding Screens
import PaymentMethodOnboardingScreen from '../screens/PaymentMethodOnboardingScreen';

// App Screens
import HouseTabzLoadingScreen from '../components/HouseTabzLoadingScreen'; // Changed this line
import PartnersScreen from '../screens/PartnersScreen';
import ViewCompanyCard from '../modals/ViewCompanyCard';
import DashboardScreen from '../screens/DashboardScreen';
import HouseServicesScreen from '../screens/HouseServicesScreen';
import InAppBrowser from '../screens/InAppBrowser';
import PaymentMethodsSettings from '../modals/PaymentMethodsSettings';
import TabNavigator from './BottomBar';
import TermsOfService from '../components/TermsOfService';

// Bill Takeover Screens
import BillTakeoverScreen from '../screens/BillTakeOverScreen';

// New House Setup Screens
import HouseOptionsScreen from '../screens/HouseOptionsScreen';
import CreateHouseScreen from '../screens/CreateHouseScreen';
import JoinHouseScreen from '../screens/JoinHouseScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyResetCode" component={VerifyResetCodeScreen} />
    <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
    <Stack.Screen name="ResetPasswordSuccess" component={ResetPasswordSuccessScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Group screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="HouseServices" component={HouseServicesScreen} />
      <Stack.Screen name="Marketplace" component={PartnersScreen} />
      <Stack.Screen name="InAppBrowser" component={InAppBrowser} />
      
      {/* Add Bill Takeover Screen */}
      <Stack.Screen name="BillTakeover" component={BillTakeoverScreen} />
    </Stack.Group>

    {/* Modal Screens */}
    <Stack.Group screenOptions={{ 
      presentation: 'modal',
      headerShown: true,
    }}>
      <Stack.Screen 
        name="ViewCompanyCard" 
        component={ViewCompanyCard}
        options={{ title: 'Company Details' }}
      />
    
      <Stack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsSettings}
        options={{
          title: 'Payment Methods',
          headerBackTitle: 'Settings',
        }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

// Payment method onboarding (mandatory)
const PaymentOnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="PaymentMethodOnboarding" 
      component={PaymentMethodOnboardingScreen} 
    />
  </Stack.Navigator>
);

// House setup onboarding (after payment method is added)
const HouseOnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="HouseOptionsScreen" 
      component={HouseOptionsScreen} 
    />
    <Stack.Screen 
      name="CreateHouse" 
      component={CreateHouseScreen} 
    />
    <Stack.Screen 
      name="JoinHouse" 
      component={JoinHouseScreen} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading, hasPaymentMethods, checkPaymentMethods } = useAuth();
  const [checkingPayments, setCheckingPayments] = useState(false);

  // Check payment methods when user becomes available (for app startup)
  useEffect(() => {
    const checkPaymentsOnStartup = async () => {
      if (user && hasPaymentMethods === null && !checkingPayments) {
        console.log('Checking payment methods on app startup...');
        setCheckingPayments(true);
        try {
          const result = await checkPaymentMethods();
          console.log('Payment methods check result:', result);
        } catch (error) {
          console.error('Error checking payment methods on startup:', error);
        } finally {
          setCheckingPayments(false);
        }
      }
    };

    checkPaymentsOnStartup();
  }, [user, hasPaymentMethods, checkingPayments]);

  // Show loading screen while initial auth load or payment check is happening
  if (loading || (user && hasPaymentMethods === null)) {
    console.log('Showing loading screen. Loading:', loading, 'User:', !!user, 'HasPaymentMethods:', hasPaymentMethods);
    return <HouseTabzLoadingScreen message="Setting up your account..." />;
  }

  console.log('AppNavigator decision - User:', !!user, 'HasPaymentMethods:', hasPaymentMethods, 'HouseId:', user?.houseId);

  return (
    <NavigationContainer>
      {user ? (
        // Check payment methods first
        hasPaymentMethods === false ? (
          // No payment methods - force payment method setup
          <PaymentOnboardingStack />
        ) : hasPaymentMethods === true ? (
          // Has payment methods, now check house status
          user.houseId ? <MainStack /> : <HouseOnboardingStack />
        ) : (
          // Still checking or undefined - show loading
          <HouseTabzLoadingScreen message="Checking payment methods..." />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;