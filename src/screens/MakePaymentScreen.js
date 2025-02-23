import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import PayTab from '../components/PayTab';
import MethodsTab from '../components/MethodsTab';
import HistoryTab from '../components/HistoryTab';

const TABS = {
  PAY: 'pay',
  METHODS: 'methods',
  HISTORY: 'history',
};

const BillingScreen = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.PAY);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [charges, setCharges] = useState([]);
  const [totalCharges, setTotalCharges] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [selectedCharges, setSelectedCharges] = useState([]);

  useEffect(() => {
    if (authUser?.id) {
      fetchUserData();
      fetchCharges();
      fetchPaymentMethods();
    }
  }, [authUser?.id]);

  const fetchUserData = async () => {
    try {
      if (!authUser?.id) {
        console.error('No authenticated user found');
        return;
      }
      const response = await axios.get(`http://localhost:3004/api/users/${authUser.id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharges = async () => {
    try {
      if (!authUser?.id) return;
      const response = await axios.get(`http://localhost:3004/api/users/${authUser.id}/charges`);
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
      if (!authUser?.id) return;
      const response = await axios.get(`http://localhost:3004/api/payment-methods`);
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
    setSelectedCharges((prev) =>
      prev.includes(charge.id)
        ? prev.filter(id => id !== charge.id)
        : [...prev, charge.id]
    );
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

  if (loading || !authUser?.id) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
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

      {/* Render Selected Tab */}
      {activeTab === TABS.PAY && (
        <PayTab
          charges={charges}
          totalCharges={totalCharges}
          selectedCharges={selectedCharges}
          handlePayAllCharges={handlePayAllCharges}
          handlePaySelectedCharges={handlePaySelectedCharges}
          handleChargeSelectToggle={handleChargeSelectToggle}
          categorizeCharges={categorizeCharges}
        />
      )}
      {activeTab === TABS.METHODS && (
        <MethodsTab defaultMethod={defaultMethod} paymentMethods={paymentMethods} />
      )}
      {activeTab === TABS.HISTORY && <HistoryTab />}
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
});

export default BillingScreen;
