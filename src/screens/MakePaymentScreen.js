import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Animated,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import axios from 'axios';

const MakePaymentScreen = () => {
  const [user, setUser] = useState({ balance: 0, bank: null });
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/users/1');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodPress = (method) => {
    setPaymentMethod(method);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay $${amount} with your ${paymentMethod === 'bank' ? 'Bank Account' : 'Credit Card'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: processPayment,
        },
      ]
    );
  };

  const processPayment = () => {
    // Simulated payment processing
    Alert.alert(
      'Payment Successful',
      'Your payment has been processed successfully.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>${user.balance.toFixed(2)}</Text>
        <View style={styles.dueDateContainer}>
          <MaterialIcons name="event" size={16} color="#64748b" />
          <Text style={styles.dueDateText}>Due in 5 days</Text>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.amountSection}>
        <Text style={styles.sectionTitle}>Payment Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.methodsSection}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity
          style={[styles.methodCard, paymentMethod === 'bank' && styles.selectedMethod]}
          onPress={() => handlePaymentMethodPress('bank')}
          activeOpacity={0.9}
        >
          <View style={styles.methodLeft}>
            <View style={styles.methodIcon}>
              <MaterialIcons name="account-balance" size={24} color="#22c55e" />
            </View>
            <View style={styles.methodDetails}>
              <Text style={styles.methodTitle}>Bank Account</Text>
              <Text style={styles.methodSubtitle}>
                {user.bank ? `****${user.bank.last4}` : 'Add bank account'}
              </Text>
            </View>
          </View>
          <View style={styles.methodRight}>
            <Text style={styles.methodTag}>No Fee</Text>
            {paymentMethod === 'bank' && (
              <MaterialIcons name="check-circle" size={20} color="#22c55e" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, paymentMethod === 'card' && styles.selectedMethod]}
          onPress={() => handlePaymentMethodPress('card')}
          activeOpacity={0.9}
        >
          <View style={styles.methodLeft}>
            <View style={styles.methodIcon}>
              <MaterialIcons name="credit-card" size={24} color="#22c55e" />
            </View>
            <View style={styles.methodDetails}>
              <Text style={styles.methodTitle}>Credit Card</Text>
              <Text style={styles.methodSubtitle}>Visa ending in 4242</Text>
            </View>
          </View>
          <View style={styles.methodRight}>
            <Text style={styles.methodTag}>3% Fee</Text>
            {paymentMethod === 'card' && (
              <MaterialIcons name="check-circle" size={20} color="#22c55e" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Payment Summary */}
      {amount && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Amount</Text>
            <Text style={styles.summaryValue}>${amount}</Text>
          </View>
          {paymentMethod === 'card' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Fee (3%)</Text>
              <Text style={styles.summaryValue}>
                ${(parseFloat(amount || 0) * 0.03).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${(parseFloat(amount || 0) * (paymentMethod === 'card' ? 1.03 : 1)).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

{/* AutoPay Section */}

    



      {/* Pay Button */}
      <TouchableOpacity
        style={[
          styles.payButton,
          (!amount || parseFloat(amount) <= 0) && styles.payButtonDisabled
        ]}
        onPress={handlePayment}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        <MaterialIcons name="lock" size={20} color="white" />
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <MaterialIcons name="security" size={16} color="#64748b" />
        <Text style={styles.securityText}>
          Payments are secure and processed by Stripe
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dueDateText: {
    fontSize: 14,
    color: '#64748b',
  },
  amountSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#64748b',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#1e293b',
    fontWeight: '600',
  },
  methodsSection: {
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  selectedMethod: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodDetails: {
    gap: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  methodRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  methodTag: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
  },
  payButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  securityText: {
    fontSize: 13,
    color: '#64748b',
  },

  autopayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
  },
  autopayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autopayText: {
    fontSize: 14,
    color: '#64748b',
  },
  autopayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  autopayButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#22c55e',
  },
});

export default MakePaymentScreen;