import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.2; // Same height as FinancialSummaryCard
const CARD_WIDTH = width * 0.38; // About half the width of FinancialSummaryCard

// Custom DrippyText component for badass dripping effect
const DrippyText = ({ text, style }) => {
  // Create text with multiple shadow layers to simulate drip effect
  return (
    <View style={styles.drippyTextContainer}>
      {/* Drip shadow layers */}
      <Text style={[styles.drippyShadow1, style]}>{text}</Text>
      <Text style={[styles.drippyShadow2, style]}>{text}</Text>
      <Text style={[styles.drippyShadow3, style]}>{text}</Text>
      
      {/* Main text on top */}
      <Text style={[styles.drippyTextMain, style]}>{text}</Text>
    </View>
  );
};

const DawgModeCard = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.purpleBackground}>
        {/* Centered drippy title at the top */}
        <View style={styles.titleContainer}>
          <DrippyText text="DAWG MODE" style={styles.title} />
        </View>
        
        {/* Extra large image positioned near the bottom */}
        <Image
          source={require('../../../../assets/dawg-mode.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        {/* Question mark icon at bottom right */}
        <View style={styles.questionContainer}>
          <MaterialIcons name="help" size={24} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  purpleBackground: {
    flex: 1,
    backgroundColor: '#7e22ce', // Solid purple background
    padding: 16,
    justifyContent: 'flex-start', // Align content to the top
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 2,
  },
  drippyTextContainer: {
    position: 'relative',
  },
  title: {
    fontSize: 22, // Slightly smaller to fit better when centered
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
    textAlign: 'center',
  },
  // Drip shadow effects
  drippyShadow1: {
    position: 'absolute',
    textShadowColor: '#9333ea', // Lighter purple
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 2,
  },
  drippyShadow2: {
    position: 'absolute',
    textShadowColor: '#6b21a8', // Darker purple
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 3,
  },
  drippyShadow3: {
    position: 'absolute',
    textShadowColor: '#4c1d95', // Even darker purple
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 4,
  },
  drippyTextMain: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  image: {
    position: 'absolute',
    bottom: -20, // Move even lower to make it appear larger
    left: -10, // Shift slightly left to center visually
    width: '150%', // Make image much larger
    height: '100%', // Make image taller
    zIndex: 1, // Behind the question mark
  },
  questionContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure it's on top of image
  }
});

export default DawgModeCard;