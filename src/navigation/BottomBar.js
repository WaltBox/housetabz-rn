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
import HouseServicesScreen from '../screens/HouseServicesScreen';
import ViewCompanyCard from '../modals/ViewCompanyCard';

const Tab = createBottomTabNavigator();
const Dashboard = createStackNavigator();
const MyHouse = createStackNavigator();
const Merchants = createStackNavigator();
const HouseServices = createStackNavigator();
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

const MerchantsStack = () => (
  <Merchants.Navigator screenOptions={{ headerShown: false }}>
    <Merchants.Screen name="MarketplaceScreen" component={MarketplaceScreen} />
    <Merchants.Screen name="ViewCompanyCard" component={ViewCompanyCard} options={{ title: 'Company Details' }} />
  </Merchants.Navigator>
);

const HouseServicesStack = () => (
  <HouseServices.Navigator screenOptions={{ headerShown: false }}>
    <HouseServices.Screen name="HouseServicesScreen" component={HouseServicesScreen} />
  </HouseServices.Navigator>
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

  const isMakePaymentScreen = currentRouteName === 'Pay Tab';

  const logo = isMakePaymentScreen
    ? require('../../assets/housetabzwinklogo.png')
    : require('../../assets/housetabzlogo.png');

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => navigation.navigate('Pay Tab')}
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
          } else if (route.name === 'Merchants') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'HouseServices') {
            iconName = focused ? 'wallet' : 'wallet-outline';
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
      <Tab.Screen name="HouseServices" component={HouseServicesStack} />
      <Tab.Screen name="Pay Tab" component={PaymentStack} />
      <Tab.Screen name="My House" component={MyHouseStack} />
      <Tab.Screen name="Merchants" component={MerchantsStack} />
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