import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const InAppBrowser = ({ route }) => {
  const { url } = route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => {
    navigation.goBack();
  };

  // Handle WebView errors
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
  };

  // Handle loading state
  const handleLoadStart = () => setIsLoading(true);
  const handleLoadEnd = () => setIsLoading(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color="#6A0DAD" />
        </TouchableOpacity>
        <Text style={styles.urlText} numberOfLines={1}>
          {url}
        </Text>
      </View>

      <WebView 
        source={{ 
          uri: url,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        scalesPageToFit={true}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A0DAD" />
        </View>
      )}
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
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default InAppBrowser;