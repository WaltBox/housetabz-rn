import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const CompanyCardComponent = ({ name, description, logoUrl, coverUrl, onPress, cardWidth }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { width: cardWidth }]}>
      {/* Cover Photo */}
      <Image 
        source={coverUrl ? { uri: coverUrl } : require('../../assets/rhythmenergycover.jpeg')} 
        style={styles.coverPhoto} 
        resizeMode="cover"
      />
      <View style={styles.content}>
        {/* Logo */}
        <Image 
          source={logoUrl ? { uri: logoUrl } : require('../../assets/rhythmlogo.png')}
          style={styles.logo} 
          resizeMode="contain"
        />
        {/* Name and Description */}
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    height: 220, // Fixed height for uniformity
  },
  coverPhoto: {
    width: '100%', // Ensures it spans the full card width
    height: '50%', // Takes up the top half of the card
  },
  content: {
    padding: 10,
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default CompanyCardComponent;
