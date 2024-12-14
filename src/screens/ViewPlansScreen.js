import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import ViewPlansCard from '../components/ViewPlansCard';

const ViewPlansScreen = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const roommates = 4; // Example: Number of roommates

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get('https://d96e-2605-a601-a0c6-4f00-c98b-de38-daaa-fde7.ngrok-free.app/api/v2/rhythm-offers');
        setOffers(response.data);
      } catch (error) {
        console.error('Error fetching Rhythm offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Plans</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" />
      ) : (
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {offers.length > 0 ? (
            offers.map((offer) => (
              <ViewPlansCard
                key={offer.uuid}
                title={offer.title}
                description={offer.description_en}
                price={(offer.price_1000_kwh / roommates).toFixed(2)} // Calculate price per roommate
                onPress={() => console.log('Selected offer:', offer)}
              />
            ))
          ) : (
            <Text style={styles.noOffersText}>No plans available at the moment.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noOffersText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ViewPlansScreen;
