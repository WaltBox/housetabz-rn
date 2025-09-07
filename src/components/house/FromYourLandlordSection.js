import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getRentAllocationRequest, claimRentAllocationRequest, formatRentAmount } from '../../services/rentProposalService';

const FromYourLandlordSection = ({ house, onRefresh }) => {
  const navigation = useNavigation();
  const [rentAllocationRequest, setRentAllocationRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Only show this section if house has a landlord
  if (!house?.landlordId) {
    return null;
  }

  useEffect(() => {
    fetchRentAllocationRequest();
  }, [house?.id]);

  const fetchRentAllocationRequest = async () => {
    if (!house?.id) return;

    try {
      setLoading(true);
      const request = await getRentAllocationRequest(house.id);
      setRentAllocationRequest(request);
    } catch (error) {
      console.error('Error fetching rent allocation request:', error);
      setRentAllocationRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!rentAllocationRequest?.canClaim) {
      Alert.alert(
        'Cannot Create Proposal',
        'Someone else may have already started creating a proposal for this rent allocation.'
      );
      return;
    }

    try {
      setClaiming(true);

      // Claim the rent allocation request
      await claimRentAllocationRequest(house.id);

      // Navigate to proposal creation
      navigation.navigate('CreateRentProposal', {
        houseId: house.id,
        rentConfigurationId: rentAllocationRequest.rentConfiguration.id,
        totalRentAmount: rentAllocationRequest.rentConfiguration.monthlyRentAmount
      });

      // Refresh the parent component to remove the card
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('Error claiming rent allocation request:', error);
      
      if (error.response?.status === 409) {
        Alert.alert(
          'Already Claimed',
          'Someone else has already started creating a proposal for this rent allocation.'
        );
        // Refresh to remove the card
        if (onRefresh) {
          onRefresh();
        }
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to start creating proposal. Please try again.'
        );
      }
    } finally {
      setClaiming(false);
    }
  };

  // Helper function to get ordinal suffix
  const getDayOrdinal = (day) => {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Don't render if no request or not pending
  if (!rentAllocationRequest || rentAllocationRequest.status !== 'pending') {
    return null;
  }

  const { rentConfiguration } = rentAllocationRequest;
  const monthlyAmount = rentConfiguration?.monthlyRentAmount || 0;
  const dueDay = rentConfiguration?.rentDueDay || 1;

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="business" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>From Your Landlord</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading rent information...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="business" size={20} color="#f59e0b" />
        <Text style={styles.sectionTitle}>From Your Landlord</Text>
      </View>

      <TouchableOpacity
        style={[styles.card, claiming && styles.disabledCard]}
        onPress={handleCreateProposal}
        disabled={claiming || !rentAllocationRequest.canClaim}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="home" size={18} color="#f59e0b" />
            <Text style={styles.cardTitle}>Rent Allocation Needed</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>PENDING</Text>
          </View>
        </View>

        <View style={styles.rentDetails}>
          <Text style={styles.rentAmount}>
            {formatRentAmount(monthlyAmount)}
          </Text>
          <Text style={styles.rentPeriod}>/month</Text>
        </View>

        <Text style={styles.dueDateText}>
          Due on the {dueDay}{getDayOrdinal(dueDay)} of each month
        </Text>

        <Text style={styles.description}>
          Your landlord set the monthly rent. Someone needs to propose how to split it among tenants.
        </Text>

        <View style={styles.actionContainer}>
          {claiming ? (
            <View style={styles.loadingAction}>
              <ActivityIndicator size="small" color="#f59e0b" />
              <Text style={styles.loadingActionText}>Creating proposal...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.actionText}>Tap to create rent proposal</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#f59e0b" />
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Quicksand-Medium',
  },
  card: {
    backgroundColor: '#fffbeb', // Very light yellow
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  statusBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
  },
  rentDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  rentAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Quicksand-Bold',
  },
  rentPeriod: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 4,
    fontFamily: 'Quicksand-Medium',
  },
  dueDateText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontFamily: 'Quicksand-Medium',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Quicksand-Medium',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    fontFamily: 'Quicksand-SemiBold',
  },
  loadingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f59e0b',
    marginLeft: 8,
    fontFamily: 'Quicksand-Medium',
  },
});

export default FromYourLandlordSection;

