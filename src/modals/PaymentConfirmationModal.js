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
// Import apiClient instead of axios
import apiClient from '../config/api';

const PaymentConfirmationModal = ({
  visible,
  onClose,
  selectedCharges,
  totalAmount,
  onConfirmPayment,
  isProcessing,
}) => {
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
      console.log('🔄 Fetching payment methods in PaymentConfirmationModal');
      // Use apiClient with relative path
      const response = await apiClient.get('/api/payment-methods');
      const methods = response.data?.paymentMethods || [];
      console.log('✅ PaymentConfirmationModal payment methods:', methods.map(m => ({ id: m.id, isDefault: m.isDefault, last4: m.last4 })));
      
      setPaymentMethods(methods);
      
      // Set the default method as selected if no method is currently selected
      if (!selectedMethod && methods.length > 0) {
        const defaultMethod = methods.find(m => m.isDefault);
        if (defaultMethod) {
          setSelectedMethod(defaultMethod.id);
          console.log('🎯 Auto-selected default payment method:', { id: defaultMethod.id, isDefault: defaultMethod.isDefault });
        } else {
          setSelectedMethod(methods[0]?.id);
          console.log('🎯 Auto-selected first payment method:', { id: methods[0]?.id });
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Unable to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayText = (method) => {
    if (!method) return '';
    return method.type === 'us_bank_account'
      ? `Bank Account •••• ${method.last4}${method.isDefault ? ' (Default)' : ''}`
      : `${method.brand} •••• ${method.last4}${method.isDefault ? ' (Default)' : ''}`;
  };

  // Get the payment method that will be used for this payment
  const getEffectivePaymentMethod = () => {
    if (selectedMethod) {
      return paymentMethods.find(m => m.id === selectedMethod);
    }
    // If no method is selected, find the default method
    return paymentMethods.find(m => m.isDefault);
  };

  // When the user confirms, simply call the parent's callback
  const handleConfirm = () => {
    onConfirmPayment();
  };

  if (!visible) return null;

  const effectivePaymentMethod = getEffectivePaymentMethod();

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
                  
                  {/* Enhanced payment method display */}
                  {effectivePaymentMethod ? (
                    <View style={styles.paymentMethodContainer}>
                      <View style={[
                        styles.paymentMethodDisplay,
                        effectivePaymentMethod.isDefault && styles.defaultPaymentMethodDisplay
                      ]}>
                        <View style={styles.paymentMethodLeft}>
                          <MaterialIcons 
                            name="credit-card" 
                            size={24} 
                            color={effectivePaymentMethod.isDefault ? "#34d399" : "#64748b"} 
                          />
                          <View style={styles.paymentMethodInfo}>
                            <Text style={styles.paymentMethodText}>
                              {getDisplayText(effectivePaymentMethod)}
                            </Text>
                            {effectivePaymentMethod.isDefault && (
                              <Text style={styles.defaultMethodNote}>
                                Your default payment method will be used
                              </Text>
                            )}
                          </View>
                        </View>
                        {effectivePaymentMethod.isDefault && (
                          <MaterialIcons name="check-circle" size={20} color="#34d399" />
                        )}
                      </View>
                      
                      {/* Payment method options */}
                      {paymentMethods.length > 1 && (
                        <TouchableOpacity
                          style={styles.changePaymentMethod}
                          onPress={() => setShowPaymentOptions(!showPaymentOptions)}
                        >
                          <Text style={styles.changePaymentMethodText}>
                            Change payment method
                          </Text>
                          <MaterialIcons
                            name={showPaymentOptions ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={20}
                            color="#34d399"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View style={styles.noPaymentMethodContainer}>
                      <MaterialIcons name="credit-card-off" size={24} color="#ef4444" />
                      <Text style={styles.noPaymentMethodText}>
                        No payment method available
                      </Text>
                    </View>
                  )}

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
                          <Text style={[
                            styles.paymentOptionText,
                            method.isDefault && styles.defaultPaymentOptionText
                          ]}>
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
                    style={[
                      styles.confirmButton,
                      !effectivePaymentMethod && styles.disabledConfirmButton
                    ]}
                    onPress={handleConfirm}
                    disabled={isProcessing || !effectivePaymentMethod}
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
    backgroundColor: '#dff6f0',
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
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#dff6f0',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  defaultPaymentOptionText: {
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  paymentMethodContainer: {
    marginTop: 12,
  },
  paymentMethodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    marginLeft: 12,
  },
  paymentMethodText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  defaultPaymentMethodDisplay: {
    borderWidth: 2,
    borderColor: '#34d399',
  },
  defaultMethodNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  changePaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  changePaymentMethodText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  noPaymentMethodContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noPaymentMethodText: {
    marginTop: 12,
    color: '#ef4444',
    fontSize: 16,
  },
  disabledConfirmButton: {
    opacity: 0.7,
  },
});

export default PaymentConfirmationModal;