import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import ProfileModal from './ProfileModal';
import PaymentMethodsSettings from './PaymentMethodsSettings';

const SettingsModal = ({ onClose = () => {} }) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autopay, setAutopay] = useState(false);
  
  // Profile Modal
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  
  // Payment Methods Modal 
  const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingsRow = ({ icon, title, subtitle, onPress, value, type = 'navigation' }) => (
    <TouchableOpacity 
      style={styles.settingsRow} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.settingsRowLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon} size={20} color="#34d399" />
        </View>
        <View style={styles.settingsRowText}>
          <Text style={styles.settingsRowTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {type === 'navigation' && (
        <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
      )}
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#e2e8f0', true: '#bbf7d0' }}
          thumbColor={value ? '#34d399' : '#dff6f0'}
          ios_backgroundColor="#e2e8f0"
        />
      )}
    </TouchableOpacity>
  );

  const handleOpenProfileModal = () => {
    setIsProfileModalVisible(true);
  };

  const handleOpenPaymentMethodsModal = () => {
    setIsPaymentMethodsVisible(true);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SettingsSection title="Account Settings">
            <SettingsRow
              icon="person-outline"
              title="Profile Information"
              subtitle="Update personal details"
              onPress={handleOpenProfileModal}
            />
            <SettingsRow
              icon="credit-card"
              title="Payment Methods"
              subtitle="Manage connected accounts"
              onPress={handleOpenPaymentMethodsModal}
            />
            <SettingsRow
              icon="autorenew"
              title="AutoPay Configuration"
              subtitle={autopay ? "Active - Manage schedule" : "Set up recurring payments"}
              type="switch"
              value={autopay}
              onPress={setAutopay}
            />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsRow
              icon="notifications-none"
              title="Push Notifications"
              subtitle="App alerts and reminders"
              type="switch"
              value={notifications}
              onPress={setNotifications}
            />
            <SettingsRow
              icon="mail-outline"
              title="Email Communications"
              subtitle="Newsletters and updates"
              type="switch"
              value={emailUpdates}
              onPress={setEmailUpdates}
            />
            <SettingsRow
              icon="dark-mode"
              title="Dark Theme"
              subtitle="Enable night mode"
              type="switch"
              value={darkMode}
              onPress={setDarkMode}
            />
          </SettingsSection>

          <SettingsSection title="Support & Legal">
            <SettingsRow
              icon="help-outline"
              title="Help Center"
              subtitle="Guides and FAQs"
              onPress={() => Alert.alert('Navigate to Help Center')}
            />
            <SettingsRow
              icon="chat-bubble-outline"
              title="Contact Support"
              subtitle="24/7 customer service"
              onPress={() => Alert.alert('Navigate to Contact Support')}
            />
            <SettingsRow
              icon="description"
              title="Terms of Service"
              onPress={() => Alert.alert('Navigate to Terms')}
            />
            <SettingsRow
              icon="security"
              title="Privacy Policy"
              subtitle="Data usage information"
              onPress={() => Alert.alert('Navigate to Privacy Policy')}
            />
          </SettingsSection>

          <SettingsSection title="Application">
            <SettingsRow
              icon="info-outline"
              title="About HouseTabz"
              subtitle="Version 1.0.0 (Build 123)"
            />
            <SettingsRow
              icon="update"
              title="Check for Updates"
              subtitle="Latest version available"
            />
          </SettingsSection>

          <View style={styles.signOutContainer}>
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <MaterialIcons name="exit-to-app" size={20} color="#ef4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpace} />
        </ScrollView>
      </SafeAreaView>

      <ProfileModal 
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />
      
      <PaymentMethodsSettings 
        visible={isPaymentMethodsVisible}
        onClose={() => setIsPaymentMethodsVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  headerContainer: {
    backgroundColor: "#dff6f0",
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
  },
  closeButton: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 80,
    backgroundColor: "#dff6f0",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
    textTransform: 'uppercase',
  },
  sectionContent: {
    // Content flows directly on the modal background.
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowText: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  settingsRowSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 16,
  },
  signOutContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    letterSpacing: -0.2,
  },
  footerSpace: {
    height: 40,
  }
});

export default SettingsModal;
