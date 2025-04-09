import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CompanyCardComponent from "../components/CompanyCardComponent";
import ViewCompanyCard from "../modals/ViewCompanyCard";
import SpecialDeals from "../components/SpecialDeals";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "../config/api"; // Import apiClient instead of axios

const { width, height } = Dimensions.get("window");
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2;

const MarketplaceScreen = () => {
  const { user, token } = useAuth();
  const [partnerDetails, setPartnerDetails] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialDealsCount, setSpecialDealsCount] = useState(0);
  const cardScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    fetchPartnerDetails();
  }, []);

  useEffect(() => {
    // Fetch deals count for the Special Deals header
    const fetchDealsCount = async () => {
      try {
        const response = await apiClient.get(`/api/deals`);
        setSpecialDealsCount(response.data.deals.length);
      } catch (err) {
        console.error("Error fetching deals count:", err);
      }
    };

    fetchDealsCount();
  }, []);

  const fetchPartnerDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get(`/api/partners`);
      setPartnerDetails(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load marketplace data. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPress = (partner) => {
    setSelectedPartner(partner);
    Animated.spring(cardScale, {
      toValue: 0.96,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => setSelectedPartner(null));
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#34d399', '#10b981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>HouseTabz</Text>
            <Text style={styles.headerSubtitle}>Marketplace</Text>
          </View>
          <Image
            source={require("../../assets/housetabz-marketplace3.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
    </View>
  );

  const renderPartnerGrid = () => {
    if (isLoading)
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={styles.loadingText}>Loading Marketplace...</Text>
        </View>
      );

    if (error)
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={32} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPartnerDetails}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );

    return (
      <View style={styles.cardGrid}>
        {partnerDetails.map((partner) => (
          <Animated.View key={partner.id} style={{ transform: [{ scale: cardScale }] }}>
            <CompanyCardComponent
              name={partner.name}
              logoUrl={partner.logo}
              coverUrl={partner.marketplace_cover}
              onPress={() => handleCardPress(partner)}
              cardWidth={CARD_WIDTH}
            />
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Special Deals Section */}
        {specialDealsCount > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleGroup}>
                <MaterialIcons name="auto-awesome" size={24} color="#22c55e" />
                <Text style={styles.sectionTitle}>Special Deals</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{specialDealsCount} available</Text>
              </View>
            </View>
            <SpecialDeals />
          </View>
        )}

        {/* Featured Services */}
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Featured Services</Text>
          {renderPartnerGrid()}
        </View>
      </ScrollView>
      
      <Modal
        visible={!!selectedPartner}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
        {selectedPartner && (
  <ViewCompanyCard
    partner={selectedPartner}
    visible={!!selectedPartner}
    onClose={handleCloseModal}
    userId={user?.id}
    jwtToken={token}  // Use token from AuthContext
  />
)}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff1f0",
  },
  headerContainer: {
    width: "100%",
    overflow: "hidden",
  },
  gradient: {
    paddingTop: 20, // Reduced padding top to center content better
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: 'Montserrat-Black',
  },
  headerSubtitle: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 4,
    fontFamily: 'Montserrat-Medium',
    opacity: 0.9,
  },
  headerImage: {
    width: 130,
    height: 80,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
    fontFamily: 'Montserrat-Black',
  },
  countBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  countBadgeText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
  featuredSection: {
    marginTop: 8,
    paddingHorizontal: CARD_GUTTER,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: 'Montserrat-Black',
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    margin: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#34d399",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
});

export default MarketplaceScreen;
