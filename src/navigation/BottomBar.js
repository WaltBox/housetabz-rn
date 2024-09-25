import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ViewCompanyCard from '../screens/ViewCompanyCard';
import MyHouseScreen from '../screens/MyHouseScreen';
import Icon from 'react-native-vector-icons/Ionicons';
const Dashboard = createStackNavigator();
const MyHouse = createStackNavigator();
const Market = createStackNavigator();
const Tab = createBottomTabNavigator();
const DashboardStack = () => {
    return (
        <Dashboard.Navigator
        screenOptions={{
            headerShown: false
        }}
        >
            <Dashboard.Screen name="Home" component={HomeScreen}/>
            <Dashboard.Screen name="Marketplace" component={MarketplaceScreen}/>
        </Dashboard.Navigator>
    );
};
const MyHouseStack = ()  => {
    return (
        <MyHouse.Navigator
        screenOptions={{
            headerShown: false
        }}
        >
            <MyHouse.Screen name="MyHouse" component={MyHouseScreen} />
        </MyHouse.Navigator>
    );
};
const MarketplaceStack = () => {
    return (
        <Market.Navigator
        screenOptions={{
            headerShown: false
        }}
        >
            <Market.Screen name="Marketplace" component={MarketplaceScreen}/>
            <Market.Screen name="ViewCompanyCard" component={ViewCompanyCard} options={{ title: 'Company Details' }} />
        </Market.Navigator>
    );
};
const TabNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'My House') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name == 'Make Payment') {
                iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name == 'Marketplace') {
                iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name == 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: 'gray',
        })}>
                <Tab.Screen name="Dashboard" component={DashboardStack}/>
                <Tab.Screen name="My House" component={MyHouseStack}/>
                <Tab.Screen name="Make Payment" component={DashboardStack}/>
                <Tab.Screen name="Marketplace" component={MarketplaceStack}/>
                <Tab.Screen name="Profile" component={DashboardStack}/>
            </Tab.Navigator>
        </NavigationContainer>
    );
};
export default TabNavigator;