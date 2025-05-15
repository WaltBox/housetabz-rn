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

// App Screens
import LoadingScreen from '../screens/LoadingScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
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
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
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

// New stack for house setup (for users who have no houseId)
const HouseStack = () => (
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
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? (
        // If the user exists, check if they've joined/created a house.
        // If not, show the HouseStack so they can choose an option.
        user.houseId ? <MainStack /> : <HouseStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;