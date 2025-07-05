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
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../config/api';
import OverviewTab from '../components/houseServices/OverviewTab';
import DetailsTab from '../components/houseServices/DetailsTab';

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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':   return '#34d399';
    case 'pending':  return '#f59e0b';
    case 'accepted': return '#34d399';
    case 'inactive':
    case 'cancelled':
    case 'rejected': return '#dc2626';
    default:         return '#64748b';
  }
};

const HouseServiceDetailModal = ({ service, activeLedger: initialLedger, onClose, visible }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [detailedService, setDetailedService] = useState(null);
  const [activeLedger, setActiveLedger] = useState(initialLedger);
  const [ledgers, setLedgers] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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