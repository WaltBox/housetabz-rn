// src/components/HouseTabzLoadingScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator
} from 'react-native';

const HouseTabzLoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      
      {/* Simple centered content */}
      <View style={styles.content}>
        <Text style={styles.appName}>HouseTabz</Text>
        <ActivityIndicator 
          size="large" 
          color="#34d399" 
          style={styles.loader}
        />
        <Text style={styles.loadingMessage}>{message}</Text>
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
    marginBottom: 30,
  },
  loader: {
    marginBottom: 20,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HouseTabzLoadingScreen;