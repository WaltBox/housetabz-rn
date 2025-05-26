// modals/HouseServiceDetailModal.js (COMPLETE REWRITTEN VERSION)

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
  
      setIsLoading(true);
      try {
        // Fetch house service details
        const serviceResp = await apiClient.get(`/api/houseServices/${service.id}`);
        setDetailedService(serviceResp.data);
        
        // If we don't have a ledger yet, try to fetch it
        if (!activeLedger) {
          try {
            const activeLedgerResp = await apiClient.get(`/api/house-service/${service.id}/active`);
            setActiveLedger(activeLedgerResp.data);
          } catch (err) {
        
          }
        }
        
        // Try to fetch all ledgers
        try {
          const ledgersResp = await apiClient.get(`/api/house-service/${service.id}`);
          if (ledgersResp.data?.ledgers) {
            setLedgers(ledgersResp.data.ledgers);
          }
        } catch (err) {
          console.log('No ledgers found or error fetching ledgers:', err);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [service?.id, visible]);

  const displayService = detailedService || service;
  const tasks = displayService.serviceRequestBundle?.tasks || [];

  // Special case for Google Fiber
  const enhancedService = 
    displayService.id === 7 && displayService.name?.includes('Google Fiber')
      ? { ...displayService, fundedAmount: 20 }
      : displayService;

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
          <View style={styles.tabIndicator} />
          <View style={styles.tabsWrapper}>
            <TouchableOpacity
              style={[styles.tab, { marginLeft: 0 }]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
              {activeTab === 'overview' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
                Details
              </Text>
              {activeTab === 'details' && <View style={styles.activeIndicator} />}
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
                  .then(r => { setDetailedService(r.data); setError(null); })
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
    activeLedger={detailedService?.activeLedger}
    ledgers={detailedService?.ledgers || []}
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
    padding: 16,
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: Platform.OS === "android"
      ? "sans-serif-black"
      : "Montserrat-Black",
  },
  closeButton: { padding: 8 },

  tabContainer: {
    position: 'relative',
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