import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BillTakeoverScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    accountNumber: "",
    monthlyAmount: "",
    dueDate: "",
    requiredUpfrontPayment: "0",
  });

  const steps = [
    {
      title: "Service Details",
      description: "Tell us about the bill you want to split",
      fields: ["serviceName", "accountNumber"],
      icon: "receipt-long",
    },
    {
      title: "Payment Info",
      description: "Enter the payment details",
      fields: ["monthlyAmount", "dueDate"],
      icon: "payments",
    },
    {
      title: "Additional Details",
      description: "Any upfront costs we should know about?",
      fields: ["requiredUpfrontPayment"],
      icon: "add-card",
    },
  ];

  const handleNext = () => {
    const currentFields = steps[currentStep].fields;
    if (currentFields.some((field) => !formData[field])) {
      Alert.alert("Missing Information", "Please fill all fields before continuing");
      return;
    }
    currentStep < steps.length - 1 
      ? setCurrentStep(currentStep + 1)
      : handleSubmit();
  };

  const handleSubmit = async () => {
    if (!formData.serviceName || !formData.accountNumber || 
        !formData.monthlyAmount || !formData.dueDate) {
      return Alert.alert("Error", "Please fill all required fields");
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
        monthlyAmount: parseFloat(formData.monthlyAmount),
        dueDate: dueDateNum,
        requiredUpfrontPayment: parseFloat(formData.requiredUpfrontPayment) || 0,
      };

      await axios.post("http://localhost:3004/api/take-over-requests", payload);
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
        <MaterialIcons 
          name={steps[currentStep].icon} 
          size={32} 
          color="#22c55e" 
        />
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
        <Text style={styles.stepDescription}>
          {steps[currentStep].description}
        </Text>
      </View>

      <View style={styles.stepContent}>
        {steps[currentStep].fields.map((field) => (
          <StepField
            key={field}
            field={field}
            value={formData[field]}
            onChange={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
          />
        ))}
      </View>
    </View>
  );

  if (showSuccess) {
    return (
      <View style={styles.successOverlay}>
        <View style={styles.successCard}>
          <MaterialIcons name="check-circle" size={48} color="#22c55e" />
          <Text style={styles.successTitle}>All Set! 🎉</Text>
          <Text style={styles.successText}>
            Bill takeover initiated. Remind your roommates to accept 
            the request through their app notifications.
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => setShowSuccess(false)}
          >
            <Text style={styles.successButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {steps.map((_, index) => (
          <View key={index} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive
            ]} />
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < currentStep && styles.progressLineActive
              ]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(prev => prev - 1)}
          >
            <MaterialIcons name="arrow-back" size={24} color="#64748b" />
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
                {currentStep === steps.length - 1 ? "Submit" : "Continue"}
              </Text>
              <MaterialIcons
                name={currentStep === steps.length - 1 ? "check" : "arrow-forward"}
                size={22}
                color="#FFF"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    },
  }[field];

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{fieldConfig.label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialIcons 
          name={fieldConfig.icon} 
          size={22} 
          color="#64748b" 
          style={styles.fieldIcon}
        />
        <TextInput
          style={styles.input}
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
  progressBar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "white",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#cbd5e1",
  },
  progressDotActive: {
    backgroundColor: "#22c55e",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: "#22c55e",
    borderRadius: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginVertical: 12,
  },
  stepDescription: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  fieldIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    marginRight: 12,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
  },
  successCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginVertical: 16,
  },
  successText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BillTakeoverScreen;