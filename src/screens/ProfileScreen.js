import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';

const ProfileScreen = () => {
  const [user, setUser] = useState({
    username: 'Unknown',
    house: { name: 'Unknown' },
    balance: 'Unknown',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3004/api/users/1')
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
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
      <View style={styles.profileContainer}>
        <Image style={styles.profileImage} />
        <Text style={styles.nameText}>{user.username}</Text>
        <Text style={styles.pointsText}>Points: XX</Text>
        <View style={styles.progressBar} />
        <Text style={styles.nextLevelText}>Next Level in X points</Text>
        <Text style={styles.houseNameText}>
          House Name: {user.house ? user.house.name : 'Unknown'}
        </Text>
        <Text style={styles.userStatusText}>User Status: Active</Text>
        <Text style={styles.creditText}>Current Credit: {user.balance}$</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.termsText}>
        By Using HouseTabz, you agree to our{' '}
        <Text style={styles.termsLink}>Terms and Conditions</Text>
      </Text>
      <View style={styles.tabSection}>
        <Text style={styles.sectionTitle}>Current Tab</Text>
        <View style={styles.row}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.moneyValue}>$$$</Text>
        </View>
        <View style={styles.chargesContainer}>
          <View style={styles.row}>
            <Text style={styles.chargeText}>Charge 1:</Text>
            <Text style={styles.moneyValue}>$$</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.chargeText}>Charge 2:</Text>
            <Text style={styles.moneyValue}>$</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.lateChargeText}>Late Charge 1:</Text>
            <Text style={styles.moneyValue}>$</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.lateChargeText}>Late Charge 2:</Text>
            <Text style={styles.moneyValue}>$</Text>
          </View>
        </View>
      </View>
      <View style={styles.paymentsSection}>
        <Text style={styles.sectionTitle}>Previous Payments</Text>
        <View style={styles.row}>
          <Text style={styles.paymentText}>Payment 1:</Text>
          <Text style={styles.moneyValue}>$$</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.paymentText}>Payment 2:</Text>
          <Text style={styles.moneyValue}>$$</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 85,
    height: 85,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  pointsText: {
    fontSize: 16,
    marginTop: 5,
  },
  progressBar: {
    height: 10,
    width: '80%',
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  nextLevelText: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
  },
  houseNameText: {
    fontSize: 16,
    marginTop: 10,
  },
  userStatusText: {
    fontSize: 16,
    marginTop: 5,
  },
  creditText: {
    fontSize: 16,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 20,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  termsLink: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  tabSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chargesContainer: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  chargeText: {
    fontSize: 16,
    color: '#333',
  },
  lateChargeText: {
    fontSize: 16,
    color: '#FF0000',
  },
  paymentsSection: {
    marginBottom: 20,
  },
  paymentText: {
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  moneyValue: {
    textDecorationLine: 'none',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
