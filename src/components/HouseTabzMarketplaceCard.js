// src/components/HouseTabzMarketplaceCard.js
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';

// Marketplace asset
import marketplace from '../../assets/marketplace.png';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = 120; // Much shorter horizontal card

const HouseTabzMarketplaceCard = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Card base */}
        <View style={styles.card} />

        {/* Decorative elements */}
        <View style={styles.leftCircle} />
        <View style={styles.rightCircle} />

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>            
            Connect services to HouseTabz
          </Text>
          <Text style={[styles.subtitle, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>          
            Pay as a house — no fronting, no chasing.
          </Text>
        </View>

        {/* Hero image - positioned on the right */}
        <Image source={marketplace} style={styles.image} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: '60%',
    zIndex: 2,
  },
  title: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    opacity: 0.85,
    lineHeight: 16,
  },
  leftCircle: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34d399',
    opacity: 0.1,
  },
  rightCircle: {
    position: 'absolute',
    bottom: -40,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34d399',
    opacity: 0.05,
  },
  image: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    width: CARD_WIDTH * 0.35,
    height: CARD_HEIGHT * 1.2,
    resizeMode: 'contain',
  },
});

export default HouseTabzMarketplaceCard;