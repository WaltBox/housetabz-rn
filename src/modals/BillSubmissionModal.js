import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import apiClient from '../config/api';
import { useAuth } from '../context/AuthContext';

const BillSubmissionModal = ({ visible, onClose, billSubmission, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  // Reset amount when modal opens with a new submission
  useEffect(() => {
    if (visible && billSubmission) {
      setAmount('');
    }
  }, [visible, billSubmission]);

  const handleAmountChange = (text) => {
    // Allow only numbers and one decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length > 1 && parts[1].length > 2) {
      return;
    }
    
    setAmount(filtered);
  };

  const calculateEstimatedSplit = () => {
    if (!amount) return 0;
    
    // Estimate with 3 roommates if we don't know the actual count
    const estimatedRoommateCount = 3;
    const amountValue = parseFloat(amount);
    return amountValue / estimatedRoommateCount;
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bill amount greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct API call to submit the bill amount
      const response = await apiClient.post(`/api/bill-submissions/${billSubmission.id}/submit`, {
        amount: parseFloat(amount)
      });

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
      
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Error submitting bill amount:', err);
      Alert.alert(
        'Submission Failed',
        err.response?.data?.error || 'Failed to submit bill amount. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Determine if the submission is overdue
  const isOverdue = () => {
    if (!billSubmission?.dueDate) return false;
    const dueDate = new Date(billSubmission.dueDate);
    const today = new Date();
    return dueDate < today;
  };

  // Get house service name safely
  const serviceName = billSubmission?.houseService?.name || 
                     billSubmission?.metadata?.serviceName || 
                     'Utility Bill';

  if (!visible || !billSubmission) return null;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[
                styles.headerTitle,
                fontsLoaded && { fontFamily: 'Poppins-Bold' }
              ]}>Submit Bill Amount</Text>
              <Text style={[
                styles.headerSubtitle,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>{serviceName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Bill Details Card */}
            <View style={styles.card}>
              <View style={styles.billHeader}>
                <View style={styles.serviceIcon}>
                  <MaterialIcons name="receipt-long" size={24} color="#34d399" />
                </View>
                <View style={styles.billInfo}>
                  <Text style={[
                    styles.serviceName,
                    fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                  ]}>{serviceName}</Text>
                  <Text style={[
                    styles.billType,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}>Monthly bill</Text>
                </View>
                {isOverdue() && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueText}>OVERDUE</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.dueDateRow}>
                <MaterialIcons name="schedule" size={18} color="#6b7280" />
                <Text style={[
                  styles.dueDateText,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  Due {formatDueDate(billSubmission?.dueDate)}
                </Text>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.card}>
              <Text style={[
                styles.inputLabel,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Total Bill Amount</Text>
              
              {/* Instructions */}
              <View style={styles.instructionContainer}>
                <MaterialIcons name="info-outline" size={16} color="#34d399" />
                <Text style={[
                  styles.instructionText,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  Check your provider account for the total amount
                </Text>
              </View>
              
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Split Preview */}
          

            {/* Process Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <MaterialIcons name="auto-awesome" size={20} color="#34d399" />
                <Text style={[
                  styles.infoTitle,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>How it works</Text>
              </View>
              <Text style={[
                styles.infoText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                We'll split this bill among roommates. Once everyone pays, HouseTabz handles payment to your provider.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={[
                styles.cancelButtonText,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!amount || parseFloat(amount) <= 0 || isSubmitting) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialIcons name="send" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={[
                    styles.submitButtonText,
                    fontsLoaded && { fontFamily: 'Poppins-Bold' }
                  ]}>Submit Bill</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Main container styles (kept the same)
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  
  // Header (improved)
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#dff6f0",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Content
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  
  // Bill Header (improved)
  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  billType: {
    fontSize: 14,
    color: "#6b7280",
  },
  overdueBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overdueText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "700",
  },
  
  // Due Date
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  dueDateText: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 14,
  },
  
  // Instructions
  instructionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#34d399",
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: "#059669",
    lineHeight: 18,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    padding: 0,
  },
  
  // Split Preview (simplified)
  splitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  splitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  splitAmount: {
    alignItems: "center",
  },
  splitValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#34d399",
    marginBottom: 4,
  },
  splitNote: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  
  // Info Card (cleaner)
  infoCard: {
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  
  // Footer (kept the same structure, refined styling)
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#dff6f0",
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelButtonText: {
    fontWeight: "600",
    color: "#6b7280",
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#34d399",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#a7f3d0",
  },
  submitButtonText: {
    fontWeight: "700",
    color: "white",
    fontSize: 16,
  }
});

export default BillSubmissionModal;