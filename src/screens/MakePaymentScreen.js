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
import apiClient from '../config/api';
import { useFonts } from 'expo-font';

// Import the skeleton component
import BillingSkeleton from '../components/skeletons/BillingSkeleton';

const TABS = {
  PAY: 'pay',
  HISTORY: 'history',
};

const BillingScreen = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.PAY);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [charges, setCharges] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);

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
      
      console.log('Fetching unpaid charges...');
      const response = await apiClient.get(`/api/users/${authUser.id}/charges/unpaid`);
      console.log(`Found ${response.data.length} unpaid charges`);
      setCharges(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching unpaid charges:', error);
      
      // Fallback to all charges endpoint
      try {
        console.log('Trying fallback to all charges...');
        const fallbackResponse = await apiClient.get(`/api/users/${authUser.id}/charges`);
        
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
    setRefreshTrigger(prev => prev + 1);
  };

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.headerTitle,
            fontsLoaded && { fontFamily: 'Montserrat-Black' }
          ]}>
            Payments
          </Text>
        </View>
        
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
          </View>
        </View>

        {/* Render Selected Tab */}
        {activeTab === TABS.PAY && (
          <PayTab 
            charges={charges} 
            onChargesUpdated={handleChargesUpdated} 
          />
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
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
  },
  tabContainer: {
    position: 'relative',
    paddingHorizontal: 0,
    marginBottom: 16,
    backgroundColor: "#dff6f0",
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
});

export default BillingScreen;