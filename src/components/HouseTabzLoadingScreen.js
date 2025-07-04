// src/components/HouseTabzLoadingScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar
} from 'react-native';

const HouseTabzLoadingScreen = ({ message }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      
      {/* Just the HouseTabz text, centered */}
      <View style={styles.content}>
        <Text style={styles.appName}>HouseTabz</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0', // Your light HouseTabz color
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#34d399', // Your main HouseTabz color
    fontFamily: 'Montserrat-Black',
  },
});

export default HouseTabzLoadingScreen;