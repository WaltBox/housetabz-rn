import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ViewPlansCard = ({ title, description, price, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.content}>
        {/* Plan Title */}
        <Text style={styles.title}>{title}</Text>
        
        {/* Plan Description */}
        <Text style={styles.description}>{description}</Text>
        
        {/* Price Per Roommate */}
        <Text style={styles.priceLabel}>Avg Cost / Roommate:</Text>
        <Text style={styles.price}>${price}</Text>
        
        {/* Call-to-Action */}
        <Text style={styles.moreDetails}>Tap for More Details</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '45%', // Adjust width to fit two cards per row
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  moreDetails: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34d399',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default ViewPlansCard;
