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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CompanyCardComponent from "../components/CompanyCardComponent";
import ViewCompanyCard from "../modals/ViewCompanyCard";
import SpecialDeals from "../components/SpecialDeals";
import axios from "axios";

const screenWidth = Dimensions.get("window").width;
const API_URL = "http://localhost:3004"; // Consider moving to config file

const MarketplaceScreen = () => {
  // State management
  const [partnerDetails, setPartnerDetails] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scaleValue] = useState(new Animated.Value(1));

  // Fetch partner data
  useEffect(() => {
    fetchPartnerDetails();
  }, []);

  const fetchPartnerDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/partners`);
      console.log('Raw API response:', response); // Log full response
      console.log('Partner data type:', typeof response.data); // Check data type
      console.log('Partner data:', response.data); // Log actual data
  
      // Ensure we're getting an array
      const partners = Array.isArray(response.data) ? response.data : 
                      response.data.partners ? response.data.partners : [];
      
      setPartnerDetails(partners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setError('Unable to load marketplace data. Please try again later.');
      setPartnerDetails([]); // Ensure we set an empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Animation handlers
  const handleCardPress = (partner) => {
    setSelectedPartner(partner);
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedPartner(null));
  };

  // Render helpers
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["#22c55e", "#22c55e"]}
        style={styles.gradientBackground}
      >
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>HouseTabz</Text>
          <Text style={styles.headerText}>Marketplace</Text>
        </View>
        <Image
          source={require("../../assets/housetabz-marketplace3.png")}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </LinearGradient>
    </View>
  );

  const renderPartnerCards = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
  
    // Ensure partnerDetails is an array
    const partners = Array.isArray(partnerDetails) ? partnerDetails : [];
  
    if (partners.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.noDataText}>No companies available</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.cardGrid}>
        {partners.map((partner) => (
          <View key={partner.id} style={styles.cardContainer}>
            <CompanyCardComponent
              name={partner.name}
              description={partner.about}
              logoUrl={partner.logo}
              coverUrl={partner.marketplace_cover}
              onPress={() => handleCardPress(partner)}
              cardWidth={(screenWidth - 60) / 2}
            />
          </View>
        ))}
      </View>
    );
  };

  // Main render
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.specialDealsContainer}>
          <SpecialDeals />
        </View>

        <View style={styles.cardsContainer}>
          {renderPartnerCards()}
        </View>
      </ScrollView>

      {selectedPartner && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalBackground}>
            <ViewCompanyCard
              partner={selectedPartner}
              visible={true}
              onClose={handleCloseModal}
            />
          </View>
        </Modal>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f5f0",
  },
  headerContainer: {
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  gradientBackground: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 120,
    borderBottomRightRadius: 60,
    paddingLeft: 20,
    paddingRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "montserrat-bold",
    color: "#FFFFFF",
  },
  headerImage: {
    width: 150,
    height: 100,
    marginLeft: 10,
  },
  scrollContainer: {
    paddingTop: 140,
    paddingHorizontal: 20,
  },
  specialDealsContainer: {
    marginBottom: 10,
  },
  cardsContainer: {
    marginTop: -30,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  cardContainer: {
    width: (screenWidth - 60) / 2,
    height: 220,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
  },
  noDataText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});

export default MarketplaceScreen;