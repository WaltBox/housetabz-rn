import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// App Screens
import LoadingScreen from '../screens/LoadingScreen';
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ViewCompanyCard from '../modals/ViewCompanyCard';
import ProfileScreen from '../screens/ProfileScreen';


import DashboardScreen from '../screens/DashboardScreen';
import InAppBrowser from '../screens/InAppBrowser';
import PaymentMethodsSettings from '../modals/PaymentMethodsSettings';
import TabNavigator from './BottomBar';

// Bill Takeover Screens
import BillTakeoverScreen from '../screens/BillTakeOverScreen';

// New House Setup Screens
import HouseOptionsScreen from '../screens/HouseOptionsScreen';
import CreateHouseScreen from '../screens/CreateHouseScreen';
import JoinHouseScreen from '../screens/JoinHouseScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ 
        title: 'Login',
        headerShown: false 
      }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{ 
        title: 'Create Account',
        headerShown: false 
      }}
    />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Group screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="InAppBrowser" component={InAppBrowser} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
     
      
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