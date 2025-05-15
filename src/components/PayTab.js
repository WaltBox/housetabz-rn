import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import PaymentConfirmationModal from '../modals/PaymentConfirmationModal';
import PaymentMethodsSettings from '../modals/PaymentMethodsSettings';
import apiClient from '../config/api';
import { useFonts } from 'expo-font';

const PayTab = ({ charges: allCharges, onChargesUpdated }) => {
  const queryClient = useQueryClient();
  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  // Filter out charges already paid or processing
  const unpaidCharges = useMemo(() => 
    allCharges.filter(charge => charge.status !== 'paid' && charge.status !== 'processing'),
    [allCharges]
  );
  
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [localUnpaidCharges, setLocalUnpaidCharges] = useState(unpaidCharges);
  
  // Add state for payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  
  // Add state for payment methods modal
  const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
  
  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await apiClient.get('/api/payment-methods');
        if (response.data.paymentMethods && response.data.paymentMethods.length > 0) {
          setPaymentMethods(response.data.paymentMethods);
          // Set default or first payment method
          const defaultMethod = response.data.paymentMethods.find(m => m.isDefault) || response.data.paymentMethods[0];
          setSelectedPaymentMethod(defaultMethod);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };
    
    fetchPaymentMethods();
  }, [isPaymentMethodsVisible]); // Re-fetch when modal closes
  
  // Update local charges when props change
  useEffect(() => {
    setLocalUnpaidCharges(unpaidCharges);
  }, [unpaidCharges]);
  
  // Ensure selected charges are still valid
  useEffect(() => {
    const validSelectedCharges = selectedCharges.filter(selected =>
      localUnpaidCharges.some(charge => charge.id === selected.id)
    );
    if (validSelectedCharges.length !== selectedCharges.length) {
      setSelectedCharges(validSelectedCharges);
    }
  }, [localUnpaidCharges, selectedCharges]);
  
  // Calculate total amounts
  const totalBalance = useMemo(() =>
    localUnpaidCharges.reduce((sum, charge) => sum + Number(charge.amount), 0),
    [localUnpaidCharges]
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

  const { late, upcoming, other } = useMemo(() => categorizeCharges(localUnpaidCharges), [localUnpaidCharges]);
  
  const handleChargeSelectToggle = (charge) => {
    setSelectedCharges(prev => {
      const isSelected = prev.some(c => c.id === charge.id);
      return isSelected ? prev.filter(c => c.id !== charge.id) : [...prev, charge];
    });
  };

  // Handle opening payment methods modal
  const handleOpenPaymentMethodsModal = () => {
    setIsPaymentMethodsVisible(true);
  };

  const handlePayAll = () => {
    if (!selectedPaymentMethod) {
      Alert.alert(
        "Missing Payment Method", 
        "Please add a payment method to continue.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Payment Method", onPress: handleOpenPaymentMethodsModal }
        ]
      );
      return;
    }
    setSelectedCharges(localUnpaidCharges);
    setShowConfirmation(true);
  };

  const handlePaySelected = () => {
    if (!selectedPaymentMethod) {
      Alert.alert(
        "Missing Payment Method", 
        "Please add a payment method to continue.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Payment Method", onPress: handleOpenPaymentMethodsModal }
        ]
      );
      return;
    }
    if (selectedCharges.length > 0) {
      setShowConfirmation(true);
    }
  };

  // Centralized API call
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert(
        "Missing Payment Method", 
        "Please add a payment method to continue.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Payment Method", onPress: handleOpenPaymentMethodsModal }
        ]
      );
      return;
    }
    
    try {
      setIsProcessingPayment(true);
      const idempotencyKey = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      
      const paymentRequest = {
        chargeIds: selectedCharges.map(charge => charge.id),
        paymentMethodId: selectedPaymentMethod.id
      };
      
      console.log('Sending payment request with:', { ...paymentRequest, idempotencyKey });
      
      const response = await apiClient.post(
        '/api/payments/batch',
        paymentRequest,
        { headers: { 'idempotency-key': idempotencyKey } }
      );
      
      console.log('Payment response:', response.data);
      
      // Remove paid charges and update state
      const paidChargeIds = selectedCharges.map(charge => charge.id);
      setLocalUnpaidCharges(prev => prev.filter(charge => !paidChargeIds.includes(charge.id)));
      setSelectedCharges([]);
      
      if (onChargesUpdated) {
        onChargesUpdated(paidChargeIds);
      }
      
      // Invalidate the dashboard query to trigger a refresh when the user returns to the dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      Alert.alert(
        "Payment Successful",
        `Successfully paid ${paidChargeIds.length} charges totaling $${selectedTotal.toFixed(2)}.`,
        [{ text: "OK" }]
      );
    } 
    catch (error) {
      console.error('Payment processing error:', error);
      
      let errorMessage = 'An error occurred while processing your payment.';
      
      // Log detailed error information
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
      }
      
      Alert.alert(
        "Payment Failed",
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessingPayment(false);
      setShowConfirmation(false);
    }
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
                  ${Number(charge.amount).toFixed(2)}
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
          
          <TouchableOpacity 
            style={styles.addPaymentMethodBtn}
            onPress={handleOpenPaymentMethodsModal}
            activeOpacity={0.7}
          >
            <MaterialIcons name="credit-card" size={18} color="#34d399" />
            <Text style={[
              styles.addPaymentMethodText,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}>
              Add Payment Method
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.paymentButton,
            (localUnpaidCharges.length === 0 || isProcessingPayment || !selectedPaymentMethod) && styles.disabledButton
          ]}
          onPress={localUnpaidCharges.length === 0 ? null : (selectedCharges.length ? handlePaySelected : handlePayAll)}
          disabled={localUnpaidCharges.length === 0 || isProcessingPayment || !selectedPaymentMethod}
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
        {localUnpaidCharges.length === 0 && (
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

      {/* Payment Methods Modal */}
      <PaymentMethodsSettings 
        visible={isPaymentMethodsVisible}
        onClose={() => setIsPaymentMethodsVisible(false)}
      />

      <PaymentConfirmationModal
        visible={showConfirmation}
        onClose={() => !isProcessingPayment && setShowConfirmation(false)}
        selectedCharges={selectedCharges}
        totalAmount={selectedTotal}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessingPayment}
      />
    </View>
  );
};

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
  addPaymentMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  addPaymentMethodText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
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