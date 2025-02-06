import React, { useState } from 'react';
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
import { MaterialIcons } from "@expo/vector-icons";

const AcceptServicePayment = ({ 
  visible,
  onClose,
  taskData,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank');

  if (!taskData?.stagedRequest) return null;
  const { stagedRequest, paymentAmount } = taskData;

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onSuccess({
        paymentMethod,
        amount: paymentAmount
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = Number(paymentAmount) * (paymentMethod === 'card' ? 1.03 : 1);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Accept Service</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Service Details */}
            <View style={styles.serviceCard}>
              <Text style={styles.serviceName}>{stagedRequest.serviceName}</Text>
              <Text style={styles.providerName}>{stagedRequest.partnerName}</Text>
              <View style={styles.costBreakdown}>
                <View style={styles.costRow}>
                  <Text style={styles.label}>Total Cost</Text>
                  <Text style={styles.value}>${Number(stagedRequest.estimatedAmount).toFixed(2)}</Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.label}>Your Share</Text>
                  <Text style={styles.shareAmount}>${paymentAmount.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Escrow Info */}
            <View style={styles.infoCard}>
              <MaterialIcons name="security" size={20} color="#22c55e" />
              <Text style={styles.infoText}>
                Your payment will be held securely until all roommates approve. 
                Funds can be withdrawn if any roommate declines.
              </Text>
            </View>

            {/* Payment Method Selection */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'bank' && styles.selectedOption
                ]}
                onPress={() => setPaymentMethod('bank')}
              >
                <View style={styles.optionContent}>
                  <MaterialIcons 
                    name="account-balance" 
                    size={24} 
                    color={paymentMethod === 'bank' ? "#22c55e" : "#64748b"}
                  />
                  <View>
                    <Text style={styles.optionTitle}>Bank Account</Text>
                    <Text style={styles.optionSubtitle}>No fees</Text>
                  </View>
                </View>
                {paymentMethod === 'bank' && (
                  <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'card' && styles.selectedOption
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <View style={styles.optionContent}>
                  <MaterialIcons 
                    name="credit-card" 
                    size={24} 
                    color={paymentMethod === 'card' ? "#22c55e" : "#64748b"}
                  />
                  <View>
                    <Text style={styles.optionTitle}>Credit Card</Text>
                    <Text style={styles.optionSubtitle}>3% processing fee</Text>
                  </View>
                </View>
                {paymentMethod === 'card' && (
                  <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Fixed Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total to Pay</Text>
              <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleAccept}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  costBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    gap: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  value: {
    fontSize: 14,
    color: '#1e293b',
  },
  shareAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
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
    borderColor: '#22c55e',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});

export default AcceptServicePayment;