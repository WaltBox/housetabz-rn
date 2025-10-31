import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import PayTab from '../components/PayTab';
import HistoryTab from '../components/HistoryTab';
import apiClient, { clearUserCache, invalidateCache, clearAllCache, getAppUserInfo } from '../config/api';
import { useFonts } from 'expo-font';
import FinancialWebSocket from '../services/FinancialWebSocket';

// Import the skeleton component
import BillingSkeleton from '../components/skeletons/BillingSkeleton';

const TABS = {
  PAY: 'pay',
  HISTORY: 'history',
};

const BillingScreen = () => {
  const { user: authUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.PAY);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [charges, setCharges] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  // WebSocket state for real-time charge updates
  const [financialSocket, setFinancialSocket] = useState(null);

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
  });

  // Fetch data when user ID changes or when refreshTrigger is updated
  useEffect(() => {
    if (authUser?.id) {
      fetchData();
    }
  }, [authUser?.id, refreshTrigger]);

  const fetchData = async () => {
    try {
      // ✅ CRITICAL FIX: Don't fetch data while payment confirmation is open
      if (activeTab === TABS.PAY && isConfirmationOpen) {
        console.log('⏸️ CRITICAL: Payment confirmation open - skipping data fetch');
        return;
      }
      
      setError(null);
      setLoading(true);
      
      // Fetch user data and charges in parallel
      const [userResponse, chargesResponse] = await Promise.all([
        fetchUserData(),
        fetchCharges()
      ]);
      
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      if (!authUser?.id) {
        console.error('No authenticated user found');
        return;
      }
      const response = await apiClient.get(`/api/users/${authUser.id}`);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  const fetchCharges = async () => {
    try {
      if (!authUser?.id) return;
      
      console.log('📡 Fetching unpaid charges...');
      // ✅ CRITICAL: Add nocache parameter to bypass stale cache
      const response = await apiClient.get(`/api/users/${authUser.id}/charges/unpaid?nocache=${Date.now()}`);
      console.log(`✅ Found ${response.data.length} unpaid charges`);
      setCharges(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching unpaid charges:', error);
      
      // Fallback to all charges endpoint
      try {
        console.log('Trying fallback to all charges...');
        const fallbackResponse = await apiClient.get(`/api/users/${authUser.id}/charges?nocache=${Date.now()}`);
        
        // Filter out paid and processing charges client-side
        const unpaidCharges = fallbackResponse.data.filter(
          charge => charge.status !== 'paid' && charge.status !== 'processing'
        );
        
        console.log(`Found ${unpaidCharges.length} unpaid charges via fallback`);
        setCharges(unpaidCharges);
        return unpaidCharges;
      } catch (fallbackError) {
        console.error('Fallback error fetching charges:', fallbackError);
        Alert.alert(
          "Network Error",
          "Unable to load your charges. Please try again later.",
          [{ text: "OK" }]
        );
        setCharges([]);
        throw fallbackError;
      }
    }
  };

  // SIMPLIFIED: Payment complete callback - just refresh in background
  const handlePaymentComplete = useCallback(() => {
    console.log('✅ Payment completed - refreshing data in background');
    // Clear cache and refetch silently
    clearAllCache();
    invalidateCache('dashboard');
    invalidateCache('house');
    invalidateCache('user');
    // Trigger refetch
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Manual refresh function
  const refreshData = () => {
    // ✅ CRITICAL FIX: Don't trigger refresh during payment
    if (isConfirmationOpen) {
      console.log('⏸️ CRITICAL: Payment in progress - blocking manual refresh');
      return;
    }
    setRefreshTrigger(prev => prev + 1);
  };

  // ✅ FIX 2: No-op handler for payment flow changes (DashboardScreen will track it)
  const handlePaymentFlowChange = (isActive) => {
    console.log(`📱 MakePaymentScreen: Payment flow ${isActive ? 'active' : 'inactive'}`);
    // No-op: DashboardScreen tracks this via its own flag
  };

  // WebSocket event handlers for real-time charge updates
  const handleFinancialUpdate = useCallback((data) => {
    console.log('💰 Pay screen received financial update:', data);
    
    // ✅ CRITICAL FIX: Don't fetch during payment flow
    if (activeTab === TABS.PAY && isConfirmationOpen) {
      console.log('⏸️ CRITICAL: Payment in progress - deferring financial update fetch');
      return;
    }
    
    // Clear cache and refresh charges when financial transactions occur
    clearUserCache(authUser.id);
    invalidateCache('dashboard');
    invalidateCache('house');
    invalidateCache('user');
    
    setRefreshTrigger(prev => prev + 1);
  }, [authUser?.id, activeTab, isConfirmationOpen]); // ✅ Add payment state dependency

  const handleChargeUpdate = useCallback((data) => {
    console.log('💳 Pay screen received charge update:', data);
    
    // ✅ CRITICAL FIX: Don't fetch during payment flow
    if (activeTab === TABS.PAY && isConfirmationOpen) {
      console.log('⏸️ CRITICAL: Payment in progress - deferring charge update fetch');
      return;
    }
    
    // If this is a charge being marked as paid, remove it immediately from local state
    if (data?.changeType === 'paid' && data?.chargeId) {
      console.log(`🎯 Charge ${data.chargeId} was paid, removing from UI immediately...`);
      setCharges(currentCharges => {
        const updated = currentCharges.filter(charge => charge.id !== data.chargeId);
        console.log(`✅ Removed charge ${data.chargeId}. Remaining charges: ${updated.length}`);
        return updated;
      });
    }
    
    // Also clear cache and refresh for other updates
    clearUserCache(authUser.id);
    invalidateCache('dashboard');
    invalidateCache('house');
    invalidateCache('user');
    
    setRefreshTrigger(prev => prev + 1);
  }, [authUser?.id, activeTab, isConfirmationOpen]); // ✅ Add payment state dependency

  // WebSocket initialization
  useEffect(() => {
    if (authUser?.id && token) {
      console.log('🚀 Pay screen: Initializing WebSocket for charge updates...');
      
      const socket = new FinancialWebSocket(token);
      socket.setFinancialUpdateHandler(handleFinancialUpdate);
      socket.setChargeUpdateHandler(handleChargeUpdate);
      socket.connect();
      
      console.log('✅ Pay screen: WebSocket handlers registered for financial_update and charge_update events');
      
      setFinancialSocket(socket);
      
      return () => {
        console.log('🔌 Pay screen: Cleaning up WebSocket...');
        socket.disconnect();
        setFinancialSocket(null);
      };
    }
  }, [authUser?.id, token, handleFinancialUpdate, handleChargeUpdate]);

  // Show skeleton while loading
  if (loading || !authUser?.id) {
    return <BillingSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <View style={styles.container}>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <View style={styles.tabIndicator} />
          <View style={styles.tabsWrapper}>
            {Object.values(TABS).map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={styles.tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabText, 
                  activeTab === tab && styles.activeTabText,
                  fontsLoaded && { fontFamily: 'Poppins-Medium' }
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
            
            {/* Confirm Payment Tab - Only visible when confirmation screen is open */}
            {isConfirmationOpen && (
              <TouchableOpacity 
                key="confirm-payment"
                style={[styles.tab, styles.confirmPaymentTab]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabText,
                  styles.confirmPaymentTabText,
                  fontsLoaded && { fontFamily: 'Poppins-Medium' }
                ]}>
                  Confirm Payment
                </Text>
                <View style={styles.confirmPaymentIndicator} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Render Selected Tab */}
        {activeTab === TABS.PAY && (
          <PayTab 
            charges={charges} 
            onChargesUpdated={handlePaymentComplete}
            onConfirmationStateChange={setIsConfirmationOpen}
            onPaymentFlowChange={handlePaymentFlowChange}
          />
        )}
        {/* Close confirmation when switching tabs */}
        {activeTab !== TABS.PAY && isConfirmationOpen && (
          <View onLayout={() => setIsConfirmationOpen(false)} />
        )}
        {activeTab === TABS.HISTORY && <HistoryTab />}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  tabContainer: {
    position: 'relative',
    paddingHorizontal: 0,
    marginBottom: 16,
    backgroundColor: "#dff6f0",
    paddingTop: 16,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  tab: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1e293b',
    zIndex: 1,
  },
  tabText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dff6f0',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmPaymentTab: {
    backgroundColor: '#34d399',
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
  },
  confirmPaymentTabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmPaymentIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'white',
    zIndex: 1,
  },
});

export default BillingScreen;