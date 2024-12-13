import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const InAppBrowser = ({ route }) => {
  const { url } = route.params;
  const navigation = useNavigation();

  const handleClose = () => {
    navigation.goBack(); // Navigates back to the previous screen
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button and URL */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color="#6A0DAD" />
        </TouchableOpacity>
        <Text style={styles.urlText} numberOfLines={1}>
          {url}
        </Text>
      </View>

      {/* WebView */}
      <WebView source={{ uri: url }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  urlText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    textAlign: 'left',
  },
});

export default InAppBrowser;
