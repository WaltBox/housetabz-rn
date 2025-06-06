import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlansCompanyBox = () => {
  return (
    <View style={styles.wrapper}>
      {/* Special Deals Text in the top-left, outside the container */}
      {/*<Text style={styles.dealLabel}>Special Deals</Text>*/}
        
      {/* Container for the special deals content */}
      <View style={styles.dealContainer}>   
        <Text style={styles.dealLabelCenter}> Welcome to (company name)! </Text>
        <Text style={styles.dealLabelCenter}> Available Plans at </Text>
        <Text style={styles.dealLabelCenter}> (Your Address Here) </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',  // Make sure wrapper takes up full width
    alignItems: 'center',  // Center the container within the wrapper
    marginBottom: 100,  // Add space between SpecialDeals and CompanyCard components
  },
  dealLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',  // Align text to the top left of the container
    marginLeft: '12.5%',  // Same as 25%/2 to match the left side of the container
    marginBottom: 5,  // Add space between the text and the container
  },
  dealLabelCenter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'center',  // Align text to the top left of the container
    //marginLeft: '12.5%',  // Same as 25%/2 to match the left side of the container
    marginBottom: 5,  // Add space between the text and the container
  },
  dealContainer: {
    width: '90%',  // 75% of the screen width
    height: 110,  // Same height as CompanyCard
    backgroundColor: '#F5F5DC',  // Special deals background color
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default PlansCompanyBox;
