import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [user, setUser] = useState({
    username: 'Unknown',
    house: { name: 'Unknown' },
    balance: 'Unknown',
  });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileRow}>
        <Image style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{user.username}</Text>
          <Text style={styles.houseNameText}>
            House: {user.house ? user.house.name : 'Unknown'}
          </Text>
          <Text style={styles.creditText}>Credit: ${user.balance}</Text>
        </View>
      </View>

      {/* Points and Progress Section */}
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>Points: {user.points}</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.nextLevelText}>Next Level in X points</Text>
      </View>

      {/* Clickable Titles Section */}
      <View style={styles.clickableSection}>
        <TouchableOpacity style={styles.clickableRow} activeOpacity={0.7}>
          <Text style={styles.clickableTitle}>Current Tab</Text>
          <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.clickableRow} activeOpacity={0.7}>
          <Text style={styles.clickableTitle}>Transactions</Text>
          <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Bottom Message */}
      <View style={styles.footer}>
        <Text style={styles.termsText}>
          By using this app, I agree to HouseTabz{'\n'}
          <Text style={styles.termsLink}>Terms of Service</Text>{'\n'}
          Copyright © 2024 HouseTabz, Inc{'\n'}
          🏠✨
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f2f8",
    paddingHorizontal: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 85,
    height: 85,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
  profileInfo: {
    marginLeft: 20,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  houseNameText: {
    fontSize: 16,
    marginTop: 5,
  },
  creditText: {
    fontSize: 16,
    marginTop: 5,
  },
  pointsContainer: {
    alignItems: 'center',
    marginVertical: 30, // Added more space
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
    width: '50%', // Adjust dynamically based on progress
    backgroundColor: '#4CAF50',
  },
  nextLevelText: {
    fontSize: 14,
    marginTop: 10,
    color: '#666',
  },
  clickableSection: {
    marginVertical: 30, // Added more space
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
  },
  footer: {
    marginTop: 'auto', // Pushes the footer to the bottom
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
