import React, { useEffect, useState } from 'react';
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
import apiClient, { invalidateCache } from '../config/api';
import HouseServiceDetailModal from './HouseServiceDetailModal';

const HouseServicesModal = ({ house, onClose }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // Default tab is 'active'
  const [selectedService, setSelectedService] = useState(null); // Track selected service

  const fetchHouseServices = async () => {
    try {
      const response = await apiClient.get(`/api/houseServices/house/${house.id}`);
      const houseServices = response.data?.houseServices || [];
      setServices(houseServices);
      setError(null);
    } catch (err) {
      console.error('Error fetching house services:', err);
      setError('Failed to load house services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (house?.id) {
      fetchHouseServices();
    }
  }, [house?.id]);

  // Filter services based on active tab
  const filteredServices = services.filter(service => {
    if (activeTab === 'active') return service.status === 'active';
    if (activeTab === 'pending') return service.status === 'pending';
    if (activeTab === 'deactivated') return service.status === 'inactive' || service.status === 'deactivated';
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => setSelectedService(item)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={getServiceIcon(item.type)} 
            size={20} 
            color="#34d399" 
          />
        </View>
        <View style={styles.serviceTextContainer}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceType}>{formatServiceType(item.type)}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
    </TouchableOpacity>
  );

  const getServiceIcon = (type) => {
    switch (type) {
      case 'fixed_recurring':
        return 'request-quote';
      case 'variable_recurring':
        return 'sync-alt';
      case 'one_time':
        return 'receipt';
      case 'marketplace_onetime':
        return 'shopping-cart';
      default:
        return 'home';
    }
  };
  
  const formatServiceType = (type) => {
    switch (type) {
      case 'fixed_recurring':
        return 'Fixed';
      case 'variable_recurring':
        return 'Variable';
      case 'one_time':
        return 'One-time';
      case 'marketplace_onetime':
        return 'Marketplace';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  // Count services by status
  const activeCount = services.filter(s => s.status === 'active').length;
  const pendingCount = services.filter(s => s.status === 'pending').length;
  const deactivatedCount = services.filter(s => s.status === 'inactive' || s.status === 'deactivated').length;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>House Services</Text>
            <View style={styles.headerPlaceholder} />
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'active' && styles.activeTab
              ]}
              onPress={() => setActiveTab('active')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'active' && styles.activeTabText
              ]}>
                Active ({activeCount})
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
                activeTab === 'pending' && styles.activeTabText
              ]}>
                Pending ({pendingCount})
              </Text>
              {pendingCount > 0 && (
                <View style={styles.pendingDot} />
              )}
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
                activeTab === 'deactivated' && styles.activeTabText
              ]}>
                Deactivated ({deactivatedCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchHouseServices}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderServiceItem}
            contentContainerStyle={styles.servicesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialIcons 
                  name={activeTab === 'active' ? 'home' : 'pending-actions'} 
                  size={48} 
                  color="#64748b" 
                />
                <Text style={styles.emptyTitle}>
                  No {activeTab === 'active' ? 'Active' : 'Pending'} Services
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'active' 
                    ? 'Add house services to manage bills more efficiently'
                    : 'No services are currently awaiting approval'}
                </Text>
                {activeTab === 'active' && (
                  <TouchableOpacity 
                    style={styles.addButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addButtonText}>Add Service</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
        
        {/* Detail Modal */}
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
              // Clear cache and refetch to ensure fresh data
              setTimeout(() => {
                invalidateCache('houseService');
                fetchHouseServices();
              }, 100);
              // Optionally close the modal after update
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
  headerContainer: {
    backgroundColor: "#dff6f0",
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
  },
  closeButton: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 28,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: '#34d399',
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
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginLeft: 5,
  },
  servicesList: {
    padding: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  serviceType: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dff6f0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#34d399',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default HouseServicesModal;