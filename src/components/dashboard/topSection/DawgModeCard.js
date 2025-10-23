// DawgModeCard.js - Simple clean design
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DawgModeCard = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.purpleBackground}>
        {/* Dark polka dots pattern */}
        <View style={[styles.polkaDot, styles.dot1]} />
        <View style={[styles.polkaDot, styles.dot2]} />
        <View style={[styles.polkaDot, styles.dot3]} />
        <View style={[styles.polkaDot, styles.dot4]} />
        <View style={[styles.polkaDot, styles.dot5]} />
        
        {/* Title at top */}
        <Text style={styles.title}>DAWG MODE</Text>
        
        {/* Massive hero image - takes almost entire card */}
        <Image
          source={require('../../../../assets/dawg-mode.png')}
          style={styles.dawgImage}
          resizeMode="contain"
        />
        
        {/* Question mark icon */}
        <View style={styles.questionContainer}>
          <MaterialIcons name="help" size={16} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  purpleBackground: {
    flex: 1,
    backgroundColor: '#7e22ce',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
    zIndex: 2,
  },
  dawgImage: {
    position: 'absolute',
    top: 25,
    left: -10,
    right: -10,
    bottom: -10,
    width: '110%',
    height: '130%',
    zIndex: 1,
  },
  questionContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  polkaDot: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 50,
    zIndex: 0,
  },
  dot1: {
    width: 25,
    height: 25,
    top: 15,
    left: 20,
  },
  dot2: {
    width: 18,
    height: 18,
    top: 45,
    right: 25,
  },
  dot3: {
    width: 22,
    height: 22,
    bottom: 25,
    left: 15,
  },
  dot4: {
    width: 15,
    height: 15,
    top: 25,
    right: 45,
  },
  dot5: {
    width: 20,
    height: 20,
    bottom: 45,
    right: 15,
  },
});

export default DawgModeCard;