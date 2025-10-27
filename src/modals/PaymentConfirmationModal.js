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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
// Import apiClient and getFeePreview
import apiClient, { getFeePreview } from '../config/api';
import { useAuth } from '../context/AuthContext';

const PaymentConfirmationModal = ({
  visible,
  onClose,
  selectedCharges,
  totalAmount,
  onConfirmPayment,
  isProcessing,
  house, // NEW: Add house prop to check for Dawg Mode
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, refreshPaymentMethods } = useAuth();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feePreview, setFeePreview] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);

  // NEW: Check if Dawg Mode is active
  const isDawgModeActive = house?.dawgMode || user?.house?.dawgMode;

  useEffect(() => {
    if (visible) {
      fetchPaymentMethods();
      fetchFees();
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

  const fetchFees = async () => {
    try {
      setLoadingFees(true);
      console.log('🔄 Fetching fee preview');
      const preview = await getFeePreview();
      if (preview) {
        console.log('✅ Fee preview:', preview);
        setFeePreview(preview);
      } else {
        console.log('⚠️ No fee preview available - will show generic message');
      }
    } catch (error) {
      console.error('Error fetching fee preview:', error);
      // Graceful degradation - fees will be calculated on backend
    } finally {
      setLoadingFees(false);
    }
  };

  const handleAddPaymentMethod = async (type = 'card') => {
    try {
      setAddingPaymentMethod(true);
      
      // Determine which endpoint to use based on payment method type
      const endpoint = type === 'ach' 
        ? '/api/payment-methods/setup-intent/ach'
        : '/api/payment-methods/setup-intent';

      const setupResponse = await apiClient.post(endpoint, {});
      
      const { clientSecret, setupIntentId } = setupResponse.data;
      if (!clientSecret || !setupIntentId) {
        throw new Error('No client secret or setupIntentId received');
      }
      
      // Configure Stripe PaymentSheet based on payment method type
      const paymentSheetConfig = {
        merchantDisplayName: 'HouseTabz',
        setupIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        appearance: { colors: { primary: '#34d399' } },
      };

      // For ACH, we need to specify payment method types
      if (type === 'ach') {
        paymentSheetConfig.paymentMethodTypes = ['us_bank_account'];
      }

      const initResponse = await initPaymentSheet(paymentSheetConfig);
      
      if (initResponse.error) {
        Alert.alert('Error', initResponse.error.message);
        return;
      }
      
      const presentResponse = await presentPaymentSheet();
      if (presentResponse.error) {
        if (presentResponse.error.code === 'Canceled') return;
        Alert.alert('Error', presentResponse.error.message);
        return;
      }
      
      await apiClient.post('/api/payment-methods/complete', { setupIntentId });
      
      // Refresh payment methods
      await refreshPaymentMethods();
      await fetchPaymentMethods();
      
      // Auto-select the newly added method and close dropdown
      setShowPaymentOptions(false);
      
      Alert.alert('Success', `${type === 'ach' ? 'Bank account' : 'Card'} added successfully! It's now your default payment method.`);
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setAddingPaymentMethod(false);
    }
  };

  const getDisplayText = (method) => {
    if (!method) return '';
    return method.type === 'us_bank_account'
      ? `Bank Account •••• ${method.last4}${method.isDefault ? ' (Default)' : ''}`
      : `${method.brand} •••• ${method.last4}${method.isDefault ? ' (Default)' : ''}`;
  };

  const getFeeText = (method) => {
    // NEW: If Dawg Mode is active, show zero fees message
    if (isDawgModeActive) {
      return '🐕 Zero Fees - Dawg Mode Active';
    }
    
    if (!feePreview || !method) return null;
    
    // Get the appropriate fee text based on payment method type
    if (method.type === 'us_bank_account') {
      return feePreview.paymentMethods?.ach?.displayText || 'Processing fee applies';
    } else {
      return feePreview.paymentMethods?.card?.displayText || 'Processing fee applies';
    }
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Confirm Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#64748b" />
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
              <TouchableOpacity style={styles.retryButton} onPress={fetchPaymentMethods}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Amount Display - Hero Section */}
                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>You're paying</Text>
                  <Text style={styles.amountValue}>${totalAmount.toFixed(2)}</Text>
                </View>

                {/* Services List - Minimal */}
                <View style={styles.servicesSection}>
                  {selectedCharges.map((charge, index) => (
                    <View key={charge.id} style={[
                      styles.serviceRow,
                      index !== selectedCharges.length - 1 && styles.serviceRowDivider
                    ]}>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{charge.name}</Text>
                        <Text style={styles.serviceDate}>
                          Due {new Date(charge.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={styles.serviceAmount}>
                        ${Number(charge.useNewFeeStructure ? (charge.baseAmount || charge.amount) : charge.amount).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Payment Method Selection */}
                <View style={styles.paymentSection}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  
                  {effectivePaymentMethod ? (
                    <>
                      {/* Display Selected Method */}
                      <View style={styles.selectedMethodDisplay}>
                        <View style={styles.methodLeft}>
                          <View style={styles.methodIcon}>
                            <MaterialIcons 
                              name={effectivePaymentMethod.type === 'us_bank_account' ? 'account-balance' : 'credit-card'}
                              size={24}
                              color="#34d399"
                            />
                          </View>
                          <View style={styles.methodDetails}>
                            <Text style={styles.methodName}>{getDisplayText(effectivePaymentMethod)}</Text>
                            {getFeeText(effectivePaymentMethod) && (
                              <Text style={styles.methodFee}>{getFeeText(effectivePaymentMethod)}</Text>
                            )}
                          </View>
                        </View>
                        <MaterialIcons name="check-circle" size={24} color="#34d399" />
                      </View>

                      {/* Change Payment Method Button */}
                      <TouchableOpacity 
                        style={styles.changeMethodButton}
                        onPress={() => setShowPaymentOptions(!showPaymentOptions)}
                      >
                        <MaterialIcons name="add" size={20} color="#34d399" />
                        <Text style={styles.changeMethodButtonText}>Change payment method</Text>
                      </TouchableOpacity>

                      {/* Options Dropdown */}
                      {showPaymentOptions && (
                        <View style={styles.dropdownContainer}>
                          {paymentMethods.length > 0 && (
                            <>
                              <Text style={styles.dropdownTitle}>Select a payment method</Text>
                              {paymentMethods.map(method => (
                                <TouchableOpacity
                                  key={method.id}
                                  style={[
                                    styles.dropdownItem,
                                    selectedMethod === method.id && styles.dropdownItemSelected
                                  ]}
                                  onPress={() => {
                                    setSelectedMethod(method.id);
                                    setShowPaymentOptions(false);
                                  }}
                                >
                                  <View style={styles.dropdownItemLeft}>
                                    <MaterialIcons
                                      name={method.type === 'us_bank_account' ? 'account-balance' : 'credit-card'}
                                      size={20}
                                      color="#34d399"
                                    />
                                    <View style={styles.dropdownItemInfo}>
                                      <Text style={styles.dropdownItemName}>{getDisplayText(method)}</Text>
                                      {getFeeText(method) && (
                                        <Text style={styles.dropdownItemFee}>{getFeeText(method)}</Text>
                                      )}
                                    </View>
                                  </View>
                                  {selectedMethod === method.id && (
                                    <MaterialIcons name="check-circle" size={22} color="#34d399" />
                                  )}
                                </TouchableOpacity>
                              ))}
                            </>
                          )}

                          {/* Add New Payment Method */}
                          <View style={styles.addMethodDivider} />
                          <Text style={styles.dropdownTitle}>Add new</Text>
                          <TouchableOpacity
                            style={styles.addMethodRow}
                            onPress={() => handleAddPaymentMethod('card')}
                            disabled={addingPaymentMethod}
                          >
                            <MaterialIcons name="credit-card" size={20} color="#34d399" />
                            <View style={styles.addMethodTextContainer}>
                              <Text style={styles.addMethodName}>Add Card</Text>
                              <Text style={styles.addMethodFee}>3% processing fee</Text>
                            </View>
                            {!addingPaymentMethod && <MaterialIcons name="add" size={24} color="#cbd5e1" />}
                            {addingPaymentMethod && <ActivityIndicator size="small" color="#34d399" />}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.addMethodRow}
                            onPress={() => handleAddPaymentMethod('ach')}
                            disabled={addingPaymentMethod}
                          >
                            <MaterialIcons name="account-balance" size={20} color="#34d399" />
                            <View style={styles.addMethodTextContainer}>
                              <Text style={styles.addMethodName}>Add Bank</Text>
                              <Text style={styles.addMethodFee}>1% processing fee</Text>
                            </View>
                            {!addingPaymentMethod && <MaterialIcons name="add" size={24} color="#cbd5e1" />}
                            {addingPaymentMethod && <ActivityIndicator size="small" color="#34d399" />}
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={styles.emptyMethodCard}
                      onPress={() => setShowPaymentOptions(true)}
                    >
                      <MaterialIcons name="add-circle-outline" size={28} color="#34d399" />
                      <Text style={styles.emptyMethodText}>Add a payment method</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Bottom padding to allow scrolling past footer */}
                <View style={styles.scrollBottomPadding} />
              </ScrollView>

              {/* Action Buttons - Sticky Footer */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    (!effectivePaymentMethod || isProcessing) && styles.confirmButtonDisabled
                  ]}
                  onPress={handleConfirm}
                  disabled={isProcessing || !effectivePaymentMethod}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="lock" size={18} color="#FFFFFF" />
                      <Text style={styles.confirmButtonText}>Complete Payment</Text>
                    </>
                  )}
                </TouchableOpacity>
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
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    backgroundColor: '#dff6f0',
  },
  amountSection: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  servicesSection: {
    marginBottom: 20,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  serviceRowDivider: {
    borderBottomWidth: 0,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  serviceDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  serviceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  selectedMethodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  changeMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  changeMethodButtonText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodDetails: {
    marginLeft: 12,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  methodFee: {
    fontSize: 12,
    color: '#34d399',
    marginTop: 4,
    fontWeight: '500',
  },
  dropdownContainer: {
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.15)',
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 211, 153, 0.12)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemInfo: {
    marginLeft: 12,
  },
  dropdownItemName: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdownItemFee: {
    fontSize: 12,
    color: '#34d399',
    marginTop: 4,
    fontWeight: '500',
  },
  addMethodDivider: {
    height: 16,
  },
  addMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    marginBottom: 12,
  },
  addMethodTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  addMethodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  addMethodFee: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '600',
    marginTop: 2,
  },
  emptyMethodCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyMethodText: {
    marginTop: 12,
    color: '#ef4444',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#dff6f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
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
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
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
  scrollBottomPadding: {
    height: 80, // Reduced from 100 by 20%
  },
});

export default PaymentConfirmationModal;