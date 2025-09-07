import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';
import { 
  createRentProposal, 
  updateRentProposal, 
  submitRentProposal,
  deleteRentProposal,
  formatRentAmount,
  validateProposalAllocations,
  getActiveRentProposal
} from '../services/rentProposalService';

const CreateRentProposalScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { houseId, rentConfigurationId, totalRentAmount } = route.params;
  
  const [houseMembers, setHouseMembers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingProposal, setExistingProposal] = useState(null);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    fetchHouseData();
    checkExistingProposal();
  }, []);

  const fetchHouseData = async () => {
    try {
      const response = await apiClient.get(`/api/houses/${houseId}`);
      const house = response.data;
      
      console.log('Fetched house data:', house);
      console.log('House members:', house.members);
      
      if (house.members && house.members.length > 0) {
        setHouseMembers(house.members);
        // Always initialize allocations for all members
        initializeAllocations(house.members);
      }
    } catch (error) {
      console.error('Error fetching house data:', error);
      Alert.alert('Error', 'Failed to load house information');
      navigation.goBack();
    }
  };

  const checkExistingProposal = async () => {
    try {
      const activeProposal = await getActiveRentProposal(houseId);
      if (activeProposal && activeProposal.status === 'draft' && activeProposal.createdBy === user.id) {
        setExistingProposal(activeProposal);
        setIsDraft(true);
        // Load existing allocations
        if (activeProposal.allocations) {
          setAllocations(activeProposal.allocations.map(allocation => ({
            userId: allocation.userId,
            amount: allocation.amount.toString(),
            user: allocation.user
          })));
        }
      }
    } catch (error) {
      console.error('Error checking existing proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeAllocations = (members) => {
    // Initialize with empty amounts for all members
    const newAllocations = members.map(member => ({
      userId: member.id,
      amount: '',
      user: member
    }));
    setAllocations(newAllocations);
    console.log('Initialized allocations for members:', members.length, newAllocations);
  };

  const updateAllocation = (userId, amount) => {
    setAllocations(prev => 
      prev.map(allocation => 
        allocation.userId === userId 
          ? { ...allocation, amount: amount }
          : allocation
      )
    );
  };



  const getTotalAllocated = () => {
    return allocations.reduce((sum, allocation) => {
      return sum + (parseFloat(allocation.amount) || 0);
    }, 0);
  };

  const getValidation = () => {
    return validateProposalAllocations(allocations, totalRentAmount);
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      
      const proposalData = {
        rentConfigurationId,
        allocations: allocations.map(allocation => ({
          userId: allocation.userId,
          amount: parseFloat(allocation.amount) || 0
        }))
      };

      let result;
      if (existingProposal) {
        result = await updateRentProposal(existingProposal.id, proposalData);
      } else {
        result = await createRentProposal(houseId, proposalData);
        setExistingProposal(result);
        setIsDraft(true);
      }

      Alert.alert('Success', 'Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    const validation = getValidation();
    
    if (!validation.isValid) {
      Alert.alert('Invalid Allocation', validation.message);
      return;
    }

    Alert.alert(
      'Submit for Approval',
      'Once submitted, you cannot edit this proposal. All house members will be notified to approve or decline.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              let proposalId = existingProposal?.id;
              
              // Create or update proposal first
              const proposalData = {
                rentConfigurationId,
                allocations: allocations.map(allocation => ({
                  userId: allocation.userId,
                  amount: parseFloat(allocation.amount) || 0
                }))
              };

              if (!proposalId) {
                const result = await createRentProposal(houseId, proposalData);
                proposalId = result.id;
              } else {
                await updateRentProposal(proposalId, proposalData);
              }

              // Submit for approval
              await submitRentProposal(proposalId);
              
              Alert.alert(
                'Success',
                'Proposal submitted for approval! All house members will be notified.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error submitting proposal:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to submit proposal');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteDraft = async () => {
    if (!existingProposal) return;

    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft proposal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await deleteRentProposal(existingProposal.id);
              Alert.alert(
                'Success',
                'Draft deleted successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error deleting draft:', error);
              Alert.alert('Error', 'Failed to delete draft');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={styles.loadingText}>Loading house information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const validation = getValidation();
  const totalAllocated = getTotalAllocated();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isDraft ? 'Edit Rent Proposal' : 'Create Rent Proposal'}
        </Text>
        {isDraft && (
          <TouchableOpacity onPress={handleDeleteDraft} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Simple Header */}
          <View style={styles.headerCard}>
            <View style={styles.rentDisplay}>
              <Text style={styles.rentLabel}>Monthly Rent:</Text>
              <Text style={styles.rentAmount}>{formatRentAmount(totalRentAmount)}</Text>
            </View>
            <View style={styles.totalDisplay}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={[
                styles.totalAmount,
                totalAllocated === totalRentAmount && styles.totalPerfect,
                totalAllocated !== totalRentAmount && styles.totalError
              ]}>
                {formatRentAmount(totalAllocated)}
              </Text>
            </View>
          </View>

          {/* House Members */}
          <View style={styles.membersCard}>
            <Text style={styles.membersTitle}>How much does each person pay?</Text>
            {console.log('DEBUG: Rendering members, count:', houseMembers.length)}
            {houseMembers.length === 0 && (
              <Text style={styles.noMembersText}>No house members found</Text>
            )}
            {houseMembers.map((member, index) => {
              const allocation = allocations.find(a => a.userId === member.id);
              return (
                <View key={member.id} style={styles.memberRow}>
                  <Text style={styles.memberName}>
                    {member.firstName && member.lastName 
                      ? `${member.firstName} ${member.lastName}`
                      : member.username
                    }
                  </Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={allocation?.amount || ''}
                      onChangeText={(text) => updateAllocation(member.id, text)}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!validation.isValid || submitting) && styles.disabledButton
            ]}
            onPress={handleSubmitForApproval}
            disabled={!validation.isValid || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Proposal</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
  headerCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentDisplay: {
    flex: 1,
  },
  rentLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  rentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Quicksand-Bold',
  },
  totalDisplay: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Quicksand-Bold',
  },
  totalPerfect: {
    color: '#10b981',
  },
  totalError: {
    color: '#ef4444',
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Quicksand-SemiBold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  summaryValueError: {
    color: '#ef4444',
  },
  validationError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontFamily: 'Quicksand-Medium',
  },
  calculatorCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#34d399',
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculatorLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  calculatorTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  calculatorAllocated: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  calculatorRemaining: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Quicksand-Bold',
  },
  calculatorDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  calculatorPerfect: {
    color: '#10b981',
  },
  calculatorShortage: {
    color: '#f59e0b',
  },
  calculatorOverage: {
    color: '#ef4444',
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  allocationsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allocationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  allocationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Quicksand-SemiBold',
  },
  evenSplitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  evenSplitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34d399',
    marginLeft: 4,
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
    backgroundColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Quicksand-Medium',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 4,
    fontFamily: 'Quicksand-Medium',
  },
  amountInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    minWidth: 80,
    textAlign: 'right',
    fontFamily: 'Quicksand-SemiBold',
  },
  membersCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    fontFamily: 'Quicksand-SemiBold',
  },
  noMembersText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'Quicksand-Medium',
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 120,
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
    fontFamily: 'Quicksand-SemiBold',
  },
  actionButtons: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'Quicksand-SemiBold',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#34d399',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateRentProposalScreen;
