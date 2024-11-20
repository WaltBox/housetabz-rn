import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ModalComponent from '../components/ModalComponent';
import SettingsModal from '../modals/SettingsModal';
import NotificationsModal from '../modals/NotificationsModal';

const TopBar = () => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  return (
    <View style={styles.headerContainer}>
      {/* App Title */}
      <TouchableOpacity>
        <Text style={styles.headerTitle}>HouseTabz</Text>
      </TouchableOpacity>

      {/* Icons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => setIsNotificationsVisible(true)}>
          <Icon
            name="notifications-outline"
            size={24}
            color="green"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
          <Icon name="settings-outline" size={24} color="green" style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Notifications Modal */}
      <ModalComponent
        visible={isNotificationsVisible}
        onClose={() => setIsNotificationsVisible(false)}
      >
        <NotificationsModal />
      </ModalComponent>

      {/* Settings Modal */}
      <ModalComponent
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      >
        <SettingsModal />
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
    color: 'green',
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
    marginLeft: 16, // Space between icons
  },
});

export default TopBar;
