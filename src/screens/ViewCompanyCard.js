import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const ViewCompanyCard = ({ route }) => {
  const { partner } = route.params;
  const [showHeader, setShowHeader] = useState(false);
  const navigation = useNavigation();
  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset > 200 && !showHeader) {
      setShowHeader(true);
    } else if (yOffset <= 200 && showHeader) {
      setShowHeader(false);
    }
  };

  const handleShopNow = () => {
    navigation.navigate('InAppBrowser', { url: 'https://www.gotrhythm.com/' });
  };

  const screenHeight = Dimensions.get('window').height;
  const buttonHeight = 70;
  const navbarHeight = 60; // Adjust this value to match your navbar's height

  return (
    <View style={styles.outerContainer}>
      {showHeader && (
        <View style={styles.stickyHeader}>
          <Text style={styles.headerTitle}>{partner.name}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: buttonHeight + navbarHeight }}
      >
        {/* Cover Image */}
        <View style={styles.coverImageContainer}>
          <Image 
            source={partner.company_cover 
              ? { uri: `https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/${partner.company_cover}` } 
              : require('../../assets/fallback_cover.png')} // Fallback image if company_cover is unavailable
            style={styles.coverImage} 
          />
          <LinearGradient
            colors={['transparent', '#f8f8f8']}
            style={styles.coverImageOverlay}
          />
        </View>

        {/* Company Details */}
        <View style={styles.companyDetailsContainer}>
          <Text style={styles.title}>{partner.name}</Text>
          <Text style={styles.description}>{partner.description}</Text>
          <Text style={styles.avgRoommate}>AVG / Roommate: $50 (example)</Text>
        </View>

        <View style={styles.howToSection}>
          <Text style={styles.sectionTitle}>How to Use HouseTabz for {partner.name}</Text>
          <Text style={styles.paragraph}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sit amet accumsan tortor.</Text>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.paragraph}>{partner.about || 'No additional information available.'}</Text>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>Important Information</Text>
          <Text style={styles.paragraph}>{partner.important_information || 'No additional information available.'}</Text>
        </View>
      </ScrollView>

      {/* Fixed Button */}
      <View style={styles.shopButtonContainer}>
        <TouchableOpacity style={styles.shopButton} onPress={handleShopNow}>
          <Text style={styles.shopButtonText}>Shop {partner.name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    zIndex: 10,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  coverImageContainer: {
    height: 300, // Increase height to allow dissolve effect
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // Adjust for a smooth fade
  },
  companyDetailsContainer: {
    marginTop: -50, // Pull into the cover image
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'montserrat-bold',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
  },
  avgRoommate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 10,
  },
  howToSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  textSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  shopButtonContainer: {
    height: 70,
    position: 'absolute',
    bottom: 20, // Move up slightly
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButton: {
    backgroundColor: '#ffffff',
    borderColor: '#6A0DAD',
    borderWidth: 2,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 10,
    width: Dimensions.get('window').width - 40,
  },
  shopButtonText: {
    color: '#6A0DAD',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ViewCompanyCard;
