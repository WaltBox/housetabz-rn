import React from 'react';
import { View, Text, Image, StyleSheet, Button, ScrollView } from 'react-native';

const ViewCompanyCard = ({ route }) => {
  const { title, description, image, price, logo } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
  

      {/* Company Details Container */}
      <View style={styles.companyDetailsContainer}>
    
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.avgCost}>Avg Cost / Roommate: {price}</Text>
        <Button title="View Plans" onPress={() => { /* Action for viewing plans */ }} />
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
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  coverImage: {
    width: '100%',
    height: '12.5%',  // 1/8th of the screen height
    borderRadius: 10,
    marginBottom: 20,
  },
  companyDetailsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  companyLogo: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  avgCost: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#555',
  },
  specialDealsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'grey',  // Similar style to the Special Deals
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  specialDealsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  textSection: {
    marginBottom: 20,
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