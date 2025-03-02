import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert 
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import ProfileModal from './ProfileModal'; // Import the ProfileModal

const SettingsModal = ({ onNavigateToPaymentMethods, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autopay, setAutopay] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false); // Add state for ProfileModal visibility

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
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
          {subtitle && (
            <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
          )}
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

  // Updated to open the ProfileModal instead of navigating
  const handleOpenProfileModal = () => {
    // Close the settings modal
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
    
    // Open the profile modal after a small delay
    setTimeout(() => {
      setIsProfileModalVisible(true);
    }, 300);
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
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
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
              onPress={onNavigateToPaymentMethods}
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

          {/* Preferences Section */}
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

          {/* Support Section */}
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

          {/* App Section */}
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

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <MaterialIcons name="exit-to-app" size={20} color="#ef4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Profile Modal */}
      <ProfileModal 
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowText: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  settingsRowSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  signOutContainer: {
    marginTop: 24,
    paddingHorizontal: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    letterSpacing: -0.2,
  },
});

export default SettingsModal;