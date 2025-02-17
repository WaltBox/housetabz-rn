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
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import CompanyCardComponent from "../components/CompanyCardComponent";
import ViewCompanyCard from "../modals/ViewCompanyCard";
import SpecialDeals from "../components/SpecialDeals";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2; // Back to 2 per row (normal size)
const API_URL = "http://localhost:3004";

const MarketplaceScreen = () => {
  const [partnerDetails, setPartnerDetails] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    fetchPartnerDetails();
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
      <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.gradientBackground}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerText}>HouseTabz Marketplace</Text>
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
          <ActivityIndicator size="large" color="#22c55e" />
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
          <Animated.View key={partner.id} style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
            <CompanyCardComponent
              name={partner.name}
              description={partner.about}
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

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Special Deals Section */}
        <View style={styles.specialDealsContainer}>
          <Text style={styles.sectionTitle}>Exclusive Offers 🎁</Text>
          <SpecialDeals />
        </View>

        {/* Partner Grid */}
        <View style={styles.partnerGridContainer}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          {renderPartnerGrid()}
        </View>
      </ScrollView>

      <Modal visible={!!selectedPartner} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ViewCompanyCard partner={selectedPartner} onClose={handleCloseModal} />
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
            <MaterialIcons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  headerContainer: {
    width: "100%",
    zIndex: 10,
    marginBottom: -height * 0.07, // Moves everything up ~10% screen height
  },
  gradientBackground: {
    height: 110,
    paddingHorizontal: 24,
    borderBottomRightRadius: 50,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerImage: {
    width: 130,
    height: 80,
  },
  scrollContainer: {
    paddingTop: 110,
    paddingHorizontal: CARD_GUTTER,
    paddingBottom: 40,
  },
  specialDealsContainer: {
    marginBottom: 24,
    marginTop: -height * 0.05, // Moves Special Deals section up slightly
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  partnerGridContainer: {
    marginTop: 8,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: CARD_GUTTER,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 10,
  },
});

export default MarketplaceScreen;
