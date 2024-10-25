import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CompanyCardComponent from '../components/CompanyCardComponent';
import SpecialDeals from '../components/SpecialDeals';
import AppNavigator from '../navigation/AppNavigator';
import axios from 'axios'

const MarketplaceScreen = () => {
  const navigation = useNavigation();
  const [partnerDetails, setPartnerDetails] = useState({});
  useEffect(() => {

    const fetchPartnerDetails = async() => {
      try {
        const parterResponse = await axios.get("http://localhost:3004/api/partners");
        const companies = parterResponse.data.map(partner => {
          return{
            title:partner.title,
            description:partner.description
          };
        });
        setPartnerDetails(companies);
      } catch (error){
        console.error('Error fetching partner details.')
      }
  };
  fetchPartnerDetails();
})


  const handleCardPress = (company) => {
    navigation.navigate('ViewCompanyCard', { ...company });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>HouseTabz Marketplace</Text>
      
      <SpecialDeals />

      <Text style={styles.industryText}> Industry </Text>
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.cardRow}
      >
        {partnerDetails.map((company, index) => (
          <CompanyCardComponent 
            key={index}
            {...company}
            onPress={() => handleCardPress(company)}
          />
        ))}
      </ScrollView>
      
      <Text style={styles.industryText}> Industry </Text>
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
    color: 'green',
    marginTop: 40,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  industryText: {
    fontSize: 18, // Increase text size
    fontWeight: 'bold', // Make text bold
    marginBottom: 10, // Add margin at the bottom
  },
});

export default MarketplaceScreen;
