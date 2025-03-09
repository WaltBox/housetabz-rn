import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../config/api';

const AcceptServicePayment = ({ visible, onClose, taskData, onSuccess, onAddPaymentMethod }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [bundleDetails, setBundleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For one-time upfront payment amount
  const effectivePaymentAmount = taskData?.paymentAmount != null
    ? Number(taskData.paymentAmount)
    : 0;

  // For monthly recurring amount (individual share)
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

  const request = bundleDetails.stagedRequest || bundleDetails.takeOverRequest;
  const isRecurring = bundleDetails.takeOverRequest != null;
  const isStaged = bundleDetails.stagedRequest != null;
  const { status, creator, tasks = [] } = bundleDetails;
  const pendingParticipants = tasks.filter(task => task.response === 'pending');
  const acceptedCount = tasks.filter(t => t.response === 'accepted').length;
  const totalParticipants = tasks.length;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Group Commitment</Text>
          <MaterialIcons
            name="close"
            size={28}
            color="#64748b"
            onPress={onClose}
            style={styles.closeIcon}
          />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{isStaged ? 'Commitment Status' : 'Request Status'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '1a' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(status) }]}>{status?.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="group" size={16} color="#64748b" />
              <Text style={styles.subLabel}>Organized by {creator?.username}</Text>
            </View>
          </View>

          {/* Service Details */}
          {request && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{request.serviceName}</Text>
              <Text style={styles.cardSubTitle}>
                {request.partnerName ? `with ${request.partnerName}` : ''}
              </Text>
              <View style={styles.costContainer}>
                <View style={styles.row}>
                  {isRecurring ? (
                    <>
                      <Text style={styles.label}>Total Monthly Cost</Text>
                      <Text style={styles.value}>
                        ${Number(request.monthlyAmount || 0).toFixed(2)}/mo
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.label}>Total Service Cost</Text>
                      <Text style={styles.value}>
                        ${Number(request.estimatedAmount || 0).toFixed(2)}
                      </Text>
                    </>
                  )}
                </View>
                {isRecurring && effectiveMonthlyAmount > 0 && (
                  <View style={[styles.row, styles.highlightedRow]}>
                    <Text style={styles.label}>Your Monthly Share</Text>
                    <Text style={styles.value}>${effectiveMonthlyAmount.toFixed(2)}/mo</Text>
                  </View>
                )}

                {effectivePaymentAmount > 0 && (
                  <View style={[styles.row, styles.highlightedRow, isRecurring ? { marginTop: 8 } : {}]}>
                    <Text style={styles.label}>
                      {isRecurring ? 'Your Upfront Payment' : 'Your Share'}
                    </Text>
                    <Text style={styles.value}>${effectivePaymentAmount.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Pledge Info */}
          <View style={styles.infoCard}>
            <MaterialIcons name="verified-user" size={22} color="#34d399" />
            <Text style={styles.infoText}>
              By confirming your pledge, HouseTabz will process your payment when everyone in house pledges.
            </Text>
          </View>

          {/* Participants Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Waiting On ({pendingParticipants.length})</Text>
              <Text style={styles.subLabel}>{acceptedCount}/{totalParticipants} Accepted</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarScroll}>
              {pendingParticipants.map(task => (
                <View key={task.id} style={styles.avatarContainer}>
                  <View style={[styles.avatar, { borderColor: getStatusColor(task.response) }]}>
                    <Text style={styles.avatarText}>{task.user?.username[0]?.toUpperCase()}</Text>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.response) }]} />
                  </View>
                  <Text style={styles.avatarName}>{task.user?.username}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>You need a card on file.</Text>
                <TouchableOpacity style={styles.addButton} onPress={onAddPaymentMethod}>
                  <Text style={styles.addButtonText}>Add Payment Method</Text>
                </TouchableOpacity>
              </View>
            ) : (
              !showPaymentOptions ? (
                <TouchableOpacity style={styles.paymentCard} onPress={() => setShowPaymentOptions(true)}>
                  <View style={styles.row}>
                    <MaterialIcons
                      name={getMethodIcon(paymentMethods.find(m => m.id === selectedMethod)?.type)}
                      size={24}
                      color="#34d399"
                    />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentTitle}>
                        {getPaymentMethodDisplay(paymentMethods.find(m => m.id === selectedMethod))}
                      </Text>
                      {paymentMethods.find(m => m.id === selectedMethod)?.isDefault && (
                        <Text style={styles.paymentSubtitle}>Default</Text>
                      )}
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
                </TouchableOpacity>
              ) : (
                <View style={styles.paymentOptions}>
                  {paymentMethods.map(method => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentOption,
                        selectedMethod === method.id && styles.selectedOption,
                      ]}
                      onPress={() => {
                        setSelectedMethod(method.id);
                        setShowPaymentOptions(false);
                      }}
                    >
                      <View style={styles.row}>
                        <MaterialIcons
                          name={getMethodIcon(method.type)}
                          size={24}
                          color={selectedMethod === method.id ? '#34d399' : '#64748b'}
                        />
                        <View style={styles.paymentInfo}>
                          <Text style={styles.paymentTitle}>{getPaymentMethodDisplay(method)}</Text>
                          {method.isDefault && (
                            <Text style={styles.paymentSubtitle}>Default</Text>
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
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.amountRow}>
            <Text style={styles.label}>
              {isRecurring
                ? (effectivePaymentAmount > 0 ? 'Upfront Payment' : 'Monthly Share')
                : 'Commitment Total'}
            </Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>
                ${(isRecurring && effectivePaymentAmount === 0
                  ? effectiveMonthlyAmount
                  : effectivePaymentAmount).toFixed(2)}
                {isRecurring && effectivePaymentAmount === 0 ? '/mo' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleAccept} disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="lock" size={18} color="white" />
                  <Text style={styles.confirmButtonText}>Confirm Pledge</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AcceptServicePayment;

const LoadingModal = ({ visible }) => (
  <Modal transparent visible={visible}>
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#34d399" />
    </View>
  </Modal>
);

const ErrorModal = ({ visible, error, onClose }) => (
  <Modal transparent visible={visible}>
    <View style={styles.centerContainer}>
      <View style={styles.errorCard}>
        <MaterialIcons name="error-outline" size={40} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onClose}>
          <Text style={styles.retryText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#dff6f0",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "Quicksand-Bold",
  },
  closeIcon: {
    padding: 5,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#dff6f0",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "Quicksand-Bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  subLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardSubTitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  costContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  highlightedRow: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    lineHeight: 22,
    marginLeft: 10,
  },
  avatarScroll: {
    paddingHorizontal: 4,
    marginTop: 8,
  },
  avatarContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    position: "relative",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  avatarName: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
    maxWidth: 64,
    textAlign: "center",
  },
  statusDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#dff6f0",
  },
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  paymentInfo: {
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  paymentSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#f0fdf4",
    borderColor: "#34d399",
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#34d399",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#dff6f0",
  },
  amountContainer: {
    backgroundColor: 'white',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dff6f0',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    marginRight: 6,
  },
  cancelButtonText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#34d399",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  errorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fecaca",
    borderRadius: 12,
  },
  retryText: {
    color: "#dc2626",
    fontWeight: "600",
  },
});


