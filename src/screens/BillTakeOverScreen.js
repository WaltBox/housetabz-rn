import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/billTakeOver/FormField';
import TakeoverSuccess from '../components/billTakeOver/TakeoverSuccess';
// Import apiClient instead of axios
import apiClient from '../config/api';

const { width } = Dimensions.get('window');

const BillTakeoverScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const [formData, setFormData] = useState({
    serviceName: '',
    accountNumber: '',
    monthlyAmount: '',
    dueDate: '',
    requiredUpfrontPayment: '0',
    isFixedService: true,
  });

  // Define steps
  const steps = [
    {
      title: "Provider Information",
      subtitle: "Please provide us some details about your bill",
      fields: [
        {
          field: 'serviceName',
          label: 'Provider Name',
          placeholder: 'AT&T, Reliant, etc.',
          icon: 'business',
        },
        {
          field: 'accountNumber',
          label: 'Account Number',
          placeholder: 'Account or reference number',
          icon: 'badge',
        },
        {
          field: 'isFixedService',
          label: 'Fixed expense?',
          icon: 'done',
          isCheckbox: true,
        }
      ]
    },
    {
      title: "Payment Details",
      subtitle: "How much is the bill and when is it due?",
      fields: [
        {
          field: 'monthlyAmount',
          label: 'Monthly Amount',
          placeholder: '0.00',
          icon: 'attach-money',
          keyboardType: 'decimal-pad',
          prefix: '$',
        },
        {
          field: 'dueDate',
          label: 'Due Date',
          placeholder: '1-31',
          icon: 'calendar-today',
          keyboardType: 'number-pad',
          maxLength: 2,
        }
      ]
    },
    {
      title: "Need money now?",
      subtitle: "Is there any upfront payment required?",
      fields: [
        {
          field: 'requiredUpfrontPayment',
          label: 'Amount',
          placeholder: '0.00',
          icon: 'security',
          keyboardType: 'decimal-pad',
          prefix: '$',
        }
      ]
    }
  ];

  const totalSteps = steps.length;

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxToggle = () => {
    setFormData(prev => ({ ...prev, isFixedService: !prev.isFixedService }));
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

      // Use apiClient with relative path
      const response = await apiClient.post("/api/take-over-requests", payload);
      setSubmittedData(response.data);
      setShowSuccess(true);
    } catch (error) {
      Alert.alert(
        "Error", 
        error.response?.data?.error || "Failed to submit takeover request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess && submittedData) {
    return <TakeoverSuccess data={submittedData} onDone={() => navigation.goBack()} />;
  }

  // Custom Field Renderer
  const renderField = (fieldConfig, index, isLastField) => {
    // Special case for checkbox
    if (fieldConfig.isCheckbox) {
      return (
        <View key={fieldConfig.field} style={styles.checkboxContainer}>
          <View style={styles.labelContainer}>
            <MaterialIcons name={fieldConfig.icon} size={24} color="#34d399" style={styles.labelIcon} />
            <Text style={styles.label}>{fieldConfig.label}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.checkbox} 
            onPress={handleCheckboxToggle}
          >
            {formData.isFixedService && (
              <MaterialIcons name="check" size={24} color="#34d399" />
            )}
          </TouchableOpacity>
        </View>
      );
    }

    // Regular field
    return (
      <View key={fieldConfig.field} style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name={fieldConfig.icon} size={24} color="#34d399" style={styles.labelIcon} />
          <Text style={styles.label}>{fieldConfig.label}</Text>
        </View>
        
        <View style={styles.inputContainer}>
          {fieldConfig.prefix && (
            <Text style={styles.prefix}>{fieldConfig.prefix}</Text>
          )}
          <TextInput
            style={[styles.input, fieldConfig.prefix && styles.inputWithPrefix]}
            value={formData[fieldConfig.field]}
            onChangeText={(text) => handleFieldChange(fieldConfig.field, text)}
            placeholder={fieldConfig.placeholder}
            placeholderTextColor="#94a3b8"
            keyboardType={fieldConfig.keyboardType || 'default'}
            maxLength={fieldConfig.maxLength}
            autoCapitalize={fieldConfig.field === 'serviceName' ? 'words' : 'none'}
          />
        </View>
      </View>
    );
  };

  // Determine which step to render
  const renderCurrentStep = () => {
    if (currentStep === totalSteps) {
      // Review step (last step)
      return (
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewTitle}>Review Your Request</Text>
          
          <View style={styles.summaryContainer}>
            <SummaryItem 
              icon="business"
              label="Provider"
              value={formData.serviceName}
            />
            
            <SummaryItem 
              icon="badge"
              label="Account"
              value={formData.accountNumber}
            />
            
            <SummaryItem 
              icon="done"
              label="Type"
              value={formData.isFixedService ? "Fixed Amount" : "Variable Amount"}
            />
            
            {formData.isFixedService && (
              <SummaryItem 
                icon="attach-money"
                label="Monthly"
                value={`$${formData.monthlyAmount}`}
              />
            )}
            
            <SummaryItem 
              icon="calendar-today"
              label="Due Date"
              value={`Day ${formData.dueDate}`}
            />
            
            {parseFloat(formData.requiredUpfrontPayment) > 0 && (
              <SummaryItem 
                icon="security"
                label="Upfront"
                value={`$${formData.requiredUpfrontPayment}`}
              />
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Request</Text>
                <MaterialIcons name="check" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    } else {
      const currentStepData = steps[currentStep];
      const isLastField = currentStepData.fields.length - 1;
      
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
          
          {currentStepData.fields.map((field, index) => 
            renderField(field, index, index === isLastField)
          )}
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={fadeToNextStep}
          >
            <MaterialIcons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Takeover</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / (totalSteps)) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {totalSteps + 1}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form content with animation */}
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {renderCurrentStep()}
        </Animated.View>
        
        {/* Navigation */}
        {currentStep > 0 && currentStep <= totalSteps && (
          <TouchableOpacity 
            style={styles.backStepButton}
            onPress={() => setCurrentStep(prev => prev - 1)}
          >
            <MaterialIcons name="arrow-back" size={18} color="#64748b" />
            <Text style={styles.backButtonText}>Previous Step</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Summary Item Component
const SummaryItem = ({ icon, label, value }) => (
  <View style={styles.summaryItem}>
    <View style={styles.summaryIconContainer}>
      <MaterialIcons name={icon} size={20} color="#34d399" />
    </View>
    <View style={styles.summaryContent}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bfeee8',
    backgroundColor: '#dff6f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily: 'Quicksand-Bold',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#dff6f0',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#bfeee8',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  contentContainer: {
    marginBottom: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontFamily: 'Quicksand-Bold',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 30,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelIcon: {
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily:'Sigmar-Regular'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  prefix: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    paddingVertical: 12,
  },
  inputWithPrefix: {
    marginLeft: 8,
  },
  checkboxContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#34d399',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 20,
  },
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginLeft: 4,
  },
  reviewContainer: {
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dff6f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  submitButton: {
    backgroundColor: '#34d399',
    paddingVertical: 16,
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
    width: '100%',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default BillTakeoverScreen;