// src/modals/UrgentMessageModal.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ModalComponent from '../components/ModalComponent';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../config/api';

const MAX_MESSAGE_LENGTH = 150; // Character limit for reminder messages

const UrgentMessageModal = ({ visible, message, onClose, onAction }) => {
  const navigation = useNavigation();
  const [showReminderInput, setShowReminderInput] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderUserId, setReminderUserId] = useState(null);
  const [reminderCooldowns, setReminderCooldowns] = useState({}); // Tracks cooldown status by user ID
  const [isCheckingCooldown, setIsCheckingCooldown] = useState(false); // Loading state
  
  if (!message) return null;
  
  const getMetadata = () => {
    if (!message.metadata) return {};
    
    if (typeof message.metadata === 'string') {
      try {
        return JSON.parse(message.metadata);
      } catch (e) {
        return {};
      }
    }
    
    return message.metadata;
  };
  
  const metadata = getMetadata();
  
  // Function to navigate to payment screen
  const handleGoToPayments = () => {
    // First close the modal
    onClose();
    
    // Then navigate to the payment screen
    setTimeout(() => {
      navigation.navigate('TabNavigator', { 
        screen: 'Pay Tab', 
        params: { screen: 'MakePaymentScreen' } 
      });
    }, 300);
  };
  
  // Function to check cooldown status before showing reminder input
  const handleReminderRequest = async (userId) => {
    setIsCheckingCooldown(true);
    
    try {
      // Check if this user has been reminded recently
      const canSendReminder = await checkReminderCooldown(userId);
      
      if (canSendReminder) {
        // Can send reminder - show the input screen
        setReminderUserId(userId);
        setReminderMessage(`Hey, don't forget to pay your share of the bill!`); // Default message
        setShowReminderInput(true);
      } else {
        // In cooldown period - show alert
        const userName = getUserNameById(userId, metadata);
        Alert.alert(
          "Reminder Limit Reached",
          `You can only send one reminder to ${userName || 'this user'} per day. Please try again later.`,
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }
    } catch (error) {
      console.error("Error checking reminder cooldown:", error);
      Alert.alert(
        "Error",
        "Couldn't check reminder status. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsCheckingCooldown(false);
    }
  };
  
  // Helper function to get username by ID from metadata
  const getUserNameById = (userId, metadata) => {
    if (metadata && metadata.roommates) {
      const roommate = metadata.roommates.find(r => r.id === userId);
      if (roommate) return roommate.name;
    }
    
    if (metadata && metadata.unpaidUser && metadata.unpaidUser.id === userId) {
      return metadata.unpaidUser.name;
    }
    
    if (metadata && metadata.roommateName && metadata.roommateId === userId) {
      return metadata.roommateName;
    }
    
    return null; // Not found
  };
  
  // Function to check if user is in cooldown period
  const checkReminderCooldown = async (userId) => {
    try {
      // Call API to check cooldown status
      const response = await apiClient.get(`/api/users/${userId}/reminder-status`);
      
      // Update local cooldown state
      const cooldownData = { ...reminderCooldowns };
      cooldownData[userId] = response.data.inCooldown;
      setReminderCooldowns(cooldownData);
      
      return !response.data.inCooldown; // Return true if NOT in cooldown
    } catch (error) {
      console.error("Error checking cooldown:", error);
      // Default to allowing reminder if API fails
      return true;
    }
  };
  
  // Function to actually send the reminder
  const handleSendReminder = async () => {
    if (!reminderUserId || !reminderMessage.trim()) return;
    
    try {
      // Call API to send the push notification
      await apiClient.post(`/api/users/${reminderUserId}/send-reminder`, {
        message: reminderMessage,
        billId: message.billId // Include the bill ID for context
      });
      
      // Update the local cooldown state
      const cooldownData = { ...reminderCooldowns };
      cooldownData[reminderUserId] = true;
      setReminderCooldowns(cooldownData);
      
      // Show success message
      Alert.alert(
        "Reminder Sent",
        "Your reminder has been sent successfully.",
        [{ text: "OK" }]
      );
      
      // Close modals
      setShowReminderInput(false);
      onClose();
      
    } catch (error) {
      console.error("Error sending reminder:", error);
      Alert.alert(
        "Error",
        "Couldn't send reminder. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  // Function to cancel reminder
  const handleCancelReminder = () => {
    setShowReminderInput(false);
    setReminderMessage('');
    setReminderUserId(null);
  };
  
  // If showing the reminder input screen
  if (showReminderInput) {
    return (
      <ModalComponent
        visible={visible}
        title="Send Reminder"
        onClose={handleCancelReminder}
        backgroundColor="#dff6f0"
        fullScreen={false}
        hideCloseButton={false}
        useBackArrow={true}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.reminderContainer}>
              <Text style={styles.reminderInstructions}>
                Send a reminder message to your roommate about their unpaid bill.
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.reminderInput}
                  multiline
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={reminderMessage}
                  onChangeText={setReminderMessage}
                  placeholder="Enter your reminder message..."
                  placeholderTextColor="#64748b"
                />
                <Text style={styles.characterCount}>
                  {reminderMessage.length}/{MAX_MESSAGE_LENGTH}
                </Text>
              </View>
              
              <View style={styles.reminderButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancelReminder}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    !reminderMessage.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendReminder}
                  disabled={!reminderMessage.trim()}
                >
                  <Text style={styles.sendButtonText}>Send Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ModalComponent>
    );
  }
  
  // Display loading indicator while checking cooldown
  if (isCheckingCooldown) {
    return (
      <ModalComponent
        visible={visible}
        title="Checking Reminder Status"
        onClose={onClose}
        backgroundColor="#dff6f0"
        fullScreen={false}
        hideCloseButton={false}
        useBackArrow={true}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={styles.loadingText}>Checking reminder status...</Text>
        </View>
      </ModalComponent>
    );
  }
  
  // Render a roommate item with reminder button
  const renderRoommateWithReminderButton = (roommate) => (
    <View key={roommate.id} style={styles.roommateItem}>
      <Text style={styles.roommateName}>{roommate.name}</Text>
      <Text style={styles.roommateAmount}>${parseFloat(roommate.amount).toFixed(2)}</Text>
      <TouchableOpacity 
        style={[
          styles.miniReminderButton,
          reminderCooldowns[roommate.id] && styles.miniReminderButtonDisabled
        ]}
        onPress={() => handleReminderRequest(roommate.id)}
        disabled={reminderCooldowns[roommate.id]}
      >
        <MaterialIcons 
          name={reminderCooldowns[roommate.id] ? "notifications-off" : "notifications"} 
          size={16} 
          color="#ffffff" 
        />
      </TouchableOpacity>
    </View>
  );
  
  // Regular content based on message type
  const renderContent = () => {
    switch(message.type) {
      case 'user_multi_funding':
        return (
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>Your Unpaid Services</Text>
            {metadata.bills?.map((bill, index) => (
              <View key={index} style={styles.billItem}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billAmount}>${parseFloat(bill.amount).toFixed(2)}</Text>
                <Text style={styles.billDate}>Due: {new Date(bill.dueDate).toLocaleDateString()}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due:</Text>
              <Text style={styles.totalAmount}>${parseFloat(metadata.totalAmount).toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleGoToPayments}
            >
              <Text style={styles.actionButtonText}>Go To Payments</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'roommate_multi_funding':
        return (
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{metadata.roommateName}'s Unpaid Services</Text>
            {metadata.bills?.map((bill, index) => (
              <View key={index} style={styles.billItem}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billAmount}>${parseFloat(bill.amount).toFixed(2)}</Text>
                {bill.dueDate && <Text style={styles.billDate}>Due: {new Date(bill.dueDate).toLocaleDateString()}</Text>}
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due:</Text>
              <Text style={styles.totalAmount}>${parseFloat(metadata.totalAmount).toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.reminderButton}
              onPress={() => handleReminderRequest(metadata.roommateId)}
            >
              <Text style={styles.reminderButtonText}>Send Reminder</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'house_multi_roommate_funding':
        return (
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>Multiple Roommates Missing Funding</Text>
            <Text style={styles.detailSubtitle}>Roommates with unpaid bills:</Text>
            {metadata.roommates?.map(roommate => renderRoommateWithReminderButton(roommate))}
            <View style={styles.divider} />
            <Text style={styles.detailSubtitle}>Affected services:</Text>
            {metadata.bills?.map((bill, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceName}>{bill.name}</Text>
                <Text style={styles.serviceUsers}>{bill.unpaidCount} roommate(s)</Text>
              </View>
            ))}
          </View>
        );
        
      case 'bill_multi_funding':
        return (
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{metadata.billName} Service Status</Text>
            <Text style={styles.detailSubtitle}>Roommates missing funding:</Text>
            {metadata.roommates?.map(roommate => renderRoommateWithReminderButton(roommate))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Missing:</Text>
              <Text style={styles.totalAmount}>${parseFloat(metadata.totalUnpaid).toFixed(2)}</Text>
            </View>
          </View>
        );
        
      case 'charge_funding':
        return (
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{metadata.billName} Payment Due</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.largeAmount}>${parseFloat(metadata.amount).toFixed(2)}</Text>
              {metadata.dueDate && <Text style={styles.dueDateText}>Due: {new Date(metadata.dueDate).toLocaleDateString()}</Text>}
            </View>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleGoToPayments}
            >
              <Text style={styles.actionButtonText}>Go To Payments</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'single_funding':
        return (
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{metadata.billName} Service</Text>
            <Text style={styles.detailBody}>
              {metadata.unpaidUser?.name} hasn't paid their share of ${parseFloat(metadata.unpaidUser?.amount).toFixed(2)}.
            </Text>
            {metadata.dueDate && <Text style={styles.dueDateText}>Due: {new Date(metadata.dueDate).toLocaleDateString()}</Text>}
            <TouchableOpacity 
              style={styles.reminderButton}
              onPress={() => handleReminderRequest(metadata.unpaidUser?.id)}
            >
              <Text style={styles.reminderButtonText}>Send Reminder</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return (
          <View style={styles.detailContent}>
            <Text style={styles.detailBody}>{message.body}</Text>
            {message.type.includes('funding') && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleGoToPayments}
              >
                <Text style={styles.actionButtonText}>Go To Payments</Text>
              </TouchableOpacity>
            )}
          </View>
        );
    }
  };
  
  return (
    <ModalComponent
      visible={visible}
      title={message.title}
      onClose={onClose}
      backgroundColor="#dff6f0"
      fullScreen={false}
      hideCloseButton={false}
      useBackArrow={true}
    >
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  content: { 
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  contentContainer: { 
    padding: 16,
    paddingBottom: 32,
  },
  detailContent: {
    marginBottom: 16,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  detailSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detailBody: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  billItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginVertical: 4,
  },
  billDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#34d399',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  reminderButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  reminderButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  miniReminderButton: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  miniReminderButtonDisabled: {
    backgroundColor: '#94a3b8', // Grayed out when in cooldown
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    width: '100%',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
    width: '100%',
  },
  roommateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    width: '100%',
  },
  roommateName: {
    flex: 2,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  roommateBills: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  roommateAmount: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    width: '100%',
  },
  serviceName: {
    flex: 3,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  serviceUsers: {
    flex: 2,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
  },
  amountContainer: {
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  largeAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Montserrat-Black',
    fontVariant: ['tabular-nums'],
  },
  dueDateText: {
    fontSize: 14,
    color: '#64748b',
    marginVertical: 8,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#1e293b',
    marginTop: 16,
  },
  
  // Keyboard avoiding view
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Reminder input styles
  reminderContainer: {
    flex: 1,
    paddingTop: 16,
  },
  reminderInstructions: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reminderInput: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 8,
  },
  reminderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93c5fd', // Lighter blue when disabled
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UrgentMessageModal;