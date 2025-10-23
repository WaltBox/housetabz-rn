import React, { useState, useEffect } from "react";
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
import PaymentFlow from '../modals/PaymentFlow';
import ConsentConfirmationModal from './ConsentConfirmationModal';
import { LinearGradient } from "expo-linear-gradient";
import { getPartnerDetails } from '../config/api';

const { height } = Dimensions.get("window");
const MODAL_HEIGHT = height * 0.94;

const ViewCompanyCard = ({ visible, onClose, partner, userId, jwtToken }) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Add these new state variables
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  
  // Consent modal state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentData, setConsentData] = useState(null);
  
  // State for detailed partner data
  const [detailedPartner, setDetailedPartner] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  
  // Fetch detailed partner information when component opens
  useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (!visible || !partner?.id) return;
      
      setLoadingDetails(true);
      setDetailsError(null);
      
      try {
        console.log('🔍 Fetching details for partner:', partner.id, partner.name);
        const response = await getPartnerDetails(partner.id);
        
        if (response?.partner) {
          setDetailedPartner(response.partner);
          console.log('✅ Partner details loaded:', response.partner.name);
        } else {
          console.warn('⚠️ No partner data in response:', response);
          setDetailsError('Partner details not found');
        }
      } catch (error) {
        console.error('❌ Error loading partner details:', error);
        setDetailsError('Failed to load partner details');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchPartnerDetails();
  }, [visible, partner?.id]);
  
  const webviewRef = React.useRef(null);
  if (!visible || !partner) return null;

  const getInjectedScript = () => {
    return `
      (function() {
        try {
          // Only set the HouseTabz WebView identifier
          window.sessionStorage.setItem('housetabz_webview', 'true');
          
          // We can keep user ID for analytics/tracking if needed
          // (but not really required for authentication anymore)
          window.sessionStorage.setItem('housetabz_user_id', '${userId || ""}');
          
          // Log for debugging
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'log',
            message: 'Session Storage Check',
            data: {
              isHouseTabzWebView: window.sessionStorage.getItem('housetabz_webview'),
              storedUserId: window.sessionStorage.getItem('housetabz_user_id')
            }
          }));
  
          // Override console.log for debugging
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
      // Use detailed partner data if available, otherwise fallback to basic partner data
      const partnerData = detailedPartner || partner.partner || partner;
      
      // Get the base URL from partner.link
      const baseUrl = partnerData.link;
      
      console.log('Partner data:', partnerData);
      console.log('Partner link from data:', baseUrl);
      
      if (!baseUrl) {
        console.error('Partner link is missing for:', partnerData.name);
        return '';
      }
      
      // Add query parameters back
      const finalUrl = `${baseUrl}?ref=housetabz&partner_id=${partnerData.id || '2'}&user_id=${userId || ''}`;
      
      // Add cache busting in development mode
      let urlToUse = finalUrl;
      if (__DEV__) {
        urlToUse = `${finalUrl}&cacheBust=${Date.now()}`;
      }
      
      console.log('Constructed URL:', urlToUse);
      return urlToUse;
    } catch (error) {
      console.error('Error constructing URL:', error);
      return '';
    }
  };

  const renderMainContent = () => {
    // Use detailed partner data if available, otherwise fallback to basic partner data
    const displayPartner = detailedPartner || partner;
    
    // Show loading state while fetching details
    if (loadingDetails) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading partner details...</Text>
        </View>
      );
    }
    
    // Show error state if details failed to load
    if (detailsError) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to Load Details</Text>
          <Text style={styles.errorText}>{detailsError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              // Retry fetching details
              setDetailsError(null);
              setLoadingDetails(true);
              getPartnerDetails(partner.id)
                .then(response => {
                  if (response?.partner) {
                    setDetailedPartner(response.partner);
                  } else {
                    setDetailsError('Partner details not found');
                  }
                })
                .catch(error => {
                  console.error('❌ Retry error:', error);
                  setDetailsError('Failed to load partner details');
                })
                .finally(() => setLoadingDetails(false));
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Header Section */}
          <View style={styles.logoHeaderSection}>
            <View style={styles.logoContainer}>
              {displayPartner.logo ? (
                <Image
                  source={{
                    uri: displayPartner.logo,
                    headers: { Pragma: 'no-cache' }
                  }}
                  style={styles.logoImage}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
              ) : (
                <View style={styles.placeholderLogo}>
                  <Text style={styles.placeholderLogoText}>
                    {displayPartner.name.substring(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              {imageLoading && (
                <View style={styles.logoLoadingContainer}>
                  <ActivityIndicator size="small" color="#34d399" />
                </View>
              )}
            </View>
            
            <Text style={styles.payWithText}>Pay with HouseTabz{'\n'}at {displayPartner.name}</Text>
            
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.reviewCount}>(243 reviews)</Text>
            </View>
          </View>

          {/* Content Sections */}
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>
              {displayPartner.about || "No description available."}
            </Text>
          </View>

          <View style={styles.howToSection}>
            <Text style={styles.howToTitle}>How to pay with HouseTabz</Text>
            <Text style={styles.checkoutText}>At checkout, select <Text style={styles.highlightText}>HouseTabz</Text></Text>
            
            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Shop the site</Text>
            </View>
            
            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Link to HouseTabz at checkout</Text>
            </View>
          </View>

        </ScrollView>

        {/* Shop Online Divider and Button */}
        <View style={styles.actionContainer}>
          <View style={styles.shopOnlineDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.shopOnlineText}>Shop Online</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => setShowBrowser(true)}
          >
            <Text style={styles.shopButtonText}>Shop</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderBrowser = () => {
    const displayPartner = detailedPartner || partner;
    
    return (
      <View style={styles.browserContainer}>
        <View style={styles.browserHeader}>
          <TouchableOpacity
            style={styles.browserBackButton}
            onPress={() => setShowBrowser(false)}
          >
            <MaterialIcons name="arrow-back" size={24} color="#22c55e" />
          </TouchableOpacity>
          <Text style={styles.browserTitle} numberOfLines={1}>
            {displayPartner.name}
          </Text>
        </View>

      <WebView
        ref={webviewRef}
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
          try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('WebView Message:', data);
            
            // Handle payment request messages - SIMPLIFIED (no pre-check)
            if (data.type === 'housetabz_payment_request') {
              console.log('Payment request received:', data.data);
              setPaymentData(data.data);
              setShowPaymentModal(true);
            }
          } catch (error) {
            console.error('Error processing WebView message:', error);
          }
        }}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        )}
      />
    </View>
    );
  };

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

      {/* Payment Modal - FIXED */}
      {showPaymentModal && paymentData && (
        <PaymentFlow
          visible={showPaymentModal}
          onClose={() => {
            console.log('PaymentFlow: User manually closed modal');
            setShowPaymentModal(false);
            // Send cancellation response back to WebView
            if (webviewRef.current) {
              webviewRef.current.injectJavaScript(`
                window.dispatchEvent(new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'housetabz_payment_response',
                    status: 'cancel'
                  })
                }));
                true;
              `);
            }
          }}
          paymentData={paymentData}
          onSuccess={(result) => {
            console.log('PaymentFlow: Success received:', result);
            
            // ✅ NEW: Handle consent flow
            if (result.status === 'consent_given') {
              console.log('🎯 Creator consent detected, showing consent modal');
              
              // Close payment modal and show consent confirmation
              setShowPaymentModal(false);
              setConsentData({
                taskData: { 
                  paymentAmount: paymentData?.amount,
                  serviceRequestBundle: {
                    stagedRequest: {
                      serviceName: paymentData?.serviceName
                    }
                  }
                },
                paymentIntentId: result.consentData?.paymentIntentId,
                message: result.consentData?.message
              });
              setShowConsentModal(true);
              
              // Send consent response back to WebView
              if (webviewRef.current) {
                webviewRef.current.injectJavaScript(`
                  window.dispatchEvent(new MessageEvent('message', {
                    data: JSON.stringify({
                      type: 'housetabz_payment_response',
                      status: 'consent_given',
                      data: ${JSON.stringify(result.data)}
                    })
                  }));
                  true;
                `);
              }
              return;
            }
            
            // Handle other success types (existing logic)
            let responseData = {};
            let responseStatus = 'success';
            
            if (result.data?.type === 'already_connected') {
              responseStatus = 'already_connected';
              responseData = {
                serviceName: result.data.serviceName,
                partnerName: result.data.partnerName,
                status: result.data.status
              };
            } else if (result.data?.type === 'reused_agreement') {
              responseStatus = 'success';
              responseData = {
                agreementId: result.data.agreementId,
                serviceName: result.data.serviceName,
                message: result.data.message
              };
            } else {
              responseStatus = 'success';
              responseData = result.data || result;
            }
            
            // Send response back to WebView
            if (webviewRef.current) {
              webviewRef.current.injectJavaScript(`
                window.dispatchEvent(new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'housetabz_payment_response',
                    status: '${responseStatus}',
                    data: ${JSON.stringify(responseData)}
                  })
                }));
                true;
              `);
            }
            
            // Close the modal - ONLY after the entire flow is complete
            setShowPaymentModal(false);
          }}
          onError={(error) => {
            console.log('PaymentFlow: Error received:', error);
            
            // Send error response back to WebView
            if (webviewRef.current) {
              webviewRef.current.injectJavaScript(`
                window.dispatchEvent(new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'housetabz_payment_response',
                    status: 'error',
                    message: ${JSON.stringify(error?.message || 'Payment request failed')}
                  })
                }));
                true;
              `);
            }
            
            // Don't automatically close on error - let user try again or manually close
          }}
        />
      )}
      
      {/* Consent Confirmation Modal */}
      <ConsentConfirmationModal
        visible={showConsentModal}
        onClose={() => {
          setShowConsentModal(false);
          setConsentData(null);
        }}
        taskData={consentData?.taskData}
        paymentIntentId={consentData?.paymentIntentId}
        message={consentData?.message}
      />
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
    paddingBottom: 8,
  },
  logoHeaderSection: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#dff6f0',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.1)',
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoLoadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
  },
  payWithText: {
    fontSize: 24,
    fontFamily: 'Montserrat-Black',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 30,
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
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    backgroundColor: 'rgba(52, 211, 153, 0.03)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  howToSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 0,
  },
  howToTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  checkoutText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  highlightText: {
    fontWeight: '600',
    color: '#34d399',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34d399',
    marginRight: 12,
    width: 20,
  },
  stepText: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#dff6f0',
    alignItems: 'center',
  },
  shopOnlineDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '80%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  shopOnlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginHorizontal: 16,
    backgroundColor: '#dff6f0',
    paddingHorizontal: 8,
  },
  shopButton: {
    backgroundColor: '#34d399',
    borderRadius: 30,
    paddingHorizontal: 60,
    paddingVertical: 16,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 180,
    width: '60%',
  },
  shopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewCompanyCard;