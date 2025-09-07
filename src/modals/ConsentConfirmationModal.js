import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ConsentConfirmationModal = ({ 
  visible, 
  onClose, 
  taskData, 
  paymentIntentId,
  message 
}) => {
  const amount = taskData?.paymentAmount || taskData?.amount || 0;
  const serviceName = taskData?.serviceRequestBundle?.stagedRequest?.serviceName || 
                     taskData?.serviceRequestBundle?.takeOverRequest?.serviceName ||
                     'Service';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
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

            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.successIcon}>
                <MaterialIcons name="check" size={40} color="white" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Payment Consent Given</Text>

            {/* Message */}
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>
                {message || `You've agreed to pay $${amount.toFixed(2)} for ${serviceName} when all roommates accept.`}
              </Text>
            </View>

            {/* Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <MaterialIcons name="monetization-on" size={20} color="#3b82f6" />
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>${amount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialIcons name="schedule" size={20} color="#3b82f6" />
                <Text style={styles.detailLabel}>When charged:</Text>
                <Text style={styles.detailValue}>When everyone accepts</Text>
              </View>

              {paymentIntentId && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="receipt" size={20} color="#3b82f6" />
                  <Text style={styles.detailLabel}>Reference:</Text>
                  <Text style={styles.detailValue}>{paymentIntentId.slice(-8)}</Text>
                </View>
              )}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialIcons name="info" size={20} color="#3b82f6" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                No money has been taken yet. You'll be charged simultaneously with all roommates when everyone accepts.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={onClose}
              >
                <Text style={styles.primaryButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
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
  safeArea: {
    backgroundColor: '#f0f9ff',
  },
  modalContainer: {
    backgroundColor: '#f0f9ff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    minHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 16,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  messageCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  messageText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Medium',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    paddingHorizontal: 0,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

export default ConsentConfirmationModal;