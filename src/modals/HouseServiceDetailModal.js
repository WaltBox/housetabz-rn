// modals/HouseServiceDetailModal.js (FIXED VERSION - PRESERVES ENHANCED DATA)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient, { invalidateCache, clearUserCache, clearHouseCache } from '../config/api';
import { useAuth } from '../context/AuthContext';
import OverviewTab from '../components/houseServices/OverviewTab';
import DetailsTab from '../components/houseServices/DetailsTab';
import AddChargeModal from './AddChargeModal';

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const capitalizeFirstLetter = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const getStatusColor = (status, paymentStatus) => {
  // Handle combined status display for consent-based payments
  if (paymentStatus) {
    switch (paymentStatus?.toLowerCase()) {
      case 'authorized': return '#3b82f6'; // Blue for consent given
      case 'completed': return '#34d399'; // Green for payment completed
      case 'cancelled': return '#dc2626'; // Red for payment cancelled
      case 'pending': return '#f59e0b'; // Orange for pending consent
      default: break;
    }
  }
  
  // Fallback to regular status colors
  switch (status?.toLowerCase()) {
    case 'active':   return '#34d399';
    case 'pending':  return '#f59e0b';
    case 'accepted': return '#34d399';
    case 'inactive':
    case 'deactivated': return '#94a3b8'; // Gray for deactivated
    case 'cancelled':
    case 'rejected': return '#dc2626';
    default:         return '#64748b';
  }
};

const getStatusDisplayText = (status, paymentStatus) => {
  // Handle combined status display for consent-based payments
  if (paymentStatus) {
    switch (paymentStatus?.toLowerCase()) {
      case 'authorized': return 'CONSENTED';
      case 'completed': return 'PAID';
      case 'cancelled': return 'CANCELLED';
      case 'pending': return 'PENDING';
      default: break;
    }
  }
  
  // Fallback to regular status text
  switch (status?.toLowerCase()) {
    case 'active': return 'ACTIVE';
    case 'pending': return 'PENDING';
    case 'accepted': return 'ACCEPTED';
    case 'inactive': 
    case 'deactivated': return 'DEACTIVATED';
    case 'cancelled': return 'CANCELLED';
    case 'rejected': return 'REJECTED';
    default: return status?.toUpperCase() || 'UNKNOWN';
  }
};

