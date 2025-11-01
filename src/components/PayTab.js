import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import PaymentConfirmationScreen from './PaymentConfirmationScreen';
import apiClient, { invalidateCache, clearUserCache, getDashboardData, clearAllCache } from '../config/api';
import { useFonts } from 'expo-font';
import { useAuth } from '../context/AuthContext';
import { useImperativeHandle, forwardRef } from 'react';

const PayTab = forwardRef(({ charges: allCharges, onChargesUpdated, onConfirmationStateChange, onPaymentFlowChange }, ref) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  // LOCAL STATE: Maintain local copy of charges for optimistic updates
  const [localCharges, setLocalCharges] = useState(allCharges);
  
  // ✅ CRITICAL: Track when we've removed charges optimistically
  const [paidChargeIds, setPaidChargeIds] = useState([]);
  
  // STATE MACHINE: Single state for payment flow (prevents impossible states)
  const [paymentState, setPaymentState] = useState('idle'); // 'idle' | 'confirming' | 'processing' | 'success' | 'error'
  
  // ✅ CRITICAL: Wrapper to trace state changes
  const setPaymentStateWithLogging = (newState) => {
    const stack = new Error().stack;
    console.log(`🔍 CRITICAL: setPaymentState('${newState}') called from:`, {
      oldState: paymentState,
      newState: newState,
      stack: stack.split('\n').slice(1, 3).join('\n')
    });
    setPaymentState(newState);
  };
  
  // ✅ Expose closeConfirmation method to parent via ref
  useImperativeHandle(ref, () => ({
    closeConfirmation: () => {
      console.log('🔄 PayTab: closeConfirmation called from parent');
      setPaymentStateWithLogging('idle');
    }
  }), [setPaymentStateWithLogging]);
  
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // ✅ CRITICAL: Store payment response data for success screen
  const [paymentResponse, setPaymentResponse] = useState(null);
  
  // DERIVED STATE: For backwards compatibility and clearer logic
  const showConfirmation = paymentState !== 'idle';
  const isProcessingPayment = paymentState === 'processing'; // Only true during API call
  const paymentSuccess = paymentState === 'success';
  
  // ✅ FIX 2: Monitor payment state and update parent flow flag
  useEffect(() => {
    const isFlowActive = paymentState === 'confirming' || paymentState === 'processing' || paymentState === 'success';
    console.log(`📱 PayTab payment flow status: ${isFlowActive ? '🔴 ACTIVE' : '⚪ INACTIVE'} (state: ${paymentState})`);
    if (onPaymentFlowChange) {
      onPaymentFlowChange(isFlowActive);
    }
  }, [paymentState, onPaymentFlowChange]);
  
  // ✅ SYNC LOCAL CHARGES with props - but preserve optimistic updates
  useEffect(() => {
    if (paidChargeIds.length > 0) {
      // We have optimistic updates - merge them with the new charges
      // Filter out the paid charges from the new allCharges
      const filteredCharges = allCharges.filter(charge => !paidChargeIds.includes(charge.id));
      console.log(`♻️ SYNC: Merging new charges while preserving optimistic removal: ${allCharges.length} → ${filteredCharges.length}`);
      setLocalCharges(filteredCharges);
    } else {
      // No optimistic updates - just use the prop directly
      setLocalCharges(allCharges);
    }
  }, [allCharges, paidChargeIds]); // ✅ Include paidChargeIds as dependency
  
  // Log state changes for debugging
  useEffect(() => {
    console.log(`📋 PayTab state: paymentState=${paymentState}, showConfirmation=${showConfirmation}, isProcessing=${isProcessingPayment}`);
  }, [paymentState]);
  
  // Notify parent when confirmation state changes
  useEffect(() => {
    if (onConfirmationStateChange) {
      onConfirmationStateChange(paymentState !== 'idle');
    }
  }, [paymentState, onConfirmationStateChange]);

  
  // Filter out charges already paid or processing
  const unpaidCharges = useMemo(() => 
    localCharges.filter(charge => charge.status !== 'paid' && charge.status !== 'processing'),
    [localCharges]
  );
  
  // Fetch payment methods just for validation
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await apiClient.get('/api/payment-methods');
        setPaymentMethods(response.data.paymentMethods || []);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setPaymentMethods([]);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
// Ensure selected charges are still valid when unpaid charges change
useEffect(() => {
  // ✅ Only block during processing (API call), not during success screen
  if (paymentState === 'processing') {
    console.log('🛡️ Blocking selected charges validation - payment API call in progress');
    return;
  }
  
  const validSelectedCharges = selectedCharges.filter(selected =>
    unpaidCharges.some(charge => charge.id === selected.id)
  );
  if (validSelectedCharges.length !== selectedCharges.length) {
    console.log('🔄 Updating selected charges based on unpaid charges');
    setSelectedCharges(validSelectedCharges);
  }
}, [unpaidCharges, selectedCharges, paymentState]);
  
  // Calculate total amounts
  const totalBalance = useMemo(() =>
    unpaidCharges.reduce((sum, charge) => sum + Number(charge.amount), 0),
    [unpaidCharges]
  );
  const selectedTotal = useMemo(() =>
    selectedCharges.reduce((sum, charge) => sum + Number(charge.amount), 0),
    [selectedCharges]
  );
  
  // Categorize charges into groups
  const categorizeCharges = (charges) => {
    const now = new Date();
    return charges.reduce((acc, charge) => {
      if (!charge.dueDate) {
        acc.other.push({ ...charge, daysUntilDue: 999 });
        return acc;
      }
      const dueDate = new Date(charge.dueDate);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        acc.late.push({ ...charge, daysLate: Math.abs(diffDays) });
      } else if (diffDays <= 3) {
        acc.upcoming.push({ ...charge, daysUntilDue: diffDays });
      } else {
        acc.other.push({ ...charge, daysUntilDue: diffDays });
      }
      return acc;
    }, { late: [], upcoming: [], other: [] });
  };

  const { late, upcoming, other } = useMemo(() => categorizeCharges(unpaidCharges), [unpaidCharges]);
  
  const handleChargeSelectToggle = (charge) => {
    setSelectedCharges(prev => {
      const isSelected = prev.some(c => c.id === charge.id);
      return isSelected ? prev.filter(c => c.id !== charge.id) : [...prev, charge];
    });
  };

  const handlePayAll = () => {
    console.log('🎯 handlePayAll: Opening confirmation');
    setSelectedCharges(unpaidCharges);
    setPaymentStateWithLogging('confirming');
  };

  const handlePaySelected = () => {
    if (selectedCharges.length > 0) {
      console.log('🎯 handlePaySelected: Opening confirmation');
      setPaymentStateWithLogging('confirming');
    }
  };

  // Centralized API call
 // Centralized API call
const handleConfirmPayment = async (paymentMethodId) => {
  console.log('🔵 handleConfirmPayment: STARTED');
  
  if (paymentMethods.length === 0) {
    console.log('⚠️ handleConfirmPayment: No payment methods available');
    Alert.alert(
      "No Payment Methods", 
      "Please add a payment method to continue.",
      [{ text: "OK", style: "cancel" }]
    );
    return;
  }
  
  try {
    // Set to processing so button shows loading during API call
    setPaymentStateWithLogging('processing');
    console.log('🔵 handleConfirmPayment: Set to processing, making API call...');
    
    console.log('🔵 handleConfirmPayment: Preparing API call, paymentState=${paymentState}');
    const idempotencyKey = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    
    const paymentRequest = {
      chargeIds: selectedCharges.map(charge => charge.id),
      paymentMethodId: paymentMethodId || paymentMethods[0]?.id, // Use the first payment method as default
    };
    
    console.log('🔵 handleConfirmPayment: SENDING API CALL...', paymentRequest);
    
    const response = await apiClient.post(
      '/api/payments/batch',
      paymentRequest,
      { headers: { 'idempotency-key': idempotencyKey } }
    );
    
    console.log('🟢 handleConfirmPayment: API SUCCESS, response received');
    console.log('Payment response:', response.data);
    
    const paidChargeIds = selectedCharges.map(charge => charge.id);
    console.log('💡 OPTIMISTIC UPDATE: Removing paid charges from UI immediately...');
    
    setPaidChargeIds(paidChargeIds);
    
    setLocalCharges(prev => {
      const updated = prev.filter(charge => !paidChargeIds.includes(charge.id));
      console.log(`💡 Local charges filtered: ${prev.length} → ${updated.length}`);
      return updated;
    });
    
    // ✅ FIX: Store payment response data BEFORE clearing selectedCharges
    setPaymentResponse({
      chargesCount: response.data.summary?.chargesPaid || selectedCharges.length,
      totalAmount: response.data.summary?.totalAmountPaid || selectedCharges.reduce((sum, c) => sum + Number(c.amount), 0),
      chargeIds: response.data.paidChargeIds || paidChargeIds
    });
    
    setSelectedCharges([]);
    
    console.log('🟢 handleConfirmPayment: Payment successful, waiting 2 seconds before showing success screen...');
    
    // ✅ NEW: Wait 2 seconds to give backend cache time to clear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🟢 handleConfirmPayment: Setting paymentState to success');
    setPaymentStateWithLogging('success');
    console.log('✅ Payment success - showing success screen');
    
  } 
  catch (error) {
    console.error('🔴 handleConfirmPayment: API ERROR');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    
    let errorMessage = 'An error occurred while processing your payment.';
    
    // Enhanced error handling for new backend error messages
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.details) {
        errorMessage = error.response.data.details;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      // Handle specific new backend error messages
      if (errorMessage.includes('No payment method provided and no default payment method found')) {
        Alert.alert(
          "No Default Payment Method",
          "Please set a default payment method to continue. You can manage payment methods from the confirmation modal.",
          [{ text: "OK", onPress: () => setPaymentStateWithLogging('idle') }]
        );
        return;
      }
    }
    
    Alert.alert(
      "Payment Failed",
      errorMessage,
      [{ text: "OK", onPress: () => setPaymentStateWithLogging('idle') }]
    );
    
    console.log('🔴 ERROR: Payment failed');
  }

    // Finally block removed - no cleanup needed, let success/error handlers manage state
  };

  const renderChargeSection = (title, chargesGroup, color) => {
    if (chargesGroup.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
          <Text style={[
            styles.sectionTitle,
            fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
          ]}>
            {title}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
        </View>
        {chargesGroup.map(charge => {
          const isSelected = selectedCharges.some(c => c.id === charge.id);
          return (
            <TouchableOpacity 
              key={charge.id} 
              style={[
                styles.chargeItem, 
                isSelected && styles.selectedChargeItem
              ]}
              onPress={() => handleChargeSelectToggle(charge)}
              activeOpacity={0.7}
              disabled={isProcessingPayment}
            >
              <View style={styles.chargeHeader}>
                <View style={styles.chargeTitleContainer}>
                
                  <View style={styles.chargeTextContent}>
                    <Text style={[
                      styles.chargeTitle,
                      isSelected && styles.selectedChargeText,
                      fontsLoaded && { fontFamily: 'Poppins-Medium' }
                    ]}>
                      {charge.name}
                    </Text>
                    <Text style={[
                      styles.chargeSubtitle,
                      isSelected ? styles.selectedChargeSubtitle : { color },
                      fontsLoaded && { fontFamily: 'Poppins-Regular' }
                    ]}>
                      {charge.daysLate ? `${charge.daysLate}d overdue` : `Due in ${charge.daysUntilDue}d`}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.chargeAmount,
                  isSelected && styles.selectedChargeText,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>
                  ${Number(charge.useNewFeeStructure ? charge.baseAmount : charge.amount).toFixed(2)}
                </Text>
              </View>
              <View style={styles.selectIndicator}>
                <Text style={[
                  styles.selectText,
                  isSelected && styles.selectedSelectText,
                  fontsLoaded && { fontFamily: 'Poppins-Medium' }
                ]}>
                  {isSelected ? 'SELECTED' : 'TAP TO ADD'}
                </Text>
                <MaterialIcons
                  name={isSelected ? "check" : "add"}
                  size={18}
                  color={isSelected ? "#fff" : color}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showConfirmation ? (
        <PaymentConfirmationScreen
          selectedCharges={selectedCharges}
          totalAmount={selectedTotal}
          paymentResponse={paymentResponse}
          onConfirmPayment={handleConfirmPayment}
          isProcessing={isProcessingPayment}
          paymentSuccess={paymentSuccess}
          onChargesUpdated={onChargesUpdated} // ✅ ADD THIS
          onPaymentFlowChange={onPaymentFlowChange} // ✅ FIX 2: Pass flow flag controller to child
          onClose={() => {
            console.log('❌ User clicked X to close confirmation');
            if (paymentState !== 'processing' && paymentState !== 'success') {
              setPaymentStateWithLogging('idle');
            } else {
              console.log('  → NOT closing (', paymentState, 'state)');
            }
          }}
          onSuccessDone={() => {
            console.log('🎉 User clicked Done on success screen');
            setPaymentStateWithLogging('idle');
            setSelectedCharges([]);
            setPaymentResponse(null);
            // ❌ DON'T reset paidChargeIds here - it will break the optimistic update
            // setPaidChargeIds([]); // Removed - will be cleared after parent refresh completes
            
            // ✅ Clear paidChargeIds after a delay to ensure parent has refreshed
            setTimeout(() => {
              console.log('🧹 CLEANUP: Clearing paidChargeIds after parent refresh');
              setPaidChargeIds([]);
            }, 5000); // Wait 5 seconds for parent to definitely refresh
          }}
        />
      ) : (
       
        <>
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.headerSplit}>
                <View style={styles.headerSection}>
                  <Text style={[
                    styles.headerLabel,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}>
                    Total Due
                  </Text>
                  <Text style={[
                    styles.headerAmount,
                    fontsLoaded && { fontFamily: 'Poppins-Bold' }
                  ]}>
                    ${totalBalance.toFixed(2)}
                  </Text>
                </View>
                {selectedCharges.length > 0 && (
                  <View style={styles.headerSection}>
                    <Text style={[
                      styles.headerLabel,
                      fontsLoaded && { fontFamily: 'Poppins-Regular' }
                    ]}>
                      Selected
                    </Text>
                    <Text style={[
                      styles.headerAmount, 
                      styles.selectedAmount,
                      fontsLoaded && { fontFamily: 'Poppins-Bold' }
                    ]}>
                      ${selectedTotal.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.paymentButton,
                (unpaidCharges.length === 0 || isProcessingPayment) && styles.disabledButton
              ]}
              onPress={unpaidCharges.length === 0 ? null : (selectedCharges.length ? handlePaySelected : handlePayAll)}
              disabled={unpaidCharges.length === 0 || isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={[
                    styles.paymentButtonText,
                    fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                  ]}>
                    {selectedCharges.length ? 'Pay Selected' : 'Pay All'}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderChargeSection('Late Payments', late, '#ef4444')}
            {renderChargeSection('Upcoming Payments', upcoming, '#eab308')}
            {renderChargeSection('Other Charges', other, '#34d399')}
            {unpaidCharges.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="check-circle" size={40} color="#34d399" />
                <Text style={[
                  styles.emptyStateTitle,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>
                  All Caught Up!
                </Text>
                <Text style={[
                  styles.emptyStateText,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  No outstanding charges found
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#dff6f0' 
  },
  headerCard: { 
    backgroundColor: '#dff6f0', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  headerTop: { 
    marginBottom: 12 
  },
  headerSplit: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  headerSection: { 
    flex: 1 
  },
  headerLabel: { 
    fontSize: 14, 
    color: '#64748b', 
    marginBottom: 4 
  },
  headerAmount: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  selectedAmount: { 
    color: '#34d399' 
  },
  paymentButton: {
    backgroundColor: '#34d399',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: { 
    backgroundColor: '#94e0c1', 
    opacity: 0.7 
  },
  paymentButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
    marginRight: 4 
  },
  content: { 
    flex: 1 
  },
  section: { 
    marginTop: 16, 
    marginHorizontal: 16 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    paddingLeft: 8, 
    borderLeftWidth: 3 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginRight: 8 
  },
  statusDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3 
  },
  chargeItem: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#f1f5f9' 
  },
  selectedChargeItem: {
    backgroundColor: '#34d399',
    borderColor: '#34d399'
  },
  chargeHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 8 
  },
  chargeTitleContainer: { 
    flexDirection: 'row', 
    flex: 1, 
    marginRight: 8 
  },
  icon: { 
    marginRight: 8, 
    marginTop: 2 
  },
  chargeTextContent: { 
    flex: 1 
  },
  chargeTitle: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginBottom: 2 
  },
  selectedChargeText: {
    color: '#fff'
  },
  chargeSubtitle: { 
    fontSize: 13 
  },
  selectedChargeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)'
  },
  chargeAmount: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1e293b' 
  },
  selectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  selectText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginRight: 6
  },
  selectedSelectText: {
    color: '#fff'
  },
  emptyState: { 
    alignItems: 'center', 
    padding: 40 
  },
  emptyStateTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginVertical: 8 
  },
  emptyStateText: { 
    color: '#64748b', 
    fontSize: 14, 
    textAlign: 'center' 
  }
});


export default PayTab;