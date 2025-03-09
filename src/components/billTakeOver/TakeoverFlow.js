import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import UberStyleFormField from './FormField';
import ServiceTypeSelector from './ServiceTypeSelector';
// Import apiClient instead of axios
import apiClient from '../../config/api';

const TakeoverFlow = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const [formData, setFormData] = useState({
    serviceName: '',
    accountNumber: '',
    monthlyAmount: '',
    dueDate: '',
    requiredUpfrontPayment: '0',
    isFixedService: true,
  });

  // Field configurations for each step
  const fields = [
    {
      field: 'serviceName',
      label: 'What service are you taking over?',
      placeholder: 'e.g. Comcast, AT&T, Netflix',
      icon: 'business',
    },
    {
      field: 'accountNumber',
      label: 'What\'s the account number?',
      placeholder: 'Account or reference number',
      icon: 'badge',
    },
    // Service type selector is handled separately
    {
      field: 'monthlyAmount',
      label: 'How much is the monthly payment?',
      placeholder: '0.00',
      icon: 'attach-money',
      keyboardType: 'decimal-pad',
      prefix: '$',
      shouldShow: () => formData.isFixedService,
    },
    {
      field: 'dueDate',
      label: 'What day of the month is it due?',
      placeholder: '1-31',
      icon: 'calendar-today',
      keyboardType: 'number-pad',
      maxLength: 2,
    },
    {
      field: 'requiredUpfrontPayment',
      label: 'Any upfront payment needed?',
      placeholder: '0.00',
      icon: 'security',
      keyboardType: 'decimal-pad',
      prefix: '$',
    }
  ];

  // Filter steps based on conditions
  const getVisibleFields = () => {
    return fields.filter(field => {
      if (field.shouldShow !== undefined) {
        return field.shouldShow();
      }
      return true;
    });
  };

  const visibleFields = getVisibleFields();
  const totalSteps = visibleFields.length + 1; // +1 for service type selector

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceTypeToggle = (isFixed) => {
    setFormData(prev => ({ ...prev, isFixedService: isFixed }));
  };

  const fadeToNextStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    // Move to next step
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!formData.serviceName || !formData.accountNumber || !formData.dueDate) {
        Alert.alert("Error", "Please complete all required fields");
        setLoading(false);
        return;
      }
      
      // Validate due date
      const dueDateNum = parseInt(formData.dueDate, 10);
      if (isNaN(dueDateNum) || dueDateNum < 1 || dueDateNum > 31) {
        Alert.alert("Error", "Due date must be between 1 and 31");
        setLoading(false);
        return;
      }
      
      // Additional validation for fixed services
      if (formData.isFixedService && !formData.monthlyAmount) {
        Alert.alert("Error", "Please enter the monthly amount");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        userId: user.id,
        // For variable services, don't send a monthlyAmount
        monthlyAmount: formData.isFixedService ? parseFloat(formData.monthlyAmount) : null,
        dueDate: dueDateNum,
        requiredUpfrontPayment: parseFloat(formData.requiredUpfrontPayment) || 0,
      };

      // Use apiClient instead of axios with the relative path
      const response = await apiClient.post("/api/take-over-requests", payload);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      Alert.alert(
        "Error", 
        error.response?.data?.error || "Failed to submit takeover request"
      );
    } finally {
      setLoading(false);
    }
  };

  // Determine which step to render
  const renderCurrentStep = () => {
    const serviceTypeSelectorIndex = 2; // After account number
    
    if (currentStep === visibleFields.length) {
      // Submit button for the last step
      return (
        <View style={styles.submitContainer}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Review Your Request</Text>
            
            <View style={styles.summaryItem}>
              <MaterialIcons name="business" size={20} color="#34d399" />
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{formData.serviceName}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <MaterialIcons name="badge" size={20} color="#34d399" />
              <Text style={styles.summaryLabel}>Account:</Text>
              <Text style={styles.summaryValue}>{formData.accountNumber}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <MaterialIcons name="tune" size={20} color="#34d399" />
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text style={styles.summaryValue}>
                {formData.isFixedService ? "Fixed Amount" : "Variable Amount"}
              </Text>
            </View>
            
            {formData.isFixedService && (
              <View style={styles.summaryItem}>
                <MaterialIcons name="attach-money" size={20} color="#34d399" />
                <Text style={styles.summaryLabel}>Monthly:</Text>
                <Text style={styles.summaryValue}>${formData.monthlyAmount}</Text>
              </View>
            )}
            
            <View style={styles.summaryItem}>
              <MaterialIcons name="calendar-today" size={20} color="#34d399" />
              <Text style={styles.summaryLabel}>Due Date:</Text>
              <Text style={styles.summaryValue}>Day {formData.dueDate}</Text>
            </View>
            
            {parseFloat(formData.requiredUpfrontPayment) > 0 && (
              <View style={styles.summaryItem}>
                <MaterialIcons name="security" size={20} color="#34d399" />
                <Text style={styles.summaryLabel}>Upfront:</Text>
                <Text style={styles.summaryValue}>${formData.requiredUpfrontPayment}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    } else if (currentStep === serviceTypeSelectorIndex) {
      // Service type selector
      return (
        <ServiceTypeSelector 
          isFixedService={formData.isFixedService}
          onToggle={handleServiceTypeToggle}
          onNext={fadeToNextStep}
        />
      );
    } else {
      // Regular form field
      const fieldIndex = currentStep < serviceTypeSelectorIndex ? 
        currentStep : currentStep - 1;
      
      const currentField = visibleFields[fieldIndex];
      
      return (
        <UberStyleFormField
          field={currentField.field}
          label={currentField.label}
          value={formData[currentField.field]}
          placeholder={currentField.placeholder}
          icon={currentField.icon}
          keyboardType={currentField.keyboardType}
          prefix={currentField.prefix}
          maxLength={currentField.maxLength}
          onChange={(value) => handleFieldChange(currentField.field, value)}
          onNext={fadeToNextStep}
          isLast={currentStep === visibleFields.length - 1}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / totalSteps) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {totalSteps + 1}
        </Text>
      </View>
      
      {/* Form content with animation */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>
      </Animated.View>
      
      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentStep(prev => prev - 1)}
          >
            <MaterialIcons name="arrow-back" size={18} color="#64748b" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginLeft: 4,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 'auto',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  submitContainer: {
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
    width: 70,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#34d399',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default TakeoverFlow;