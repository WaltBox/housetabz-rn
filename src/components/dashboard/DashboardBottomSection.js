import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PartnerDisplay from '../dashboard/bottomSection/PartnerDisplay'; // Adjust path as needed

const DashboardBottomSection = ({ userData }) => {
  const navigation = useNavigation();

  const handlePartnerPress = (partner) => {
    if (partner.isViewAll) {
      // Navigate to marketplace
      navigation.navigate('Marketplace');
    } else {
      // Handle individual partner card press
      // You could navigate to partner details or show a modal
      navigation.navigate('Marketplace', { selectedPartnerId: partner.id });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Marketplace')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons name="chevron-right" size={20} color="#34d399" />
        </TouchableOpacity>
      </View>
      
      <PartnerDisplay 
        onPartnerPress={handlePartnerPress}
        limit={4} // Only show 4 partners initially
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardBottomSection;