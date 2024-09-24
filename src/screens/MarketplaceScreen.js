import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import CompanyCardComponent from '../components/CompanyCardComponent';
import SpecialDeals from '../components/SpecialDeals';

const MarketplaceScreen = () => {
  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;  // Simple fallback
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>HouseTabz Marketplace</Text>
      
      <SpecialDeals />

      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.cardRow}
      >
        <CompanyCardComponent 
          title="Internet Service" 
          description="High-speed internet for your house." 
          image="https://via.placeholder.com/300x180" 
          price="$$"
          logo="https://via.placeholder.com/50" // Placeholder for company logo
        />
        <CompanyCardComponent 
          title="Energy Service" 
          description="Energy plan with green energy options." 
          image="https://via.placeholder.com/300x180" 
          price="$$"
          logo="https://via.placeholder.com/50" // Placeholder for company logo
        />
        <CompanyCardComponent 
          title="Streaming Service" 
          description="Shared streaming subscription for the house." 
          image="https://via.placeholder.com/300x180" 
          price="$$"
          logo="https://via.placeholder.com/50" // Placeholder for company logo
        />
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
  header: {
    fontSize: 28,  // Larger font for prominence
    fontFamily: 'Montserrat_700Bold',  // Bold Montserrat font
    textAlign: 'center',  // Center the text horizontally
    marginTop: 40,  // Leave space for the imaginary nav bar
    marginBottom: 20,  // Space between header and content
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MarketplaceScreen;
