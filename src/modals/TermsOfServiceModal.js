import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import ModalComponent from '../components/ModalComponent';

/**
 * Terms of Service Modal Component using the app's existing ModalComponent
 */
const TermsOfServiceModal = ({ visible = false, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const termsUrl = 'https://www.housetabz.com/terms';

  // Handle loading state
  const handleLoadStart = () => setIsLoading(true);
  const handleLoadEnd = () => setIsLoading(false);
  
  return (
    <ModalComponent 
      visible={visible} 
      onClose={onClose}
      title="Terms of Service"
      fullScreen={true}
      backgroundColor="#dff6f0"
      useBackArrow={true}
    >
      <View style={styles.webViewContainer}>
        <WebView
          source={{ 
            uri: termsUrl,
            headers: {
              'Cache-Control': 'no-cache'
            }
          }}
          style={styles.webView}
          startInLoadingState={true}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34d399" />
          </View>
        )}
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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

export default TermsOfServiceModal;