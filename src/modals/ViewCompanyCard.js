import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");
const MODAL_HEIGHT = height * 0.94;

const ViewCompanyCard = ({ visible, onClose, partner, userId }) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!visible || !partner) return null;

  const getInjectedScript = () => {
    return `
      (function() {
        try {
          window.sessionStorage.setItem('housetabz_user_id', '${userId || ""}');
          
          // Send logs back to React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'log',
            message: 'Session Storage Check',
            data: {
              storedUserId: window.sessionStorage.getItem('housetabz_user_id'),
              attemptedId: '${userId || ""}'
            }
          }));

          // Override console.log
          const originalConsole = console.log;
          console.log = (...args) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'console',
              message: args.map(arg => JSON.stringify(arg)).join(' ')
            }));
            originalConsole.apply(console, args);
          };

        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: error.toString()
          }));
        }
      })();
      true;
    `;
  };



  const constructShopUrl = () => {
    try {
      console.log('User ID when constructing shop URL:', userId); // Add this
      const baseUrl = 'https://f932-2605-a601-a0c6-4f00-254d-d042-938f-f537.ngrok-free.app/cleaning-test.html';
      return `${baseUrl}?ref=housetabz&partner_id=${partner.id || '2'}`;
    } catch (error) {
      console.error('Error constructing URL:', error);
      return '';
    }
  };

  const renderMainContent = () => (
    <>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: partner.company_cover || 'https://via.placeholder.com/400',
              headers: { Pragma: 'no-cache' }
            }}
            style={styles.coverImage}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', '#dff6f0']}
            style={styles.imageGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        {/* Company Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.companyName}>{partner.name}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.reviewCount}>(243 reviews)</Text>
          </View>
          {partner.avg_price && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>
                AVG / Roommate: ${parseFloat(partner.avg_price).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Content Sections */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>
            {partner.about || "No description available."}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <Text style={styles.sectionText}>
            {partner.how_to || "No instructions available at the moment."}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Important Information</Text>
          <Text style={styles.sectionText}>
            {partner.important_information || "No additional information available."}
          </Text>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowBrowser(true)}
        >
          <MaterialIcons name="shopping-cart" size={20} color="white" />
          <Text style={styles.actionButtonText}>
            Shop {partner.name}
          </Text>
        </TouchableOpacity>
      
      </View>
    </>
  );

  const renderBrowser = () => (
    <View style={styles.browserContainer}>
      <View style={styles.browserHeader}>
        <TouchableOpacity
          style={styles.browserBackButton}
          onPress={() => setShowBrowser(false)}
        >
          <MaterialIcons name="arrow-back" size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text style={styles.browserTitle} numberOfLines={1}>
          {partner.name}
        </Text>
      </View>

      <WebView
      source={{ 
        uri: constructShopUrl(),
        headers: {
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      }}
      style={styles.webView}
      startInLoadingState={true}
      injectedJavaScript={getInjectedScript()}
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data);
        // Log messages from WebView
        console.log('WebView Message:', data);
      }}
      renderLoading={() => (
        <View style={styles.webviewLoading}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.partnerBadge}>
          <MaterialIcons name="verified" size={16} color="#34d399" />
          <Text style={styles.partnerBadgeText}>Verified Partner</Text>
        </View>
      </View>

      {showBrowser ? renderBrowser() : renderMainContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: MODAL_HEIGHT,
    backgroundColor: "#dff6f0",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#dff6f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  partnerBadgeText: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    height: 200,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
  },
  infoCard: {
    margin: 24,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748b',
  },
  priceBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34d399',
  },
  contentSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748b',
  },
  actionContainer: {
    padding: 24,
    backgroundColor: '#dff6f0',
    borderTopWidth: 1,
    borderTopColor: '#34d399',
  },
  actionButton: {
    backgroundColor: '#34d399',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionNote: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
  },
  browserContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  browserHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  browserBackButton: {
    padding: 8,
    marginRight: 12,
  },
  browserTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default ViewCompanyCard;