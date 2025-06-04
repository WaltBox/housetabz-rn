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
import apiClient from '../config/api';
import { useAuth } from '../context/AuthContext';

const BillSubmissionModal = ({ visible, onClose, billSubmission, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  
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
            <Text style={styles.headerTitle}>Submit Bill Amount</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Bill Service Details Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{serviceName}</Text>
              <Text style={styles.cardSubtitle}>Monthly Variable Bill</Text>
              
              {/* Due Date Badge */}
              <View style={styles.dueDateContainer}>
                <MaterialIcons name="event" size={18} color="#64748b" />
                <Text style={styles.dueDateText}>
                  Due: {formatDueDate(billSubmission?.dueDate)}
                </Text>
                {isOverdue() && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueText}>OVERDUE</Text>
                  </View>
                )}
              </View>
              
              {/* Divider */}
              <View style={styles.divider} />
              
              {/* Bill Amount Input */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Enter Bill Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    autoFocus={true}
                  />
                </View>
              </View>
            </View>

            {/* Estimated Split Card */}
            {amount && parseFloat(amount) > 0 && (
              <View style={styles.card}>
                <View style={styles.estimatedHeader}>
                  <Text style={styles.estimatedTitle}>Estimated Split</Text>
                  <TouchableOpacity 
                    onPress={() => Alert.alert(
                      'Estimated Split',
                      'This is an estimation of how the bill amount will be divided among all roommates. The actual split may include service fees based on your house status.'
                    )}
                  >
                    <MaterialIcons name="help-outline" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.splitContainer}>
                  <Text style={styles.splitLabel}>Your Roommates</Text>
                  <Text style={styles.splitAmount}>
                    ~${calculateEstimatedSplit().toFixed(2)} each
                  </Text>
                </View>
                
                <Text style={styles.splitNote}>
                  Note: Actual charge amounts may include service fees based on your house status.
                </Text>
              </View>
            )}

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialIcons name="info" size={22} color="#22c55e" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                After submission, this bill will be split among all roommates. Each roommate will receive a charge notification.
              </Text>
            </View>
          </ScrollView>

          {/* Footer with buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
                  <MaterialIcons name="check" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Submit Bill</Text>
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
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  closeButton: {
    padding: 8,
  },
  
  // Content
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,

  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  
  // Due Date
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dueDateText: {
    marginLeft: 8,
    color: "#64748b",
    fontSize: 14,
    flex: 1,
  },
  overdueBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "700",
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 16,
  },
  
  // Amount Input
  amountSection: {
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    color: "#64748b",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: "#0f172a",
    fontWeight: "600",
    padding: 0,
  },
  
  // Estimated Split
  estimatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  estimatedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  splitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcfce7",
    marginBottom: 8,
  },
  splitLabel: {
    color: "#0f172a",
    fontSize: 14,
  },
  splitAmount: {
    fontWeight: "bold",
    color: "#0f172a",
    fontSize: 14,
  },
  splitNote: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
  
  // Info Card
  infoCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    borderColor: "#dcfce7",
    borderWidth: 1,
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    alignSelf: "flex-start",
    paddingTop: 2,
  },
  infoText: {
    flex: 1,
    color: "#0f172a",
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#dff6f0",
    flexDirection: "row",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: "bold",
    color: "#475569",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#a7f3d0",
  },
  submitButtonText: {
    fontWeight: "bold",
    color: "white",
  }
});

export default BillSubmissionModal;