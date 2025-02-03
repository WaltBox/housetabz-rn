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

const MarketplaceScreen = () => {
  const [partnerDetails, setPartnerDetails] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scaleValue] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchPartnerDetails();
  }, []);

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching partners...');
      
      const partnerResponse = await axios.get(
        "http://localhost:3004/api/partners"
      );
      
      console.log('Partner Response:', partnerResponse.data);
      
      // Handle both possible response formats
      const partners = partnerResponse.data.partners || partnerResponse.data;
      
      if (Array.isArray(partners)) {
        setPartnerDetails(partners);
        console.log('Partners loaded:', partners.length);
      } else {
        console.log('No partners array found in response');
        setPartnerDetails([]);
      }
    } catch (error) {
      console.error("Error fetching partner details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError('Failed to load partners');
      setPartnerDetails([]);
    } finally {
      setLoading(false);
    }
  };

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

  const renderPartnerCards = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!partnerDetails.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.noDataText}>No companies available</Text>
        </View>
      );
    }

    return partnerDetails.map((partner) => (
      <View key={partner.id} style={styles.cardContainer}>
       <CompanyCardComponent
      name={partner.name}
      description={partner.about}  // Use about instead of description
      logoUrl={partner.logo || null}
      coverUrl={partner.marketplace_cover || null}
      onPress={() => handleCardPress(partner)}
      cardWidth={(screenWidth - 60) / 2}
    />
      </View>
    ));
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleValue }] }]}
    >
      {/* Fixed Header */}
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.specialDealsContainer}>
          <SpecialDeals />
        </View>

        <View style={styles.cardsContainer}>
          <Text style={styles.industryText}>Industry</Text>
          <View style={styles.cardGrid}>
            {renderPartnerCards()}
          </View>
        </View>
      </ScrollView>

      {selectedPartner && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedPartner}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalBackground}>
            <ViewCompanyCard
              partner={selectedPartner}
              visible={!!selectedPartner}
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
  industryText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: "montserrat-bold",
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
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
});

export default MarketplaceScreen;