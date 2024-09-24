import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';


const CompanyCardComponent = ({ title, description, image, price, logo, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.coverImage} />
      <View style={styles.logoContainer}>
        <Image source={{ uri: logo }} style={styles.logo} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.avgRoommateLabel}>Avg / Roommate</Text>
        <Text style={styles.price}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '33%',
    height: 220,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 15,
  },
  coverImage: {
    width: '100%',
    height: 100,
  },
  logoContainer: {
    position: 'absolute',
    top: 70,
    left: 15,
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 40,
    height: 40,
  },
  content: {
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  avgRoommateLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CompanyCardComponent;
