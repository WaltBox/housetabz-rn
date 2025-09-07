import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

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
      {/* Background gradient */}
      <LinearGradient
        colors={['#dff6f0', '#ffffff']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="home" size={48} color="#34d399" />
          </View>
          
          <Text style={[
            styles.welcomeTitle,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>
            Set Up Your House
          </Text>
        </View>

        {/* Options Container */}
        <View style={styles.optionsContainer}>
          {/* Create House Option */}
          <TouchableOpacity
            style={[styles.optionCard, styles.createHouseCard]}
            onPress={() => navigation.navigate('CreateHouse')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#34d399', '#10b981']}
              style={styles.optionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
          >
            <View style={styles.optionContent}>
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name="add-home" size={32} color="#ffffff" />
              </View>
                
                <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                  ]}>
                    Create New House
                  </Text>
                <Text style={[
                    styles.optionDescription,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}>
                    Start fresh and invite your roommates to join
                  </Text>
                </View>
                
                <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Join House Option */}
          <TouchableOpacity
            style={[styles.optionCard, styles.joinHouseCard]}
            onPress={() => navigation.navigate('JoinHouse')}
            activeOpacity={0.8}
          >
            <View style={styles.joinOptionContent}>
              <View style={styles.joinIconContainer}>
                <MaterialIcons name="group-add" size={32} color="#34d399" />
              </View>
              
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.joinOptionTitle,
                  fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                ]}>
                  Join Existing House
                </Text>
                <Text style={[
                  styles.joinOptionDescription,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  Got an invite? Join a house that's already set up
                </Text>
              </View>
              
              <MaterialIcons name="arrow-forward" size={24} color="#64748b" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color="#34d399" />
            <Text style={[
              styles.infoText,
              fontsLoaded && { fontFamily: 'Poppins-Regular' }
            ]}>
              Don't worry, you can always invite more people or change settings later!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    top: -40,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    bottom: 120,
    left: -30,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
    top: 200,
    right: 20,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },

  // Options Container
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  createHouseCard: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  joinHouseCard: {
    borderWidth: 3,
    borderColor: '#34d399',
  },
  optionGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  
  // Join Option (different styling)
  joinOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  joinIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  joinOptionTitle: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  joinOptionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  
  // Info Section
  infoSection: {
    marginTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.1)',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    lineHeight: 20,
    flex: 1,
  },
});

export default HouseOptionsScreen;