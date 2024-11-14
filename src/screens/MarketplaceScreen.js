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
      {/* Green Container for Text and Icon */}
      <View style={styles.headerContainer}>
        <LinearGradient 
          colors={['#22c55e', '#22c55e']} 
          style={styles.gradientBackground}
        >
          <View style={styles.textContainer}>
            {/* Header Text (Stacked and Left-Aligned) */}
            <Text style={styles.headerText}>HouseTabz</Text>
            <Text style={styles.headerText}>Marketplace</Text>
          </View>
          {/* Icon Positioned to the Right of the Text */}
          <Image 
            source={require('../../assets/housetabz-marketplace3.png')} 
            style={styles.headerImage} 
            resizeMode="contain" 
          />
        </LinearGradient>
      </View>

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
                logoUrl={company.logoUrl} 
                coverUrl={company.coverUrl} 
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
  headerContainer: {
    width: screenWidth * 0.9, // Makes it cut off midway
    alignItems: 'center',
    marginBottom: 20,
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 120,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
    paddingLeft: 20,
    paddingRight: 20, // Space around the text and icon
  },
  textContainer: {
    flex: 1, // Takes available space on the left
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    color: '#FFFFFF',
  },
  headerImage: {
    width: 150, // Larger width for the icon
    height: 100,
    marginLeft: 10, // Space between text and icon
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
    width: 160,
    height: 220,
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#ffffff',
  },
});

export default MarketplaceScreen;
