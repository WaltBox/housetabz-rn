import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const DealCard = ({ deal }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{deal.name}</Text>
    <Text style={styles.description}>
      {deal.details || 'No details provided.'}
    </Text>
    <Text style={styles.expiration}>
      Expiration: {deal.expiration_date || 'No expiration date'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: Dimensions.get('window').width * 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#22c55e',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  expiration: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default DealCard;
