// src/modals/PaymentFlow.js
import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Import screen components
import PaymentAuthScreen from "./payment/PaymentAuthScreen";
import RequestConfirmationScreen from "./payment/RequestConfirmationScreen"; // Renamed
import PaymentSuccessScreen from "./payment/PaymentSuccessScreen";

const { width, height } = Dimensions.get('window');

const PaymentFlow = ({ visible, onClose, paymentData, onSuccess, onError }) => {
  const [step, setStep] = useState('auth'); // Always start with auth
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState(null);

  // Reset step when modal closes
  useEffect(() => {
    if (!visible) {
      setStep('auth');
      setRequestData(null);
    }
  }, [visible]);

  // Handle transitions with loading state
  const goToStep = (nextStep) => {
    setLoading(true);
    setTimeout(() => {
      setStep(nextStep);
      setLoading(false);
    }, 300);
  };

  // Event handlers
  const handleAuthSuccess = () => {
    goToStep('confirm');
  };

  const handleConfirmSuccess = (data) => {
    setRequestData(data);
    goToStep('success');
  };

  const handleDone = () => {
    if (onSuccess) onSuccess(requestData);
    onClose();
  };

  // Don't render anything if not visible
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View style={styles.contentArea}>
            {loading ? (
              <View style={styles.loadingView}>
                <ActivityIndicator size="large" color="#34d399" />
              </View>
            ) : (
              <>
                {step === 'auth' && (
                  <PaymentAuthScreen 
                    onSuccess={handleAuthSuccess}
                    onCancel={onClose}
                    onError={onError}
                  />
                )}
                
                {step === 'confirm' && (
                  <RequestConfirmationScreen
                    paymentData={paymentData}
                    onSuccess={handleConfirmSuccess}
                    onCancel={onClose}
                    onError={onError}
                  />
                )}
                
                {step === 'success' && (
                  <PaymentSuccessScreen
                    paymentData={paymentData}
                    onDone={handleDone}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.9,
    width: width,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
  },
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentFlow;