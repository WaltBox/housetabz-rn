import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';

const UserFeedbackModal = () => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter your feedback.');
      return;
    }

    Alert.alert('Thank You!', 'Your feedback has been submitted.');
    setFeedback(''); // Clear input after submission
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Text style={styles.title}>We’d love to hear from you!</Text>
      <Text style={styles.subtitle}>How can we make HouseTabz even better?</Text>

      {/* Feedback Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Write your feedback here..."
          placeholderTextColor="#aaa"
          value={feedback}
          onChangeText={setFeedback}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
          <Text style={styles.sendButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Peeking Image */}
      <Image
        source={require('../../assets/feedbacktabz.png')}
        style={styles.peekingLogo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#f9f5f0'   
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textInput: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    fontSize: 14,
    marginBottom: 10,
  },
  sendButton: {
    alignSelf: 'center',
    backgroundColor: '#28a745', // Green for submission button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
    elevation: 2,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  peekingLogo: {
    width: 100,
    height: 250,
    position: 'absolute',
    bottom: -35, // Slightly below the screen
    right: -40, // Slightly to the right
    transform: [{ rotate: '-10deg' }], // Fun playful tilt
    opacity: 0.9,
  },
});

export default UserFeedbackModal;
