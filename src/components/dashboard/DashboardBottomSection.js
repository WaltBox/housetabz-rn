import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import ViewCompanyCard from '../../modals/ViewCompanyCard'; // Adjust path as needed
import PartnerDisplay from '../dashboard/bottomSection/PartnerDisplay'; // Adjust path as needed

const DashboardBottomSection = ({ userData }) => {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  // Load the Poppins font family, similar to TaskCard
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  const handlePartnerPress = (partner) => {
    if (partner.isViewAll) {
      // Navigate to Merchants tab
      navigation.navigate('Merchants');
    } else {
      // Open modal with selected partner
      setSelectedPartner(partner);
    }
  };
  
  const closeModal = () => {
    setSelectedPartner(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.sectionTitle,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>
            Services
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Merchants')}
        >
          <Text style={[
            styles.viewAllText,
            fontsLoaded && { fontFamily: 'Poppins-Medium' }
          ]}>
            View All
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="#34d399" />
        </TouchableOpacity>
      </View>
      
      <PartnerDisplay
        onPartnerPress={handlePartnerPress}
        limit={4} // Only show 4 partners initially
      />
      
      {/* Modal for partner details - same approach as PartnersScreen */}
      <Modal
        visible={!!selectedPartner}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          {selectedPartner && (
            <ViewCompanyCard
              partner={selectedPartner}
              visible={true}
              onClose={closeModal}
              userId={user.id}
              jwtToken={token}
            />
          )}
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
});

export default DashboardBottomSection;