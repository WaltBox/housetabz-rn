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

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get('http://localhost:3004/api/payment-methods');
        const methods = response.data.paymentMethods;
        setPaymentMethods(methods);
        
        const defaultMethod = methods.find(method => method.isDefault);
        setSelectedMethod(defaultMethod?.id || methods[0]?.id);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };
    
    if (visible) {
      fetchPaymentMethods();
    }
  }, [visible]);

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

  const getPaymentMethodDisplay = (method) => {
    if (!method) return 'Select payment method';
    return method.type === 'card' 
      ? `${method.brand} •••• ${method.last4}`
      : `Bank Account •••• ${method.last4}`;
  };

  const getMethodIcon = (type) => {
    return type === 'card' ? 'credit-card' : 'account-balance';
  };

  if (!taskData?.stagedRequest) return null;
  const { stagedRequest, paymentAmount } = taskData;

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
            <Text style={styles.headerTitle}>Confirm Your Pledge</Text>
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
                  <Text style={styles.value}>
                    ${Number(stagedRequest.estimatedAmount).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.label}>Your Pledge</Text>
                  <Text style={styles.shareAmount}>${paymentAmount.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Pledge Info */}
            <View style={styles.infoCard}>
              <MaterialIcons name="security" size={20} color="#22c55e" />
              <Text style={styles.infoText}>
                By pledging your payment, you authorize us to pull funds once all roommates agree. 
                If anyone declines, your pledge will be canceled automatically.
              </Text>
            </View>

            {/* Payment Method Section */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {!showPaymentOptions ? (
              <TouchableOpacity
                style={styles.defaultPaymentCard}
                onPress={() => setShowPaymentOptions(true)}
              >
                <View style={styles.optionContent}>
                  <MaterialIcons 
                    name={getMethodIcon(paymentMethods.find(m => m.id === selectedMethod)?.type)} 
                    size={24} 
                    color="#22c55e" 
                    style={styles.icon} 
                  />
                  <View>
                    <Text style={styles.optionTitle}>
                      {getPaymentMethodDisplay(paymentMethods.find(m => m.id === selectedMethod))}
                    </Text>
                    <Text style={styles.optionSubtitle}>
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
                    <View style={styles.optionContent}>
                      <MaterialIcons 
                        name={getMethodIcon(method.type)} 
                        size={24} 
                        color={selectedMethod === method.id ? '#22c55e' : '#64748b'} 
                        style={styles.icon}
                      />
                      <View>
                        <Text style={styles.optionTitle}>
                          {getPaymentMethodDisplay(method)}
                        </Text>
                        {method.isDefault && (
                          <Text style={styles.optionSubtitle}>Default</Text>
                        )}
                      </View>
                    </View>
                    {selectedMethod === method.id && (
                      <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Fixed Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total to Pledge</Text>
              <Text style={styles.totalAmount}>${paymentAmount.toFixed(2)}</Text>
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
                  <Text style={styles.confirmButtonText}>Confirm Pledge</Text>
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
  defaultPaymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  changeText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
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
  icon: {
    marginRight: 8,
  },
});

export default AcceptServicePayment;
