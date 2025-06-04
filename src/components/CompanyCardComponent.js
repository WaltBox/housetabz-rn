import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const CompanyCardComponent = ({ name, logoUrl, coverUrl, onPress, cardWidth }) => {
  // Define a fixed height for the name sliver and calculate the cover height.
  const nameSliverHeight = 24;
  const coverHeight = cardWidth * 0.85; // 85% of the card's width

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.card, { width: cardWidth, height: coverHeight + nameSliverHeight }]}
      activeOpacity={0.9}
    >
      {/* Cover Image */}
      <View style={[styles.coverContainer, { width: cardWidth, height: coverHeight }]}>
        <Image 
          source={{ uri: coverUrl }} 
          style={styles.coverImage} 
          resizeMode="cover" 
        />
        {/* Logo overlaid at the bottom left of the cover */}
        <View style={styles.logoOverlay}>
          <Image 
            source={{ uri: logoUrl }} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>
      </View>

      {/* Name sliver */}
      <View style={[styles.nameContainer, { height: nameSliverHeight }]}>
        <Text style={styles.partnerName} numberOfLines={1}>
          {name || "Company Name"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  nameContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    paddingHorizontal: 4,
  },
});

export default CompanyCardComponent;
