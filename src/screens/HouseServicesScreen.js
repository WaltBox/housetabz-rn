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
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import apiClient from '../config/api';
import { useAuth } from '../context/AuthContext';
import HouseServiceDetailModal from '../modals/HouseServiceDetailModal';

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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedService, setSelectedService] = useState(null);

  const fetchHouseServices = useCallback(async () => {
    try {
      if (!user?.houseId) {
        setError('No house associated with this account');
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get(`/api/houseServices/house/${user.houseId}`);
      const houseServices = response.data?.houseServices || [];
      setServices(houseServices);
      setError(null);
    } catch (err) {
      console.error('Error fetching house services:', err);
      setError('Failed to load house services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.houseId]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) setIsLoading(true);
      await fetchHouseServices();
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

  const filteredServices = services.filter(service => {
    if (activeTab === 'active') return service.status === 'active';
    if (activeTab === 'pending') return service.status === 'pending';
    return true;
  });

  const getPercentFunded = (service) => {
    const total = service.amount || 0;
    const funded = service.fundedAmount || 0;
    if (total === 0) return 0;
    return Math.round((funded / total) * 100);
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => setSelectedService(item)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceContent}>
        <View>
          <Text style={[
            styles.serviceName,
            fontsLoaded && { fontFamily: 'Poppins-Medium' }
          ]}>
            {item.name}
          </Text>
          <Text style={[
            styles.fundingText,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            {getPercentFunded(item)}% funded
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#1e293b" />
      </View>
    </TouchableOpacity>
  );

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

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e293b" />
          </View>
        ) : error ? (
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
            {filteredServices.length === 0 && (
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
              />
            )}
          </>
        )}

        {selectedService && (
          <HouseServiceDetailModal
            visible={selectedService !== null}
            service={selectedService}
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
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  fundingText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#dff6f0",
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
