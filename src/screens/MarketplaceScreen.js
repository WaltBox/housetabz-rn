import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CompanyCardComponent from '../components/CompanyCardComponent';
import SpecialDeals from '../components/SpecialDeals';

const MarketplaceScreen = () => {
  const navigation = useNavigation();

  const handleCardPress = (company) => {
    navigation.navigate('ViewCompanyCard', { ...company });
  };

  const companies = [
    {
      title: "Internet Service",
      description: "High-speed internet for your house.",
      image: "https://via.placeholder.com/300x180",
      price: "$$",
      logo: "https://via.placeholder.com/50",
    },
    {
      title: "Energy Service",
      description: "Energy plan with green energy options.",
      image: "https://via.placeholder.com/300x180",
      price: "$$",
      logo: "https://via.placeholder.com/50",
    },
    {
      title: "Streaming Service",
      description: "Shared streaming subscription for the house.",
      image: "https://via.placeholder.com/300x180",
      price: "$$",
      logo: "https://via.placeholder.com/50",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>HouseTabz Marketplace</Text>
      
      <SpecialDeals />

      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.cardRow}
      >
        {companies.map((company, index) => (
          <CompanyCardComponent 
            key={index}
            {...company}
            onPress={() => handleCardPress(company)}
          />
        ))}
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});

export default MarketplaceScreen;
