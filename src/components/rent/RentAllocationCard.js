import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatRentAmount } from '../../services/rentProposalService';
import RentStatusIndicator from './RentStatusIndicator';

const RentAllocationCard = ({ 
  allocation, 
  isCurrentUser = false, 
  onPress = null,
  showStatus = true 
}) => {
  const { user, amount, approvalStatus } = allocation;

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent 
      style={[
        styles.container,
        isCurrentUser && styles.currentUserContainer
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <View style={[
            styles.avatar,
            isCurrentUser && styles.currentUserAvatar
          ]}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || '?'}
            </Text>
          </View>
          
          <View style={styles.userDetails}>
            <Text style={[
              styles.userName,
              isCurrentUser && styles.currentUserName
            ]}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.username || 'Unknown User'
              }
              {isCurrentUser && ' (You)'}
            </Text>
            
            {showStatus && approvalStatus && (
              <View style={styles.statusContainer}>
                <RentStatusIndicator 
                  status={approvalStatus} 
                  size="small" 
                  showText={true}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            isCurrentUser && styles.currentUserAmount
          ]}>
            {formatRentAmount(amount)}
          </Text>
          {onPress && (
            <MaterialIcons 
              name="chevron-right" 
              size={20} 
              color="#9ca3af" 
            />
          )}
        </View>
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  currentUserContainer: {
    backgroundColor: '#ecfdf5',
    borderColor: '#34d399',
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentUserAvatar: {
    backgroundColor: '#34d399',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Quicksand-Medium',
    marginBottom: 2,
  },
  currentUserName: {
    fontWeight: '600',
    color: '#065f46',
  },
  statusContainer: {
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Quicksand-SemiBold',
    marginRight: 8,
  },
  currentUserAmount: {
    color: '#065f46',
    fontWeight: '700',
  },
});

export default RentAllocationCard;

