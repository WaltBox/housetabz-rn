import React from 'react';
import { View, Text, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';


const ViewPlansCard = ({ title, description, image, price, logo, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      {/*<Image source={{ uri: image }} style={styles.coverImage} />
      <View style={styles.logoContainer}>
        <Image source={{ uri: logo }} style={styles.logo} />
      </View>*/}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.title}>{description}</Text>
        <Text style={styles.avgRoommateLabel}>Avg / Month / Roommate</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.moreDetails}>More Details</Text>

        
        
        <Button style = {styles.button} title="Request For House" onPress={() => { /* Action for requesting for house */ }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',     // Positions the button absolutely within its parent
    bottom: 20,               // Place it 20px from the bottom of the parent container
    left: '50%',              // Horizontally position it in the center
    transform: [{ translateX: -50 }],  // Adjust the button's position to fully center it
    backgroundColor: 'black',  // Set background color to black
    paddingVertical: 10,      // Add vertical padding
    paddingHorizontal: 20,    // Add horizontal padding
    borderRadius: 5,          // Round the corners of the button
    alignItems: 'center',     // Center-align the content (text) inside the button
    justifyContent: 'center', // Vertically center the text
    width: '80%',             // Make the button take 80% of the screen width
  },
  buttonText: {
    color: '#fff',            // White text for contrast
    fontSize: 16,             // Set the font size
    fontWeight: 'bold',       // Make the text bold
    textAlign: 'center',      // Center-align the text within the button
  },  
  card: {
    width: '33%',
    height: 220,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 15,
  },
  coverImage: {
    width: '100%',
    height: 100,
  },
  logoContainer: {
    position: 'absolute',
    top: 70,
    left: 15,
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 40,
    height: 40,
  },
  content: {
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
    textAlign: 'center',
  },
  avgRoommateLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
  },
  moreDetails: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
    textDecorationLine: 'underline',  // Underline the text
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default ViewPlansCard;
