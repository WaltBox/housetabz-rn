import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

const HouseOptionsScreen = ({ navigation }) => {
  // Load fonts
  const [fontsLoaded] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/Montserrat-Black.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  return (
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
      <View style={styles.circle4} />
      <View style={styles.circle5} />
      <View style={styles.circle6} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Option Buttons */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate('CreateHouse')}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Icon name="home-plus" size={28} color="#34d399" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.optionTitle,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Create New House</Text>
                <Text style={[
                  styles.optionSubtitle,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>Set up a new house and invite your roommates</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate('JoinHouse')}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Icon name="account-group" size={28} color="#34d399" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.optionTitle,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>Join Existing House</Text>
                <Text style={[
                  styles.optionSubtitle,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>Join a house that's already been created</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#dff6f0',
    top: -50,
    right: -50,
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#34d399',
    bottom: 100,
    left: -75,
    opacity: 0.1,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dff6f0',
    top: 200,
    left: 50,
    opacity: 0.3,
  },
  circle4: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34d399',
    top: 120,
    right: 20,
    opacity: 0.2,
  },
  circle5: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dff6f0',
    bottom: 200,
    right: -30,
    opacity: 0.4,
  },
  circle6: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#34d399',
    top: 300,
    left: -60,
    opacity: 0.08,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 120,
    paddingBottom: 50,
    zIndex: 1,
    justifyContent: 'center',
  },

  optionsContainer: {
    gap: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  optionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
});

export default HouseOptionsScreen;