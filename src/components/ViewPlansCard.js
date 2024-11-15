import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ViewPlansCard = ({ title, description, price, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <LinearGradient colors={['#ffffff', '#f9fafb']} style={styles.gradient}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.priceLabel}>Avg Cost / Roommate:</Text>
        <Text style={styles.price}>${price}</Text>
        <Text style={styles.moreDetails}>Tap for More Details</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%', // Half of the row with spacing
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e', // Accent green
    textAlign: 'center',
    marginBottom: 10,
  },
  moreDetails: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default ViewPlansCard;
