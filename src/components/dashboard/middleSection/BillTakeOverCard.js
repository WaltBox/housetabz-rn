import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import BillTakeoverModal from '../../../modals/BillTakeOverModal'; // Adjust the path as needed

// Illustration asset
import takeoverCard from '../../../../assets/bill-takeover-card.png';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.95;
const CARD_HEIGHT = CARD_WIDTH / 2.8;

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
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
          {/* Card base */}
          <View style={styles.card}>
            <View style={styles.arc} />
          </View>
          
          {/* Image with absolute positioning */}
          <Image
            source={takeoverCard}
            style={styles.image}
          />
          
          {/* Text absolutely positioned OVER everything */}
          <View style={styles.textContainer}>
            <Text style={[
              styles.description,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>
              Link a recurring{`\n`}expense to {`\n`}HouseTabz
            </Text>
          </View>
          
          {/* Arrow positioned at bottom left */}
          <View style={styles.arrowButton}>
            <MaterialIcons name="arrow-forward" size={28} color="#1F2937" />
          </View>
        </TouchableOpacity>
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
    width: '100%',
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
    top: 12,
    left: 16,
    width: '50%',
    zIndex: 50,
  },
  description: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 24,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  arrowButton: {
    position: 'absolute',
    bottom: 8,
    left: 24,
    padding: 8,
    zIndex: 50,
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
    left: CARD_WIDTH * .40,
    width: CARD_WIDTH * .60,
    height: CARD_HEIGHT * 1.12,
    zIndex: 10,
  },
});

export default BillTakeoverCard;