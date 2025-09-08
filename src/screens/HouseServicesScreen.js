// HouseServicesScreen.js (COMPLETE FIXED VERSION)

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
import apiClient, { 
  getAppUserInfo,
  getHouseServicesData, // DEPRECATED - keeping for fallback
  invalidateCache, 
  clearHouseCache
} from '../config/api';
import { useAuth } from '../context/AuthContext';
import HouseServiceDetailModal from '../modals/HouseServiceDetailModal';
import { isScreenPrefetched, getPrefetchStatus } from '../services/PrefetchService';

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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedService, setSelectedService] = useState(null);

  // ✅ NEW: Use unified endpoint for house services data
  const fetchHouseServices = useCallback(async () => {
    try {
      if (!user?.id) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      setError(null);
      if (!refreshing) setIsLoading(true);

      console.log('🚀 UNIFIED: Fetching house services from unified endpoint for user:', user.id);
      
      // ✅ NEW: Get house services data from unified endpoint
      const response = await getAppUserInfo(user.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load house services data');
      }
      
      const houseServices = response.data.houseServices || [];
      
      console.log('📊 UNIFIED: House services data received:', {
        servicesCount: houseServices.length,
        activeCount: houseServices.filter(s => s.status === 'active').length,
        pendingCount: houseServices.filter(s => s.status === 'pending').length,
        dataSource: 'unified_endpoint'
      });

      // Set the services data
      setServices(houseServices);

      console.log('✅ House services loaded successfully');

    } catch (error) {
      console.log('❌ House services fetch failed:', error.message);
      setError(`Failed to load house services: ${error.message}`);
      
      // Clear cache on error
      try {
        clearHouseCache(user?.houseId);
        console.log('🧹 Cleared house cache due to error');
      } catch (cacheError) {
        console.log('⚠️ Failed to clear house cache:', cacheError.message);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.houseId, refreshing]);

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

  // Enhanced refresh function that clears cache first
  const handleRefresh = () => {
    setRefreshing(true);
    // Clear cache to force fresh data
    clearHouseCache(user.houseId);
    fetchHouseServices();
  };

  const filteredServices = services.filter(service => {
    if (activeTab === 'active') return service.status === 'active';
    if (activeTab === 'pending') return service.status === 'pending';
    if (activeTab === 'deactivated') return service.status === 'inactive' || service.status === 'deactivated';
    return true;
  });

  // FIXED: Clean helper functions using new data structure
  const getPercentFunded = (service) => {
    if (service.calculatedData?.percentFunded !== undefined) {
      return service.calculatedData.percentFunded;
    }
    
    // Use totalRequired from backend (already includes service fee)
    const total = Number(service.totalRequired) || Number(service.amount) || 0;
    const funded = Number(service.fundedAmount) || 0;
    
    if (total === 0) return 0;
    return Math.round((funded / total) * 100);
  };

  const getContributorCount = (service) => {
    return service.calculatedData?.contributorCount || 0;
  };

  const getServiceDetails = (service) => {
    // Enhanced unified endpoint now provides calculatedData for all services
    if (service.calculatedData) {
      return service.calculatedData;
    }
    
    // Check if we have the enhanced data from individual service fetch (detail modal)
    if (service.ledgers && service.ledgers.length > 0) {
      const ledger = service.ledgers[0];
      return {
        fundingRequired: Number(ledger.totalRequired) || Number(ledger.fundingRequired) || 0,
        funded: Number(ledger.funded) || Number(ledger.fundedAmount) || 0,
        fundedAmount: Number(ledger.fundedAmount) || Number(ledger.funded) || 0,
        remainingAmount: Number(ledger.remainingAmount) || 0,
        percentFunded: ledger.percentFunded || 0,
        contributorCount: ledger.contributorCount || 0,
        userContributions: ledger.userContributions || []
      };
    }
    
    // Fallback for services without calculatedData (should be rare now)
    const fundingRequired = Number(service.totalRequired) || Number(service.amount) || 0;
    const funded = Number(service.fundedAmount) || 0;
    
    return {
      fundingRequired: fundingRequired,
      funded: funded,
      fundedAmount: funded,
      remainingAmount: Math.max(0, fundingRequired - funded),
      percentFunded: getPercentFunded(service),
      contributorCount: 0,
      userContributions: []
    };
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
                {formatCurrency(serviceDetails.fundedAmount || serviceDetails.funded)} of {formatCurrency(serviceDetails.fundingRequired)}
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
          <View style={styles.tabsWrapper}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'active' && styles.activeTab
              ]}
              onPress={() => setActiveTab('active')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'active' && styles.activeTabText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                Active
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === 'pending' && styles.activeTab
              ]}
              onPress={() => setActiveTab('pending')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'pending' && styles.activeTabText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === 'deactivated' && styles.activeTab
              ]}
              onPress={() => setActiveTab('deactivated')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'deactivated' && styles.activeTabText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                Deactivated
              </Text>
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

        {/* Service Detail Modal */}
        {selectedService && (
          <HouseServiceDetailModal
            visible={selectedService !== null}
            service={selectedService}
            activeLedger={selectedService.ledgers?.[0]}
            onClose={() => setSelectedService(null)}
            onServiceUpdated={(updatedService) => {
              // Update the service in the local state
              setServices(prevServices => 
                prevServices.map(service => 
                  service.id === updatedService.id ? updatedService : service
                )
              );
              // Close the modal after update
              setSelectedService(null);
            }}
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
    paddingBottom: 16,
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
    paddingHorizontal: 20,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 1,
  },
  activeTab: {
    backgroundColor: '#34d399',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  servicesList: {
    padding: 16,
    paddingBottom: 80,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 80,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
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
    marginBottom: 6,
  },
  fundingText: {
    fontSize: 13,
    color: '#34d399',
    fontWeight: '600',
  },
  contributorText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 2,
  },
  fullyFundedBar: {
    backgroundColor: '#10b981',
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  // Contributor Status Section
  contributorStatus: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  contributorLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  contributorList: {
    gap: 2,
  },
  contributorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributorName: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  contributorAmount: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  moreContributors: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Waiting Status Section
  waitingStatus: {
    marginTop: 6,
  },
  waitingLabel: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 4,
  },
  waitingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  waitingName: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '400',
  },
  moreWaiting: {
    fontSize: 10,
    color: '#fca5a5',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  // Fully Funded Badge
  fullyFundedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  fullyFundedText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
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