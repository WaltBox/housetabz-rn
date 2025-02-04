import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import WaveBackground from '../components/WaveBackground'; // Import the updated wave component
import ModalComponent from '../components/ModalComponent';
import UserTabModal from '../modals/UserTabModal';
import UserTransactionsModal from '../modals/UserTransactionsModal';

const ProfileScreen = () => {
  const [user, setUser] = useState({
    username: 'Unknown',
    house: { name: 'Unknown' },
    balance: 'Unknown',
  });
  const [loading, setLoading] = useState(true);

  const [isUserTabVisible, setIsUserTabVisible] = useState(false);
  const [isTransactionsModalVisible, setIsTransactionsModalVisible] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:3004/api/users/1')
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, []);

  const handleEditProfile = () => {
    alert('Edit Profile feature coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WaveBackground /> {/* Updated wave design */}
      <View style={styles.contentContainer}>
        {/* Profile Section */}
        <View style={styles.profileRow}>
          <Image
            source={require('../../assets/default-profile.jpg')}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{user.username}</Text>
            <Text style={styles.houseNameText}>
              House: {user.house ? user.house.name : 'Unknown'}
            </Text>
            <Text style={styles.creditText}>Credit: ${user.credit || '0'}</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <MaterialIcons name="edit" size={18} color="#22c55e" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Points and Progress Section */}
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>Points: {user.points || 0}</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBarFill, { width: `${(user.points || 0) * 10}%` }]}
            />
          </View>
          <Text style={styles.nextLevelText}>Next Level in {100 - (user.points || 0)} points</Text>
        </View>

        {/* Clickable Titles Section */}
        <View style={styles.clickableSection}>
          <TouchableOpacity
            style={styles.clickableRow}
            activeOpacity={0.7}
            onPress={() => setIsUserTabVisible(true)}
          >
            <Text style={styles.clickableTitle}>User Tab</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clickableRow}
            activeOpacity={0.7}
            onPress={() => setIsTransactionsModalVisible(true)}
          >
            <Text style={styles.clickableTitle}>Transactions</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {/* UserTab Modal */}
        <ModalComponent
          visible={isUserTabVisible}
          onClose={() => setIsUserTabVisible(false)}
        >
          <UserTabModal user={user} />
        </ModalComponent>

        {/* Transactions Modal */}
        <ModalComponent
          visible={isTransactionsModalVisible}
          onClose={() => setIsTransactionsModalVisible(false)}
        >
          <UserTransactionsModal user={user} />
        </ModalComponent>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.termsText}>
            By using this app, I agree to HouseTabz{'\n'}
            <Text style={styles.termsLink}>Terms of Service</Text>{'\n'}
            Copyright © 2024 HouseTabz, Inc{'\n'}
            🏠✨
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f5f0',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f8fb',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  profileInfo: {
    marginLeft: 20,
    justifyContent: 'center',
    fontFamily: 'montserrat-regular',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'montserrat-bold',
  },
  houseNameText: {
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'montserrat-regular',
  },
  creditText: {
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'montserrat-regular',
    },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 8,
    backgroundColor: '#f4f8fb',
  },
  editProfileText: {
    fontSize: 16,
    color: '#22c55e',
    marginLeft: 5,
  },
  pointsContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  pointsText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 15,
    width: '70%',
    backgroundColor: '#ccc',
    borderRadius: 7.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  nextLevelText: {
    fontSize: 14,
    marginTop: 10,
    color: '#666',
  },
  clickableSection: {
    marginVertical: 30,
  },
  clickableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  clickableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'montserrat-bold',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  termsLink: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;
