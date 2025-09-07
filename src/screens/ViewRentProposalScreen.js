import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { 
  getRentProposalDetails,
  approveRentProposal,
  declineRentProposal,
  formatRentAmount
} from '../services/rentProposalService';

const ViewRentProposalScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { rentProposalId } = route.params;
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProposalDetails();
  }, []);

  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      const proposalData = await getRentProposalDetails(rentProposalId);
      setProposal(proposalData);
    } catch (error) {
      console.error('Error fetching proposal details:', error);
      Alert.alert('Error', 'Failed to load proposal details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    Alert.alert(
      'Approve Proposal',
      'Are you sure you want to approve this rent allocation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setActionLoading('approve');
              await approveRentProposal(rentProposalId);
              
              Alert.alert(
                'Success',
                'Proposal approved successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error approving proposal:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to approve proposal');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleDecline = async () => {
    Alert.alert(
      'Decline Proposal',
      'Are you sure you want to decline this rent allocation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('decline');
              await declineRentProposal(rentProposalId);
              
              Alert.alert(
                'Success',
                'Proposal declined',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error declining proposal:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to decline proposal');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'declined':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'declined':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getUserAllocation = () => {
    return proposal?.allocations?.find(allocation => allocation.userId === user.id);
  };

  const getUserApprovalStatus = () => {
    const userAllocation = getUserAllocation();
    return userAllocation?.approvalStatus || 'pending';
  };

  const canTakeAction = () => {
    const userStatus = getUserApprovalStatus();
    return proposal?.status === 'submitted' && userStatus === 'pending';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={styles.loadingText}>Loading proposal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!proposal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Proposal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const userAllocation = getUserAllocation();
  const userStatus = getUserApprovalStatus();
  const totalRent = proposal.allocations?.reduce((sum, allocation) => sum + allocation.amount, 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rent Proposal</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Proposal Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialIcons 
              name={getStatusIcon(proposal.status)} 
              size={24} 
              color={getStatusColor(proposal.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(proposal.status) }]}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.proposedBy}>
            Proposed by {proposal.createdByUser?.firstName} {proposal.createdByUser?.lastName}
          </Text>
        </View>

        {/* User's Allocation (Highlighted) */}
        {userAllocation && (
          <View style={styles.userAllocationCard}>
            <View style={styles.userAllocationHeader}>
              <MaterialIcons name="person" size={24} color="#34d399" />
              <Text style={styles.userAllocationTitle}>Your Allocation</Text>
            </View>
            <Text style={styles.userAllocationAmount}>
              {formatRentAmount(userAllocation.amount)}
            </Text>
            <View style={styles.userStatusContainer}>
              <MaterialIcons 
                name={getStatusIcon(userStatus)} 
                size={16} 
                color={getStatusColor(userStatus)} 
              />
              <Text style={[styles.userStatusText, { color: getStatusColor(userStatus) }]}>
                {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
              </Text>
            </View>
          </View>
        )}

        {/* Total Rent */}
        <View style={styles.totalRentCard}>
          <Text style={styles.totalRentLabel}>Total Monthly Rent</Text>
          <Text style={styles.totalRentAmount}>{formatRentAmount(totalRent)}</Text>
        </View>

        {/* All Allocations */}
        <View style={styles.allocationsCard}>
          <Text style={styles.allocationsTitle}>Full Breakdown</Text>
          {proposal.allocations?.map((allocation, index) => (
            <View key={allocation.userId} style={styles.allocationRow}>
              <View style={styles.memberInfo}>
                <View style={[
                  styles.memberAvatar,
                  allocation.userId === user.id && styles.currentUserAvatar
                ]}>
                  <Text style={styles.memberInitial}>
                    {allocation.user?.firstName?.charAt(0) || allocation.user?.username?.charAt(0) || '?'}
                  </Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={[
                    styles.memberName,
                    allocation.userId === user.id && styles.currentUserName
                  ]}>
                    {allocation.user?.firstName && allocation.user?.lastName 
                      ? `${allocation.user.firstName} ${allocation.user.lastName}`
                      : allocation.user?.username
                    }
                    {allocation.userId === user.id && ' (You)'}
                  </Text>
                  <View style={styles.approvalStatusContainer}>
                    <MaterialIcons 
                      name={getStatusIcon(allocation.approvalStatus)} 
                      size={14} 
                      color={getStatusColor(allocation.approvalStatus)} 
                    />
                    <Text style={[
                      styles.approvalStatusText, 
                      { color: getStatusColor(allocation.approvalStatus) }
                    ]}>
                      {allocation.approvalStatus.charAt(0).toUpperCase() + allocation.approvalStatus.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.allocationAmount}>
                {formatRentAmount(allocation.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Proposal Notes (if any) */}
        {proposal.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{proposal.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {canTakeAction() && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.declineButton, actionLoading === 'decline' && styles.disabledButton]}
            onPress={handleDecline}
            disabled={!!actionLoading}
          >
            {actionLoading === 'decline' ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <MaterialIcons name="close" size={20} color="#ef4444" />
                <Text style={styles.declineButtonText}>Decline</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.approveButton, actionLoading === 'approve' && styles.disabledButton]}
            onPress={handleApprove}
            disabled={!!actionLoading}
          >
            {actionLoading === 'approve' ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color="white" />
                <Text style={styles.approveButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: '#ef4444',
    fontFamily: 'Quicksand-Medium',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  proposedBy: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  userAllocationCard: {
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#34d399',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  userAllocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAllocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginLeft: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  userAllocationAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 8,
    fontFamily: 'Quicksand-Bold',
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: 'Quicksand-Medium',
  },
  totalRentCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRentLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'Quicksand-Medium',
  },
  totalRentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Quicksand-Bold',
  },
  allocationsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allocationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
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
  memberInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Quicksand-Medium',
  },
  currentUserName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  approvalStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  approvalStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: 'Quicksand-Medium',
  },
  allocationAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  notesCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontFamily: 'Quicksand-Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'white',
    gap: 8,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    fontFamily: 'Quicksand-SemiBold',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#34d399',
    gap: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ViewRentProposalScreen;

