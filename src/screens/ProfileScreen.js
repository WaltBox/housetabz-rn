import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import WaveBackground from '../components/WaveBackground';
import ModalComponent from '../components/ModalComponent';
import UserTabModal from '../modals/UserTabModal';
import UserTransactionsModal from '../modals/UserTransactionsModal';

const { width } = Dimensions.get('window');

const DEFAULT_USER = {
  username: 'Unknown',
  house: { name: 'Unknown' },
  balance: 0,
  credit: 0,
  points: 0,
  charges: [],
};

const ProfileScreen = () => {
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
      const response = await axios.get(`http://localhost:3004/api/users/${authUser.id}`);
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
    fetchUserData();
  }, [fetchUserData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, [fetchUserData]);

  const handleEditProfile = () => {
    alert('Edit Profile feature coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WaveBackground style={styles.waveBackground} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/default-profile.jpg')}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editIcon}
              onPress={handleEditProfile}
            >
              <MaterialIcons name="edit" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.nameText}>{userData.username}</Text>
          <Text style={styles.houseBadge}>{userData.house.name}</Text>
        </View>

        {/* Stats Cards Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${userData.credit?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Available Credit</Text>
            <MaterialIcons 
              name="attach-money" 
              size={24} 
              color="#22c55e" 
              style={styles.statIcon} 
            />
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.points || 0}</Text>
            <Text style={styles.statLabel}>Loyalty Points</Text>
            <MaterialIcons 
              name="star" 
              size={24} 
              color="#f59e0b" 
              style={styles.statIcon} 
            />
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Next Level Progress</Text>
            <Text style={styles.progressSubtitle}>
              {Math.max(100 - (userData.points || 0), 0)} points to go
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { 
                  width: `${Math.min((userData.points || 0), 100)}%`,
                  backgroundColor: userData.points >= 100 ? '#f59e0b' : '#22c55e'
                }
              ]}
            />
          </View>
        </View>

        {/* Action Menu Items */}
        <View style={styles.actionCards}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setIsUserTabVisible(true)}
          >
            <MaterialIcons name="person" size={28} color="#22c55e" />
            <Text style={styles.actionCardText}>Your Tab</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setIsTransactionsModalVisible(true)}
          >
            <MaterialIcons name="receipt" size={28} color="#22c55e" />
            <Text style={styles.actionCardText}>Transaction History</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using this app, I agree to HouseTabz{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Text>
          <Text style={styles.footerCopyright}>
            Copyright © 2024 HouseTabz, Inc • 🏠✨
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <ModalComponent
        visible={isUserTabVisible}
        onClose={() => setIsUserTabVisible(false)}
      >
        <UserTabModal user={userData} />
      </ModalComponent>

      <ModalComponent
        visible={isTransactionsModalVisible}
        onClose={() => setIsTransactionsModalVisible(false)}
      >
        <UserTransactionsModal user={userData} />
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: '#e5e7eb',
  },
  editIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#22c55e',
    borderRadius: 15,
    padding: 6,
    elevation: 2,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  houseBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#64748b',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: width * 0.42,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  progressContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  actionCards: {
    paddingHorizontal: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  actionCardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginLeft: 16,
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#22c55e',
    textDecorationLine: 'underline',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;