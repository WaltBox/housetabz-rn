import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ModalComponent from '../components/ModalComponent';
import UserTabModal from '../modals/UserTabModal';
import UserTransactionsModal from '../modals/UserTransactionsModal';
import apiClient from '../config/api';

const { width } = Dimensions.get('window');

const DEFAULT_USER = {
  username: 'Unknown',
  house: { name: 'Unknown' },
  balance: 0,
  credit: 0,
  points: 0,
  charges: [],
};

const ProfileModal = ({ visible = false, onClose }) => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(DEFAULT_USER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isUserTabVisible, setIsUserTabVisible] = useState(false);
  const [isTransactionsModalVisible, setIsTransactionsModalVisible] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!authUser?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get(`/api/users/${authUser.id}`);
      setUserData({
        ...DEFAULT_USER,
        ...response.data,
        house: response.data.house || { name: 'Unknown' },
        charges: response.data.charges || [],
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Unable to load user data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (visible) {
      fetchUserData();
    }
  }, [fetchUserData, visible]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, [fetchUserData]);

  const handleEditProfile = () => {
    alert('Edit Profile feature coming soon!');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#34d399"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarSection}>
            <Image
              source={require('../../assets/default-profile.jpg')}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <MaterialIcons name="edit" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfoSection}>
            <Text style={styles.username}>{userData.username}</Text>
            <View style={styles.houseNameContainer}>
              <MaterialIcons name="home" size={14} color="#64748b" style={styles.houseIcon} />
              <Text style={styles.houseName}>{userData.house.name}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="attach-money" size={20} color="#34d399" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>${userData.credit?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.statLabel}>Available Credit</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="star" size={20} color="#f59e0b" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{userData.points || 0}</Text>
              <Text style={styles.statLabel}>Loyalty Points</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Next Level Progress</Text>
            <Text style={styles.progressValue}>{Math.max(100 - (userData.points || 0), 0)} points to go</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min(userData.points || 0, 100)}%` }
              ]} 
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setIsUserTabVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="person" size={24} color="#34d399" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Your Tab</Text>
              <Text style={styles.menuSubtext}>View your active tab details</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setIsTransactionsModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="receipt" size={24} color="#34d399" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Transaction History</Text>
              <Text style={styles.menuSubtext}>View past transactions</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using this app, I agree to HouseTabz{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Text>
          <Text style={styles.copyright}>
            Copyright © 2024 HouseTabz, Inc • 🏠✨
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <ModalComponent 
      visible={visible} 
      onClose={onClose} 
      fullScreen={true}
      backgroundColor="#dff6f0"
    >
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
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>
        
        {renderContent()}
      </SafeAreaView>

      {/* Nested Modals */}
      <ModalComponent
        visible={isUserTabVisible}
        onClose={() => setIsUserTabVisible(false)}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <UserTabModal 
          user={userData} 
          onClose={() => setIsUserTabVisible(false)}
        />
      </ModalComponent>

      <ModalComponent
        visible={isTransactionsModalVisible}
        onClose={() => setIsTransactionsModalVisible(false)}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <UserTransactionsModal 
          user={userData}
          onClose={() => setIsTransactionsModalVisible(false)}
        />
      </ModalComponent>
    </ModalComponent>
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
  scrollContent: {
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#34d399',
    borderRadius: 12,
    padding: 4,
  },
  userInfoSection: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
  },
  houseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  houseIcon: {
    marginRight: 4,
  },
  houseName: {
    fontSize: 14,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(203, 213, 225, 0.2)',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Sigmar-Regular',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressValue: {
    fontSize: 12,
    color: '#64748b',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(203, 213, 225, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(203, 213, 225, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(240, 253, 244, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerLink: {
    color: '#34d399',
    fontWeight: '500',
  },
  copyright: {
    fontSize: 12,
    color: '#94a3b8',
  }
});

export default ProfileModal;