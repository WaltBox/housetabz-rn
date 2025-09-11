import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
// Note: Using built-in date handling without external dependencies
import apiClient from '../config/api';

const AddChargeModal = ({ visible, onClose, service, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dueDateText, setDueDateText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setAmount('');
      setDescription('');
      setDueDate(null);
      setDueDateText('');
      setErrors({});
      setShowSuccess(false);
    }
  }, [visible]);

  // Get default due date based on service's normal due day
  const getDefaultDueDate = () => {
    if (!service?.dueDate) return new Date();
    
    const today = new Date();
    const serviceDate = new Date(service.dueDate);
    const dayOfMonth = serviceDate.getDate();
    
    // Set to next occurrence of the service's due day
    const nextDueDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    if (nextDueDate <= today) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }
    
    return nextDueDate;
  };

  // Real-time validation
  const validateForm = () => {
    const newErrors = {};
    
    // Amount validation
    const amountNum = parseFloat(amount);
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (amountNum > 10000) {
      newErrors.amount = 'Amount cannot exceed $10,000';
    }
    
    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    } else if (description.trim().length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle amount input change
  const handleAmountChange = (text) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(cleanedText);
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  // Handle description change
  const handleDescriptionChange = (text) => {
    setDescription(text);
    
    // Clear description error when user starts typing
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: null }));
    }
  };



  // Handle date text change with auto-formatting
  const handleDateTextChange = (text) => {
    // Remove all non-numeric characters
    const numbersOnly = text.replace(/\D/g, '');
    
    // Auto-format with slashes as user types
    let formattedText = '';
    if (numbersOnly.length > 0) {
      if (numbersOnly.length <= 2) {
        formattedText = numbersOnly;
      } else if (numbersOnly.length <= 4) {
        formattedText = `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
      } else {
        formattedText = `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
      }
    }
    
    setDueDateText(formattedText);
    
    // Try to parse the date only if we have a complete format (MM/DD/YYYY)
    if (formattedText.length === 10) {
      const parsedDate = parseDate(formattedText);
      if (parsedDate) {
        setDueDate(parsedDate);
        // Clear any date errors
        if (errors.dueDate) {
          setErrors(prev => ({ ...prev, dueDate: null }));
        }
      } else {
        setDueDate(null);
        setErrors(prev => ({ ...prev, dueDate: 'Invalid date format. Use MM/DD/YYYY' }));
      }
    } else if (formattedText.length === 0) {
      setDueDate(null);
      if (errors.dueDate) {
        setErrors(prev => ({ ...prev, dueDate: null }));
      }
    } else {
      // Incomplete date, clear any previous errors but don't set new ones
      setDueDate(null);
      if (errors.dueDate) {
        setErrors(prev => ({ ...prev, dueDate: null }));
      }
    }
  };

  // Parse date from text input (MM/DD/YYYY format)
  const parseDate = (dateText) => {
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateText.match(dateRegex);
    
    if (match) {
      const month = parseInt(match[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      const date = new Date(year, month, day);
      
      // Validate the date
      if (date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
        // Check if date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date >= today) {
          return date;
        }
      }
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        amount: parseFloat(amount),
        description: description.trim(),
        dueDate: dueDate || getDefaultDueDate()
      };
      
      const response = await apiClient.post(
        `/api/houseServices/${service.id}/manual-bill`,
        payload
      );
      
      // Success - Show custom success modal
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Failed to create manual bill:', error);
      
      let errorMessage = 'Failed to create charge. Please try again.';
      
      if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to create charges for this service. Only the designated user can perform this action.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Service not found. It may have been deleted.';
      } else if (error.response?.status === 400) {
        const backendErrors = error.response.data?.errors;
        if (backendErrors) {
          // Handle field-specific validation errors from backend
          setErrors(backendErrors);
          return;
        } else {
          errorMessage = error.response.data?.message || 'Invalid request. Please check your input.';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    // Ensure consistent MM/DD/YYYY format
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  // Success Modal Component
  const SuccessModal = () => (
    <Modal
      visible={showSuccess}
      transparent={true}
      animationType="fade"
      onRequestClose={handleSuccessClose}
    >
      <View style={styles.successOverlay}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <MaterialIcons name="check-circle" size={60} color="#34d399" />
          </View>
          
          <Text style={styles.successTitle}>Charge Created Successfully!</Text>
          
          <Text style={styles.successMessage}>
            All house members have been notified of the new charge and will receive their portion automatically.
          </Text>
          
          <View style={styles.successDetails}>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Amount:</Text>
              <Text style={styles.successDetailValue}>${parseFloat(amount || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Service:</Text>
              <Text style={styles.successDetailValue}>{service?.name}</Text>
            </View>
            {description && (
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Description:</Text>
                <Text style={styles.successDetailValue}>{description}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.successButton}
            onPress={handleSuccessClose}
            activeOpacity={0.8}
          >
            <MaterialIcons name="check" size={20} color="white" />
            <Text style={styles.successButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Add Charge - {service?.name}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
              >
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Amount Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Amount <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  errors.amount && styles.inputError
                ]}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    maxLength={10}
                  />
                </View>
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}
              </View>

              {/* Description Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Description <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  styles.descriptionContainer,
                  errors.description && styles.inputError
                ]}>
                  <TextInput
                    style={styles.descriptionInput}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    placeholder="e.g., Overage fee, Late payment penalty"
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                </View>
                <Text style={styles.characterCount}>
                  {description.length}/200
                </Text>
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>

              {/* Due Date Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Due Date (Optional)</Text>
                <View style={[
                  styles.inputContainer,
                  errors.dueDate && styles.inputError
                ]}>
                  <MaterialIcons name="event" size={20} color="#64748b" />
                  <TextInput
                    style={styles.dateTextInput}
                    value={dueDateText}
                    onChangeText={handleDateTextChange}
                    placeholder="MM/DD/YYYY"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                {errors.dueDate && (
                  <Text style={styles.errorText}>{errors.dueDate}</Text>
                )}
                <Text style={styles.helperText}>
                  Leave empty to use service's normal due day ({formatDate(getDefaultDueDate())})
                </Text>
              </View>


              {/* Info Card */}
              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={16} color="#34d399" />
                <Text style={styles.infoText}>
                  Only use this feature for unexpected charges
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
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
                  isSubmitting && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons name="add" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Create Charge</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
      
      {/* Success Modal */}
      <SuccessModal />
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34d399',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  descriptionContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#1e293b',
    fontFamily: 'Poppins-Medium',
  },
  dateTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
    minHeight: 60, // Ensure minimum height for multiline
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },


  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#34d399',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#065f46',
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#34d399',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'Poppins-SemiBold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#34d399',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
    fontFamily: 'Poppins-Bold',
  },
  
  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  successContainer: {
    backgroundColor: '#dff6f0',
    borderRadius: 20,
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 50,
    padding: 20,
    marginBottom: 40,
    borderWidth: 3,
    borderColor: '#34d399',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Poppins-Bold',
  },
  successMessage: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 10,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  successDetailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  successDetailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    flex: 2,
    textAlign: 'right',
  },
  successButton: {
    backgroundColor: '#34d399',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#34d399',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
    fontFamily: 'Poppins-Bold',
  },
});

export default AddChargeModal;