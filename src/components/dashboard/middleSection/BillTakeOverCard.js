import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import BillTakeoverModal from '../../../modals/BillTakeOverModal'; // Adjust the path as needed

// Illustration asset
import takeoverCard from '../../../../assets/bill-takeover-card.png';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH / 3;

const BillTakeoverCard = ({ onPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  const handlePress = () => {
    setModalVisible(true);
    if (onPress) onPress();
  };
  
  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          {/* Card base */}
          <View style={styles.card}>
            <View style={styles.arc} />
          </View>
          
          {/* Image with absolute positioning */}
          <Image
            source={takeoverCard}
            style={styles.image}
          />
          
          {/* Text and link absolutely positioned OVER everything */}
          <View style={styles.textContainer}>
            <Text style={[
              styles.description,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}>
              Submit a recurring expense to{`\n`}Bill Takeover.
            </Text>
            <TouchableOpacity onPress={handlePress}>
              <Text style={[
                styles.link,
                fontsLoaded && { fontFamily: 'Poppins-Bold' }
              ]}>
                See How it Works →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Bill Takeover Modal */}
      {modalVisible && <BillTakeoverModal visible={modalVisible} onClose={handleClose} />}
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginVertical: 16,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  textContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: '50%',
    zIndex: 50,
  
  },
  description: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  link: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2937',
    // Very subtle text shadow to improve visibility without being obvious
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  arc: {
    position: 'absolute',
    bottom: -CARD_HEIGHT * 0.3,
    left: -CARD_WIDTH * 0.2,
    width: CARD_WIDTH * 0.6,
    height: CARD_WIDTH * 0.6,
    borderRadius: (CARD_WIDTH * 0.6) / 2,
    backgroundColor: '#34d399',
    opacity: 0.2,
  },
  image: {
    position: 'absolute',
    bottom: 0,
    left: CARD_WIDTH * .45,
    width: CARD_WIDTH * .55,
    height: CARD_HEIGHT * 1.12,
    zIndex: 10,

  },
});

export default BillTakeoverCard;