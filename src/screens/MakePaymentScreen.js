import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const TABS = {
  PAY: 'pay',
  METHODS: 'methods',
  HISTORY: 'history',
};

const FIXED_HEADER_HEIGHT = 240; // Adjust as needed

const BillingScreen = () => {
  const [activeTab, setActiveTab] = useState(TABS.PAY);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [charges, setCharges] = useState([]);
  const [totalCharges, setTotalCharges] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [selectedCharges, setSelectedCharges] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchCharges();
    fetchPaymentMethods();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/users/1');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharges = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/users/1/charges');
      const pendingCharges = response.data;
      setCharges(pendingCharges);
      const total = pendingCharges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);
      setTotalCharges(total);
    } catch (error) {
      console.error('Error fetching charges:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/payment-methods');
      const methods = response.data.paymentMethods || [];
      setPaymentMethods(methods);
      setDefaultMethod(methods.find(method => method.isDefault));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const categorizeCharges = (chargesList) => {
    const today = new Date();
    return chargesList.reduce((acc, charge) => {
      if (!charge.dueDate) {
        acc.other.push(charge);
        return acc;
      }
      const dueDate = new Date(charge.dueDate);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        acc.late.push({ ...charge, status: 'late', daysLate: Math.abs(diffDays) });
      } else if (diffDays <= 7) {
        acc.upcoming.push({ ...charge, status: 'upcoming', daysUntilDue: diffDays });
      } else {
        acc.other.push({ ...charge, status: 'other', daysUntilDue: diffDays });
      }
      return acc;
    }, { late: [], upcoming: [], other: [] });
  };

  const handleChargeSelectToggle = (charge) => {
    setSelectedCharges(prev => {
      if (prev.includes(charge.id)) {
        return prev.filter(id => id !== charge.id);
      } else {
        return [...prev, charge.id];
      }
    });
  };

  const handlePayCharge = async (chargeId) => {
    try {
      console.log('Paying charge:', chargeId);
      // Implement individual charge payment logic here if needed
    } catch (error) {
      console.error('Error paying charge:', error);
    }
  };

  const handlePayAllCharges = async () => {
    try {
      console.log('Paying all charges');
      // Implement payment for all charges here
    } catch (error) {
      console.error('Error paying all charges:', error);
    }
  };

  const handlePaySelectedCharges = async () => {
    try {
      console.log('Paying selected charges:', selectedCharges);
      // Implement payment for only selected charges here
    } catch (error) {
      console.error('Error paying selected charges:', error);
    }
  };

  const renderChargeSection = (title, chargesGroup, color) => {
    if (chargesGroup.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: color }]} />
        </View>
        {chargesGroup.map((charge) => (
          <View key={charge.id} style={[styles.chargeCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <View style={styles.chargeHeader}>
              <MaterialIcons
                name={charge.metadata?.icon || 'error-outline'}
                size={20}
                color={color}
                style={styles.icon}
              />
              <View style={styles.chargeTextContainer}>
                <Text style={styles.chargeTitle}>{charge.name}</Text>
                <Text style={styles.chargeSubtitle}>
                  {charge.status === 'late'
                    ? `${charge.daysLate} days overdue`
                    : `Due in ${charge.daysUntilDue} days`}
                </Text>
              </View>
            </View>
            <View style={styles.chargeDetails}>
              <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: selectedCharges.includes(charge.id) ? '#34d399' : color }
                ]}
                onPress={() => handleChargeSelectToggle(charge)}
              >
                <Text style={styles.payButtonText}>
                  {selectedCharges.includes(charge.id) ? 'Selected' : 'Select to pay'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderFixedPayHeader = () => {
    const selectedTotal = charges
      .filter(charge => selectedCharges.includes(charge.id))
      .reduce((sum, charge) => sum + parseFloat(charge.amount), 0);
    const amountStyle = selectedCharges.length > 0 ? styles.balanceAmountSmall : styles.balanceAmount;
    return (
      // Wrapper to match the charges' horizontal margins
      <View style={styles.fixedPayWrapper}>
        <View style={styles.fixedPayContainer}>
          {selectedCharges.length === 0 ? (
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceTitle}>Total Amount Due</Text>
                <MaterialIcons name="info-outline" size={18} color="#64748b" />
              </View>
              <Text style={amountStyle}>${totalCharges.toFixed(2)}</Text>
              <TouchableOpacity style={styles.payAllButton} onPress={handlePayAllCharges}>
                <Text style={styles.payAllButtonText}>Pay All Outstanding Balance</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.balanceRow}>
              <View style={[styles.balanceCard, styles.halfBalanceCard]}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceTitle}>Total{'\n'}Due</Text>
                  <MaterialIcons name="info-outline" size={18} color="#64748b" />
                </View>
                <Text style={amountStyle}>${totalCharges.toFixed(2)}</Text>
                <TouchableOpacity style={styles.payAllButton} onPress={handlePayAllCharges}>
                  <Text style={styles.payAllButtonText}>Pay All</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.balanceCard, styles.halfBalanceCard]}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceTitle}>Selected Charges</Text>
                  <MaterialIcons name="check-circle-outline" size={18} color="#34d399" />
                </View>
                <Text style={amountStyle}>${selectedTotal.toFixed(2)}</Text>
                <TouchableOpacity
                  style={[styles.payAllButton, { backgroundColor: '#34d399' }]}
                  onPress={handlePaySelectedCharges}
                >
                  <Text style={styles.payAllButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPayTab = () => {
    const { late, upcoming, other } = categorizeCharges(charges);
    return (
      <View style={{ flex: 1 }}>
        {renderFixedPayHeader()}
        <ScrollView style={[styles.tabContent, { marginTop: FIXED_HEADER_HEIGHT }]} showsVerticalScrollIndicator={false}>
          {renderChargeSection('Late Payments', late, '#ef4444')}
          {renderChargeSection('Upcoming Payments', upcoming, '#eab308')}
          {renderChargeSection('Other Charges', other, '#34d399')}
          {charges.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="check-circle" size={40} color="#34d399" />
              <Text style={styles.emptyStateTitle}>All payments complete!</Text>
              <Text style={styles.emptyStateText}>No outstanding charges found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderMethodsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.defaultMethodHeader}>
          <Text style={styles.sectionTitle}>Default Payment Method</Text>
          <Text style={styles.defaultMethodNote}>Used for pledges & autopay</Text>
        </View>
        {defaultMethod ? (
          <View style={styles.defaultMethodCard}>
            <MaterialIcons
              name={defaultMethod.type === 'card' ? 'credit-card' : 'account-balance'}
              size={20}
              color="#34d399"
              style={styles.icon}
            />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>
                {defaultMethod.type === 'card'
                  ? `${defaultMethod.brand} •••• ${defaultMethod.last4}`
                  : `Bank Account •••• ${defaultMethod.last4}`}
              </Text>
              <Text style={styles.methodSubtitle}>Default Payment Method</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeMethodText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.defaultMethodCard}>
            <Text style={styles.methodSubtitle}>No default payment method set</Text>
          </View>
        )}
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Payment Methods</Text>
        </View>
        <TouchableOpacity style={styles.addMethodCard}>
          <View style={styles.addMethodContent}>
            <MaterialIcons name="add-circle-outline" size={24} color="#34d399" />
            <Text style={styles.addMethodText}>Add New Payment Method</Text>
          </View>
        </TouchableOpacity>
        {paymentMethods
          .filter(method => !method.isDefault)
          .map(method => (
            <View key={method.id} style={styles.methodCard}>
              <MaterialIcons
                name={method.type === 'card' ? 'credit-card' : 'account-balance'}
                size={20}
                color="#34d399"
                style={styles.icon}
              />
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>
                  {method.type === 'card'
                    ? `${method.brand} •••• ${method.last4}`
                    : `Bank Account •••• ${method.last4}`}
                </Text>
                {method.type === 'card' && (
                  <Text style={styles.methodSubtitle}>
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Text>
                )}
              </View>
              <TouchableOpacity>
                <MaterialIcons name="more-vert" size={20} color="#34d399" style={styles.icon} />
              </TouchableOpacity>
            </View>
          ))}
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionCard}>
          <View style={styles.transactionLeft}>
            <MaterialIcons name="wifi" size={20} color="#34d399" style={styles.icon} />
            <View>
              <Text style={styles.transactionTitle}>Internet Bill</Text>
              <Text style={styles.transactionDate}>Jan 15, 2025</Text>
            </View>
          </View>
          <Text style={styles.transactionAmount}>-$35.00</Text>
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {Object.values(TABS).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === TABS.PAY && renderPayTab()}
      {activeTab === TABS.METHODS && renderMethodsTab()}
      {activeTab === TABS.HISTORY && renderHistoryTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  // General Container Styles
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Tab Navigation
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#34d399',
  },
  tabText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#34d399',
  },
  tabContent: {
    flex: 1,
  },
  // Icon
  icon: {
    marginRight: 8,
  },
  // Balance Cards
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 8, // use vertical margin only, since horizontal will be provided by wrapper
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBalanceCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#1e293b',
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 16,
  },
  balanceAmountSmall: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
  },
  payAllButton: {
    backgroundColor: '#34d399',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Fixed Pay Container Wrapper (to match charges' horizontal margins)
  fixedPayWrapper: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  // Fixed Pay Container (the balance container, not altered in width)
  fixedPayContainer: {
    backgroundColor: '#dff6f0',
    paddingVertical: 8,
  },
  // Charge Sections
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 8,
    borderLeftWidth: 4,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Charge Cards
  chargeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chargeTextContainer: {
    flex: 1,
  },
  chargeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  chargeSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  chargeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  payButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginVertical: 8,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  // Payment Method Section
  defaultMethodHeader: {
    marginBottom: 12,
  },
  defaultMethodNote: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  defaultMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  changeMethodText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '500',
  },
  // Other Payment Methods
  addMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addMethodText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#34d399',
    marginLeft: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  // Transaction History
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default BillingScreen;
