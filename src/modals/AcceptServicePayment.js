import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../config/api';

const AcceptServicePayment = ({ visible, onClose, taskData, onSuccess, onAddPaymentMethod }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [bundleDetails, setBundleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upfront pledge required (the amount the user must pay now)
  const effectivePaymentAmount = taskData?.paymentAmount != null
    ? Number(taskData.paymentAmount)
    : 0;

  // Monthly ownership amount (the recurring amount the user claims)
  const effectiveMonthlyAmount = taskData?.monthlyAmount != null
    ? Number(taskData.monthlyAmount)
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const serviceRequestBundleId = taskData?.serviceRequestBundleId || taskData?.bundleId;
        if (!serviceRequestBundleId) {
          throw new Error('Missing service request data');
        }

        // Fetch payment methods and bundle details in parallel.
        const [methodsResponse, bundleResponse] = await Promise.all([
          apiClient.get('/api/payment-methods'),
          apiClient.get(`/api/service-request-bundle/${serviceRequestBundleId}`)
        ]);

        const methods = methodsResponse.data?.paymentMethods || [];
        const bundleData = bundleResponse.data?.serviceRequestBundle;
        if (!bundleData) throw new Error('Failed to load service details');

        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethod(methods.find(m => m.isDefault)?.id || methods[0]?.id);
        }
        setBundleDetails(bundleData);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (visible && taskData) fetchData();
  }, [visible, taskData]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onSuccess({
        paymentMethod: selectedMethod,
        amount: effectivePaymentAmount,
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#34d399';
      case 'rejected': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    if (!method) return 'Select payment method';
    return method.type === 'card'
      ? `${method.brand} •••• ${method.last4}`
      : `Bank Account •••• ${method.last4}`;
  };

  const getMethodIcon = (type) => {
    return type === 'card' ? 'credit-card' : 'account-balance';
  };

  if (loading) return <LoadingModal visible={visible} />;
  if (error) return <ErrorModal visible={visible} error={error} onClose={onClose} />;
  if (!bundleDetails) return null;

  // Ensure these properties exist before using them
  const request = bundleDetails.stagedRequest || bundleDetails.takeOverRequest || {};
  const isRecurring = bundleDetails.takeOverRequest != null || 
                     bundleDetails.type === 'fixed_recurring' || 
                     bundleDetails.type === 'variable_recurring';
  const tasks = bundleDetails.tasks || [];
  const creator = bundleDetails.creator || {};
  const acceptedCount = tasks.filter(t => t.response === 'accepted').length || 0;
  const totalParticipants = tasks.length || 1;
  const pendingParticipants = tasks.filter(task => task.response === 'pending') || [];

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {bundleDetails.type === 'marketplace_onetime' 
              ? "One-time Service Request" 
              : bundleDetails.type === 'fixed_recurring'
                ? "Fixed Monthly Expense" 
                : "Variable Monthly Expense"
            }
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Service Details Card */}
          {request && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{request.serviceName || ''}</Text>
              <Text style={styles.cardSubtitle}>
                {request.partnerName ? `Provider: ${request.partnerName}` : ''}
              </Text>
              
              {/* Organized by */}
              <View style={styles.organizedBy}>
                <MaterialIcons name="person" size={18} color="#64748b" />
                <Text style={styles.organizedByText}>Request by {creator?.username || 'Unknown'}</Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Roommate Approvals: {acceptedCount}/{totalParticipants}</Text>
                <View style={styles.progressTrack}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(acceptedCount/totalParticipants) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Payment details */}
              <View style={styles.paymentSection}>
                {/* Upfront Payment */}
                {effectivePaymentAmount > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <View style={styles.titleWithHelp}>
                      <Text style={styles.paymentTitle}>
                        {bundleDetails.type === 'marketplace_onetime' ? "One-time Payment" : "Upfront Pledge Required"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => alert(bundleDetails.type === 'marketplace_onetime' 
                          ? "This is your share of the one-time service cost. Payment will only process after all roommates approve."
                          : "This is your portion of the initial setup fee or security deposit required to start the service."
                        )}
                      >
                        <MaterialIcons name="help-outline" size={18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Your Amount</Text>
                      <Text style={styles.paymentAmount}>${effectivePaymentAmount.toFixed(2)}</Text>
                    </View>
                  </View>
                )}

                {/* Monthly Ownership - Only for recurring services */}
                {(bundleDetails.type === 'fixed_recurring' || bundleDetails.type === 'variable_recurring') && (
                  <View>
                    <View style={styles.titleWithHelp}>
                      <Text style={styles.paymentTitle}>
                        {bundleDetails.type === 'fixed_recurring' 
                          ? "Monthly Share" 
                          : "Variable Monthly Share"
                        }
                      </Text>
                      <TouchableOpacity
                        onPress={() => alert(bundleDetails.type === 'fixed_recurring'
                          ? "This is your portion of the fixed monthly bill that will be split between roommates."
                          : "This is your estimated share of the monthly expense. The actual amount may vary month to month."
                        )}
                      >
                        <MaterialIcons name="help-outline" size={18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Monthly Amount</Text>
                      <Text style={styles.paymentAmount}>${effectiveMonthlyAmount.toFixed(2)}/mo</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Payment Method Section */}
          <View style={styles.paymentMethodSection}>
            <Text style={styles.paymentMethodTitle}>Payment Method</Text>
            
            {paymentMethods.length === 0 ? (
              <View style={styles.noPaymentMethodsContainer}>
                <Text style={styles.noPaymentMethodsText}>No payment methods available</Text>
                <TouchableOpacity 
                  style={styles.addMethodButton}
                  onPress={onAddPaymentMethod}
                >
                  <Text style={styles.addMethodButtonText}>Add Payment Method</Text>
                </TouchableOpacity>
              </View>
            ) : (
              !showPaymentOptions ? (
                <TouchableOpacity 
                  style={styles.paymentMethodSelector}
                  onPress={() => setShowPaymentOptions(true)}
                >
                  <View style={styles.paymentMethodInfo}>
                    <MaterialIcons
                      name={getMethodIcon(paymentMethods.find(m => m.id === selectedMethod)?.type)}
                      size={24}
                      color="#34d399"
                      style={styles.methodIcon}
                    />
                    <View style={styles.paymentMethodDetails}>
                      <Text style={styles.paymentMethodName}>
                        {getPaymentMethodDisplay(paymentMethods.find(m => m.id === selectedMethod))}
                      </Text>
                      {paymentMethods.find(m => m.id === selectedMethod)?.isDefault && (
                        <Text style={styles.paymentMethodDefaultLabel}>Default</Text>
                      )}
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
                </TouchableOpacity>
              ) : (
                <View>
                  {paymentMethods.map(method => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethodOption,
                        selectedMethod === method.id ? styles.selectedPaymentMethod : styles.unselectedPaymentMethod
                      ]}
                      onPress={() => {
                        setSelectedMethod(method.id);
                        setShowPaymentOptions(false);
                      }}
                    >
                      <View style={styles.paymentMethodInfo}>
                        <MaterialIcons
                          name={getMethodIcon(method.type)}
                          size={24}
                          color={selectedMethod === method.id ? "#34d399" : "#64748b"}
                          style={styles.methodIcon}
                        />
                        <View style={styles.paymentMethodDetails}>
                          <Text style={styles.paymentMethodName}>{getPaymentMethodDisplay(method)}</Text>
                          {method.isDefault && (
                            <Text style={styles.paymentMethodDefaultLabel}>Default</Text>
                          )}
                        </View>
                      </View>
                      {selectedMethod === method.id && (
                        <MaterialIcons name="check-circle" size={20} color="#34d399" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={22} color="#34d399" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {bundleDetails.type === 'marketplace_onetime'
                ? "Your payment will only be processed after all roommates have agreed to their pledges."
                : effectivePaymentAmount > 0
                  ? "By confirming, you agree to both your upfront pledge and monthly expense responsibility."
                  : "By confirming, you're claiming responsibility for your portion of this recurring expense."
              }
            </Text>
          </View>

          {/* Participants List */}
          <View style={styles.participantsCard}>
            <Text style={styles.participantsTitle}>Roommate Status</Text>
            
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
        </ScrollView>

        {/* Footer with buttons */}
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 16 }}>
              {isRecurring && effectivePaymentAmount > 0 
                ? "Upfront Payment" 
                : isRecurring 
                  ? "Monthly Ownership" 
                  : "Payment Amount"}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              ${isRecurring && effectivePaymentAmount > 0 
                ? effectivePaymentAmount.toFixed(2) 
                : effectiveMonthlyAmount.toFixed(2)}
              {isRecurring && effectivePaymentAmount === 0 ? "/mo" : ""}
            </Text>
          </View>
          
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity 
              style={{ 
                flex: 1, 
                backgroundColor: "#f1f5f9", 
                padding: 16, 
                borderRadius: 12, 
                alignItems: "center",
                marginRight: 8
              }}
              onPress={onClose}
            >
              <Text style={{ fontWeight: "bold", color: "#475569" }}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ 
                flex: 1,
                flexDirection: "row", 
                backgroundColor: "#34d399", 
                padding: 16, 
                borderRadius: 12, 
                alignItems: "center", 
                justifyContent: "center",
                marginLeft: 8
              }}
              onPress={handleAccept}
              disabled={isProcessing || paymentMethods.length === 0}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ fontWeight: "bold", color: "white" }}>
                    {effectivePaymentAmount > 0 ? "Pledge Payment" : "Accept Ownership"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const LoadingModal = ({ visible }) => (
  <Modal transparent visible={visible}>
    <View style={styles.modalOverlay}>
      <ActivityIndicator size="large" color="#34d399" />
    </View>
  </Modal>
);

const ErrorModal = ({ visible, error, onClose }) => (
  <Modal transparent visible={visible}>
    <View style={styles.modalOverlay}>
      <View style={styles.errorCard}>
        <MaterialIcons name="error-outline" size={40} color="#dc2626" style={styles.errorIcon} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={onClose}
        >
          <Text style={styles.errorButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

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
  
  // Progress
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginTop: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34d399",
  },
  
  // Payment sections
  paymentSection: {
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  paymentLabel: {
    color: "#0f172a",
  },
  paymentAmount: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  titleWithHelp: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  
  // Payment method section
  paymentMethodSection: {
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
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
  },
  noPaymentMethodsContainer: {
    alignItems: "center",
    padding: 16,
  },
  noPaymentMethodsText: {
    color: "#64748b",
    marginBottom: 12,
  },
  addMethodButton: {
    backgroundColor: "#34d399",
    padding: 12,
    borderRadius: 8,
  },
  addMethodButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  paymentMethodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentDescription: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    lineHeight: 20,
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  paymentMethodDefaultLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  paymentMethodOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: "#34d399",
    backgroundColor: "#f0fdf4",
  },
  unselectedPaymentMethod: {
    borderColor: "#e2e8f0",
    backgroundColor: "white",
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
  methodIcon: {
    marginRight: 12,
  },
  
  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#dff6f0",
  },
  footerAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  footerAmountLabel: {
    fontSize: 16,
    color: "#0f172a",
  },
  footerAmountValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  buttonRow: {
    flexDirection: "row",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  declineButtonText: {
    fontWeight: "bold",
    color: "#475569",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#34d399",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  participantStatusText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  acceptButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledAcceptButton: {
    backgroundColor: "#94e0c4",
  },
  acceptButtonText: {
    fontWeight: "bold",
    color: "white",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  acceptButtonIcon: {
    marginRight: 8,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 22,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fecaca",
    borderRadius: 12,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorButtonText: {
    color: "#dc2626",
    fontWeight: "bold",
  },
});

export default AcceptServicePayment;