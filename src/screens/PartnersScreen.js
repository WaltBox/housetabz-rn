// src/screens/PartnersScreen.js
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
import apiClient from "../config/api";

const { width } = Dimensions.get("window");
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2;

const PartnersScreen = () => {
  const { user, token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealsCount, setDealsCount] = useState(0);
  const cardScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadPartners();
    loadDealsCount();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/api/partners");
      setPartners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Couldn’t load partners. Pull to retry.");
    } finally {
      setLoading(false);
    }
  };

  const loadDealsCount = async () => {
    try {
      const res = await apiClient.get("/api/deals");
      setDealsCount(res.data.deals.length);
    } catch (e) {
      console.error("Deals count error:", e);
    }
  };

  const onCardPress = (p) => {
    setSelectedPartner(p);
    Animated.spring(cardScale, {
      toValue: 0.96,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      setSelectedPartner(null);
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["#34d399", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.textGroup}>
            <Text style={styles.title}>Pay with HouseTabz at...</Text>
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

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={styles.loadingText}>Loading partners…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={32} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPartners}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        {partners.map((p) => (
          <Animated.View key={p.id} style={{ transform: [{ scale: cardScale }] }}>
            <CompanyCardComponent
              name={p.name}
              logoUrl={p.logo}
              coverUrl={p.marketplace_cover}
              onPress={() => onCardPress(p)}
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {dealsCount > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleGroup}>
                <MaterialIcons name="auto-awesome" size={24} color="#34d399" />
                <Text style={styles.sectionTitle}>Special Deals</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{dealsCount} available</Text>
              </View>
            </View>
            <SpecialDeals />
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.subTitle}>Our Partners</Text>
          {renderBody()}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedPartner}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          {selectedPartner && (
            <ViewCompanyCard
              partner={selectedPartner}
              visible
              onClose={closeModal}
              userId={user.id}
              jwtToken={token}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PartnersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  headerContainer: {
    width: "100%",
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 24,    // increased for taller banner
    paddingHorizontal: 24,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 28,           // reduced from 28
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    fontFamily: "Montserrat-Black",
  },
  headerImage: {
    width: 120,
    height: 80,
  },
  scroll: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "Montserrat-Bold",
  },
  badge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#34d399",
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    paddingHorizontal: CARD_GUTTER,
    marginBottom: 12,
    fontFamily: "Montserrat-Black",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: CARD_GUTTER,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 24,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#34d399",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
});
