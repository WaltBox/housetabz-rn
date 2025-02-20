import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const TABS = {
  PAY: 'pay',
  METHODS: 'methods',
  HISTORY: 'history',
};

const BillingScreen = () => {
  const [activeTab, setActiveTab] = useState(TABS.PAY);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [autopayEnabled, setAutopayEnabled] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3004/api/users/1');
      setUser(response.data);
      setAutopayEnabled(response.data.autopayEnabled || false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPayTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Balance Overview */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Amount Due</Text>
        <Text style={styles.balanceAmount}>$245.00</Text>
        <View style={styles.balanceBreakdown}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Bills</Text>
            <Text style={styles.breakdownValue}>$175.00</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Pledged</Text>
            <Text style={styles.breakdownValue}>$70.00</Text>
          </View>
        </View>
      </View>

      {/* Active Bills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Bills</Text>
        
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <MaterialIcons name="flash-on" size={20} color="#22c55e" style={styles.icon} />
            <Text style={styles.billTitle}>February Energy Bill</Text>
          </View>
          <View style={styles.billDetails}>
            <View>
              <Text style={styles.billShare}>Your Share</Text>
              <Text style={styles.billAmount}>$45.00</Text>
            </View>
            <TouchableOpacity style={styles.payButton}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.billDue}>Due in 5 days</Text>
        </View>

        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <MaterialIcons name="wifi" size={20} color="#22c55e" style={styles.icon} />
            <Text style={styles.billTitle}>Internet - Xfinity</Text>
          </View>
          <View style={styles.billDetails}>
            <View>
              <Text style={styles.billShare}>Your Share</Text>
              <Text style={styles.billAmount}>$35.00</Text>
            </View>
            <TouchableOpacity style={styles.payButton}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.billDue}>Due in 8 days</Text>
        </View>
      </View>

      {/* Pledged Payments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pledged Payments</Text>
        
        <View style={styles.pledgeCard}>
          <View style={styles.pledgeHeader}>
            <MaterialIcons name="cleaning-services" size={20} color="#22c55e" style={styles.icon} />
            <Text style={styles.pledgeTitle}>Monthly Cleaning</Text>
          </View>
          <View style={styles.pledgeDetails}>
            <View>
              <Text style={styles.pledgeShare}>Your Share</Text>
              <Text style={styles.pledgeAmount}>$70.00</Text>
            </View>
            <View style={styles.pledgeStatus}>
              <MaterialIcons name="schedule" size={20} color="#22c55e" style={styles.icon} />
              <Text style={styles.pledgeStatusText}>Pending Approval</Text>
            </View>
          </View>
          <Text style={styles.pledgeNote}>
            Payment will be processed when all roommates approve
          </Text>
        </View>
      </View>
    </ScrollView>
  );

 // In BillingScreen.js, add a new state for payment methods
const [paymentMethods, setPaymentMethods] = useState([]);
const [defaultMethod, setDefaultMethod] = useState(null);

// Add a function to fetch payment methods
const fetchPaymentMethods = async () => {
  try {
    const response = await axios.get('http://localhost:3004/api/payment-methods');
    const methods = response.data.paymentMethods;
    setPaymentMethods(methods);
    setDefaultMethod(methods.find(method => method.isDefault));
  } catch (error) {
    console.error('Error fetching payment methods:', error);
  }
};

// Update useEffect to also fetch payment methods
useEffect(() => {
  fetchUserData();
  fetchPaymentMethods();
}, []);

// Update the renderMethodsTab function
const renderMethodsTab = () => (
  <ScrollView style={styles.tabContent}>
    {/* Default Payment Method */}
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
            color="#22c55e" 
            style={styles.icon} 
          />
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>
              {defaultMethod.type === 'card' 
                ? `${defaultMethod.brand} •••• ${defaultMethod.last4}`
                : `Bank Account •••• ${defaultMethod.last4}`
              }
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

    {/* Other Payment Methods */}
 {/* Other Payment Methods */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Other Payment Methods</Text>
  </View>
  
  {/* Add New Payment Method Card */}
  <TouchableOpacity style={styles.addMethodCard}>
    <View style={styles.addMethodContent}>
      <MaterialIcons name="add-circle-outline" size={24} color="#22c55e" />
      <Text style={styles.addMethodText}>Add New Payment Method</Text>
    </View>
  </TouchableOpacity>

  {/* Existing Payment Methods */}
  {paymentMethods
    .filter(method => !method.isDefault)
    .map(method => (
      <View key={method.id} style={styles.methodCard}>
        <MaterialIcons 
          name={method.type === 'card' ? 'credit-card' : 'account-balance'} 
          size={20} 
          color="#22c55e" 
          style={styles.icon} 
        />
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>
            {method.type === 'card' 
              ? `${method.brand} •••• ${method.last4}`
              : `Bank Account •••• ${method.last4}`
            }
          </Text>
          <Text style={styles.methodSubtitle}>
            {method.type === 'card' && `Expires ${method.expiryMonth}/${method.expiryYear}`}
          </Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={20} color="#22c55e" style={styles.icon} />
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
            <MaterialIcons name="wifi" size={20} color="#22c55e" style={styles.icon} />
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
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
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

      {/* Tab Content */}
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
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#22c55e',
  },
  tabContent: {
    flex: 1,
  },

  // Icon (Unified)
  icon: {
    marginRight: 8,
  },

  // Balance Card
  balanceCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  breakdownDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 24,
  },

  // Section Headers & General Section Styling
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },

  // Bill Card
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billShare: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  billDue: {
    fontSize: 13,
    color: '#64748b',
  },
  payButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Pledge Card
  pledgeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pledgeTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  pledgeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pledgeShare: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  pledgeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  pledgeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pledgeStatusText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  pledgeNote: {
    fontSize: 13,
    color: '#64748b',
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
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
  },

  // Autopay
  autopayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  autopaySubtitle: {
    fontSize: 13,
    color: '#64748b',
  },

  // Other Payment Methods (Add Button & Method Card)
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
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
    color: '#22c55e',
    marginLeft: 8,
  },
});

export default BillingScreen;
