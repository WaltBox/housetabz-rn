import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PlansCardComponent from '../components/CompanyCardComponent';// page after clicking a plan
import SpecialDeals from '../components/SpecialDeals';

import PlansCompanyBox from '../components/PlansCompanyBox';
import ViewPlansCard from './ViewPlansCard';

const ViewPlansScreen = ({ route }) => {
  const {name} = route.params; 
  console.log(name);
  const navigation = useNavigation();

  const handleCardPress = (plan) => {
    navigation.navigate('ViewPlansCard', { ...plan });
  };

  const plans = [
    {
      title: "Ultimate",
      description: "Quite Overpriced",
      image: "https://via.placeholder.com/300x180",
      price: "$$",
      logo: "https://via.placeholder.com/50",
    },
    {
      title: "Premium",
      description: "Marginally better than regular",
      image: "https://via.placeholder.com/300x180",
      price: "$$",
      logo: "https://via.placeholder.com/50",
    },
    {
      title: "Regular",
      description: "Broke people only",
      image: "https://via.placeholder.com/300x180",
      price: "$$",
      logo: "https://via.placeholder.com/50",
    },
  ];

  return (
    <View style={styles.container}>
      {/*<Text style={styles.header}>Best planz from {name}</Text>*/}
      
      <PlansCompanyBox /> 

      <ScrollView 
        horizontal={true}   
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.cardRow}
      >
        {plans.map((plan, index) => (
          <ViewPlansCard 
            //style = {styles.containerCard}
            key={index}
            {...plan}
            onPress={() => handleCardPress(plan)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffb121',
    padding: 20,
    //height: '30%',               // Set height to 30% of the screen
    //width: '100%',               // Make sure it takes the full width
  },
  containerCard: {
    flex: 1,
    backgroundColor: '#F5F5DC',
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
    //backgroundColor: '#F5F5DC',
  },
});

export default ViewPlansScreen;
