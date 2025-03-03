// src/navigation/BottomBar.js
import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import TopBar from './TopBar';
import DashboardScreen from '../screens/DashboardScreen';
import MyHouseScreen from '../screens/MyHouseScreen';
import MakePaymentScreen from '../screens/MakePaymentScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import TakeOverScreen from '../screens/TakeOverScreen';
import ViewCompanyCard from '../modals/ViewCompanyCard';


const Tab = createBottomTabNavigator();
const Dashboard = createStackNavigator();
const MyHouse = createStackNavigator();
const Market = createStackNavigator();
const TakeOver = createStackNavigator();
const Payment = createStackNavigator();

const DashboardStack = () => (
  <Dashboard.Navigator screenOptions={{ headerShown: false }}>
    <Dashboard.Screen name="DashboardScreen" component={DashboardScreen} />
  </Dashboard.Navigator>
);

const MyHouseStack = () => (
  <MyHouse.Navigator screenOptions={{ headerShown: false }}>
    <MyHouse.Screen name="MyHouse" component={MyHouseScreen} />
  </MyHouse.Navigator>
);

const MarketplaceStack = () => (
  <Market.Navigator screenOptions={{ headerShown: false }}>
    <Market.Screen name="MarketplaceScreen" component={MarketplaceScreen} />
    <Market.Screen name="ViewCompanyCard" component={ViewCompanyCard} options={{ title: 'Company Details' }} />
 
  </Market.Navigator>
);

const TakeOverStack = () => (
  <TakeOver.Navigator screenOptions={{ headerShown: false }}>
    <TakeOver.Screen name="TakeOverScreen" component={TakeOverScreen} />
  </TakeOver.Navigator>
);

const PaymentStack = () => (
  <Payment.Navigator screenOptions={{ headerShown: false }}>
    <Payment.Screen name="MakePaymentScreen" component={MakePaymentScreen} />
  </Payment.Navigator>
);

const FloatingButton = () => {
  const navigation = useNavigation();

  const currentRouteName = useNavigationState((state) =>
    state?.routes?.[state.index]?.name || null
  );

  const isMakePaymentScreen = currentRouteName === 'Make Payment';

  const logo = isMakePaymentScreen
    ? require('../../assets/housetabzwinklogo.png')
    : require('../../assets/housetabzlogo.png');

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => navigation.navigate('Make Payment')}
    >
      <Image source={logo} style={styles.logo} resizeMode="contain" />
    </TouchableOpacity>
  );
};

const TabNavigator = () => (
  <View style={{ flex: 1, backgroundColor: '#dff6f0' }}>
    <TopBar />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'My House') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'TakeOver') {
            iconName = focused ? 'flash' : 'flash-outline';
          }
          return iconName ? <Icon name={iconName} size={typeof size === 'number' ? size : 24} color="#34d399" /> : null;
        },
        headerShown: false,
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          backgroundColor: '#dff6f0',
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 2,
          borderTopColor: 'white',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="My House" component={MyHouseStack} />
      <Tab.Screen name="Make Payment" component={PaymentStack} />
      <Tab.Screen name="Marketplace" component={MarketplaceStack} />
      <Tab.Screen name="TakeOver" component={TakeOverStack} />
    </Tab.Navigator>

    <FloatingButton />
  </View>
);

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 50,
    height: 50,
  },
});

export default TabNavigator;