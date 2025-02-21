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
import axios from "axios";

const { width, height } = Dimensions.get("window");
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2;
const API_URL = "http://localhost:3004";

const MarketplaceScreen = () => {
  const { user } = useAuth();
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
        const response = await axios.get(`${API_URL}/api/deals`);
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
      const { data } = await axios.get(`${API_URL}/api/partners`);
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
      <View style={styles.solidHeader}>
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
      </View>
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
        {/* Special Deals Section with Header */}
        <View style={styles.chartCard}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleGroup}>
              <MaterialIcons name="local-offer" size={20} color="#22c55e" style={styles.icon} />
              <Text style={styles.chartTitle}>Special Deals</Text>
            </View>
            {specialDealsCount > 0 && (
              <View style={styles.taskBadge}>
                <Text style={styles.taskBadgeText}>{specialDealsCount} available</Text>
              </View>
            )}
          </View>
          <SpecialDeals />
        </View>

        {/* Featured Services */}
        <View style={styles.partnerGridContainer}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
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
    backgroundColor: "#dff1f0", // Changed to match Dashboard background
  },
  headerContainer: {
    width: "100%",
    zIndex: 10,
    marginBottom: -height * 0.07,
  },
  solidHeader: {
    backgroundColor: "#34d399",
    height: 110,
    paddingHorizontal: 24,
    borderBottomRightRadius: 50,
    justifyContent: "center",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 4,
  },
  headerImage: {
    width: 130,
    height: 80,
  },
  scrollContainer: {
    paddingTop: 110,
    paddingBottom: 40,
  },
  // Chart Card styling to match Dashboard task section
  chartCard: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  taskBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  taskBadgeText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '500',
  },
  icon: {
    marginRight: 8,
  },
  partnerGridContainer: {
    marginTop: 8,
    paddingHorizontal: CARD_GUTTER,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
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