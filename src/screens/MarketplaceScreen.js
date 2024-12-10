import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CompanyCardComponent from '../components/CompanyCardComponent';
import SpecialDeals from '../components/SpecialDeals';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const MarketplaceScreen = () => {
  const navigation = useNavigation();
  const [partnerDetails, setPartnerDetails] = useState([]);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        const partnerResponse = await axios.get("https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/api/partners");
        setPartnerDetails(partnerResponse.data);
      } catch (error) {
        console.error('Error fetching partner details:', error);
      }
    };
    fetchPartnerDetails();
  }, []);

  const handleCardPress = (partner) => {
    navigation.navigate('ViewCompanyCard', { partner });
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <LinearGradient 
          colors={['#22c55e', '#22c55e']} 
          style={styles.gradientBackground}
        >
          <View style={styles.textContainer}>
            <Text style={styles.headerText}>HouseTabz</Text>
            <Text style={styles.headerText}>Marketplace</Text>
          </View>
          <Image 
            source={require('../../assets/housetabz-marketplace3.png')} 
            style={styles.headerImage} 
            resizeMode="contain" 
          />
        </LinearGradient>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Special Deals Section */}
        <View style={styles.specialDealsContainer}>
          <SpecialDeals />
        </View>

        {/* Industry Text and Cards */}
        <View style={styles.cardsContainer}>
          <Text style={styles.industryText}>Industry</Text>
          <View style={styles.cardGrid}>
            {partnerDetails.length > 0 ? (
              partnerDetails.map((partner) => (
                <View key={partner.id} style={styles.cardContainer}>
  <CompanyCardComponent
    name={partner.name}
    description={partner.description}
    logoUrl={`https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/${partner.logo}`} 
    coverUrl={`https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/${partner.marketplace_cover}`} 
    onPress={() => handleCardPress(partner)}
    cardWidth={(screenWidth - 60) / 2} // Pass dynamic width to card
  />
</View>

              ))
            ) : (
              <Text>No companies available</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    width: '100%',
    position: 'absolute', // Fixed header
    top: 0,
    zIndex: 10, // Ensures header stays above scrollable content
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 120,
    borderBottomRightRadius: 60,
    paddingLeft: 20,
    paddingRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    color: '#FFFFFF',
  },
  headerImage: {
    width: 150,
    height: 100,
    marginLeft: 10,
  },
  scrollContainer: {
    paddingTop: 140, // To offset the fixed header
    paddingHorizontal: 20,
  },
  specialDealsContainer: {
    marginBottom: 10, // Reduced spacing between Special Deals and cards
  },
  cardsContainer: {
    marginTop: -30, // Pulls the cards closer to the Special Deals section
  },
  industryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Ensures proper grid layout
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5, // Reduces padding within the ScrollView
  },
  cardContainer: {
    width: (screenWidth - 60) / 2, // Dynamic width for two cards per row
    height: 220,
    marginBottom: 20, // Spacing between rows
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  
});

export default MarketplaceScreen;
