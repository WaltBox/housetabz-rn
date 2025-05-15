import { Linking } from 'react-native';

/**
 * Navigation service to centralize navigation actions
 */
const NavigationService = {
  /**
   * Opens a URL in the in-app browser
   * 
   * @param {object} navigation - React Navigation object
   * @param {string} url - URL to open
   * @param {string} title - Optional title for the browser header
   */
  openInBrowser: (navigation, url, title = '') => {
    try {
      if (navigation) {
        navigation.navigate('InAppBrowser', { url, title });
      } else {
        // Fallback to external browser
        Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      // Fallback to external browser if there's an error
      Linking.openURL(url);
    }
  },

  /**
   * Opens the Terms of Service page
   * 
   * @param {object} navigation - React Navigation object
   */
  openTermsOfService: (navigation) => {
    NavigationService.openInBrowser(
      navigation, 
      'https://www.housetabz.com/terms', 
      'Terms of Service'
    );
  },

  /**
   * Opens the Privacy Policy page
   * 
   * @param {object} navigation - React Navigation object
   */
  openPrivacyPolicy: (navigation) => {
    NavigationService.openInBrowser(
      navigation, 
      'https://www.housetabz.com/privacy', 
      'Privacy Policy'
    );
  },

  /**
   * Opens the Help Center
   * 
   * @param {object} navigation - React Navigation object
   */
  openHelpCenter: (navigation) => {
    NavigationService.openInBrowser(
      navigation, 
      'https://www.housetabz.com/help', 
      'Help Center'
    );
  }
};

export default NavigationService;