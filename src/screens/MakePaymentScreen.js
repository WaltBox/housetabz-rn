import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import PayTab from '../components/PayTab';
import MethodsTab from '../components/MethodsTab';
import HistoryTab from '../components/HistoryTab';
// Import apiClient instead of axios
import apiClient from '../config/api';

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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data when user ID changes or when refreshTrigger is updated
  useEffect(() => {
    if (authUser?.id) {
      fetchUserData();
      fetchCharges();
      fetchPaymentMethods();
    }
  }, [authUser?.id, refreshTrigger]);

  const fetchUserData = async () => {
    try {
      if (!authUser?.id) {
        console.error('No authenticated user found');
        return;
      }
      // Use apiClient with relative path
      const response = await apiClient.get(`/api/users/${authUser.id}`);
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
      
      // Use the new endpoint for unpaid charges
      console.log('Fetching unpaid charges...');
      // Use apiClient with relative path
      const response = await apiClient.get(`/api/users/${authUser.id}/charges/unpaid`);
      console.log(`Found ${response.data.length} unpaid charges`);
      setCharges(response.data);
    } catch (error) {
      console.error('Error fetching unpaid charges:', error);
      
      // Fallback to all charges endpoint
      try {
        console.log('Trying fallback to all charges...');
        // Use apiClient with relative path
        const fallbackResponse = await apiClient.get(`/api/users/${authUser.id}/charges`);
        
        // Filter out paid and processing charges client-side
        const unpaidCharges = fallbackResponse.data.filter(
          charge => charge.status !== 'paid' && charge.status !== 'processing'
        );
        
        console.log(`Found ${unpaidCharges.length} unpaid charges via fallback`);
        setCharges(unpaidCharges);
      } catch (fallbackError) {
        console.error('Fallback error fetching charges:', fallbackError);
        Alert.alert(
          "Network Error",
          "Unable to load your charges. Please try again later.",
          [{ text: "OK" }]
        );
        setCharges([]);
      }
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      if (!authUser?.id) return;
      // Use apiClient with relative path
      const response = await apiClient.get(`/api/payment-methods`);
      const methods = response.data.paymentMethods || [];
      setPaymentMethods(methods);
      setDefaultMethod(methods.find(method => method.isDefault));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  // Process when charges are updated by the PayTab component
  const handleChargesUpdated = useCallback((paidChargeIds) => {
    console.log('Charges updated in BillingScreen:', paidChargeIds);
    
    if (!paidChargeIds || paidChargeIds.length === 0) return;
    
    // Remove the paid charges from the state
    setCharges(currentCharges => {
      const updatedCharges = currentCharges.filter(
        charge => !paidChargeIds.includes(charge.id)
      );
      
      console.log(`Removed ${paidChargeIds.length} paid charges, ${updatedCharges.length} remaining`);
      return updatedCharges;
    });
  }, []);

  // Manual refresh function
  const refreshData = () => {
    setLoading(true);
    setRefreshTrigger(prev => prev + 1);
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

      {/* Refresh Button */}
      {/* <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={refreshData}
      >
        <MaterialIcons name="refresh" size={20} color="#64748b" />
      </TouchableOpacity> */}

      {/* Render Selected Tab */}
      {activeTab === TABS.PAY && (
        <PayTab 
          charges={charges} 
          onChargesUpdated={handleChargesUpdated} 
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
  // Refresh Button
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default BillingScreen;