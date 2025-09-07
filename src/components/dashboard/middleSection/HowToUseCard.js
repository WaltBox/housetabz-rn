import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import HowToUseModal from '../../../modals/HowToUseModal';
import { MaterialIcons } from '@expo/vector-icons';

// Illustration asset
import howUseImage from '../../../../assets/how-to-use.png';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.95;
const CARD_HEIGHT = CARD_WIDTH / 2.8;

const HowToUseCard = ({ onPress }) => {
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
          
          {/* Image with absolute positioning - LEFT SIDE */}
          <Image
            source={howUseImage}
            style={styles.image}
          />
          
          {/* Text and link absolutely positioned OVER everything - RIGHT SIDE */}
          <View style={styles.textContainer}>
            <Text style={[
              styles.description,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>
              How do I use{`\n`}HouseTabz?
            </Text>
          </View>
          
          {/* Arrow positioned at bottom right */}
          <View style={styles.arrowButton}>
            <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>
      
      {modalVisible && <HowToUseModal visible={modalVisible} onClose={handleClose} />}
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
    right: 16, // RIGHT SIDE instead of left
    width: '50%',
    zIndex: 50,
    alignItems: 'flex-end', // Align text to the right
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  arrowButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 8,
    zIndex: 50,
  },
  arc: {
    position: 'absolute',
    bottom: -CARD_HEIGHT * 0.3,
    right: -CARD_WIDTH * 0.2,
    width: CARD_WIDTH * 0.6,
    height: CARD_WIDTH * 0.6,
    borderRadius: (CARD_WIDTH * 0.6) / 2,
    backgroundColor: '#34d399',
    opacity: 1,
  },
  image: {
    position: 'absolute',
    bottom: 0,
    left: 0, // LEFT SIDE instead of right
    width: CARD_WIDTH * .55,
    height: CARD_HEIGHT * 1.12,
    zIndex: 10,
  },
});

export default HowToUseCard; 