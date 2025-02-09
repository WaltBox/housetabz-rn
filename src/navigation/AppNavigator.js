// src/navigation/AppNavigator.js
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
import ViewPlansScreen from '../screens/ViewPlansScreen';
import ViewForm from '../screens/ViewForm';
import ViewPlansCard from '../screens/ViewPlansCard';
import DashboardScreen from '../screens/DashboardScreen';
import InAppBrowser from '../screens/InAppBrowser';
import PaymentMethodsSettings from '../modals/PaymentMethodsSettings';
import TabNavigator from './BottomBar';

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
      <Stack.Screen name="ViewPlans" component={ViewPlansScreen} />
      <Stack.Screen name="ViewForm" component={ViewForm} />
    </Stack.Group>

    {/* Modal Screens */}
    <Stack.Group screenOptions={{ 
      presentation: 'modal',
      headerShown: true,
    }}>
      <Stack.Screen 
        name="ViewCompanyCard" 
        component={ViewCompanyCard}
        options={{ 
          title: 'Company Details',
        }}
      />
      <Stack.Screen 
        name="ViewPlansCard" 
        component={ViewPlansCard}
        options={{ 
          title: 'Company Details',
        }}
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

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;