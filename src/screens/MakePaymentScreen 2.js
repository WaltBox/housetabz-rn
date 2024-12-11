import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const MakePaymentScreen = () => {
  const [user, setUser] = useState({ balance: 'Unknown', bank: null });
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank'); // Default payment method is bank

  useEffect(() => {
    // Simulating API call to fetch user data
    axios
      .get('https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/api/users/1')
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, []);

  const handlePayment = () => {
    Alert.alert(
      'Confirm Payment',
      `You are about to pay with your ${paymentMethod === 'bank' ? 'bank account' : 'card'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // API call to process payment (placeholder for now)
            Alert.alert('Payment Successful', 'Your payment has been processed.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make a Payment</Text>

      {/* User Balance Section */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>${user.balance}</Text>
      </View>

      {/* Payment Method Section */}
      <View style={styles.paymentMethodContainer}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'bank' && styles.selectedOption,
          ]}
          onPress={() => setPaymentMethod('bank')}
          activeOpacity={0.7}
        >
          <Icon name="wallet" size={24} color={paymentMethod === 'bank' ? '#28a745' : '#888'} />
          <View style={styles.optionDetails}>
            <Text style={styles.optionTitle}>Bank Account</Text>
            <Text style={styles.optionSubtitle}>
              {user.bank ? `**** ${user.bank.last4}` : 'No bank account linked'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'card' && styles.selectedOption,
          ]}
          onPress={() => setPaymentMethod('card')}
          activeOpacity={0.7}
        >
          <Icon name="card" size={24} color={paymentMethod === 'card' ? '#28a745' : '#888'} />
          <View style={styles.optionDetails}>
            <Text style={styles.optionTitle}>Credit/Debit Card</Text>
            <Text style={styles.optionSubtitle}>Use your saved card (3% fee)</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Pay Now Button */}
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>
          Pay with {paymentMethod === 'bank' ? 'Bank Account' : 'Card'}
        </Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          <Text style={styles.disclaimerBold}>Note:</Text> HouseTabz works with trusted third-party payment processors to ensure your information is secure. We do not store your payment details. Your privacy and security are our priority.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  balanceContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#28a745',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#333',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  paymentMethodContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#28a745',
  },
  optionDetails: {
    marginLeft: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  payButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimerContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
});

export default MakePaymentScreen;
