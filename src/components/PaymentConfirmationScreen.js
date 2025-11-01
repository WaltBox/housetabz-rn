import React, { useState, useEffect } from 'react';
import {
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
import apiClient, { getFeePreview, invalidateCache, clearUserCache, clearAllCache } from '../config/api';
import { useAuth } from '../context/AuthContext';

const PaymentConfirmationScreen = ({
  selectedCharges,
  totalAmount,
  onConfirmPayment,
  isProcessing,
  house,
  paymentSuccess,
  onSuccessDone,
  onClose,
  onChargesUpdated, // ✅ ADD THIS
  onPaymentFlowChange, // ✅ FIX 5: Add payment flow control
  paymentResponse, // ✅ FIX: Add payment response data
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

  const isDawgModeActive = house?.dawgMode || user?.house?.dawgMode;

  // ✅ CRITICAL: Debug mount/unmount
  console.log('🔍 PaymentConfirmationScreen rendered:', { paymentSuccess, isProcessing });
  
  useEffect(() => {
    console.log('🔍 PaymentConfirmationScreen mounted or props changed:', { paymentSuccess, isProcessing });
    return () => {
      console.log('🔍 PaymentConfirmationScreen UNMOUNTING:', { paymentSuccess, isProcessing });
    };
  }, [paymentSuccess, isProcessing]);

  useEffect(() => {
    fetchPaymentMethods();
    fetchFees();
  }, []);

  // ✅ FIX 5: Manage payment flow flag on mount/unmount
  useEffect(() => {
    if (paymentSuccess) {
      console.log('🔴 Payment success screen opened - marking payment flow as active');
      if (onPaymentFlowChange) {
        onPaymentFlowChange(true);
      }
    }
    
    return () => {
      // Cleanup when component unmounts
      if (paymentSuccess) {
        console.log('⚪ Payment success screen closed - marking payment flow as inactive');
        if (onPaymentFlowChange) {
          onPaymentFlowChange(false);
        }
      }
    };
  }, [paymentSuccess, onPaymentFlowChange]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching payment methods in PaymentConfirmationScreen');
      const response = await apiClient.get('/api/payment-methods');
      const methods = response.data?.paymentMethods || [];
      console.log('✅ PaymentConfirmationScreen payment methods:', methods.map(m => ({ id: m.id, isDefault: m.isDefault, last4: m.last4 })));
      
      setPaymentMethods(methods);
      
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
    } finally {
      setLoadingFees(false);
    }
  };

  const handleAddPaymentMethod = async (type = 'card') => {
    try {
      setAddingPaymentMethod(true);
      
      const endpoint = type === 'ach' 
        ? '/api/payment-methods/setup-intent/ach'
        : '/api/payment-methods/setup-intent';

      const setupResponse = await apiClient.post(endpoint, {});
      
      const { clientSecret, setupIntentId } = setupResponse.data;
      if (!clientSecret || !setupIntentId) {
        throw new Error('No client secret or setupIntentId received');
      }
      
      const paymentSheetConfig = {
        merchantDisplayName: 'HouseTabz',
        setupIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        appearance: { colors: { primary: '#34d399' } },
      };

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
      
      await refreshPaymentMethods();
      await fetchPaymentMethods();
      
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
    if (isDawgModeActive) {
      return '🐕 Zero Fees - Dawg Mode Active';
    }
    
    if (!feePreview || !method) return null;
    
    if (method.type === 'us_bank_account') {
      return feePreview.paymentMethods?.ach?.displayText || 'Processing fee applies';
    } else {
      return feePreview.paymentMethods?.card?.displayText || 'Processing fee applies';
    }
  };

  const getEffectivePaymentMethod = () => {
    if (selectedMethod) {
      return paymentMethods.find(m => m.id === selectedMethod);
    }
    return paymentMethods.find(m => m.isDefault);
  };

  const handleConfirm = () => {
    onConfirmPayment();
  };

  const effectivePaymentMethod = getEffectivePaymentMethod();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        {!paymentSuccess && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {paymentSuccess ? (
        // SUCCESS STATE
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <MaterialIcons name="check-circle" size={80} color="#34d399" />
          </View>
          <Text style={styles.successTitle}>Payment Successful! ✅</Text>
          <Text style={styles.successMessage}>
            Successfully paid {paymentResponse?.chargesCount || 0} charge{paymentResponse?.chargesCount !== 1 ? 's' : ''} totaling ${paymentResponse?.totalAmount || totalAmount.toFixed(2)}
          </Text>
          <TouchableOpacity 
  style={styles.doneButton}
  onPress={async () => {
    console.log('🎉 User clicked Done on success screen');
    
    // ✅ STEP 1: Release payment flow flag IMMEDIATELY
    if (onPaymentFlowChange) {
      onPaymentFlowChange(false);
      console.log('✅ Payment flow flag released');
    }
    
    // ✅ STEP 2: Clear caches
    try {
      console.log('🧹 Clearing all caches...');
      invalidateCache('dashboard');
      invalidateCache('app');
      invalidateCache('house');
      invalidateCache('user');
      
      if (user?.id) {
        clearUserCache(user.id);
      }
      
      clearAllCache();
      console.log('✅ All caches cleared');
    } catch (error) {
      console.error('⚠️ Error clearing caches:', error);
    }
    
    // ✅ STEP 3: Close the modal FIRST
    onSuccessDone();
    
    // ✅ STEP 4: THEN trigger refresh after modal is closed
    setTimeout(() => {
      if (onChargesUpdated) {
        console.log('🔄 Triggering charges refresh (after modal closed)');
        onChargesUpdated();
      }
    }, 100); // Short delay to ensure modal is fully closed
  }}
>
  <Text style={styles.doneButtonText}>Done</Text>
</TouchableOpacity>
        </View>
      ) : loading ? (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
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
    flex: 1,
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
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#dff6f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 40,
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
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 80,
  },
  successContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dff6f0',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 15,
  },
  successSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 25,
  },
  doneButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#34d399',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentConfirmationScreen;
