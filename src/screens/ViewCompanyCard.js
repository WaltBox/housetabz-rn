import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ViewCompanyCard = ({ route }) => {
  const { partner } = route.params;
  const navigation = useNavigation();

  const handleNavigation = () => {
    if (partner.type === 'plannable') {
      navigation.navigate('ViewPlans', { partnerId: partner.id });
    } else if (partner.type === 'formable') {
      navigation.navigate('ViewForm', { partnerId: partner.id });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverImageContainer}>
        <Image 
          source={partner.company_cover 
            ? { uri: `http://localhost:3004/${partner.company_cover}` } 
            : require('../../assets/fallback_cover.png')} // Fallback image if company_cover is unavailable
          style={styles.coverImage} 
        />
      </View>

      {/* Company Details Container */}
      <View style={styles.companyDetailsContainer}>
        <Text style={styles.title}>{partner.name}</Text>
        <Text style={styles.description}>{partner.description}</Text>
        {/* Conditional Button */}
        <Button 
          title={partner.type === 'plannable' ? 'View Plans' : 'View Form'}
          onPress={handleNavigation}
          color="#4CAF50"
        />
      </View>

      {/* About Section */}
      <View style={styles.textSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.paragraph}>{partner.about || 'No additional information available.'}</Text>
      </View>

      {/* Important Information Section */}
      <View style={styles.textSection}>
        <Text style={styles.sectionTitle}>Important Information</Text>
        <Text style={styles.paragraph}>{partner.important_information || 'No important information available.'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  coverImageContainer: {
    height: 200, // Adjusted for proper display
    backgroundColor: '#d3d3d3', // Subtle background color for fallback
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ensures image covers the area
  },
  companyDetailsContainer: {
    marginTop: -30, // Keeps the company details close to the cover image
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
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
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
});

export default ViewCompanyCard;
