// src/screens/LoadingScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import CircularProgress from '../components/CircularProgress';

const LoadingScreen = ({ navigation }) => {
  const progress = new Animated.Value(0);

  useEffect(() => {
    // Simulate a loading process
    const loadApp = async () => {
      Animated.timing(progress, {
        toValue: 100, // 100% progress
        duration: 3000, // 3 seconds
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        navigation.replace('Home');
      }, 3000); // Match this time with the loading bar animation
    };

    loadApp();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/housetabzlogo.png')} // Replace with the correct path to your logo
        style={styles.logo}
      />
      <Text style={styles.text}>Welcome to HouseTabz</Text>
      <CircularProgress progress={progress} size={120} color="#ffffff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#48bb78', // Green background
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default LoadingScreen;
