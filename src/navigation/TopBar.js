import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
import { useNavigationState } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { scrollEmitter } from '../utils/eventEmitter';
import ModalComponent from '../components/ModalComponent';
import SettingsModal from '../modals/SettingsModal';
import NotificationsModal from '../modals/NotificationsModal';
import UserFeedbackModal from '../modals/UserFeedbackModal';
import PaymentMethodsSettings from '../modals/PaymentMethodsSettings';
import apiClient from '../config/api';

const { height } = Dimensions.get('window');

const TopBar = () => {
  const { user: authUser } = useAuth();
  const [isDashboard, setIsDashboard] = useState(true); // Default to true to prevent flash
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // State for house name
  const [houseName, setHouseName] = useState(null);
  
  // Get current route name for dynamic title
  const currentRouteName = useNavigationState((state) => {
    console.log('🔥 ROUTE DEBUG: Full navigation state:', JSON.stringify(state, null, 2));
    
    if (!state) {
      console.log('🔥 ROUTE DEBUG: No state, returning Dashboard');
      return 'Dashboard'; // Default to Dashboard during initial load
    }
    
    // Navigate through the navigation structure to find the actual tab
    let currentRoute = state;
    
    // Keep drilling down until we find the actual tab
    while (currentRoute && currentRoute.routes && currentRoute.routes.length > 0) {
      const activeRoute = currentRoute.routes[currentRoute.index];
      console.log('🔥 ROUTE DEBUG: Active route:', activeRoute?.name, 'has state:', !!activeRoute?.state);
      
      if (activeRoute?.name === 'TabNavigator' && activeRoute.state) {
        // We're in the TabNavigator, get the active tab
        const activeTab = activeRoute.state.routes[activeRoute.state.index];
        console.log('🔥 ROUTE DEBUG: Active tab in TabNavigator:', activeTab?.name);
        return activeTab?.name || 'Dashboard';
      }
      
      if (activeRoute?.state) {
        currentRoute = activeRoute.state;
      } else {
        console.log('🔍 TopBar: Route detected:', activeRoute?.name);
        // If we hit TabNavigator without a state, assume Dashboard
        if (activeRoute?.name === 'TabNavigator') {
          console.log('🔥 ROUTE DEBUG: TabNavigator without state, assuming Dashboard');
          return 'Dashboard';
        }
        return activeRoute?.name || 'Dashboard';
      }
    }
    
    console.log('🔥 ROUTE DEBUG: Fell through, returning Dashboard');
    return 'Dashboard';
  });

  // Check if we're on Dashboard and set up scroll listener
  useEffect(() => {
    console.log('🔥 DEBUG: useEffect triggered - isInitialLoad:', isInitialLoad, 'currentRouteName:', currentRouteName);
    console.log('🔥 DEBUG: animatedValue current value:', animatedValue._value);
    
    // On first render, always assume Dashboard to prevent flash
    if (isInitialLoad) {
      console.log('🚀 TopBar: Initial load - FORCING Dashboard colors');
      console.log('🚀 TopBar: Setting isDashboard to TRUE');
      console.log('🚀 TopBar: Setting animatedValue to 0 (GREEN background)');
      setIsDashboard(true);
      animatedValue.setValue(0); // Force green background, white text
      setIsInitialLoad(false);
      return;
    }

    const isOnDashboard = currentRouteName === 'Dashboard' || currentRouteName === 'DashboardScreen';
    console.log('🎯 TopBar: Current route:', currentRouteName, 'isDashboard:', isOnDashboard);
    console.log('🎯 TopBar: Setting isDashboard to:', isOnDashboard);
    setIsDashboard(isOnDashboard);
    
    if (isOnDashboard) {
      // Restore the previous scroll position instead of always starting at 0
      const currentScrollPosition = scrollEmitter.getDashboardScrollPosition();
      console.log('🟢 TopBar: Restoring dashboard scroll position:', {
        currentScrollPosition,
        willSetAnimatedValueTo: currentScrollPosition,
        currentAnimatedValue: animatedValue._value
      });
      animatedValue.setValue(currentScrollPosition); // Restore previous scroll state
      
      // Listen for scroll events from Dashboard
      const handleScroll = (progress) => {
        // Ensure progress is always between 0 and 1
        const clampedProgress = Math.max(0, Math.min(progress, 1));
       
        animatedValue.setValue(clampedProgress); // 0-1 based on scroll
      };
      
      scrollEmitter.on('dashboardScroll', handleScroll);
      
      return () => {
        scrollEmitter.off('dashboardScroll', handleScroll);
      };
    } else {
      // For other screens, set to inverted state (light background)
      console.log('💡 TopBar: Setting to LIGHT state for non-dashboard');
      animatedValue.setValue(1);
    }
  }, [currentRouteName, isInitialLoad]);
  
  // Fetch house name when on My House screen
  useEffect(() => {
    const fetchHouseName = async () => {
      if ((currentRouteName === 'My House' || currentRouteName === 'MyHouseScreen') && authUser?.houseId && !houseName) {
        try {
          const response = await apiClient.get(`/api/houses/${authUser.houseId}`);
          setHouseName(response.data.name);
        } catch (error) {
          console.error('Error fetching house name:', error);
          setHouseName('My House'); // Fallback
        }
      }
    };
    
    fetchHouseName();
  }, [currentRouteName, authUser?.houseId, houseName]);
  
  // Map route names to display titles
  const getScreenTitle = (routeName) => {
    const titleMap = {
      'Dashboard': 'HouseTabz',
      'DashboardScreen': 'HouseTabz',
      'HouseServices': 'House Services',
      'HouseServicesScreen': 'House Services',
      'Pay Tab': 'Payments',
      'MakePaymentScreen': 'Payments',
      'My House': houseName || 'My House',
      'MyHouseScreen': houseName || 'My House',
      'Merchants': 'Marketplace',
      'PartnersScreen': 'Marketplace',
      'Marketplace': 'Marketplace',
      'BillTakeover': 'Bill Takeover',
      'CreateRentProposal': 'Create Proposal',
      'ViewRentProposal': 'Rent Proposal'
    };
    
    return titleMap[routeName] || 'HouseTabz';
  };
  
  // Modal visibility states
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Fetch notifications (only on demand - no polling)
  const fetchNotifications = async () => {
    if (!authUser?.id) {
      console.log('No authenticated user found for notifications');
      return;
    }

    try {
      const response = await apiClient.get(`/api/users/${authUser.id}/notifications`);
      const unread = Array.isArray(response.data)
        ? response.data.some(notification => !notification.isRead)
        : false;
      setHasUnreadNotifications(unread);
    } catch (err) {
      if (
        err.response &&
        err.response.status === 404 &&
        err.response.data &&
        err.response.data.message === "No notifications found for this user."
      ) {
        console.log('User has no notifications');
      } else {
        console.log(`Notifications error: ${err.message}`);
      }
      setHasUnreadNotifications(false);
    }
  };

  useEffect(() => {
    if (authUser?.id) {
      fetchNotifications();
      // ✅ REMOVED: No more polling every 30 seconds - only fetch on app load
    }
  }, [authUser?.id]);

  const handlePaymentMethodsOpen = () => {
    setIsSettingsVisible(false);
    setIsPaymentMethodsVisible(true);
  };

  // Animated colors based on scroll simulation
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#34d399', '#dff6f0'],
  });

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#34d399'],
  });

  // Get current icon color as a static value - start with white for Dashboard
  const [currentIconColor, setCurrentIconColor] = useState('#ffffff');
  
  useEffect(() => {
    // Force white icons on initial load
    if (isInitialLoad) {
      setCurrentIconColor('#ffffff');
      return;
    }

    const isOnDashboard = currentRouteName === 'Dashboard' || currentRouteName === 'DashboardScreen';
    
    if (isOnDashboard) {
      // For Dashboard: set initial icon color based on current scroll position, then animate
      const currentScrollPosition = scrollEmitter.getDashboardScrollPosition();
      
      // Set initial icon color based on current scroll position
      if (currentScrollPosition === 0) {
        setCurrentIconColor('#ffffff');
      } else if (currentScrollPosition === 1) {
        setCurrentIconColor('#34d399');
      } else {
        // Interpolate initial color
        const r = Math.round(255 * (1 - currentScrollPosition) + 52 * currentScrollPosition);
        const g = Math.round(255 * (1 - currentScrollPosition) + 211 * currentScrollPosition);
        const b = Math.round(255 * (1 - currentScrollPosition) + 153 * currentScrollPosition);
        setCurrentIconColor(`rgb(${r}, ${g}, ${b})`);
      }
      
      // Then listen for scroll changes to update icon color
      const listener = animatedValue.addListener(({ value }) => {
        // Interpolate the color manually
        const progress = Math.max(0, Math.min(value, 1));
        if (progress === 0) {
          setCurrentIconColor('#ffffff');
        } else if (progress === 1) {
          setCurrentIconColor('#34d399');
        } else {
          // Simple interpolation between white and green
          const r = Math.round(255 * (1 - progress) + 52 * progress);
          const g = Math.round(255 * (1 - progress) + 211 * progress);
          const b = Math.round(255 * (1 - progress) + 153 * progress);
          setCurrentIconColor(`rgb(${r}, ${g}, ${b})`);
        }
      });
      
      return () => animatedValue.removeListener(listener);
    } else {
      // For other screens: static green icons
      setCurrentIconColor('#34d399');
    }
  }, [currentRouteName, isInitialLoad]);

  // Force Dashboard styling on initial load, then use normal logic
  const shouldUseDashboardStyling = isInitialLoad || currentRouteName === 'Dashboard' || currentRouteName === 'DashboardScreen';
  
  console.log('🔥 RENDER DEBUG:', {
    isInitialLoad,
    currentRouteName,
    shouldUseDashboardStyling,
    isDashboard,
    animatedValueCurrent: animatedValue._value,
    backgroundColorWillBe: shouldUseDashboardStyling ? 'backgroundColor (animated)' : '#dff6f0'
  });

  return (
    <View>
      <Animated.View style={[styles.headerContainer, { backgroundColor: shouldUseDashboardStyling ? backgroundColor : '#dff6f0' }]}>
        {/* Dynamic App Title */}
        <TouchableOpacity>
          <Animated.Text style={[
            styles.headerTitle,
            shouldUseDashboardStyling 
              ? [styles.dashboardTitle, { color: textColor }]
              : styles.screenTitle
          ]}>
            {getScreenTitle(currentRouteName)}
          </Animated.Text>
        </TouchableOpacity>

        {/* Icons */}
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => setIsNotificationsVisible(true)}>
            <View style={styles.notificationIconContainer}>
              <MaterialIcons 
                name="notifications-none" 
                size={24} 
                color={currentIconColor} 
                style={styles.icon} 
              />
              {hasUnreadNotifications && <View style={styles.notificationBadge} />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFeedbackVisible(true)}>
            <MaterialIcons 
              name="chat-bubble-outline" 
              size={24} 
              color={currentIconColor} 
              style={styles.icon} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
            <MaterialIcons 
              name="tune" 
              size={24} 
              color={currentIconColor} 
              style={styles.icon} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Notifications Modal */}
      <ModalComponent
        visible={isNotificationsVisible}
        onClose={() => {
          setIsNotificationsVisible(false);
          // Refresh notification badge when modal closes
          fetchNotifications();
        }}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <NotificationsModal 
          onClose={() => {
            setIsNotificationsVisible(false);
            // Refresh notification badge when modal closes
            fetchNotifications();
          }} 
          onMarkAsRead={fetchNotifications} 
        />
      </ModalComponent>

      {/* Settings Modal */}
      <ModalComponent
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <SettingsModal onClose={() => setIsSettingsVisible(false)} />
      </ModalComponent>

      {/* Payment Methods Modal */}
      <PaymentMethodsSettings 
        visible={isPaymentMethodsVisible}
        onClose={() => setIsPaymentMethodsVisible(false)}
      />

      {/* User Feedback Modal */}
      <ModalComponent
        visible={isFeedbackVisible}
        onClose={() => setIsFeedbackVisible(false)}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <UserFeedbackModal onClose={() => setIsFeedbackVisible(false)} />
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
    padding: 20,
  },
  headerTitle: {
    fontFamily: 'Montserrat-Black',
    fontSize: 20,
    marginLeft: 5,
    marginTop: 32,
  },
  dashboardTitle: {
    color: '#34d399',
  },
  screenTitle: {
    color: '#34d399',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 33,
  },
  icon: {
    marginLeft: 16,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
});

export default TopBar;