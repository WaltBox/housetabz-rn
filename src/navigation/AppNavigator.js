import React from 'react';
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
import PaymentMethodOnboardingScreen from '../screens/PaymentMethodOnboardingScreen';

// Rent Proposal Screens
import CreateRentProposalScreen from '../screens/CreateRentProposalScreen';
import ViewRentProposalScreen from '../screens/ViewRentProposalScreen';

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
      
      {/* Add Rent Proposal Screens */}
      <Stack.Screen name="CreateRentProposal" component={CreateRentProposalScreen} />
      <Stack.Screen name="ViewRentProposal" component={ViewRentProposalScreen} />
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

// House setup onboarding
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
    <Stack.Screen 
      name="PaymentMethodOnboarding" 
      component={PaymentMethodOnboardingScreen} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading, refreshUserData } = useAuth();

  // Add useEffect to refresh user data when AppNavigator mounts
  React.useEffect(() => {
    if (user && !loading) {
      console.log('🔄 AppNavigator mounted - refreshing user data from server...');
      refreshUserData();
    }
  }, [user?.id, loading]); // Run when user ID changes or loading completes

  // Show loading screen while initial auth load is happening
  if (loading) {
    console.log('Showing loading screen. Loading:', loading, 'User:', !!user);
    return <HouseTabzLoadingScreen />;
  }

  console.log('AppNavigator decision - User:', !!user, 'Onboarded:', user?.onboarded, 'OnboardingStep:', user?.onboarding_step);
  console.log('Full user object:', JSON.stringify(user, null, 2));

  // Function to get the right onboarding screen/stack
  const getOnboardingScreen = () => {
    console.log('🔍 Checking onboarding step:', user?.onboarding_step, 'Type:', typeof user?.onboarding_step);
    console.log('🔍 User has houseId:', user?.houseId, 'House exists:', !!user?.house);
    
    // Handle different onboarding steps
    switch (user?.onboarding_step) {
      case 'payment':
        console.log('💳 Navigating to PaymentMethodOnboardingScreen (onboarding_step: payment)');
        return <PaymentMethodOnboardingScreen />;
      
      case 'completed':
        // This shouldn't happen since onboarded should be true, but handle gracefully
        console.log('✅ Onboarding step is completed but user.onboarded is false - navigating to MainStack');
        return <MainStack />;
      
      case 'house':
      case undefined:
      default:
        // If user has a house but onboarding_step is undefined/house, infer they need payment setup
        if (user?.houseId && user?.house && !user?.onboarding_step) {
          console.log('💳 Navigating to PaymentMethodOnboardingScreen (has house but missing onboarding_step)');
          return <PaymentMethodOnboardingScreen />;
        }
        
        console.log('🏠 Navigating to HouseOnboardingStack (onboarding_step: house or no house)');
        return <HouseOnboardingStack />;
    }
  };

  return (
    <NavigationContainer>
      {user ? (
        // Check if user is onboarded
        user.onboarded ? (
          <>
            {console.log('🚀 Navigating to MainStack (user is onboarded)')}
            <MainStack />
          </>
        ) : (
          getOnboardingScreen()
        )
      ) : (
        <>
          {console.log('🔐 Navigating to AuthStack (no user)')}
        <AuthStack />
        </>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;