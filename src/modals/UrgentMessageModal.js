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
import { useFonts } from 'expo-font';
import apiClient from '../config/api';

const MAX_MESSAGE_LENGTH = 150;

const UrgentMessageModal = ({ visible, message, onClose, onAction }) => {
  const navigation = useNavigation();
  const [expandedUsers, setExpandedUsers] = useState({});
  const [reminderMessages, setReminderMessages] = useState({});
  const [sendingReminders, setSendingReminders] = useState({});
  const [userCooldowns, setUserCooldowns] = useState({});
  
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  const getMetadata = () => {
    if (!message || !message.metadata) return {};
    
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
  
  // ✅ NEW: Check cooldown status for all users when modal opens
  useEffect(() => {
    if (visible && message) {
      const checkCooldowns = async () => {
        const users = getAllUsers();
        console.log('🔍 Checking cooldown status for users:', users.map(u => ({ id: u.id, name: u.name })));
        
        for (const user of users) {
          try {
            console.log(`🔍 Checking cooldown for user ${user.id} (${user.name})`);
            const response = await apiClient.get(`/api/users/${user.id}/reminder-status`);
            console.log(`🔍 Cooldown response for ${user.name}:`, response.data);
            console.log(`🔍 Cooldown response structure:`, {
              hasInCooldown: 'inCooldown' in response.data,
              hasCooldownEnds: 'cooldownEnds' in response.data,
              hasNextReminderTime: 'nextReminderTime' in response.data,
              hasLastReminderSent: 'lastReminderSent' in response.data,
              allKeys: Object.keys(response.data)
            });
            
            setUserCooldowns(prev => ({
              ...prev,
              [user.id]: {
                inCooldown: response.data.inCooldown,
                cooldownEnds: response.data.cooldownEnds,
              }
            }));
          } catch (error) {
            console.error(`❌ Error checking cooldown for user ${user.id}:`, error);
          }
        }
      };
      
      checkCooldowns();
    }
  }, [visible, message]);
  
  const handleGoToPayments = () => {
    onClose();
    setTimeout(() => {
      navigation.navigate('TabNavigator', { 
        screen: 'Pay Tab', 
        params: { screen: 'MakePaymentScreen' } 
      });
    }, 300);
  };
  
  const toggleUserExpansion = async (userId) => {
    console.log(`🔍 toggleUserExpansion called for user ${userId}`);
    console.log(`🔍 Current cooldown state for user ${userId}:`, userCooldowns[userId]);
    
    if (expandedUsers[userId]) {
      console.log(`🔍 Collapsing user ${userId}`);
      setExpandedUsers(prev => ({ ...prev, [userId]: false }));
    } else {
      console.log(`✅ Expanding user ${userId}`);
      // Always allow expansion - cooldown only affects the Send button
      setExpandedUsers(prev => ({ ...prev, [userId]: true }));
      if (!reminderMessages[userId]) {
        setReminderMessages(prev => ({ 
          ...prev, 
          [userId]: `Hey! Just a friendly reminder about your bill payment. Thanks! 😊` 
        }));
      }
    }
  };
  
  const getUserNameById = (userId) => {
    if (metadata.roommates) {
      const roommate = metadata.roommates.find(r => r.id === userId);
      if (roommate) return roommate.name;
    }
    
    if (metadata.unpaidUser && metadata.unpaidUser.id === userId) {
      return metadata.unpaidUser.name;
    }
    
    if (metadata.roommateName && metadata.roommateId === userId) {
      return metadata.roommateName;
    }
    
    return 'User';
  };

  const handleSendReminder = async (userId) => {
    const messageText = reminderMessages[userId];
    if (!messageText?.trim()) {
      console.log('❌ No message text provided');
      return;
    }
    
    console.log('🚀 Starting reminder send process...');
    console.log('📝 Raw message object:', message);
    console.log('📝 Message object stringified:', JSON.stringify(message, null, 2));
    console.log('👤 Target userId:', userId);
    console.log('💬 Message text:', messageText);
    
    // SPECIFIC DEBUGGING FOR BILL ID ISSUE
    console.log('🔍 BILL ID DEBUGGING:', {
      'message': !!message,
      'message.billId': message?.billId,
      'message.billId type': typeof message?.billId,
      'message.billId value': message?.billId,
      'message.id': message?.id,
      'message.chargeId': message?.chargeId,
      'message keys': message ? Object.keys(message) : 'no message'
    });
    
    // Verify the message structure
    console.log('🔍 Message structure analysis:', {
      'message.id': message?.id,
      'message.billId': message?.billId,
      'message.type': message?.type,
      'message.title': message?.title,
      'message.body': message?.body,
      'messageKeys': Object.keys(message || {})
    });
    
    setSendingReminders(prev => ({ ...prev, [userId]: true }));
    
    try {
      // The API requires both message and billId
      // Let's find the billId from the message object
      // NOTE: The urgent message has charge_id: 95 and billId: 27
      // We need billId: 27 for the reminder API (not charge_id: 95)
      const billId = message?.billId || 
                    message?.bill?.id ||  // ✅ NEW: Check nested bill
                    message?.bill?.billId ||  // ✅ NEW: Check nested bill
                    message?.metadata?.billId || 
                    message?.metadata?.bill_id ||
                    message?.relatedBillId ||
                    message?.targetBillId ||
                    message?.bill_id ||
                    message?.data?.billId ||
                    message?.data?.bill_id ||
                    // Check if bills array exists and get first bill ID
                    (message?.metadata?.bills && message.metadata.bills.length > 0 ? message.metadata.bills[0].billId : null) ||
                    (message?.metadata?.bills && message.metadata.bills.length > 0 ? message.metadata.bills[0].id : null) ||
                    // Check if billIds array exists and get first ID
                    (message?.metadata?.billIds && message.metadata.billIds.length > 0 ? message.metadata.billIds[0] : null) ||
                    // Check if there's a charges array with billId
                    (message?.metadata?.charges && message.metadata.charges.length > 0 ? message.metadata.charges[0].billId : null) ||
                    // Check if roommates have bill references
                    (message?.metadata?.roommates && message.metadata.roommates.length > 0 && message.metadata.roommates[0].billId) ||
                    // Check if unpaidUser has bill reference
                    (message?.metadata?.unpaidUser && message.metadata.unpaidUser.billId) ||
                    // REMOVED DANGEROUS FALLBACK: Don't use message.id as billId!
                    null;
      
      console.log('🔍 Searching for billId in message:', {
        'message.billId': message?.billId,
        'message.bill.id': message?.bill?.id,  // ✅ NEW: Check nested bill
        'message.bill.billId': message?.bill?.billId,  // ✅ NEW: Check nested bill
        'message.metadata.billId': message?.metadata?.billId,
        'message.id': message?.id,
        'message.relatedId': message?.relatedId,
        'message.data.billId': message?.data?.billId,
        'selectedBillId': billId
      });
      
      // Show which extraction method was used
      if (message?.billId) {
        console.log('✅ Found billId directly on message object:', message.billId);
      } else if (message?.metadata?.billId) {
        console.log('✅ Found billId in metadata.billId:', message.metadata.billId);
      } else if (message?.metadata?.bill_id) {
        console.log('✅ Found billId in metadata.bill_id:', message.metadata.bill_id);
      } else if (message?.id) {
        console.log('⚠️ FALLBACK: Using message.id as billId:', message.id);
        console.log('⚠️ This means the actual billId was not found in the message object');
      } else {
        console.log('❌ No billId found anywhere in the message object');
      }

      // Let's also check the metadata for bill references
      console.log('🔍 Metadata structure:', {
        'metadata.billId': metadata?.billId,
        'metadata.bill_id': metadata?.bill_id,
        'metadata.bills': metadata?.bills,
        'metadata.billIds': metadata?.billIds,
        'metadata.relatedBillId': metadata?.relatedBillId,
        'metadata.targetBillId': metadata?.targetBillId,
        'metadata keys': Object.keys(metadata || {})
      });
      
      // Deep dive into user data to find bill references
      console.log('🔍 User data in metadata:', {
        'metadata.roommates': metadata?.roommates,
        'metadata.unpaidUser': metadata?.unpaidUser,
        'metadata.totalAmount': metadata?.totalAmount,
        'metadata.totalUnpaid': metadata?.totalUnpaid
      });

      // Full metadata dump for debugging
      console.log('🔍 COMPLETE METADATA:', JSON.stringify(metadata, null, 2));
      
      // Check if we can find the correct bill ID through user/charge associations
      console.log('🔍 Checking for correct bill ID through associations:', {
        'userId': userId,
        'unpaidUser.id': metadata?.unpaidUser?.id,
        'unpaidUser.amount': metadata?.unpaidUser?.amount,
        'message.billId': message?.billId,
        'message.type': message?.type
      });
      
      // Data integrity check - help identify bill ID mismatches
      console.log('🔍 BILL ID ANALYSIS:', {
        'extractedBillId': billId,
        'billIdType': typeof billId,
        'messageBillId': message?.billId,
        'messageType': message?.type,
        'messageTitle': message?.title,
        'unpaidAmount': metadata?.unpaidUser?.amount,
        'possibleDataIssue': billId && !Number.isInteger(Number(billId)) ? 'billId might not be a valid integer' : 'billId looks valid'
      });
      
      if (!billId) {
        console.error('❌ No billId found in message object');
        console.error('🔍 Message structure for debugging:', {
          messageKeys: Object.keys(message || {}),
          metadataKeys: Object.keys(message?.metadata || {}),
          hasMetadata: !!message?.metadata,
          messageBillId: message?.billId,
          metadataBillId: message?.metadata?.billId,
          messageType: message?.type,
          messageTitle: message?.title
        });
        
        // Provide more helpful error message
        Alert.alert(
          "Cannot Send Reminder", 
          "This message doesn't contain valid bill information. The reminder feature may not be available for this type of message.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Validate that billId is a valid number
      const billIdNum = parseInt(billId);
      if (isNaN(billIdNum) || billIdNum <= 0) {
        console.error('❌ Invalid billId format:', billId);
        Alert.alert(
          "Invalid Bill Information", 
          "The bill ID is not in a valid format. Please contact support if this issue persists.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Use the validated integer billId
      const payload = {
        message: messageText.trim(),
        billId: billIdNum
      };
      
      console.log('🔍 Pre-send validation:', {
        messageValid: !!messageText.trim(),
        billIdValid: !!billIdNum,
        messageLength: messageText.trim().length,
        billIdLength: billIdNum.toString().length
      });
      
      console.log('📤 Sending API request to:', `/api/users/${userId}/send-reminder`);
      console.log('📤 Full payload:', JSON.stringify(payload, null, 2));
      console.log('📤 API CALL SUMMARY:', {
        'endpoint': `/api/users/${userId}/send-reminder`,
        'method': 'POST',
        'billId': payload.billId,
        'targetUserId': userId,
        'messageLength': payload.message?.length,
        'expectedBehavior': 'Should find bill with ID ' + payload.billId + ' in database'
      });
      console.log('📤 Payload validation:', {
        messageType: typeof payload.message,
        messageLength: payload.message?.length,
        billIdType: typeof payload.billId,
        billIdValue: payload.billId,
        userIdType: typeof userId,
        userIdValue: userId
      });
      
      const response = await apiClient.post(`/api/users/${userId}/send-reminder`, payload);
      
      console.log('✅ Reminder sent successfully:', response.data);
      
      // ✅ NEW: Refresh cooldown status from backend after sending
      try {
        const cooldownResponse = await apiClient.get(`/api/users/${userId}/reminder-status`);
        console.log(`🔍 Updated cooldown status for user ${userId}:`, cooldownResponse.data);
        setUserCooldowns(prev => ({
          ...prev,
          [userId]: {
            inCooldown: cooldownResponse.data.inCooldown,
            cooldownEnds: cooldownResponse.data.cooldownEnds,
          }
        }));
      } catch (error) {
        console.error('Error refreshing cooldown status:', error);
      }
      
      Alert.alert("✅ Sent!", `Reminder sent to ${getUserNameById(userId)}.`);
      setExpandedUsers(prev => ({ ...prev, [userId]: false }));
      
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Couldn't send reminder. Please try again.";
      Alert.alert("Error", `Failed to send reminder: ${errorMessage}`);
    } finally {
      setSendingReminders(prev => ({ ...prev, [userId]: false }));
    }
  };

  const updateReminderMessage = (userId, text) => {
    setReminderMessages(prev => ({ ...prev, [userId]: text }));
  };

  const getAllUsers = () => {
    const users = [];
    
    if (metadata.roommates) {
      metadata.roommates.forEach(roommate => {
        users.push({
          id: roommate.id,
          name: roommate.name,
          amount: roommate.amount
        });
      });
    }
    
    if (metadata.unpaidUser) {
      users.push({
        id: metadata.unpaidUser.id,
        name: metadata.unpaidUser.name,
        amount: metadata.unpaidUser.amount
      });
    }
    
    if (metadata.roommateName && metadata.roommateId) {
      users.push({
        id: metadata.roommateId,
        name: metadata.roommateName,
        amount: metadata.totalAmount
      });
    }
    
    return users;
  };

  const getMessageTitle = () => {
    if (message?.title) return message.title;
    
    const userCount = getAllUsers().length;
    if (userCount > 1) {
      return `${userCount} people need to pay`;
    } else if (userCount === 1) {
      return `${getAllUsers()[0].name} needs to pay`;
    }
    
    return 'Payment needed';
  };

  const getTotalAmount = () => {
    if (metadata.totalAmount) return metadata.totalAmount;
    if (metadata.totalUnpaid) return metadata.totalUnpaid;
    
    return getAllUsers().reduce((sum, user) => sum + parseFloat(user.amount || 0), 0);
  };

  const renderUserCard = (user) => {
    const cooldownInfo = userCooldowns[user.id];
    const inCooldown = cooldownInfo?.inCooldown || false;
    
    console.log(`🎨 Rendering user card for ${user.name} (${user.id}):`, {
      cooldownInfo,
      inCooldown,
      hasExpandedState: expandedUsers[user.id],
      sendButtonDisabled: inCooldown,
      cooldownEnds: cooldownInfo?.cooldownEnds
    });
    
    return (
      <View key={user.id} style={styles.userCard}>
        <TouchableOpacity
          style={styles.userHeader}
          onPress={() => toggleUserExpansion(user.id)}
          activeOpacity={0.8}
        >
          <View style={styles.userInfo}>
            <View style={styles.userIcon}>
              <MaterialIcons name="person" size={18} color="#64748b" />
            </View>
            <View style={styles.userTextInfo}>
              <Text style={[styles.userName, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                {user.name}
              </Text>
              <Text style={[styles.userStatus, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                {inCooldown ? "Reminder sent today" : "Unpaid"}
              </Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={[styles.userAmount, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                ${parseFloat(user.amount).toFixed(2)}
              </Text>
            </View>
          </View>
          <MaterialIcons 
            name={expandedUsers[user.id] ? "expand-less" : "expand-more"} 
            size={20} 
            color="#64748b" 
          />
        </TouchableOpacity>
        
        {expandedUsers[user.id] && (
          <View style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <MaterialIcons name="edit" size={16} color="#34d399" />
              <Text style={[styles.reminderLabel, fontsLoaded && { fontFamily: 'Poppins-Medium' }]}>
                Message to {user.name}
              </Text>
            </View>
                    <TextInput
              style={[styles.reminderInput, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}
                    multiline
                    maxLength={MAX_MESSAGE_LENGTH}
              value={reminderMessages[user.id] || ''}
              onChangeText={(text) => updateReminderMessage(user.id, text)}
              placeholder="Write your message..."
              placeholderTextColor="#9ca3af"
                    />
            <View style={styles.reminderFooter}>
              <Text style={[styles.characterCount, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                {(reminderMessages[user.id] || '').length}/{MAX_MESSAGE_LENGTH}
                    </Text>
                    <TouchableOpacity 
                      style={[
                        styles.sendButton,
                        (!reminderMessages[user.id]?.trim() || sendingReminders[user.id] || inCooldown) && styles.sendButtonDisabled
                      ]}
                  onPress={() => handleSendReminder(user.id)}
                  disabled={!reminderMessages[user.id]?.trim() || sendingReminders[user.id] || inCooldown}
                  activeOpacity={0.8}
                    >
                  {sendingReminders[user.id] ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : inCooldown ? (
                    <>
                      <MaterialIcons name="schedule" size={14} color="#ffffff" />
                      <Text style={[styles.sendButtonText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                        Sent Today
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="send" size={14} color="#ffffff" />
                      <Text style={[styles.sendButtonText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                        Send
                      </Text>
                    </>
                  )}
                    </TouchableOpacity>
                  </View>
                </View>
        )}
      </View>
    );
  };
  
  if (!message) {
    return (
      <ModalComponent
        visible={visible}
        title="Loading..."
        onClose={onClose}
        backgroundColor="#dff6f0"
        fullScreen={false}
        hideCloseButton={false}
        useBackArrow={true}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      </ModalComponent>
    );
  }
  
  const users = getAllUsers();
  const totalAmount = getTotalAmount();
  
  return (
    <ModalComponent
      visible={visible}
      title={getMessageTitle()}
      onClose={onClose}
      backgroundColor="#dff6f0"
      fullScreen={false}
      hideCloseButton={false}
      useBackArrow={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
    >
      <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          {/* Subtle amount display */}
          <View style={styles.amountRow}>
            <MaterialIcons name="account-balance-wallet" size={18} color="#34d399" />
            <Text style={[styles.amountLabel, fontsLoaded && { fontFamily: 'Poppins-Medium' }]}>
              Total needed:
            </Text>
            <Text style={[styles.amountValue, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
              ${totalAmount.toFixed(2)}
            </Text>
          </View>

          {/* User cards */}
          <View style={styles.usersSection}>
            {users.map(user => renderUserCard(user))}
          </View>

          {/* Pay button for current user */}
          {(message.type === 'user_multi_funding' || message.type === 'charge_funding') && (
            <TouchableOpacity style={styles.payButton} onPress={handleGoToPayments} activeOpacity={0.8}>
              <MaterialIcons name="payment" size={18} color="#ffffff" />
              <Text style={[styles.payButtonText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                Pay Your Bills
              </Text>
            </TouchableOpacity>
          )}
      </ScrollView>
      </KeyboardAvoidingView>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  scrollContent: {
    padding: 20,
  },
  
  // Amount row
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
    marginRight: 4,
  },
  amountValue: {
    fontSize: 16,
    color: '#34d399',
    fontWeight: '700',
  },
  
  // Users section
  usersSection: {
    marginBottom: 20,
  },
  
  // User card
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    color: '#64748b',
  },
  amountContainer: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  userAmount: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '700',
  },
  
  // Reminder section
  reminderSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderLabel: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 6,
  },
  reminderInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 11,
    color: '#9ca3af',
  },
  sendButton: {
    backgroundColor: '#34d399',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 13,
    marginLeft: 4,
  },
  
  // Pay button
  payButton: {
    backgroundColor: '#34d399',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});

export default UrgentMessageModal;