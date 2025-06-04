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
import { useFonts } from 'expo-font';

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

  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
  });

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
          <Text style={[
            styles.errorText,
            fontsLoaded && { fontFamily: 'Poppins-Medium' }
          ]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={[
              styles.retryButtonText,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>
              Retry
            </Text>
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
            <Text style={[
              styles.username,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>
              {userData.username}
            </Text>
            <View style={styles.houseNameContainer}>
              <MaterialIcons name="home" size={14} color="#64748b" style={styles.houseIcon} />
              <Text style={[
                styles.houseName,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                {userData.house.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.sectionContainer}>
          <Text style={[
            styles.sectionTitle,
            fontsLoaded && { fontFamily: 'Poppins-Medium' }
          ]}>
            Account Information
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="attach-money" size={20} color="#34d399" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[
                  styles.statValue,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>
                  ${userData.credit?.toFixed(2) || '0.00'}
                </Text>
                <Text style={[
                  styles.statLabel,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  Available Credit
                </Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="star" size={20} color="#34d399" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[
                  styles.statValue,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>
                  {userData.points || 0}
                </Text>
                <Text style={[
                  styles.statLabel,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  Loyalty Points
                </Text>
              </View>
            </View>
          </View>
          
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[
                styles.progressTitle,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                Next Level Progress
              </Text>
              <Text style={[
                styles.progressValue,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                {Math.max(100 - (userData.points || 0), 0)} points to go
              </Text>
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
        </View>

        {/* Menu Options */}
        <View style={styles.sectionContainer}>
          <Text style={[
            styles.sectionTitle,
            fontsLoaded && { fontFamily: 'Poppins-Medium' }
          ]}>
            Account Options
          </Text>
          
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setIsUserTabVisible(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person" size={24} color="#34d399" style={styles.menuIcon} />
              <Text style={[
                styles.menuText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                Your Tab
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setIsTransactionsModalVisible(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="receipt" size={24} color="#34d399" style={styles.menuIcon} />
              <Text style={[
                styles.menuText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                Transaction History
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[
            styles.footerText,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            By using this app, I agree to HouseTabz{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Text>
          <Text style={[
            styles.copyright,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
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
            <Text style={[
              styles.headerTitle,
              fontsLoaded && { fontFamily: 'Montserrat-Black' }
            ]}>
              Profile
            </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 28,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#34d399',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfoSection: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  houseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  houseIcon: {
    marginRight: 4,
  },
  houseName: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    color: '#1e293b',
  },
  progressValue: {
    fontSize: 14,
    color: '#64748b',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(203, 213, 225, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 56, // Aligns with the end of icon + margin
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
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