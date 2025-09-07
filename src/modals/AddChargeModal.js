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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setAmount('');
      setDescription('');
      setDueDate(null);
      setDueDateText('');
      setErrors({});
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



  // Handle date text change
  const handleDateTextChange = (text) => {
    setDueDateText(text);
    
    // Try to parse the date
    if (text.trim()) {
      const parsedDate = parseDate(text);
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
    } else {
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
      
      // Success
      Alert.alert(
        'Charge Created Successfully!',
        'All house members have been notified of the new charge.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              if (onSuccess) {
                onSuccess(response.data);
              }
            }
          }
        ]
      );
      
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
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

              {/* Clear Date Option */}
              {dueDateText && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => {
                    setDueDateText('');
                    setDueDate(null);
                    if (errors.dueDate) {
                      setErrors(prev => ({ ...prev, dueDate: null }));
                    }
                  }}
                >
                  <MaterialIcons name="clear" size={16} color="#64748b" />
                  <Text style={styles.clearDateText}>Clear custom date</Text>
                </TouchableOpacity>
              )}

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
  clearDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginTop: 8,
  },
  clearDateText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
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
});

export default AddChargeModal;