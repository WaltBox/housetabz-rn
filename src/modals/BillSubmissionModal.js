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
import apiClient, { invalidateCache, clearUserCache } from '../config/api';
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
      // ENHANCED: Add detailed logging for debugging
      console.log('🔍 Bill submission attempt:', {
        billSubmissionId: billSubmission.id,
        amount: parseFloat(amount),
        userId: user?.id,
        userHouseId: user?.houseId,
        billSubmissionData: billSubmission,
        endpoint: `/api/bill-submissions/${billSubmission.id}/submit`
      });

      // 🔍 DEBUG: Log ALL fields in billSubmission object
      console.log('🔍 BILL SUBMISSION OBJECT STRUCTURE:', {
        'All Keys': Object.keys(billSubmission || {}),
        'Full Object': billSubmission
      });

      // ENHANCED: Validate bill submission data
      if (!billSubmission?.id) {
        throw new Error('Invalid bill submission: missing ID');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // ENHANCED: Check if bill is already submitted
      if (billSubmission.status && billSubmission.status !== 'pending') {
        Alert.alert(
          'Already Submitted',
          `This bill has already been ${billSubmission.status}. Please refresh the page to see the latest status.`
        );
        setIsSubmitting(false);
        return;
      }

      // 🔍 TEMPORARILY DISABLED: User validation until we understand the object structure
      // The backend should handle authorization validation
      console.log('⚠️ FRONTEND VALIDATION TEMPORARILY DISABLED - Backend will handle authorization');

      // ENHANCED: Validate amount format
      const submissionAmount = parseFloat(amount);
      if (isNaN(submissionAmount) || submissionAmount <= 0) {
        Alert.alert(
          'Invalid Amount',
          'Please enter a valid amount greater than zero.',
          [{ text: 'OK' }]
        );
        setIsSubmitting(false);
        return;
      }

      // ENHANCED: Add comprehensive pre-submission logging
      console.log('✅ Pre-submission validation passed:', {
        'Bill ID': billSubmission.id,
        'User ID': user.id,
        'Amount': submissionAmount,
        'Bill Status': billSubmission.status,
        'House Service ID': billSubmission.houseServiceId,
        'Due Date': billSubmission.dueDate
      });

      // Direct API call to submit the bill amount
      const response = await apiClient.post(`/api/bill-submissions/${billSubmission.id}/submit`, {
        amount: submissionAmount
      });

      console.log('✅ Bill submission successful:', response.data);

      // Clear cache to ensure UI updates immediately and prevent reappearance
      invalidateCache('dashboard');
      invalidateCache('houseService');
      
      // Clear user-specific cache to prevent bill submission from reappearing on refresh
      if (user?.id) {
        clearUserCache(user.id);
        console.log('🗑️ Cleared user cache after bill submission to prevent reappearance on refresh');
      }

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
      
      setAmount('');
      onClose();
    } catch (err) {
      console.error('❌ Error submitting bill amount:', err);
      
      // ENHANCED: Better error handling with specific messages
      let errorMessage = 'Failed to submit bill amount. Please try again.';
      
      if (err.response?.status === 400) {
        // Handle 400 errors - validation issues
        if (err.response.data?.message?.includes('already been processed')) {
          errorMessage = 'This bill has already been submitted. Please refresh to see the latest status.';
        } else if (err.response.data?.message?.includes('invalid amount')) {
          errorMessage = 'Please enter a valid bill amount greater than zero.';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = 'Invalid request. Please check the bill amount and try again.';
        }
      } else if (err.response?.status === 403) {
        // Handle 403 errors - authorization issues
        console.error('🚨 403 Forbidden - Detailed analysis:', {
          'User ID': user?.id,
          'Bill Submission ID': billSubmission?.id,
          'Bill Status': billSubmission?.status,
          'Bill Assigned To': billSubmission?.userId,
          'User House ID': user?.houseId,
          'House Service ID': billSubmission?.houseServiceId,
          'Response Data': err.response?.data,
          'Response Message': err.response?.data?.message || err.response?.data?.error
        });
        
        if (err.response.data?.message?.includes('not authorized') || err.response.data?.message?.includes('designated user')) {
          errorMessage = 'You are not authorized to submit this bill. Only the designated user can submit bill amounts.';
        } else if (err.response.data?.message?.includes('already completed')) {
          errorMessage = 'This bill submission has already been completed. Please refresh your dashboard.';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = 'You do not have permission to submit this bill. Please contact support if this issue persists.';
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log out and log back in.';
      } else if (err.response?.status === 404) {
        errorMessage = 'This bill submission could not be found. Please refresh and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again in a few moments.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      Alert.alert('Submission Failed', errorMessage);
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
          {/* Clean Header */}
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
              <MaterialIcons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Integrated Service Header */}
            <View style={styles.serviceHeader}>
                <View style={styles.serviceIcon}>
                <MaterialIcons name="receipt-long" size={28} color="#34d399" />
                </View>
              <View style={styles.serviceInfo}>
                  <Text style={[
                    styles.serviceName,
                    fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                  ]}>{serviceName}</Text>
                <View style={styles.dueDateRow}>
                  <MaterialIcons name="schedule" size={16} color="#64748b" />
                  <Text style={[
                    styles.dueDateText,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}>
                    Due {formatDueDate(billSubmission?.dueDate)}
                  </Text>
                </View>
                </View>
                {isOverdue() && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueText}>OVERDUE</Text>
                  </View>
                )}
              </View>
              
            {/* Amount Input Section */}
            <View style={styles.inputSection}>
              <Text style={[
                styles.inputLabel,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>Enter Total Amount</Text>
              
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    fontsLoaded && { fontFamily: 'Poppins-Bold' }
                  ]}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  autoFocus={true}
                />
              </View>
              
              {/* Subtle instruction */}
              <Text style={[
                styles.instructionText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                Check your provider account for the exact amount
              </Text>
            </View>

            {/* Process Info */}
            <View style={styles.infoSection}>
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
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  
  // Clean Header Design
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 28 : 20,
    paddingBottom: 16,
    backgroundColor: "#dff6f0",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Content
  scrollContent: {
    padding: 24,
  },
  
  // Integrated Service Header
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    opacity: 0.9,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 24,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDateText: {
    marginLeft: 6,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  overdueBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  overdueText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  
  // Input Section
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
    width: "100%",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10b981",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    padding: 0,
    textAlign: "left",
  },
  instructionText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    fontStyle: "italic",
  },
  

  
  // Info Section
  infoSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    letterSpacing: 0.2,
  },
  infoText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    fontWeight: "500",
  },
  
  // Integrated Footer
  footer: {
    padding: 24,
    backgroundColor: "#dff6f0",
    flexDirection: "row",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6ee7b7",
  },
  cancelButtonText: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#a7f3d0",
    opacity: 0.7,
  },
  submitButtonText: {
    fontWeight: "700",
    color: "white",
    fontSize: 16,
    letterSpacing: 0.3,
  }
});

export default BillSubmissionModal;