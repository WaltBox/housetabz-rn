import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
        const partnerResponse = await axios.get("http://localhost:3004/api/partners");
        setPartnerDetails(partnerResponse.data);
      } catch (error) {
        console.error('Error fetching partner details:', error);
      }
    };
    fetchPartnerDetails();
  }, []);

  const handleCardPress = (company) => {
    navigation.navigate('ViewCompanyCard', { ...company });
  };

  return (
    <View style={styles.container}>
      {/* Display the HouseTabz Marketplace Image */}
      <Image 
        source={require('../../assets/housetabz-marketplace.png')} 
        style={styles.headerImage} 
        resizeMode="cover" 
      />

      <SpecialDeals />

      <Text style={styles.industryText}>Industry</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRow}
      >
        {partnerDetails.length > 0 ? (
          partnerDetails.map((company) => (
            <View key={company.id} style={styles.cardContainer}>
              <CompanyCardComponent
                name={company.name}
                description={company.description}
                logoUrl={company.logoUrl} // assuming we have a logo URL
                coverUrl={company.coverUrl} // assuming we have a cover photo URL
                onPress={() => handleCardPress(company)}
              />
            </View>
          ))
        ) : (
          <Text>No companies available</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  headerImage: {
    width: screenWidth, // Full width of the screen
    height: 180, // Adjust the height based on the image aspect ratio
    alignSelf: 'center',
  },
  industryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardContainer: {
    width: 160, // Adjusted width for a smaller card
    height: 220, // Adjusted height for a more compact size
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // For shadow on Android
    backgroundColor: '#ffffff',
  },
});

export default MarketplaceScreen;
