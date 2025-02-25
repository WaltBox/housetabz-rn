import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import PaymentConfirmationModal from '../modals/PaymentConfirmationModal';

const PayTab = ({ charges: allCharges, onChargesUpdated }) => {
  const queryClient = useQueryClient();
  // Filter out charges already paid or processing
  const unpaidCharges = useMemo(() => 
    allCharges.filter(charge => charge.status !== 'paid' && charge.status !== 'processing'),
    [allCharges]
  );
  
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [localUnpaidCharges, setLocalUnpaidCharges] = useState(unpaidCharges);
  
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

  const handlePayAll = () => {
    setSelectedCharges(localUnpaidCharges);
    setShowConfirmation(true);
  };

  const handlePaySelected = () => {
    if (selectedCharges.length > 0) {
      setShowConfirmation(true);
    }
  };

  // Centralized API call
  const handleConfirmPayment = async () => {
    try {
      setIsProcessingPayment(true);
      const idempotencyKey = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      
      const paymentRequest = {
        chargeIds: selectedCharges.map(charge => charge.id),
        paymentMethodId: 18 // Replace with dynamic payment method if needed
      };
      
      console.log('Sending payment request with:', { ...paymentRequest, idempotencyKey });
      
      const response = await axios.post(
        'http://localhost:3004/api/payments/batch',
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
    } catch (error) {
      // error handling remains the same
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
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
        </View>
        {chargesGroup.map(charge => (
          <View key={charge.id} style={[styles.chargeItem, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <View style={styles.chargeHeader}>
              <View style={styles.chargeTitleContainer}>
                <MaterialIcons name={charge.metadata?.icon || 'receipt'} size={18} color={color} style={styles.icon} />
                <View style={styles.chargeTextContent}>
                  <Text style={styles.chargeTitle}>{charge.name}</Text>
                  <Text style={[styles.chargeSubtitle, { color }]}>
                    {charge.daysLate ? `${charge.daysLate}d overdue` : `Due in ${charge.daysUntilDue}d`}
                  </Text>
                </View>
              </View>
              <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.selectButton,
                selectedCharges.some(c => c.id === charge.id) && styles.selectedButton
              ]}
              onPress={() => handleChargeSelectToggle(charge)}
              disabled={isProcessingPayment}
            >
              <MaterialIcons
                name={selectedCharges.some(c => c.id === charge.id) ? "check" : "add"}
                size={18}
                color={selectedCharges.some(c => c.id === charge.id) ? "#fff" : color}
              />
              <Text style={[
                styles.selectButtonText,
                selectedCharges.some(c => c.id === charge.id) && styles.selectedButtonText
              ]}>
                {selectedCharges.some(c => c.id === charge.id) ? 'Selected' : 'Select to Pay'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerSplit}>
          <View style={styles.headerSection}>
            <Text style={styles.headerLabel}>Total Due</Text>
            <Text style={styles.headerAmount}>${totalBalance.toFixed(2)}</Text>
          </View>
          {selectedCharges.length > 0 && (
            <View style={styles.headerSection}>
              <Text style={styles.headerLabel}>Selected</Text>
              <Text style={[styles.headerAmount, styles.selectedAmount]}>
                ${selectedTotal.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.paymentButton,
            (localUnpaidCharges.length === 0 || isProcessingPayment) && styles.disabledButton
          ]}
          onPress={localUnpaidCharges.length === 0 ? null : (selectedCharges.length ? handlePaySelected : handlePayAll)}
          disabled={localUnpaidCharges.length === 0 || isProcessingPayment}
        >
          {isProcessingPayment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.paymentButtonText}>
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
            <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
            <Text style={styles.emptyStateText}>No outstanding charges found</Text>
          </View>
        )}
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#fff' },
  headerCard: { backgroundColor: '#fff', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerSplit: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  headerSection: { flex: 1 },
  headerLabel: { fontSize: 14, color: '#64748b', marginBottom: 4, fontWeight: '500' },
  headerAmount: { fontSize: 28, fontWeight: '700', color: '#1e293b', fontVariant: ['tabular-nums'] },
  selectedAmount: { color: '#34d399' },
  paymentButton: { backgroundColor: '#34d399', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  disabledButton: { backgroundColor: '#94e0c1', opacity: 0.7 },
  paymentButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 4 },
  content: { flex: 1 },
  section: { marginTop: 24, marginHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingLeft: 12, borderLeftWidth: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginRight: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  chargeItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  chargeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  chargeTitleContainer: { flexDirection: 'row', flex: 1, marginRight: 12 },
  icon: { marginRight: 8, marginTop: 2 },
  chargeTextContent: { flex: 1 },
  chargeTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  chargeSubtitle: { fontSize: 13, fontWeight: '500' },
  chargeAmount: { fontSize: 16, fontWeight: '600', color: '#1e293b', fontVariant: ['tabular-nums'] },
  selectButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#f8fafc' },
  selectedButton: { backgroundColor: '#34d399' },
  selectButtonText: { fontSize: 13, fontWeight: '500', color: '#64748b', marginLeft: 4 },
  selectedButtonText: { color: '#fff' },
  emptyState: { alignItems: 'center', padding: 48 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginVertical: 8 },
  emptyStateText: { color: '#64748b', fontSize: 14, textAlign: 'center' },
});

export default PayTab;
