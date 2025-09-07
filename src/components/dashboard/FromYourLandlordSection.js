import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { formatRentAmount } from '../../services/rentProposalService';

// Helper function to get ordinal suffix for day
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

const FromYourLandlordSection = ({ 
  rentAllocationRequest, 
  loading = false,
  onCreateProposal
}) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  if (!rentAllocationRequest || rentAllocationRequest.status !== 'pending') {
    return null;
  }

  const { rentConfiguration } = rentAllocationRequest;
  const monthlyAmount = rentConfiguration?.monthlyRentAmount || 0;
  const dueDay = rentConfiguration?.rentDueDay || 1;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
            From Your Landlord
          </Text>
        </View>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#34d399" />
          <Text style={[styles.loadingText, fontsLoaded && { fontFamily: 'Poppins-Medium' }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
          From Your Landlord
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onCreateProposal}
        disabled={!rentAllocationRequest.canCreateProposal}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="home"
                size={24}
                color="#34d399"
              />
            </View>
            <View style={styles.textContent}>
              <Text style={[styles.itemTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                Rent allocation needed
              </Text>
              <Text style={[styles.itemSubtitle, fontsLoaded && { fontFamily: 'Poppins-Medium' }]}>
                {formatRentAmount(monthlyAmount)}/month • Due {dueDay}{getDayOrdinal(dueDay)}
              </Text>
            </View>
          </View>
          <View style={styles.rightContent}>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color="#9ca3af"
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  compactCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#34d399',
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  rightContent: {
    marginLeft: 8,
  },
  loadingCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#34d399',
  },
});

export default FromYourLandlordSection;