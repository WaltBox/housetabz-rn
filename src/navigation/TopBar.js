import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import ModalComponent from '../components/ModalComponent';
import SettingsModal from '../modals/SettingsModal';
import NotificationsModal from '../modals/NotificationsModal';
import UserFeedbackModal from '../modals/UserFeedbackModal';
import PaymentMethodsSettings from '../modals/PaymentMethodsSettings';
// Import apiClient instead of axios
import apiClient from '../config/api';

const TopBar = () => {
  const { user: authUser } = useAuth();
  
  // Modal visibility states
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!authUser?.id) {
      console.log('No authenticated user found for notifications');
      return;
    }

    try {
      // Use apiClient with relative path
      const response = await apiClient.get(
        `/api/users/${authUser.id}/notifications`
      );
      const unread = Array.isArray(response.data) ? 
        response.data.some(notification => !notification.isRead) : 
        false;
      setHasUnreadNotifications(unread);
    } catch (err) {
      // Check if this is the specific "no notifications" error
      if (err.response && 
          err.response.status === 404 && 
          err.response.data && 
          err.response.data.message === "No notifications found for this user.") {
        console.log('User has no notifications');
        // This is normal behavior, not an error
      } else {
        // This is an actual error with the API
        console.log(`Notifications error: ${err.message}`);
      }
      
      // Either way, ensure we're not showing a notification badge
      setHasUnreadNotifications(false);
    }
  };

  useEffect(() => {
    if (authUser?.id) {
      fetchNotifications();

      // Optional: Polling to check for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [authUser?.id]);

  const handlePaymentMethodsOpen = () => {
    setIsSettingsVisible(false); // Close settings modal
    setIsPaymentMethodsVisible(true); // Open payment methods modal
  };

  return (
    <View style={styles.headerContainer}>
      {/* App Title */}
      <TouchableOpacity>
        <Text style={styles.headerTitle}>HouseTabz</Text>
      </TouchableOpacity>

      {/* Icons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => setIsNotificationsVisible(true)}>
          <View style={styles.notificationIconContainer}>
            <Icon
              name="notifications-outline"
              size={24}
              color="#34d399"
              style={styles.icon}
            />
            {hasUnreadNotifications && (
              <View style={styles.notificationBadge} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsFeedbackVisible(true)}>
          <Icon name="create-outline" size={24} color="#34d399" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
          <Icon name="settings-outline" size={24} color="#34d399" style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Notifications Modal */}
      <ModalComponent
        visible={isNotificationsVisible}
        onClose={() => setIsNotificationsVisible(false)}
      >
        <NotificationsModal onMarkAsRead={fetchNotifications} />
      </ModalComponent>

      {/* Settings Modal */}
      <ModalComponent
  visible={isSettingsVisible}
  onClose={() => setIsSettingsVisible(false)}
>
  <SettingsModal 
    onClose={() => setIsSettingsVisible(false)}
    onNavigateToPaymentMethods={handlePaymentMethodsOpen}
  />
</ModalComponent>


      {/* Payment Methods Modal */}
      <ModalComponent
        visible={isPaymentMethodsVisible}
        onClose={() => setIsPaymentMethodsVisible(false)}
      >
        <PaymentMethodsSettings />
      </ModalComponent>

      {/* User Feedback Modal */}
      <ModalComponent
        visible={isFeedbackVisible}
        onClose={() => setIsFeedbackVisible(false)}
      >
        <UserFeedbackModal />
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 95,
    padding: 20,
    backgroundColor: '#dff6f0',
    elevation: 4,
  },
  headerTitle: {
    fontFamily: 'Montserrat-Black',
    color: '#34d399',
    fontSize: 20,
    marginLeft: 5,
    marginTop: 32,
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