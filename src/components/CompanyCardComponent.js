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
        {/* Row with Logo and Text */}
        <View style={styles.row}>
          {/* Logo */}
          <Image 
            source={logoUrl ? { uri: logoUrl } : require('../../assets/rhythmlogo.png')}
            style={styles.logo} 
            resizeMode="contain"
          />
          {/* Name and Description */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>
        </View>
        {/* AVG Cost Section */}
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>Est / Roommate:</Text>
          <Text style={styles.costValue}>$123</Text> {/* Replace with dynamic cost if available */}
        </View>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Space between row and cost section
  },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 5,
    marginRight: 10, // Space between logo and text
  },
  textContainer: {
    flex: 1, // Allow the text to take up remaining space
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'left',
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    borderTopColor: '#eee',
    paddingTop: 5,
  },
  costLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  costValue: {
    fontSize: 12,
    color: '#22c55e', // Green color to match the HouseTabz theme
    fontWeight: 'bold',
  },
});

export default CompanyCardComponent;
