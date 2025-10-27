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
    const messageType = message?.type;
    
    // ✅ Extract users based on message type and metadata structure
    
    // For bill_multi_funding and house_multi_roommate_funding: use metadata.roommates array
    if ((messageType === 'bill_multi_funding' || messageType === 'house_multi_roommate_funding') && metadata.roommates) {
      metadata.roommates.forEach(roommate => {
        users.push({
          id: roommate.id,
          name: roommate.name || roommate.username,
          amount: roommate.amount || 0,
          billCount: roommate.billCount || null
        });
      });
    }
    
    // For single_funding and roommate_multi_funding: use metadata.unpaidUser object
    if ((messageType === 'single_funding' || messageType === 'roommate_multi_funding') && metadata.unpaidUser) {
      users.push({
        id: metadata.unpaidUser.id,
        name: metadata.unpaidUser.name || metadata.unpaidUser.username,
        amount: metadata.unpaidUser.amount || metadata.totalAmount || 0,
        billCount: metadata.unpaidUser.billCount || null
      });
    }
    
    // ✅ FALLBACK: Old metadata formats for backward compatibility
    if (users.length === 0 && metadata.roommateName && metadata.roommateId) {
      users.push({
        id: metadata.roommateId,
        name: metadata.roommateName,
        amount: metadata.totalAmount || 0
      });
    }
    
    console.log('👥 Extracted users for', messageType, ':', users);
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
    // ✅ NEW: Use totalAmount from enhanced metadata (backend calculates this)
    if (metadata.totalAmount !== undefined && metadata.totalAmount !== null) {
      console.log('✅ Using metadata.totalAmount:', metadata.totalAmount);
      return parseFloat(metadata.totalAmount);
    }
    
    // ✅ Check message.bill.amount (handle new fee structure)
    if (message?.bill) {
      const billAmount = message.bill.useNewFeeStructure 
        ? (message.bill.baseAmount || message.bill.amount) 
        : message.bill.amount;
      if (billAmount) {
        console.log('✅ Using message.bill amount:', billAmount);
        return parseFloat(billAmount);
      }
    }
    
    // ✅ Check message.charge.amount (handle new fee structure)
    if (message?.charge) {
      const chargeAmount = message.charge.useNewFeeStructure 
        ? (message.charge.baseAmount || message.charge.amount) 
        : message.charge.amount;
      if (chargeAmount) {
        console.log('✅ Using message.charge amount:', chargeAmount);
        return parseFloat(chargeAmount);
      }
    }
    
    // Fallback to old metadata fields
    if (metadata.totalUnpaid) return parseFloat(metadata.totalUnpaid);
    
    // Last resort: sum user amounts
    const sum = getAllUsers().reduce((sum, user) => sum + parseFloat(user.amount || 0), 0);
    console.log('⚠️ Calculating total from user amounts:', sum);
    return sum;
  };

  // ============================================
  // COMPONENT: User Multi Funding (Type 1)
  // ============================================
  const renderUserMultiFunding = (bills) => {
    return (
      <View style={styles.userPaymentContainer}>
        <Text style={[styles.paymentSectionTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
          Your Unpaid Services
        </Text>
        <View style={styles.paymentCardsGrid}>
          {bills.map((bill, index) => (
            <View key={index} style={styles.paymentCard}>
              <View style={styles.paymentCardLeft}>
                <View style={styles.paymentIconCircle}>
                  <MaterialIcons name="receipt-long" size={20} color="#34d399" />
                </View>
                <View>
                  <Text style={[styles.paymentServiceName, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                    {bill.name || `Service ${index + 1}`}
                  </Text>
                  {bill.dueDate && (
                    <Text style={[styles.paymentDueDate, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                      Due {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={[styles.paymentAmount, fontsLoaded && { fontFamily: 'Poppins-ExtraBold' }]}>
                ${parseFloat(bill.useNewFeeStructure ? (bill.baseAmount || bill.amount || 0) : (bill.amount || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ============================================
  // COMPONENT: Charge Funding (Type 2)
  // ============================================
  const renderChargeFunding = (metadata, totalAmount) => {
    return (
      <View style={styles.userPaymentContainer}>
        <Text style={[styles.paymentSectionTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
          Unpaid Service
        </Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentCardLeft}>
            <View style={styles.paymentIconCircle}>
              <MaterialIcons name="receipt-long" size={20} color="#34d399" />
            </View>
            <View>
              <Text style={[styles.paymentServiceName, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                {metadata?.billName || 'Service Payment'}
              </Text>
              {metadata?.dueDate && (
                <Text style={[styles.paymentDueDate, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                  Due {new Date(metadata.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              )}
            </View>
          </View>
          <Text style={[styles.paymentAmount, fontsLoaded && { fontFamily: 'Poppins-ExtraBold' }]}>
            ${parseFloat(metadata?.amount || totalAmount || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  // ============================================
  // COMPONENT: Roommate Message Card
  // ============================================
  const renderUserCard = (user) => {
    const cooldownInfo = userCooldowns[user.id];
    const inCooldown = cooldownInfo?.inCooldown || false;
    
    console.log(`🎨 Rendering user card for ${user.name} (${user.id}):`, {
      cooldownInfo,
      inCooldown,
      sendButtonDisabled: inCooldown,
      cooldownEnds: cooldownInfo?.cooldownEnds
    });
    
    return (
      <View key={user.id} style={styles.messageThread}>
        {/* Chat-style header */}
        <View style={styles.threadHeader}>
          <View style={styles.avatarCircle}>
            <Text style={[styles.avatarLetter, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
              {user.name?.charAt(0).toUpperCase()}
            </Text>
            </View>
          <View style={styles.threadInfo}>
            <Text style={[styles.threadName, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                {user.name}
              </Text>
            <Text style={[styles.threadSubtext, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
              {user.billCount 
                ? `${user.billCount} ${user.billCount === 1 ? 'service' : 'services'} • `
                : ""
              }
              ${parseFloat(user.amount).toFixed(2)} owed
              </Text>
            </View>
          {inCooldown && (
            <View style={styles.sentBadge}>
              <MaterialIcons name="check" size={14} color="#10b981" />
              <Text style={[styles.sentBadgeText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                Sent
              </Text>
            </View>
          )}
          </View>

        {/* Message input area */}
        <View style={styles.messageComposer}>
          <View style={styles.inputWrapper}>
                    <TextInput
              style={[styles.messageInput, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}
                    multiline
                    maxLength={MAX_MESSAGE_LENGTH}
              value={reminderMessages[user.id] || ''}
              onChangeText={(text) => updateReminderMessage(user.id, text)}
              placeholder={`Message ${user.name}...`}
              placeholderTextColor="#94a3b8"
              editable={!inCooldown}
                    />
            <Text style={[styles.charCounter, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
              {(reminderMessages[user.id] || '').length}
                    </Text>
          </View>
                    <TouchableOpacity 
                      style={[
              styles.sendIconButton,
              (!reminderMessages[user.id]?.trim() || sendingReminders[user.id] || inCooldown) && styles.sendIconButtonDisabled
                      ]}
                  onPress={() => handleSendReminder(user.id)}
                  disabled={!reminderMessages[user.id]?.trim() || sendingReminders[user.id] || inCooldown}
            activeOpacity={0.7}
                    >
                  {sendingReminders[user.id] ? (
                    <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <MaterialIcons 
                name="send" 
                size={22} 
                color="#ffffff" 
              />
                  )}
                    </TouchableOpacity>
                  </View>
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
  
  // ✅ Determine message type and what data to show
  const messageType = message?.type;
  
  // User-focused: user_multi_funding, charge_funding
  const isUserFocusedMessage = messageType === 'user_multi_funding' || messageType === 'charge_funding';
  
  // Roommate-focused: single_funding, bill_multi_funding, roommate_multi_funding, house_multi_roommate_funding
  const isRoommateFocusedMessage = [
    'single_funding',
    'bill_multi_funding', 
    'roommate_multi_funding',
    'house_multi_roommate_funding'
  ].includes(messageType);
  
  const users = isRoommateFocusedMessage ? getAllUsers() : [];
  const totalAmount = getTotalAmount();
  const bills = metadata?.bills || [];
  
  // ✅ DEBUG: Log modal data structure
  console.log('🔍 URGENT MESSAGE MODAL RENDER:', {
    'messageType': messageType,
    'isUserFocusedMessage': isUserFocusedMessage,
    'isRoommateFocusedMessage': isRoommateFocusedMessage,
    'metadata': metadata,
    'metadataTotalAmount': metadata?.totalAmount,
    'billsCount': bills.length,
    'bills': bills,
    'usersCount': users.length,
    'calculatedTotalAmount': totalAmount
  });
  
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

          {/* Content Section - Different for each message type */}
          <View style={styles.contentSection}>
            {messageType === 'user_multi_funding' && bills.length > 0 && renderUserMultiFunding(bills)}
            
            {messageType === 'charge_funding' && renderChargeFunding(metadata, totalAmount)}
            
            {messageType === 'single_funding' && (
              /* ✅ TYPE 3: One roommate owes on one service */
              <View>
                <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                  Send Reminder
                </Text>
          <View style={styles.usersSection}>
                  {users.length > 0 ? (
                    users.map(user => renderUserCard(user))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={[styles.emptyStateText, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                        {message?.body || 'No roommate information available'}
                      </Text>
          </View>
                  )}
                </View>
                {metadata?.billName && (
                  <View>
                    <Text style={[styles.affectedServicesLabel, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                      Affected Service
                    </Text>
                    <View style={styles.servicesChipRow}>
                      <View style={styles.serviceChip}>
                        <Text style={[styles.serviceChipText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                          {metadata.billName}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {messageType === 'bill_multi_funding' && (
              /* ✅ TYPE 4: Multiple roommates owe on same bill */
              <View>
                <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                  Send Reminders
                </Text>
                <View style={styles.usersSection}>
                  {users.length > 0 ? (
                    users.map(user => renderUserCard(user))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={[styles.emptyStateText, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                        {message?.body || 'No roommate information available'}
                      </Text>
                    </View>
                  )}
                </View>
                {metadata?.billName && (
                  <View>
                    <Text style={[styles.affectedServicesLabel, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                      Affected Service
                    </Text>
                    <View style={styles.servicesChipRow}>
                      <View style={styles.serviceChip}>
                        <Text style={[styles.serviceChipText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                          {metadata.billName}
                        </Text>
                        {users.length > 0 && (
                          <View style={styles.chipCountDot}>
                            <Text style={[styles.chipCountText, fontsLoaded && { fontFamily: 'Poppins-ExtraBold' }]}>
                              {users.length}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {messageType === 'roommate_multi_funding' && (
              /* ✅ TYPE 5: One roommate owes on multiple services */
              <View>
                <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                  Send Reminder
                </Text>
                <View style={styles.usersSection}>
                  {users.length > 0 ? (
                    users.map(user => renderUserCard(user))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={[styles.emptyStateText, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                        {message?.body || 'No roommate information available'}
                      </Text>
                    </View>
                  )}
                </View>
                {bills.length > 0 && (
                  <View>
                    <Text style={[styles.affectedServicesLabel, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                      Affected Services
                    </Text>
                    <View style={styles.servicesChipRow}>
                      {bills.map((bill, index) => (
                        <View key={index} style={styles.serviceChip}>
                          <Text style={[styles.serviceChipText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                            {bill.name || `Service ${index + 1}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {messageType === 'house_multi_roommate_funding' && (
              /* ✅ TYPE 6: Multiple roommates owe on multiple services */
              <View>
                <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                  Send Reminders
                </Text>
                <View style={styles.usersSection}>
                  {users.length > 0 ? (
                    users.map(user => renderUserCard(user))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={[styles.emptyStateText, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                        {message?.body || 'No roommate information available'}
                      </Text>
                    </View>
                  )}
                </View>
                {bills.length > 0 && (
                  <View>
                    <Text style={[styles.affectedServicesLabel, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                      Affected Services
                    </Text>
                    <View style={styles.servicesChipRow}>
                      {bills.map((bill, index) => (
                        <View key={index} style={styles.serviceChip}>
                          <Text style={[styles.serviceChipText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                            {bill.name || `Service ${index + 1}`}
                          </Text>
                          {bill.roommateCount && (
                            <View style={styles.chipCountDot}>
                              <Text style={[styles.chipCountText, fontsLoaded && { fontFamily: 'Poppins-ExtraBold' }]}>
                                {bill.roommateCount}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
      </ScrollView>
      
      {/* Fixed Pay button for current user */}
          {(message.type === 'user_multi_funding' || message.type === 'charge_funding') && (
        <View style={styles.stickyButtonContainer}>
            <TouchableOpacity style={styles.payButton} onPress={handleGoToPayments} activeOpacity={0.8}>
            <MaterialIcons name="payment" size={20} color="#ffffff" />
            <Text style={[styles.payButtonText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                Pay Your Bills
              </Text>
            </TouchableOpacity>
        </View>
          )}
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
    paddingBottom: 100, // Extra padding for fixed button
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
  
  // Message Thread - Modern Chat Style
  messageThread: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  
  // Thread Header
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  threadInfo: {
    flex: 1,
  },
  threadName: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 2,
  },
  threadSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  sentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentBadgeText: {
    fontSize: 11,
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '600',
  },
  
  // Message Composer (iMessage style)
  messageComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageInput: {
    fontSize: 15,
    color: '#0f172a',
    maxHeight: 100,
    lineHeight: 20,
  },
  charCounter: {
    fontSize: 10,
    color: '#cbd5e1',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  sendIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendIconButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  
  // Sticky button container
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#dff6f0',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.2)',
  },
  
  // Pay button
  payButton: {
    backgroundColor: '#34d399',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 17,
    marginLeft: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Content section
  contentSection: {
    marginBottom: 20,
  },
  
  // Bills section (for user-focused messages)
  billsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 2,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  
  // Service Chips - Creative floating tags
  servicesChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34d399',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceChipText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  chipCountDot: {
    backgroundColor: '#ffffff',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  chipCountText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '900',
  },
  
  // Affected services label
  affectedServicesLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // User Payment Components (Type 1 & 2)
  userPaymentContainer: {
    marginBottom: 20,
  },
  paymentSectionTitle: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  paymentCardsGrid: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  paymentServiceName: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentDueDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  paymentAmount: {
    fontSize: 22,
    color: '#ef4444',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  
  billCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  billName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  billDetails: {
    padding: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  billAmount: {
    fontSize: 16,
    color: '#34d399',
    fontWeight: '700',
  },
  billDueDate: {
    fontSize: 14,
    color: '#1e293b',
  },
  emptyBills: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Service info card (for single bill context)
  serviceInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceInfoText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
    marginLeft: 10,
  },
  
  // Affected services card
  affectedServicesCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  affectedServicesTitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicesGrid: {
    gap: 8,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  serviceBadgeText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  serviceBadgeWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  serviceBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roommateCountBadge: {
    backgroundColor: '#f0fdf4',
    minWidth: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  roommateCountText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
});

export default UrgentMessageModal;