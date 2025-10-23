import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { claimRentAllocationRequest, formatRentAmount } from '../../services/rentProposalService';

const COLORS = {
  primary: '#34d399',
  primaryDark: '#10b981',
  background: '#dff6f0',
  cardBackground: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  whiteCardBorder: '#34d399',
  warning: '#f59e0b',
};

const RentAllocationRequestCard = ({ 
  rentAllocationRequest,
  houseId,
  onClaimSuccess,
  onNavigateToProposal
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  // Don't render if no request or not pending
  if (!rentAllocationRequest || rentAllocationRequest.status !== 'pending') {
    return null;
  }

  const { rentConfiguration, canClaim } = rentAllocationRequest;
  const monthlyAmount = rentConfiguration?.monthlyRentAmount || 0;
  const dueDay = rentConfiguration?.rentDueDay || 1;

  const handleCreateProposal = async () => {
    if (!canClaim) {
      Alert.alert(
        'Cannot Create Proposal',
        'Someone else may have already started creating a proposal for this rent allocation.'
      );
      return;
    }

    try {
      setIsProcessing(true);

      // Claim the rent allocation request
      await claimRentAllocationRequest(houseId);

      // Notify parent component of successful claim
      if (onClaimSuccess) {
        onClaimSuccess();
      }

      // Navigate to proposal creation
      if (onNavigateToProposal) {
        onNavigateToProposal({
          houseId,
          rentConfigurationId: rentConfiguration.id,
          totalRentAmount: monthlyAmount
        });
      }

    } catch (error) {
      console.error('Error claiming rent allocation request:', error);
      
      if (error.response?.status === 409) {
        Alert.alert(
          'Already Claimed',
          'Someone else has already started creating a proposal for this rent allocation.'
        );
        // Refresh the data to remove the card
        if (onClaimSuccess) {
          onClaimSuccess();
        }
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to start creating proposal. Please try again.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <MaterialIcons name="home" size={20} color={COLORS.warning} />
          <Text style={[styles.headerText, { fontFamily: fontsLoaded ? 'Poppins-SemiBold' : 'System' }]}>
            Rent Allocation Needed
          </Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.card, isProcessing && styles.processingCard]}
          onPress={handleCreateProposal}
          activeOpacity={0.7}
          disabled={isProcessing || !canClaim}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <MaterialIcons 
                  name="assignment" 
                  size={16} 
                  color={COLORS.warning} 
                  style={styles.statusIcon}
                />
                <Text 
                  style={[
                    styles.cardTitle, 
                    { fontFamily: fontsLoaded ? 'Poppins-SemiBold' : 'System' }
                  ]}
                  numberOfLines={1}
                >
                  Create Rent Proposal
                </Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: COLORS.warning }]}>
                <Text style={[styles.statusText, { fontFamily: fontsLoaded ? 'Poppins-Medium' : 'System' }]}>
                  PENDING
                </Text>
              </View>
            </View>

            <View style={styles.rentDetails}>
              <Text 
                style={[
                  styles.rentAmount, 
                  { fontFamily: fontsLoaded ? 'Poppins-Bold' : 'System' }
                ]}
              >
                {formatRentAmount(monthlyAmount)}/month
              </Text>
              <Text 
                style={[
                  styles.rentDueDate, 
                  { fontFamily: fontsLoaded ? 'Poppins-Regular' : 'System' }
                ]}
              >
                Due on the {dueDay}{getDayOrdinal(dueDay)} of each month
              </Text>
            </View>

            <Text 
              style={[
                styles.cardDescription, 
                { fontFamily: fontsLoaded ? 'Poppins-Regular' : 'System' }
              ]}
              numberOfLines={2}
            >
              Your landlord set the monthly rent. Someone needs to propose how to split it among tenants.
            </Text>

            <View style={styles.cardFooter}>
              <Text 
                style={[
                  styles.cardFooterText, 
                  { fontFamily: fontsLoaded ? 'Poppins-Regular' : 'System' }
                ]}
              >
                {isProcessing ? 'Creating proposal...' : 'Tap to create proposal'}
              </Text>
              {!isProcessing && (
                <MaterialIcons 
                  name="arrow-forward" 
                  size={16} 
                  color={COLORS.textSecondary} 
                />
              )}
              {isProcessing && (
                <MaterialIcons 
                  name="hourglass-empty" 
                  size={16} 
                  color={COLORS.warning} 
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  cardContainer: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff8e1', // Light yellow background for warning/attention
    borderWidth: 2,
    borderColor: COLORS.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  processingCard: {
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusIcon: {
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  rentDetails: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  rentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  rentDueDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default RentAllocationRequestCard;












