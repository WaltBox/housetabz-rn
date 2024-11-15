import React from 'react';
import { View, Text, Image, StyleSheet, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ViewCompanyCard = ({ route }) => {
  const { title, description, price, logo, coverUrl } = route.params; // coverUrl included

  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverImageContainer}>
        <Image 
          source={coverUrl ? { uri: coverUrl } : require('../../assets/rhythmcover2.png')} // Fallback image if coverUrl is unavailable
          style={styles.coverImage} 
        />
      </View>

      {/* Company Details Container */}
      <View style={styles.companyDetailsContainer}>
        <Text style={styles.title}>{title}</Text>
        
        {/* Align Avg Cost and Button in a row */}
        <View style={styles.row}>
          <Text style={styles.avgCost}>Avg Cost / Roommate: {price}</Text>
          <Button 
            title="View Plans" 
            onPress={() => navigation.navigate('ViewPlans', { name: title })}
          />
        </View>
      </View>

      {/* Special Deals Container */}
      <View style={styles.specialDealsContainer}>
        <Text style={styles.specialDealsText}>Special Deals</Text>
      </View>

      {/* About Section */}
      <View style={styles.textSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.paragraph}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.
        </Text>
        <Text style={styles.paragraph}>
          Cras vehicula, dolor at placerat elementum, risus felis viverra urna, vel consequat velit sapien id metus.
        </Text>
      </View>

      {/* Important Information Section */}
      <View style={styles.textSection}>
        <Text style={styles.sectionTitle}>Important Information</Text>
        <Text style={styles.paragraph}>
          Aenean efficitur sit amet massa fringilla egestas. Nullam condimentum luctus turpis.
        </Text>
        <Text style={styles.paragraph}>
          Curabitur sit amet mauris morbi in dui quis est pulvinar ullamcorper. Nulla facilisi.
        </Text>
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
    backgroundColor: '#FFA500', // Yellow background color
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  companyDetailsContainer: {
    marginTop: -50,
    padding: 20,
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    width: '100%', 
    marginTop: 10,
  },
  avgCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  specialDealsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  specialDealsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
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