const HouseServiceDetailModal = ({ service, activeLedger: initialLedger, onClose, visible, onServiceUpdated }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [detailedService, setDetailedService] = useState(null);
  const [activeLedger, setActiveLedger] = useState(initialLedger);
  const [ledgers, setLedgers] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);

  // Check if current user is the designated user for this service
  const isDesignatedUser = user?.id === (detailedService?.designatedUserId || service?.designatedUserId);
  

  
  // Handle deactivation
  const handleDeactivate = async () => {
    Alert.alert(
      'Deactivate Service',
      'This will stop automatic bill generation for this service. You can reactivate it later if needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setIsDeactivating(true);
            try {
              const response = await apiClient.patch(`/api/houseServices/${service.id}/deactivate`);
              
              // Update local state with response data
              const updatedService = {
                ...detailedService,
                status: 'inactive',
                previousStatus: response.data.previousStatus,
                deactivatedAt: response.data.timestamps?.deactivatedAt
              };
              setDetailedService(updatedService);
              
              console.log('🔄 Service deactivated successfully:', service.name);
              
              // Show success message and close modal
              Alert.alert(
                'Service Deactivated',
                response.data.message || `${service.name} has been deactivated successfully.`,
                [{ 
                  text: 'OK',
                  onPress: () => {
                    // Notify parent and close modal
                    if (onServiceUpdated) {
                      onServiceUpdated(updatedService);
                    }
                    onClose();
                  }
                }]
              );
            } catch (error) {
              console.error('Deactivation failed:', error);
              let errorMessage = 'Failed to deactivate service. Please try again.';
              
              if (error.response?.status === 403) {
                errorMessage = 'You are not authorized to deactivate this service. Only the designated user can perform this action.';
              } else if (error.response?.status === 404) {
                errorMessage = 'Service not found. It may have been deleted.';
              } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Cannot deactivate this service in its current state.';
              }
              
              Alert.alert('Deactivation Failed', errorMessage, [{ text: 'OK' }]);
            } finally {
              setIsDeactivating(false);
            }
          }
        }
      ]
    );
  };

  // Handle reactivation
  const handleReactivate = async () => {
    Alert.alert(
      'Reactivate Service',
      'This will resume automatic bill generation for this service.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reactivate',
          onPress: async () => {
            setIsDeactivating(true);
            try {
              const response = await apiClient.patch(`/api/houseServices/${service.id}/reactivate`);
              
              // Update local state with response data
              const updatedService = {
                ...detailedService,
                status: 'active',
                previousStatus: response.data.previousStatus,
                reactivatedAt: response.data.timestamps?.reactivatedAt
              };
              setDetailedService(updatedService);
              
              console.log('🔄 Service reactivated successfully:', service.name);
              
              // Show success message and close modal
              Alert.alert(
                'Service Reactivated',
                response.data.message || `${service.name} has been reactivated successfully.`,
                [{ 
                  text: 'OK',
                  onPress: () => {
                    // Notify parent and close modal
                    if (onServiceUpdated) {
                      onServiceUpdated(updatedService);
                    }
                    onClose();
                  }
                }]
              );
            } catch (error) {
              console.error('Reactivation failed:', error);
              let errorMessage = 'Failed to reactivate service. Please try again.';
              
              if (error.response?.status === 403) {
                errorMessage = 'You are not authorized to reactivate this service. Only the designated user can perform this action.';
              } else if (error.response?.status === 404) {
                errorMessage = 'Service not found. It may have been deleted.';
              } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Cannot reactivate this service in its current state.';
              }
              
              Alert.alert('Reactivation Failed', errorMessage, [{ text: 'OK' }]);
            } finally {
              setIsDeactivating(false);
            }
          }
        }
      ]
    );
  };

  if (!visible || !service) return null;

  useEffect(() => {
    const fetchData = async () => {
      if (!service?.id || !visible) return;
  
      // Check if we already have enhanced data - if so, be more selective about what we fetch
      const hasEnhancedData = service.calculatedData;

  
      setIsLoading(true);
      try {
        // Always fetch detailed service info for tasks and bundle details
     
        const serviceResp = await apiClient.get(`/api/houseServices/${service.id}`);
        
        // CRITICAL: Merge the enhanced data from the original service with the detailed data
        const mergedService = {
          ...serviceResp.data,
          // Preserve the enhanced data if it exists
          ...(hasEnhancedData && {
            calculatedData: service.calculatedData,
            ledgers: service.ledgers || serviceResp.data.ledgers
          })
        };
        
     
        setDetailedService(mergedService);
        
        // If we don't have a ledger yet and don't have enhanced data, try to fetch it
        if (!activeLedger && !hasEnhancedData) {
          try {
           
            const activeLedgerResp = await apiClient.get(`/api/house-service/${service.id}/active`);
            setActiveLedger(activeLedgerResp.data);
          } catch (err) {
  
          }
        }
        
        // Try to fetch all ledgers only if we don't have them
        if (!hasEnhancedData || !service.ledgers?.length) {
          try {
        
            const ledgersResp = await apiClient.get(`/api/house-service/${service.id}`);
            if (ledgersResp.data?.ledgers) {
              setLedgers(ledgersResp.data.ledgers);
            }
          } catch (err) {
      
          }
        } else {
          // Use ledgers from enhanced data
          setLedgers(service.ledgers || []);
        }
        
        setError(null);
      } catch (err) {

        setError('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [service?.id, visible]);

  // Use the detailed service data (now includes ledger info), but merge in original service data as fallback
  const displayService = {
    ...service, // Original service data as fallback
    ...(detailedService && detailedService), // Use detailed service data (now has ledger info)
    // Extract service fee and total from active ledger if available
    ...(detailedService?.ledgers?.length > 0 && {
      serviceFeeTotal: detailedService.ledgers[0].serviceFeeTotal,
      totalRequired: detailedService.ledgers[0].totalRequired,
      fundingRequired: detailedService.ledgers[0].fundingRequired,
      funded: detailedService.ledgers[0].funded
    })
  };
  
  // Debug logging to track status changes
  console.log('🔍 Modal displayService status:', displayService.status, 'Service name:', displayService.name);
  const tasks = displayService.serviceRequestBundle?.tasks || [];



  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{displayService.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={28} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons - Below service name */}
        {isDesignatedUser && (
          <View style={styles.actionButtonsContainer}>
            {/* Add Charge Button - Only show when service is active */}
            {displayService.status === 'active' && (
              <TouchableOpacity
                onPress={() => setShowAddChargeModal(true)}
                style={[styles.actionButton, styles.addChargeButton]}
              >
                <MaterialIcons 
                  name="add-circle-outline" 
                  size={18} 
                  color="#3b82f6" 
                  style={styles.actionButtonIcon}
                />
                <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>Add Charge</Text>
              </TouchableOpacity>
            )}
            
            {/* Deactivate/Reactivate Button */}
            <TouchableOpacity
              onPress={displayService.status === 'active' ? handleDeactivate : handleReactivate}
              style={[
                styles.actionButton,
                displayService.status === 'active' 
                  ? styles.deactivateButton 
                  : styles.reactivateButton,
                isDeactivating && styles.actionButtonDisabled
              ]}
              disabled={isDeactivating}
            >
              {isDeactivating ? (
                <ActivityIndicator 
                  size="small" 
                  color={displayService.status === 'active' ? '#ef4444' : '#34d399'} 
                />
              ) : (
                <>
                  <MaterialIcons 
                    name={displayService.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'} 
                    size={18} 
                    color={displayService.status === 'active' ? '#ef4444' : '#34d399'} 
                    style={styles.actionButtonIcon}
                  />
                  <Text style={[
                    styles.actionButtonText, 
                    { color: displayService.status === 'active' ? '#ef4444' : '#34d399' }
                  ]}>
                    {displayService.status === 'active' ? 'Deactivate' : 'Reactivate'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          <View style={styles.tabsWrapper}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'overview' && styles.activeTab
              ]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'overview' && styles.activeTabText
              ]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'details' && styles.activeTab
              ]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'details' && styles.activeTabText
              ]}>
                Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e293b" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setIsLoading(true);
                apiClient.get(`/api/houseServices/${service.id}`)
                  .then(r => { 
                    // Preserve enhanced data on retry too
                    const mergedService = {
                      ...r.data,
                      ...(service.calculatedData && {
                        calculatedData: service.calculatedData,
                        ledgers: service.ledgers || r.data.ledgers
                      })
                    };
                    setDetailedService(mergedService); 
                    setError(null); 
                  })
                  .catch(() => setError('Failed to load service details'))
                  .finally(() => setIsLoading(false));
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
           {activeTab === 'overview' ? (
  <OverviewTab
    displayService={displayService}
    tasks={tasks}
    formatDate={formatDate}
    getStatusColor={getStatusColor}
    activeLedger={activeLedger || displayService?.activeLedger}
    ledgers={ledgers.length > 0 ? ledgers : (displayService?.ledgers || [])}
  />
) : (
  <DetailsTab
    displayService={displayService}
    formatDate={formatDate}
    getStatusColor={getStatusColor}
    capitalizeFirstLetter={capitalizeFirstLetter}
  />
)}
          </ScrollView>
        )}
      </SafeAreaView>
      
      {/* Add Charge Modal */}
      <AddChargeModal
        visible={showAddChargeModal}
        onClose={() => setShowAddChargeModal(false)}
        service={displayService}
        onSuccess={(result) => {
          console.log('Manual charge created successfully:', result);
          // Optionally refresh the service data or notify parent
          if (onServiceUpdated) {
            // Trigger a refresh by updating the service
            onServiceUpdated({ ...displayService, lastUpdated: new Date() });
          }
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#dff6f0" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: Platform.OS === "android"
      ? "sans-serif-black"
      : "Montserrat-Black",
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: "#dff6f0",
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  deactivateButton: {
    borderColor: '#ef4444',
  },
  reactivateButton: {
    borderColor: '#34d399',
  },
  addChargeButton: {
    borderColor: '#3b82f6',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: { 
    padding: 8,
    borderRadius: 8,
  },

  tabContainer: {
    position: 'relative',
    marginBottom: 20,
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
    paddingVertical: 10,
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

  scrollContent: {
    paddingBottom: 20,
    backgroundColor: "#dff6f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HouseServiceDetailModal;