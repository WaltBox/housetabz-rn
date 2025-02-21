import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import ModalComponent from '../components/ModalComponent';
import SettingsModal from '../modals/SettingsModal';
import NotificationsModal from '../modals/NotificationsModal';
import UserFeedbackModal from '../modals/UserFeedbackModal';
import PaymentMethodsSettings from '../modals/PaymentMethodsSettings';

const TopBar = () => {
  const userId = 1; // Replace with dynamic user ID as needed
  
  // Modal visibility states
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/users/${userId}/notifications`
      );
      const unread = response.data.some((notification) => !notification.isRead);
      setHasUnreadNotifications(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Optional: Polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [userId]);

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
        <SettingsModal onNavigateToPaymentMethods={handlePaymentMethodsOpen} />
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
    backgroundColor: 'white',
    elevation: 4,
  },
  headerTitle: {
    fontFamily: 'Montserrat-Black', // Updated font
    color: '#34d399',               // Updated color
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
