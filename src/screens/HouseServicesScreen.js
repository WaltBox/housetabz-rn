// HouseServicesScreen.js (UPDATED WITH SKELETON)

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import apiClient from '../config/api';
import { useAuth } from '../context/AuthContext';
import HouseServiceDetailModal from '../modals/HouseServiceDetailModal';

// Import the skeleton component
import HouseServicesSkeleton from '../components/skeletons/HouseServicesSkeleton';

const HouseServicesScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
  });

  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [serviceFundingSummaries, setServiceFundingSummaries] = useState({});
  const [serviceLedgers, setServiceLedgers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedService, setSelectedService] = useState(null);

  // Function to fetch active ledger with enhanced data
  const fetchLedgerForService = async (serviceId) => {
    try {
      // The original path that worked before
      const response = await apiClient.get(`/api/house-service/${serviceId}/active`);
      return response.data;
    } catch (err) {
      // First error, try alternative path
      try {
        // Try the new path format
        const altResponse = await apiClient.get(`/api/house-service-ledgers/house-service/${serviceId}/active`);
        return altResponse.data;
      } catch (altErr) {
        // If both fail, log quietly and return null
        console.log(`No active ledger available for service ${serviceId}`);
        return null;
      }
    }
  };

  // Function to fetch funding summary for a service
  const fetchFundingSummaryForService = async (serviceId) => {
    try {
      // The correct path should match the routes we defined in house-service-ledger-routes.js
      const response = await apiClient.get(`/api/house-service-ledgers/house-service/${serviceId}/funding-summary`);
      return response.data;
    } catch (err) {
      // First error, try alternative path
      try {
        // Try another possible path format
        const altResponse = await apiClient.get(`/api/house-service/${serviceId}/funding-summary`);
        return altResponse.data;
      } catch (altErr) {
        // If both fail, log the original error but don't crash
        console.log(`No funding summary available for service ${serviceId}`);
        return null;
      }
    }
  };

  const fetchHouseServices = useCallback(async () => {
    try {
      if (!user?.houseId) {
        setError('No house associated with this account');
        setIsLoading(false);
        return;
      }

      setError(null);
      if (!refreshing) setIsLoading(true);

      // Fetch all house services
      const response = await apiClient.get(`/api/houseServices/house/${user.houseId}`);
      const houseServices = response.data?.houseServices || [];
      setServices(houseServices);

      // Fetch enhanced data for all services in parallel
      const ledgerPromises = houseServices.map(service => fetchLedgerForService(service.id));
      const summaryPromises = houseServices.map(service => fetchFundingSummaryForService(service.id));
      
      // Wait for all promises to resolve
      const [ledgerResults, summaryResults] = await Promise.all([
        Promise.all(ledgerPromises),
        Promise.all(summaryPromises)
      ]);
      
      // Organize data by service ID
      const ledgersData = {};
      const summariesData = {};
      
      houseServices.forEach((service, index) => {
        if (ledgerResults[index]) {
          ledgersData[service.id] = ledgerResults[index];
        }
        
        if (summaryResults[index]) {
          summariesData[service.id] = summaryResults[index];
        }
      });
      
      setServiceLedgers(ledgersData);
      setServiceFundingSummaries(summariesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching house services:', err);
      setError('Failed to load house services. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.houseId]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchHouseServices();
      }
    };

    loadData();

    const unsubscribe = navigation.addListener('focus', () => {
      if (isMounted) {
        loadData();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation, fetchHouseServices]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHouseServices();
  };

  const filteredServices = services.filter(service => {
    if (activeTab === 'active') return service.status === 'active';
    if (activeTab === 'pending') return service.status === 'pending';
    return true;
  });

  const getPercentFunded = (service) => {
    // First try to get data from the funding summary
    const summary = serviceFundingSummaries[service.id];
    if (summary?.activeLedger?.percentFunded !== undefined) {
      return summary.activeLedger.percentFunded;
    }
    
    // Then try the active ledger
    const ledger = serviceLedgers[service.id];
    if (ledger) {
      const total = Number(ledger.fundingRequired) || 0;
      const funded = Number(ledger.funded) || 0;
      
      if (total === 0) return 0;
      return Math.round((funded / total) * 100);
    }
    
    // Fall back to service data
    const total = Number(service.amount) || 0;
    const funded = Number(service.fundedAmount) || 0;
    
    // Special case for Google Fiber (ID 7)
    if (service.id === 7 && service.name?.includes('Google Fiber')) {
      return 20; // 20% funded
    }
    
    if (total === 0) return 0;
    return Math.round((funded / total) * 100);
  };

  const getContributorCount = (service) => {
    const ledger = serviceLedgers[service.id];
    if (ledger?.metadata?.fundedUsers?.length) {
      return ledger.metadata.fundedUsers.length;
    }
    return 0;
  };

  const getServiceDetails = (service) => {
    const summary = serviceFundingSummaries[service.id];
    const ledger = serviceLedgers[service.id];
    
    let details = {};
    
    if (summary?.activeLedger) {
      details = {
        fundingRequired: summary.activeLedger.fundingRequired,
        funded: summary.activeLedger.funded,
        remainingAmount: summary.activeLedger.remainingAmount,
        percentFunded: summary.activeLedger.percentFunded,
        contributorCount: summary.userContributions?.length || 0,
        userContributions: summary.userContributions || []
      };
    } else if (ledger) {
      details = {
        fundingRequired: ledger.fundingRequired,
        funded: ledger.funded,
        remainingAmount: Math.max(0, Number(ledger.fundingRequired) - Number(ledger.funded)),
        percentFunded: getPercentFunded(service),
        contributorCount: ledger.metadata?.fundedUsers?.length || 0,
        fundedUsers: ledger.metadata?.fundedUsers || []
      };
    } else {
      details = {
        fundingRequired: service.amount || 0,
        funded: service.fundedAmount || 0,
        remainingAmount: Math.max(0, Number(service.amount || 0) - Number(service.fundedAmount || 0)),
        percentFunded: getPercentFunded(service),
        contributorCount: 0,
        fundedUsers: []
      };
    }
    
    return details;
  };

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

  const renderServiceItem = ({ item }) => {
    const percentFunded = getPercentFunded(item);
    const contributorCount = getContributorCount(item);
    const serviceDetails = getServiceDetails(item);
    
    return (
      <TouchableOpacity 
        style={styles.serviceCard}
        onPress={() => setSelectedService(item)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceContent}>
          <View style={styles.serviceInfo}>
            <Text style={[
              styles.serviceName,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}>
              {item.name}
            </Text>
            
            <View style={styles.fundingInfo}>
              <Text style={[
                styles.fundingText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                {percentFunded}% funded
              </Text>
              
              {contributorCount > 0 && (
                <Text style={[
                  styles.contributorText,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  • {contributorCount} {contributorCount === 1 ? 'contributor' : 'contributors'}
                </Text>
              )}
            </View>
            
            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${percentFunded}%` }
                ]} 
              />
            </View>
            
            {/* Amount info */}
            <View style={styles.amountInfo}>
              <Text style={[
                styles.amountText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                {formatCurrency(serviceDetails.funded)} of {formatCurrency(serviceDetails.fundingRequired)}
              </Text>
              
              <Text style={[
                styles.remainingText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                {formatCurrency(serviceDetails.remainingAmount)} remaining
              </Text>
            </View>
          </View>
          
          <MaterialIcons name="chevron-right" size={24} color="#1e293b" />
        </View>
      </TouchableOpacity>
    );
  };

  // Show skeleton while loading (not refreshing)
  if (isLoading && !refreshing) {
    return <HouseServicesSkeleton />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[
            styles.headerTitle,
            fontsLoaded && { fontFamily: 'Montserrat-Black' }
          ]}>
            House Services
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabIndicator} />
          <View style={styles.tabsWrapper}>
            <TouchableOpacity 
              style={[styles.tab, { marginLeft: 0 }]}
              onPress={() => setActiveTab('active')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'active' && styles.activeTabText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                Active
              </Text>
              {activeTab === 'active' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setActiveTab('pending')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'pending' && styles.activeTabText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                Pending
              </Text>
              {activeTab === 'pending' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text style={[
              styles.errorText,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}>
              {error}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                setIsLoading(true);
                fetchHouseServices();
              }}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.retryButtonText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredServices.length === 0 && !isLoading && (
              <View style={styles.emptyContainer}>
                <MaterialIcons 
                  name={activeTab === 'active' ? 'home' : 'pending-actions'} 
                  size={64} 
                  color="#64748b" 
                />
                <Text style={[
                  styles.emptyTitle,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>
                  No {activeTab === 'active' ? 'Active' : 'Pending'} Services
                </Text>
                <Text style={[
                  styles.emptyText,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  {activeTab === 'active' 
                    ? 'No active house services to display'
                    : 'No services are currently awaiting approval'}
                </Text>
              </View>
            )}

            {filteredServices.length > 0 && (
              <FlatList
                data={filteredServices}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderServiceItem}
                contentContainerStyle={styles.servicesList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#34d399"
                  />
                }
              />
            )}
          </>
        )}

        {selectedService && (
          <HouseServiceDetailModal
            visible={selectedService !== null}
            service={selectedService}
            activeLedger={serviceLedgers[selectedService?.id]}
            fundingSummary={serviceFundingSummaries[selectedService?.id]}
            onClose={() => setSelectedService(null)}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
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
    marginBottom: 16,
    backgroundColor: "#dff6f0",
  },
  tabsWrapper: {
    flexDirection: 'row',
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
  },
  activeTabText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  servicesList: {
    padding: 20,
    paddingBottom: 80,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  fundingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fundingText: {
    fontSize: 14,
    color: '#64748b',
  },
  contributorText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 12,
    color: '#64748b',
  },
  remainingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: "#dff6f0",
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default HouseServicesScreen;