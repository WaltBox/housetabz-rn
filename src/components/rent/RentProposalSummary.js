import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatRentAmount } from '../../services/rentProposalService';
import RentStatusIndicator from './RentStatusIndicator';

const RentProposalSummary = ({ 
  proposal, 
  userAllocation, 
  onPress = null,
  style = {} 
}) => {
  if (!proposal) return null;

  const CardComponent = onPress ? TouchableOpacity : View;
  const totalRent = proposal.allocations?.reduce((sum, allocation) => sum + allocation.amount, 0) || 0;
  const userAmount = userAllocation?.amount || 0;
  const userStatus = userAllocation?.approvalStatus || 'pending';

  const getMessageForStatus = () => {
    switch (proposal.status) {
      case 'draft':
        return 'Draft rent proposal needs to be submitted';
      case 'submitted':
        if (userStatus === 'pending') {
          return 'Waiting for your approval';
        } else if (userStatus === 'approved') {
          return 'You approved - waiting for others';
        } else {
          return 'Proposal declined';
        }
      case 'approved':
        return 'Rent allocation approved by all members';
      case 'declined':
        return 'Proposal was declined - new proposal needed';
      default:
        return 'Rent proposal status unknown';
    }
  };

  return (
    <CardComponent
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="home" size={20} color="#34d399" />
          <Text style={styles.title}>Rent Allocation</Text>
        </View>
        <RentStatusIndicator 
          status={proposal.status} 
          size="small" 
          showText={true}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Your share:</Text>
          <Text style={styles.userAmount}>
            {formatRentAmount(userAmount)}
          </Text>
        </View>
        
        <View style={styles.amountRow}>
          <Text style={styles.label}>Total rent:</Text>
          <Text style={styles.totalAmount}>
            {formatRentAmount(totalRent)}
          </Text>
        </View>
      </View>

      <Text style={styles.message}>
        {getMessageForStatus()}
      </Text>

      {onPress && (
        <View style={styles.footer}>
          <Text style={styles.actionText}>Tap to view details</Text>
          <MaterialIcons name="chevron-right" size={16} color="#9ca3af" />
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  content: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  userAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34d399',
    fontFamily: 'Quicksand-SemiBold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Quicksand-Medium',
  },
  message: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Quicksand-Medium',
    marginRight: 4,
  },
});

export default RentProposalSummary;

