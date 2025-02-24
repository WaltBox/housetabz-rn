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

const PaymentConfirmationModal = ({ visible, onClose, selectedCharges, totalAmount, onConfirmPayment }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchPaymentMethods();
    }
  }, [visible]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3004/api/payment-methods');
      const methods = response.data?.paymentMethods || [];
      const defaultMethod = methods.find(m => m.isDefault);
      setPaymentMethods(methods);
      setSelectedMethod(defaultMethod?.id || methods[0]?.id);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Unable to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayText = (method) => {
    if (!method) return '';
    return `${method.brand} •••• ${method.last4}${method.isDefault ? ' (Default)' : ''}`;
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const idempotencyKey = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Sending payment request with:', {
        chargeIds: selectedCharges.map(c => c.id),
        paymentMethodId: selectedMethod,
        idempotencyKey
      });
      
      const response = await axios.post('http://localhost:3004/api/payments/batch', 
        {
          chargeIds: selectedCharges.map(c => c.id),
          paymentMethodId: selectedMethod,
        },
        {
          headers: {
            'idempotency-key': idempotencyKey
          }
        }
      );
      
      console.log('Payment response:', response.data);
  
      if (response.data && response.data.payment && response.data.payment.status === 'completed') {
        onConfirmPayment(response.data);
        onClose();
      } else {
        setError('Payment processed but status is not completed');
        console.error('Unexpected payment response:', response.data);
      }
    } catch (error) {
      console.error('Payment error details:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.response?.data?.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };
  if (!visible) return null;

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Confirm Payment</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34d399" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={40} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchPaymentMethods}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView style={styles.content}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Selected Charges</Text>
                  {selectedCharges.map(charge => (
                    <View key={charge.id} style={styles.chargeItem}>
                      <View style={styles.chargeHeader}>
                        <MaterialIcons name="receipt" size={20} color="#64748b" />
                        <View style={styles.chargeInfo}>
                          <Text style={styles.chargeName}>{charge.name}</Text>
                          <Text style={styles.chargeDate}>
                            Due {new Date(charge.dueDate).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.chargeAmount}>
                          ${Number(charge.amount).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  <TouchableOpacity
                    style={styles.paymentSelector}
                    onPress={() => setShowPaymentOptions(!showPaymentOptions)}
                  >
                    <View style={styles.paymentMethod}>
                      <MaterialIcons
                        name="credit-card"
                        size={24}
                        color="#34d399"
                      />
                      <Text style={styles.paymentMethodText}>
                        {getDisplayText(selectedPaymentMethod)}
                      </Text>
                    </View>
                    {paymentMethods.length > 1 && (
                      <MaterialIcons
                        name={showPaymentOptions ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                        size={24}
                        color="#64748b"
                      />
                    )}
                  </TouchableOpacity>

                  {showPaymentOptions && paymentMethods.length > 1 && (
                    <View style={styles.paymentOptions}>
                      {paymentMethods.map(method => (
                        <TouchableOpacity
                          key={method.id}
                          style={[
                            styles.paymentOption,
                            selectedMethod === method.id && styles.selectedPaymentOption
                          ]}
                          onPress={() => {
                            setSelectedMethod(method.id);
                            setShowPaymentOptions(false);
                          }}
                        >
                          <MaterialIcons
                            name="credit-card"
                            size={20}
                            color={selectedMethod === method.id ? "#34d399" : "#64748b"}
                          />
                          <Text style={styles.paymentOptionText}>
                            {getDisplayText(method)}
                          </Text>
                          {selectedMethod === method.id && (
                            <MaterialIcons name="check" size={20} color="#34d399" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="lock" size={20} color="#fff" />
                        <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  content: {
    padding: 20,
    backgroundColor: '#dff6f0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  chargeItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  chargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chargeName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  chargeDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentSelector: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  paymentOptions: {
    marginTop: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedPaymentOption: {
    backgroundColor: '#f0fdf4',
  },
  paymentOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#dff6f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginVertical: 12,
    textAlign: 'center',
    color: '#ef4444',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fecaca',
    borderRadius: 8,
  },
  retryText: {
    color: '#ef4444',
    fontWeight: '500',
  },
});

export default PaymentConfirmationModal;