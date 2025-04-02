import React, { useState, useRef, useEffect } from 'react';
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
  
  // Add state for house data inside the component
  const [houseData, setHouseData] = useState(null);
  
  // Move the useEffect inside the component
  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        if (user?.houseId) {
          const response = await apiClient.get(`/api/houses/${user.houseId}`);
          setHouseData(response.data);
        }
      } catch (error) {
        console.error('Error fetching house data:', error);
      }
    };

    fetchHouseData();
  }, [user]);
  
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
          // Only show this field for fixed services
          shouldShow: () => formData.isFixedService,
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
      title: "One-time Upfront Payment",
      subtitle: "Is there a security deposit or setup fee needed?",
      fields: [
        {
          field: 'requiredUpfrontPayment',
          label: 'Security Deposit or Setup Fee',
          placeholder: '0.00',
          icon: 'security',
          keyboardType: 'decimal-pad',
          prefix: '$',
          helperText: 'This is a ONE-TIME payment, not your monthly bill amount'
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
        // Add service type field explicitly
        serviceType: formData.isFixedService ? 'fixed' : 'variable',
        // Add a hint for the backend about bundle type
        bundleType: formData.isFixedService ? 'fixed_recurring' : 'variable_recurring',
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
    // Skip fields that shouldn't be shown based on form state
    if (fieldConfig.shouldShow && !fieldConfig.shouldShow()) {
      return null;
    }
  
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
    // Calculate monthly amounts
    const billAmount = formData.isFixedService ? parseFloat(formData.monthlyAmount || 0) : 0;
    
    // Get actual roommate count from house data
    const roommateCount = houseData?.users?.length || 2; // Default to 2 if data not loaded
    
    const userBasePortion = formData.isFixedService ? 
      (billAmount / roommateCount).toFixed(2) : 
      'Varies';
    
    const userTotalPortion = formData.isFixedService ? 
      ((billAmount / roommateCount) + 2).toFixed(2) : 
      'Varies + $2.00';
  

    return (
      <View style={styles.reviewContainer}>
        <Text style={styles.reviewTitle}>Review Your Request</Text>
        
        {/* Bill Information Card */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="receipt-long" size={22} color="#34d399" />
            <Text style={styles.cardTitle}>Bill Information</Text>
          </View>
          
          <View style={styles.cardContent}>
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
                label="Monthly Amount"
                value={`$${formData.monthlyAmount}`}
              />
            )}
            
            <SummaryItem 
              icon="calendar-today"
              label="Due Date"
              value={`Day ${formData.dueDate}`}
            />
          </View>
        </View>
        
        {/* Your Details Card */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={22} color="#34d399" />
            <Text style={styles.cardTitle}>Your Details</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Your share of the bill</Text>
              <Text style={styles.detailValue}>
                {formData.isFixedService ? `$${userBasePortion}/mo` : "Varies monthly"}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>HouseTabz management</Text>
              <Text style={styles.detailValue}>$2.00/mo</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailTotal}>
              <Text style={styles.detailTotalLabel}>Your monthly total</Text>
              <Text style={styles.detailTotalValue}>${userTotalPortion}</Text>
            </View>
            
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <MaterialIcons name="check-circle" size={16} color="#34d399" />
                <Text style={styles.benefitText}>Auto payment reminders</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <MaterialIcons name="check-circle" size={16} color="#34d399" />
                <Text style={styles.benefitText}>Fair split between roommates</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <MaterialIcons name="check-circle" size={16} color="#34d399" />
                <Text style={styles.benefitText}>Payment tracking & history</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* One-time Payment Card (if applicable) */}
        {parseFloat(formData.requiredUpfrontPayment) > 0 && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="security" size={22} color="#34d399" />
              <Text style={styles.cardTitle}>One-time Payment</Text>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.upfrontNote}>
                This is a one-time security deposit or setup fee:
              </Text>
              <Text style={styles.upfrontAmount}>
                ${formData.requiredUpfrontPayment}
              </Text>
            </View>
          </View>
        )}
        
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
    fontFamily:'Montserrat-Black'
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

  helpTextContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 249, 255, 0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  helpText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0066cc',
  },
  serviceFeeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 248, 240, 0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe0cc',
  },
  serviceFeeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#ff6600',
  },
  totalValue: {
    fontWeight: '700',
    color: '#0f766e',
  },

  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 10,
  },
  cardContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  detailTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  detailTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f766e',
  },
  benefitsContainer: {
    marginTop: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  upfrontNote: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  upfrontAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f766e',
    textAlign: 'center',
  },
});

export default BillTakeoverScreen;