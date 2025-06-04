import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  SafeAreaView, 
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#6A0DAD" />
          </TouchableOpacity>
          <Text style={styles.urlText} numberOfLines={1}>
            {url}
          </Text>
        </View>

        {/* WebView container - pushed down from top */}
        <View style={styles.webViewContainer}>
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
            style={styles.webView}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6A0DAD" />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 50,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  urlText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    textAlign: 'left',
  },
  // WebView container styles
  webViewContainer: {
    height: height * 0.85, // Take up 85% of screen height
    marginTop: 40, // Push down from the top by 40 pixels
    marginHorizontal: 15, // Add horizontal margins
    borderRadius: 15, // Rounded corners
    overflow: 'hidden', // Ensure WebView respects border radius
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#ffffff',
    // Add shadow on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Add  on Android

  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
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