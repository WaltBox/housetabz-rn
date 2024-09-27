import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SpecialDeals = () => {
  return (
    <View style={styles.wrapper}>
      {/* Special Deals Text in the top-left, aligned with the container */}
      <Text style={styles.dealLabel}>Special Deals</Text>
      
      {/* Container for the special deals content */}
      <View style={styles.dealContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',  // Full width of the wrapper
    alignItems: 'center',  // Center the container within the wrapper
    marginBottom: 100,  // Add space between SpecialDeals and CompanyCard components
  },
  dealLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',  // Align text to the top left of the container
    marginLeft: '5%',  // Adjusted to align with the container's width
    marginBottom: 5,  // Space between the text and the container
  },
  dealContainer: {
    width: '90%',  // 90% of the screen width for the container
    height: 110,  // Same height as CompanyCard
    backgroundColor: 'grey',  // Background color for special deals
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SpecialDeals;
