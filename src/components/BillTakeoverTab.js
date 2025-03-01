import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { StyleSheet } from "react-native";
const BillTakeoverScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    accountNumber: "",
    monthlyAmount: "",
    dueDate: "",
    requiredUpfrontPayment: "0",
    isFixedService: true, // Default to fixed service
  });

  // Add a computed variable to check if this is a variable service
  const isVariableService = !formData.isFixedService;

  // Define the base steps
  const baseSteps = [
    {
      title: "Service Details",
      description: "Tell us about the bill you want to split",
      fields: ["serviceName", "accountNumber"],
      icon: "receipt-long",
    },
    {
      title: "Payment Info",
      description: "Enter the payment details",
      fields: ["dueDate"], // We'll add monthlyAmount dynamically if it's a fixed service
      icon: "payments",
    },
    {
      title: "Additional Details",
      description: "Any upfront costs we should know about?",
      fields: ["requiredUpfrontPayment"],
      icon: "add-card",
    },
  ];

  // Get the current fields based on the service type
  const getStepFields = (step) => {
    if (step === 1 && formData.isFixedService) {
      return ["monthlyAmount", "dueDate"];
    }
    return baseSteps[step].fields;
  };

  const handleNext = () => {
    // Get the fields that should be validated for the current step
    const fieldsToValidate = getStepFields(currentStep);
    
    if (fieldsToValidate.some((field) => !formData[field])) {
      Alert.alert("Missing Information", "Please fill all required fields");
      return;
    }
    
    currentStep < baseSteps.length - 1
      ? setCurrentStep(currentStep + 1)
      : handleSubmit();
  };

  const handleSubmit = async () => {
    // Basic validation for all service types
    if (!formData.serviceName || !formData.accountNumber || !formData.dueDate) {
      return Alert.alert("Error", "Please fill all required fields");
    }

    // Additional validation for fixed services
    if (formData.isFixedService && !formData.monthlyAmount) {
      return Alert.alert("Error", "Please enter the monthly amount");
    }

    const dueDateNum = parseInt(formData.dueDate, 10);
    if (dueDateNum < 1 || dueDateNum > 31) {
      return Alert.alert("Error", "Due date must be between 1 and 31");
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        userId: user.id,
        // For variable services, don't send a monthlyAmount
        monthlyAmount: formData.isFixedService ? parseFloat(formData.monthlyAmount) : null,
        dueDate: dueDateNum,
        requiredUpfrontPayment: parseFloat(formData.requiredUpfrontPayment) || 0,
        isFixedService: formData.isFixedService,
      };

      await axios.post("http://localhost:3004/api/take-over-requests", payload);
      setSubmittedData(payload);
      setShowSuccess(true);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={baseSteps[currentStep].icon} 
            size={24} 
            color="#ffffff" 
          />
        </View>
        <Text style={styles.stepTitle}>{baseSteps[currentStep].title}</Text>
        <Text style={styles.stepDescription}>
          {baseSteps[currentStep].description}
        </Text>
      </View>
      <View style={styles.stepContent}>
        {/* Form fields specific to the current step and expense type */}
        {getStepFields(currentStep).map((field) => (
          <StepField
            key={field}
            field={field}
            value={formData[field]}
            onChange={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
          />
        ))}
        
        {/* Checkbox for fixed expense on the Service Details page */}
        {currentStep === 0 && (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => setFormData(prev => ({ ...prev, isFixedService: !prev.isFixedService }))}
            >
              <MaterialIcons 
                name={formData.isFixedService ? "check-box" : "check-box-outline-blank"} 
                size={24} 
                color="#34d399" 
              />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Is this a fixed expense?</Text>
            <MaterialIcons name="info-outline" size={18} color="#64748b" style={styles.infoIcon} />
          </View>
        )}
        
        {/* Add variable expense info on the Payment Info page */}
        {currentStep === 1 && isVariableService && (
          <View style={styles.variableInfoContainer}>
            <MaterialIcons name="info" size={22} color="#3b82f6" />
            <Text style={styles.variableInfoText}>
              For variable expenses, you'll enter the bill amount each month when it arrives.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Variable';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  if (showSuccess) {
    return (
      <View style={styles.successOverlay}>
        <View style={styles.successCard}>
          <View style={styles.successIconContainer}>
            <MaterialIcons name="check-circle" size={48} color="#ffffff" />
          </View>
          <Text style={styles.successTitle}>Bill Takeover Submitted! 🎉</Text>
          <View style={styles.detailsContainer}>
            <DetailItem 
              icon="business" 
              label="Service" 
              value={submittedData.serviceName} 
            />
            <DetailItem 
              icon="badge" 
              label="Account" 
              value={submittedData.accountNumber} 
            />
            <DetailItem 
              icon="attach-money" 
              label="Monthly" 
              value={submittedData.isFixedService ? formatCurrency(submittedData.monthlyAmount) : "Variable Amount"} 
            />
            <DetailItem 
              icon="calendar-today" 
              label="Due Date" 
              value={`Day ${submittedData.dueDate}`} 
            />
            <DetailItem 
              icon="repeat" 
              label="Type" 
              value={submittedData.isFixedService ? "Fixed Amount" : "Variable Amount"} 
            />
            {parseFloat(submittedData.requiredUpfrontPayment) > 0 && (
              <DetailItem 
                icon="security" 
                label="Upfront" 
                value={formatCurrency(submittedData.requiredUpfrontPayment)} 
              />
            )}
          </View>
          <View style={styles.reminderContainer}>
            <MaterialIcons name="notification-important" size={22} color="#34d399" />
            <Text style={styles.reminderText}>
              Remind roommates to accept their share in the app!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Info Button */}
      <TouchableOpacity style={styles.infoButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.infoButtonText}>What's Bill Takeover?</Text>
        <MaterialIcons name="keyboard-arrow-right" size={20} color="#fff" style={styles.infoButtonIcon} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How Bill Takeover Works</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.modalBullet}>
                <MaterialIcons name="cancel" size={20} color="#e53e3e" />
                <Text style={styles.modalBulletText}>
                  No single person pays the entire shared bill.
                </Text>
              </View>
              <View style={styles.redDivider} />
              <View style={styles.modalBullet}>
                <MaterialIcons name="group" size={20} color="#34d399" />
                <Text style={styles.modalBulletText}>
                  Each roommate takes ownership of their share.
                </Text>
              </View>
              <View style={styles.modalBullet}>
                <MaterialIcons name="credit-card" size={20} color="#34d399" />
                <Text style={styles.modalBulletText}>
                  HouseTabz becomes your dedicated payment method.
                </Text>
              </View>
              <View style={styles.modalBullet}>
                <MaterialIcons name="done-all" size={20} color="#34d399" />
                <Text style={styles.modalBulletText}>
                  Everyone pays HouseTabz directly—fair, simple, and secure.
                </Text>
              </View>
              <Text style={styles.modalNote}>
                HouseTabz does not take over until each person in the house takes financial responsibility.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {baseSteps.map((step, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => index < currentStep ? setCurrentStep(index) : null}
              style={styles.progressItem}
              disabled={index > currentStep}
            >
              <View style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive
              ]}>
                {index < currentStep ? (
                  <MaterialIcons name="check" size={12} color="#fff" />
                ) : (
                  <Text style={[
                    styles.stepNumber, 
                    index === currentStep && styles.activeStepNumber
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < baseSteps.length - 1 && (
                <View style={[
                  styles.progressLine,
                  index < currentStep && styles.progressLineActive
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {baseSteps.length}
        </Text>
      </View>

      {/* Form Steps (no scrolling now) */}
      <View style={styles.formContainer}>
        {renderStepContent()}
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
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
          style={[
            styles.nextButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {currentStep === baseSteps.length - 1 ? "Submit Request" : "Continue"}
              </Text>
              <MaterialIcons
                name={currentStep === baseSteps.length - 1 ? "check" : "arrow-forward"}
                size={18}
                color="#FFF"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add the DetailItem component that was in your original code
const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIconContainer}>
      <MaterialIcons name={icon} size={18} color="#34d399" />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

// Add the StepField component that was in your original code
const StepField = ({ field, value, onChange }) => {
  const fieldConfig = {
    serviceName: {
      label: "Service Provider",
      placeholder: "AT&T, Comcast, etc...",
      icon: "business",
    },
    accountNumber: {
      label: "Account Number",
      placeholder: "Enter account number",
      icon: "badge",
    },
    monthlyAmount: {
      label: "Monthly Amount",
      placeholder: "0.00",
      icon: "attach-money",
      keyboardType: "decimal-pad",
      prefix: "$",
    },
    dueDate: {
      label: "Due Date (Day of Month)",
      placeholder: "1-31",
      icon: "calendar-today",
      keyboardType: "number-pad",
      maxLength: 2,
    },
    requiredUpfrontPayment: {
      label: "Upfront Payment Needed",
      placeholder: "0.00",
      icon: "security",
      keyboardType: "decimal-pad",
      prefix: "$",
    },
  }[field];

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{fieldConfig.label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialIcons 
          name={fieldConfig.icon} 
          size={22} 
          color="#34d399" 
          style={styles.fieldIcon}
        />
        {fieldConfig.prefix && (
          <Text style={styles.inputPrefix}>{fieldConfig.prefix}</Text>
        )}
        <TextInput
          style={[
            styles.input,
            fieldConfig.prefix && styles.inputWithPrefix
          ]}
          placeholder={fieldConfig.placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChange}
          keyboardType={fieldConfig.keyboardType}
          maxLength={fieldConfig.maxLength}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  infoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34d399",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "center",
    marginVertical: 16,
  },
  infoButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 4,
  },
  infoButtonIcon: {
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#34d399",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  modalBody: {
    padding: 15,
  },
  modalBullet: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalBulletText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  redDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e53e3e",
    marginVertical: 10,
  },
  modalNote: {
    fontSize: 13,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
  progressContainer: {
    paddingVertical: 14,
    backgroundColor: "#dff6f0",
    elevation: 2,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  progressDotActive: {
    backgroundColor: "#34d399",
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 2,
  },
  progressLineActive: {
    backgroundColor: "#34d399",
  },
  stepNumber: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 12,
  },
  activeStepNumber: {
    color: "#fff",
  },
  progressText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
  },
  stepContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepHeader: {
    alignItems: "center",
    padding: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#34d399",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  stepContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  fieldIcon: {
    marginRight: 12,
  },
  inputPrefix: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
    paddingVertical: 8,
  },
  inputWithPrefix: {
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#dff6f0",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },
  backButtonText: {
    marginLeft: 6,
    color: "#64748b",
    fontWeight: "600",
    fontSize: 15,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34d399",
    padding: 14,
    borderRadius: 10,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff6f0",
    padding: 24,
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#34d399",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 18,
  },
  detailsContainer: {
    width: "100%",
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    width: "100%",
  },
  reminderText: {
    fontSize: 13,
    color: "#065f46", 
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  infoIcon: {
    marginLeft: 6,
  },
});

export default BillTakeoverScreen;
