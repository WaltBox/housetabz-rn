// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from '../screens/LoadingScreen';
import HomeScreen from '../screens/HomeScreen'; // Your main app screen
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ViewCompanyCard from '../modals/ViewCompanyCard';
import ProfileScreen from '../screens/ProfileScreen';
import ViewPlansScreen from '../screens/ViewPlansScreen';
import ViewForm from '../screens/ViewForm';
import ViewPlansCard from '../screens/ViewPlansCard';
import DashboardScreen from '../screens/DashboardScreen'; // Import your Dashboard screen
import InAppBrowser from '../screens/InAppBrowser';
import PaymentMethodsSettings from '../screens/PaymentMethodsSettings';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} /> {/* Add Dashboard here */}
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="ViewCompanyCard" component={ViewCompanyCard} options={{ title: 'Company Details' }} />
        <Stack.Screen name="InAppBrowser" component={InAppBrowser} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
       
        <Stack.Screen name="ViewPlans" component={ViewPlansScreen} />
        <Stack.Screen name="ViewPlansCard" component={ViewPlansCard} options={{ title: 'Company Details' }} />
        <Stack.Screen name="ViewForm" component={ViewForm} />
        <Stack.Screen 
  name="PaymentMethods" 
  component={PaymentMethodsSettings}
  options={{
    title: 'Payment Methods',
    headerBackTitle: 'Settings',
  }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
