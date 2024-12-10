import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import TopBar from './TopBar'; // Assuming this is your custom component
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ViewCompanyCard from '../screens/ViewCompanyCard';
import ViewPlansCard from '../screens/ViewPlansCard';
import ViewPlansScreen from '../screens/ViewPlansScreen';
import ViewForm from '../screens/ViewForm'; // Adjust the path as necessary
import MyHouseScreen from '../screens/MyHouseScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MakePaymentScreen from '../screens/MakePaymentScreen';

const Tab = createBottomTabNavigator();
const Dashboard = createStackNavigator();
const MyHouse = createStackNavigator();
const Market = createStackNavigator();
const Profile = createStackNavigator();
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
    <Market.Screen name="ViewPlans" component={ViewPlansScreen} />
    <Market.Screen name="ViewPlansCard" component={ViewPlansCard} options={{ title: 'Company Details' }} />
    <Market.Screen name="ViewForm" component={ViewForm} />
  </Market.Navigator>
);

const ProfileStack = () => (
  <Profile.Navigator screenOptions={{ headerShown: false }}>
    <Profile.Screen name="ProfileScreen" component={ProfileScreen} />
  </Profile.Navigator>
);

const PaymentStack = () => (
  <Payment.Navigator screenOptions={{ headerShown: false }}>
    <Payment.Screen name="MakePaymentScreen" component={MakePaymentScreen} />
  </Payment.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') {
          iconName = focused ? 'grid' : 'grid-outline';
        } else if (route.name === 'My House') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Make Payment') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Marketplace') {
          iconName = focused ? 'cart' : 'cart-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      headerShown: false,
      tabBarActiveTintColor: 'green',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen name="My House" component={MyHouseStack} />
    <Tab.Screen name="Make Payment" component={PaymentStack} />
    <Tab.Screen name="Marketplace" component={MarketplaceStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

const App = () => (
  <React.Fragment>
    <TopBar />
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  </React.Fragment>
);

export default App;
