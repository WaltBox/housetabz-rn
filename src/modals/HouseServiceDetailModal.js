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
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../config/api';

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const HouseServiceDetailModal = ({ service, onClose, visible }) => {
  const [loading, setLoading] = useState(false);
  const [detailedService, setDetailedService] = useState(null);
  const [error, setError] = useState(null);
  
  // Don't render anything if not visible or no service
  if (!visible || !service) {
    return null;
  }
  
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!service?.id || !visible) return;
      
      setLoading(true);
      
      try {
        // Fetch detailed service info including tasks
        const response = await apiClient.get(`/api/houseServices/${service.id}`);
        setDetailedService(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [service?.id, visible]);
  
  // Use the detailed service if available, otherwise fall back to the service prop
  const displayService = detailedService || service;
  const bundle = displayService?.serviceRequestBundle;
  const tasks = bundle?.tasks || [];
  
  // Filter for pending tasks (tasks with status=false)
  const pendingTasks = tasks.filter(task => task.status === false);
  
  // Get partner info if available
  const stagedRequest = bundle?.stagedRequest || {};
  const partnerName = stagedRequest?.partnerName || 'Unknown Provider';
  
  // Service type info
  const serviceType = displayService?.metadata?.serviceType || displayService?.type;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
       
           <Text style={styles.cardTitle}>{displayService.name}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#64748b" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34d399" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                setLoading(true);
                if (service?.id) {
                  apiClient.get(`/api/houseServices/${service.id}`)
                    .then(response => {
                      setDetailedService(response.data);
                      setError(null);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error('Error fetching service details:', err);
                      setError('Failed to load service details');
                      setLoading(false);
                    });
                } else {
                  setLoading(false);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Service Details Card */}
            <View style={styles.card}>
            <Text style={styles.headerTitle}>
            {displayService.type === 'marketplace_onetime' 
              ? "One-time Service" 
              : displayService.type === 'fixed_recurring'
                ? "Fixed Monthly Service" 
                : "Variable Monthly Service"
            }
          </Text> 
              
              {/* Service type indicator */}
              <View style={styles.organizedBy}>
                <MaterialIcons 
                  name={getServiceIcon(displayService.type, serviceType)} 
                  size={20} 
                  color="#34d399" 
                />
                <Text style={styles.organizedByText}>
                  {formatServiceType(displayService.type)}
                  {serviceType && displayService.type !== serviceType}
                </Text>
              </View>

              {/* Status indicator */}
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(displayService.status) + '20' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.statusText, 
                      { color: getStatusColor(displayService.status) }
                    ]}
                  >
                    {capitalizeFirstLetter(displayService.status)}
                  </Text>
                </View>
              </View>
              
              {/* Additional details */}
              {displayService.accountNumber && (
                <View style={styles.additionalDetailsSection}>
                  <Text style={styles.additionalDetailsTitle}>Additional Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Number</Text>
                    <Text style={styles.detailValue}>{displayService.accountNumber}</Text>
                  </View>
                  
                  {displayService.createdAt && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Added On</Text>
                      <Text style={styles.detailValue}>{formatDate(displayService.createdAt)}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Approval Status Section */}
            {tasks.length > 0 && (
              <View style={styles.participantsCard}>
                <Text style={styles.participantsTitle}>Approval Status</Text>
                
                {tasks.map(task => (
                  <View 
                    key={task.id || Math.random().toString()} 
                    style={styles.participantRow}
                  >
                    <View style={styles.participantInfo}>
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantInitial}>{task.user?.username?.[0]?.toUpperCase() || "?"}</Text>
                      </View>
                      <Text style={styles.participantName}>{task.user?.username || "Unknown"}</Text>
                    </View>
                    <View style={[styles.participantStatusBadge, { backgroundColor: getStatusColor(task.response) + '20' }]}>
                      <Text style={[styles.participantStatusText, { color: getStatusColor(task.response) }]}>
                        {task.response === 'pending' ? 'PENDING' : task.response === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* Info Card - Only show if relevant */}
            {pendingTasks.length > 0 && (
              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={22} color="#34d399" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  This service is waiting for approval from {pendingTasks.length} roommate{pendingTasks.length > 1 ? 's' : ''}.
                </Text>
              </View>
            )}
            
            {/* Bills Placeholder */}
            <View style={styles.participantsCard}>
              <Text style={styles.participantsTitle}>Bill History</Text>
              <View style={styles.emptyBillContainer}>
                <MaterialIcons name="receipt" size={40} color="#cbd5e1" />
                <Text style={styles.emptyBillText}>No bills yet</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// Helper functions
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatServiceType = (type) => {
  switch (type) {
    case 'fixed_recurring':
      return 'This charge is the same every month';
    case 'variable_recurring':
      return 'This charge is different every month';
    case 'one_time':
      return 'This is a one time charge';
    case 'marketplace_onetime':
      return 'Marketplace';
    default:
      return type.replace(/_/g, ' ');
  }
};

const getServiceIcon = (type, serviceType) => {
  // First check the service-specific type if available
  if (serviceType) {
    switch (serviceType.toLowerCase()) {
      case 'energy':
      case 'electricity':
      case 'power':
        return 'bolt';
      case 'water':
        return 'water-drop';
      case 'internet':
      case 'wifi':
        return 'wifi';
      case 'gas':
        return 'local-fire-department';
      case 'security':
        return 'security';
      case 'cleaning':
        return 'cleaning-services';
    }
  }
  
  // Fallback to general type
  switch (type) {
    case 'fixed_recurring':
      return 'calendar-today';
    case 'variable_recurring':
      return 'sync';
    case 'one_time':
      return 'receipt';
    case 'marketplace_onetime':
      return 'shopping-cart';
    default:
      return 'home';
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '#34d399';
    case 'pending':
      return '#f59e0b';
    case 'inactive':
    case 'cancelled':
    case 'rejected':
      return '#dc2626';
    case 'accepted':
      return '#34d399';
    default:
      return '#64748b';
  }
};

// Styles matching the AcceptServicePayment modal
const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  closeButton: {
    padding: 8,
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff6f0",
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
    backgroundColor: "#34d399",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Content and cards
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: "#dff6f0",
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  
  // Organized by section
  organizedBy: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  organizedByText: {
    marginLeft: 8,
    color: "#64748b",
    fontSize: 14,
  },
  
  // Status
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusLabel: {
    color: "#64748b",
    fontSize: 14,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  
  // Additional details section
  additionalDetailsSection: {
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 16,
    marginTop: 16,
  },
  additionalDetailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    color: "#64748b",
  },
  detailValue: {
    fontWeight: "500",
    color: "#0f172a",
  },
  
  // Info Card
  infoCard: {
    flexDirection: "row",
    margin: 16,
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    borderColor: "#dcfce7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIcon: {
    marginRight: 12,
    alignSelf: "flex-start",
    paddingTop: 2,
  },
  infoText: {
    flex: 1,
    color: "#0f172a",
    lineHeight: 20,
  },
  
  // Participants list
  participantsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantInitial: {
    color: "#0f172a",
    fontWeight: "600",
  },
  participantName: {
    color: "#0f172a",
  },
  participantStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantStatusText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  
  // Empty bill section
  emptyBillContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyBillText: {
    marginTop: 8,
    color: "#94a3b8",
    fontSize: 16,
  }
});

export default HouseServiceDetailModal;