import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const CompanyCardComponent = ({ name, description, logoUrl, coverUrl, onPress, cardWidth }) => {
  // Handle empty or undefined text props
  const displayName = name || 'Company Name';
  const displayDescription = description || 'No description available';

  // Handle image loading errors
  const handleImageError = (error) => {
    console.log('Image loading error:', error);
  };

  // Direct use of S3 URLs - no need for local asset fallbacks since we're using S3
  const coverImage = { uri: coverUrl };
  const logoImage = { uri: logoUrl };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { width: cardWidth }]}>
      {/* Cover Photo */}
      <View style={styles.coverPhotoContainer}>
        <Image 
          source={coverImage}
          style={styles.coverPhoto} 
          resizeMode="cover"
          onError={handleImageError}
        />
      </View>

      <View style={styles.content}>
        {/* Row with Logo and Text */}
        <View style={styles.row}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={logoImage}
              style={styles.logo} 
              resizeMode="contain"
              onError={handleImageError}
            />
          </View>

          {/* Name and Description */}
          <View style={styles.textContainer}>
            <Text 
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayName}
            </Text>
            <Text 
              style={styles.description} 
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {displayDescription}
            </Text>
          </View>
        </View>

        {/* AVG Cost Section */}
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>
            Est / Roommate:
          </Text>
          <Text style={styles.costValue}>
            $123
          </Text>
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
