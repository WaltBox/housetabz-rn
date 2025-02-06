import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import axios from 'axios';

const MakePaymentScreen = () => {
  const [user, setUser] = useState({ balance: 0, dueNow: 0, bank: null });
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [autopayEnabled, setAutopayEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/users/1');
      // Calculate dueNow from charges that are past due
      const dueNow = response.data.charges
        .filter(charge => !charge.paid && new Date(charge.dueDate) <= new Date())
        .reduce((sum, charge) => sum + charge.amount, 0);
      
      setUser({
        ...response.data,
        dueNow
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodPress = (method) => {
    setPaymentMethod(method);
  };

  const setupAutopay = () => {
    if (!user.bank) {
      Alert.alert(
        'Bank Account Required',
        'Please connect your bank account to enable autopay.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Connect Bank',
            onPress: () => {/* Navigate to bank connection */}
          }
        ]
      );
      return;
    }
    setAutopayEnabled(true);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulated payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Payment Successful',
        'Your payment has been processed successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Summary */}
        <View style={styles.balanceCard}>
          <View style={styles.totalBalance}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>${user.balance.toFixed(2)}</Text>
          </View>

          <View style={styles.balanceDivider} />

          <TouchableOpacity 
            style={styles.dueNowSection}
            onPress={() => {/* Show charges breakdown */}}
          >
            <View>
              <Text style={styles.dueNowLabel}>Amount Due Now</Text>
              <Text style={styles.dueNowAmount}>${user.dueNow.toFixed(2)}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'bank' && styles.selectedMethod]}
            onPress={() => handlePaymentMethodPress('bank')}
          >
            <View style={styles.methodLeft}>
              <View style={styles.methodIcon}>
                <MaterialIcons name="account-balance" size={24} color="#22c55e" />
              </View>
              <View>
                <Text style={styles.methodTitle}>Bank Account (ACH)</Text>
                <Text style={styles.methodSubtitle}>
                  {user.bank ? `****${user.bank.last4}` : 'Connect Bank'}
                </Text>
              </View>
            </View>
            {paymentMethod === 'bank' && (
              <MaterialIcons name="check-circle" size={24} color="#22c55e" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, paymentMethod === 'card' && styles.selectedMethod]}
            onPress={() => handlePaymentMethodPress('card')}
          >
            <View style={styles.methodLeft}>
              <View style={styles.methodIcon}>
                <MaterialIcons name="credit-card" size={24} color="#22c55e" />
              </View>
              <View>
                <Text style={styles.methodTitle}>Credit Card</Text>
                <Text style={styles.methodSubtitle}>3% processing fee</Text>
              </View>
            </View>
            {paymentMethod === 'card' && (
              <MaterialIcons name="check-circle" size={24} color="#22c55e" />
            )}
          </TouchableOpacity>
        </View>

        {/* AutoPay Option - Only show for bank payments */}
        {paymentMethod === 'bank' && (
          <View style={styles.autopayCard}>
            <View style={styles.autopayHeader}>
              <View style={styles.autopayLeft}>
                <MaterialIcons name="schedule" size={24} color="#22c55e" />
                <View>
                  <Text style={styles.autopayTitle}>Set Up AutoPay</Text>
                  <Text style={styles.autopaySubtitle}>
                    Pay automatically on due dates
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.setupButton}
                onPress={setupAutopay}
              >
                <Text style={styles.setupButtonText}>Setup</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#22c55e" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Due</Text>
            <Text style={styles.summaryValue}>${user.dueNow.toFixed(2)}</Text>
          </View>
          {paymentMethod === 'card' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Fee (3%)</Text>
              <Text style={styles.summaryValue}>
                ${(user.dueNow * 0.03).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total to Pay</Text>
            <Text style={styles.totalValue}>
              ${(user.dueNow * (paymentMethod === 'card' ? 1.03 : 1)).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="lock" size={20} color="white" />
              <Text style={styles.payButtonText}>
                Pay ${(user.dueNow * (paymentMethod === 'card' ? 1.03 : 1)).toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>
          <MaterialIcons name="verified-user" size={14} color="#64748b" />
          {' '}Secure payment by Stripe
        </Text>
      </View>
    </View>
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
    padding: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  totalBalance: {
    alignItems: 'center',
    marginBottom: 16,
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
  },
  balanceDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  dueNowSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueNowLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  dueNowAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
  },
  methodsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
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
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  autopayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  autopayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autopayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  autopayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  autopaySubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  setupButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22c55e',
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
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22c55e',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
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
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secureText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default MakePaymentScreen;