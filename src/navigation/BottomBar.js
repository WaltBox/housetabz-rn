import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer, useNavigation, useNavigationState } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import TopBar from './TopBar';
import DashboardScreen from '../screens/DashboardScreen';
import MyHouseScreen from '../screens/MyHouseScreen';
import MakePaymentScreen from '../screens/MakePaymentScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ViewCompanyCard from '../modals/ViewCompanyCard';
import ViewPlansScreen from '../screens/ViewPlansScreen';
import ViewPlansCard from '../screens/ViewPlansCard';
import ViewForm from '../screens/ViewForm';
import InAppBrowser from '../screens/InAppBrowser';
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
      <Market.Screen name="InAppBrowser" component={InAppBrowser} />
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

const FloatingButton = () => {
    const navigation = useNavigation();
  
    const currentRouteName = useNavigationState((state) =>
      state?.routes?.[state.index]?.name || null
    );
  
    const isMakePaymentScreen = currentRouteName === 'Make Payment';
  
    const logo = isMakePaymentScreen
      ? require('../../assets/housetabzwinklogo.png') // Winking logo
      : require('../../assets/housetabzlogo.png'); // Regular logo
  
    return (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Make Payment')}
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
    );
  };
  
  
  

  const TabNavigator = ({ navigation }) => (
    <View style={{ flex: 1 }}>
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
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return iconName ? <Icon name={iconName} size={size} color={color} /> : null;
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
  
      {/* Pass the navigation prop explicitly */}
      <FloatingButton navigation={navigation} />
    </View>
  );
  
  

  const App = () => (
    <NavigationContainer>
      <React.Fragment>
        <TopBar />
        <TabNavigator />
      </React.Fragment>
    </NavigationContainer>
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
    shadowColor: '#22C55E',
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

export default App;
