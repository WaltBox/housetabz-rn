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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const AcceptServicePayment = ({ 
  visible,
  onClose,
  taskData,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [bundleDetails, setBundleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const serviceRequestBundleId = taskData?.serviceRequestBundleId || taskData?.bundleId;
        if (!serviceRequestBundleId) {
          throw new Error('Missing service request data');
        }

        const [methodsResponse, bundleResponse] = await Promise.all([
          axios.get('http://localhost:3004/api/payment-methods'),
          axios.get(`http://localhost:3004/api/service-request-bundle/${serviceRequestBundleId}`)
        ]);

        const methods = methodsResponse.data?.paymentMethods || [];
        const bundleData = bundleResponse.data?.serviceRequestBundle;

        if (!bundleData) throw new Error('Failed to load service details');
        if (methods.length === 0) throw new Error('No payment methods found');

        setPaymentMethods(methods);
        setSelectedMethod(methods.find(m => m.isDefault)?.id || methods[0]?.id);
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
        amount: taskData.paymentAmount,
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
      case 'accepted': return '#22c55e';
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

  const { stagedRequest, status, creator, tasks = [] } = bundleDetails;
  const { paymentAmount } = taskData;
  const pendingParticipants = tasks.filter(
    task => task.type === 'service_request' && task.response === 'pending'
  );
  const acceptedCount = tasks.filter(t => t.response === 'accepted').length;
  const totalParticipants = tasks.length;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Secure Group Commitment</Text>
            <MaterialIcons 
              name="close" 
              size={24} 
              color="#64748b" 
              onPress={onClose} 
              style={styles.closeIcon}
            />
          </View>

          <ScrollView contentContainerStyle={styles.contentContainer}>
            {/* Status Section */}
            <View style={styles.statusSection}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Commitment Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '1a' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                    {status?.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.creatorRow}>
                <MaterialIcons name="group" size={16} color="#64748b" />
                <Text style={styles.creatorText}>Organized by {creator?.username}</Text>
              </View>
            </View>

            {/* Service Details */}
            {stagedRequest && (
              <View style={styles.serviceCard}>
                <Text style={styles.serviceName}>{stagedRequest.serviceName}</Text>
                <Text style={styles.providerName}>with {stagedRequest.partnerName}</Text>
                <View style={styles.costBreakdown}>
                  <View style={styles.costRow}>
                    <Text style={styles.label}>Total Service Cost</Text>
                    <Text style={styles.value}>
                      ${Number(stagedRequest.estimatedAmount).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.costRow, styles.highlightedRow]}>
                    <Text style={styles.label}>Your Contribution</Text>
                    <Text style={styles.shareAmount}>${paymentAmount.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}

 {/* Pledge Info */}
 <View style={styles.infoCard}>
              <MaterialIcons name="verified-user" size={22} color="#16a34a" />
              <Text style={styles.infoText}>
              By confirming your pledge, HouseTabz will process your payment wheneveryone in house pledges.
              </Text>
            </View>

            {/* Redesigned Participants Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Waiting On ({pendingParticipants.length})</Text>
                <Text style={styles.acceptedCount}>
                  {acceptedCount}/{totalParticipants} Accepted
                </Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarScroll}
              >
                {pendingParticipants.map(task => (
                  <View key={task.id} style={styles.avatarContainer}>
                    <View style={[
                      styles.avatar,
                      { borderColor: getStatusColor(task.response) }
                    ]}>
                      <Text style={styles.avatarText}>
                        {task.user?.username[0]?.toUpperCase()}
                      </Text>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(task.response) }
                      ]} />
                    </View>
                    <Text style={styles.avatarName}>{task.user?.username}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Payment Method Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              {!showPaymentOptions ? (
                <TouchableOpacity
                  style={styles.paymentCard}
                  onPress={() => setShowPaymentOptions(true)}
                >
                  <View style={styles.paymentContent}>
                    <MaterialIcons 
                      name={getMethodIcon(paymentMethods.find(m => m.id === selectedMethod)?.type)} 
                      size={24} 
                      color="#16a34a" 
                    />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentTitle}>
                        {getPaymentMethodDisplay(paymentMethods.find(m => m.id === selectedMethod))}
                      </Text>
                      <Text style={styles.paymentSubtitle}>
                        {paymentMethods.find(m => m.id === selectedMethod)?.isDefault && 'Default'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.changeText}>Change</Text>
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
                      <View style={styles.paymentContent}>
                        <MaterialIcons 
                          name={getMethodIcon(method.type)} 
                          size={24} 
                          color={selectedMethod === method.id ? '#16a34a' : '#64748b'} 
                        />
                        <View style={styles.paymentInfo}>
                          <Text style={styles.paymentTitle}>
                            {getPaymentMethodDisplay(method)}
                          </Text>
                          {method.isDefault && (
                            <Text style={styles.paymentSubtitle}>Default</Text>
                          )}
                        </View>
                      </View>
                      {selectedMethod === method.id && (
                        <MaterialIcons name="check-circle" size={20} color="#16a34a" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

           
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Commitment Total</Text>
              <Text style={styles.totalAmount}>${paymentAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleAccept}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="lock" size={18} color="white" />
                    <Text style={styles.confirmText}>Secure Pledge</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const LoadingModal = ({ visible }) => (
  <Modal transparent visible={visible}>
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#16a34a" />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  closeIcon: {
    // any additional style if needed
  },
  contentContainer: {
    padding: 20,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorText: {
    fontSize: 13,
    color: '#64748b',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  costBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightedRow: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  value: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  shareAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  acceptedCount: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  participantsContainer: {
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantName: {
    fontSize: 14,
    color: '#0f172a',
  },
  avatarScroll: {
    paddingHorizontal: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  avatarName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    maxWidth: 64,
    textAlign: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f8fafc',
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentInfo: {
    gap: 2,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  changeText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  paymentOptions: {
    gap: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  selectedOption: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#166534',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: 'white',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    width: '80%',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#fecaca',
    borderRadius: 12,
  },
  retryText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});

export default AcceptServicePayment;
