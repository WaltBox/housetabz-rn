import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Share,
  Clipboard,
  StatusBar,
  SafeAreaView,
  TouchableWithoutFeedback,
  Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import apiClient from "../config/api";

// Existing modals/components
import ModalComponent from "../components/ModalComponent";
import CurrentHouseTab from "../modals/CurrentHouseTab";
import PaidHouseTabz from "../modals/PaidHouseTabz";
import HouseServicesModal from "../modals/HouseServicesModal";
import HSIModal from "../modals/HSIModal";
// Updated components
import HouseHeader from "../components/myhouse/HouseHeader";
import HouseFinancialHealth from "../components/myhouse/HouseFinancialHealth"; // New unified component
import Scoreboard from "../components/myhouse/Scoreboard";
import ActionCards from "../components/myhouse/ActionCards"; // Keep ActionCards!
import InviteModalContent from "../components/myhouse/InviteModalContent";

// Import the skeleton component
import HouseTabzSkeleton from "../components/skeletons/HouseTabzSkeleton";

const { width } = Dimensions.get("window");

const HouseTabzScreen = () => {
  const { user } = useAuth();
  const [house, setHouse] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);

  // NEW: Add state for bills data
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isCurrentTabVisible, setIsCurrentTabVisible] = useState(false);
  const [isPaidTabVisible, setIsPaidTabVisible] = useState(false);
  const [isServicesVisible, setIsServicesVisible] = useState(false);
  const [isHSIModalVisible, setIsHSIModalVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Tab navigation state
  const [selectedTab, setSelectedTab] = useState("house"); // "house" or "billTakeover"

  const getInviteLink = () => `https://housetabz.com/join/${user?.houseId}`;

  const handleShare = async (shareType = 'default') => {
    try {
      const shareOptions = {
        message: `Join my house on HouseTabz!\n${getInviteLink()}`,
        url: getInviteLink(),
        title: "Join my house on HouseTabz",
        ...(shareType === 'email' && { subject: "Join my HouseTabz" }),
      };
      const result = await Share.share(shareOptions);
      if (result.action === Share.sharedAction) {
        setShowInviteModal(false);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const copyToClipboard = (text = null) => {
    Clipboard.setString(text || getInviteLink());
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  // UPDATED: New optimized fetch function
  const fetchHouseData = async () => {
    try {
      if (!user?.houseId) {
        setError("No house assigned. Please join a house first.");
        setLoading(false);
        return;
      }

      setError(null);
      if (!refreshing) setLoading(true);

      console.log('Trying new tabs-data endpoint for house:', user.houseId);
      
      // Single API call with all data needed for tabs
      const { data } = await apiClient.get(`/api/houses/${user.houseId}/tabs-data`);
      
      console.log('New endpoint success! Data received:', {
        house: data.house?.name,
        unpaidBills: data.unpaidBills?.length,
        paidBills: data.paidBills?.length,
        houseBalance: data.house?.houseBalance,
        summary: data.summary
      });
      
      // Set the main house data
      setHouse(data.house);
      
      // Store the bills data for modals
      setUnpaidBills(data.unpaidBills || []);
      setPaidBills(data.paidBills || []);
      
      setError(null);
    } catch (err) {
      console.error("New endpoint failed with error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Fallback to original endpoint if new one fails
      try {
        console.log('Falling back to original house endpoint...');
        const { data } = await apiClient.get(`/api/houses/${user.houseId}`);
        setHouse(data);
        // Clear bills data since we don't have it
        setUnpaidBills([]);
        setPaidBills([]);
      } catch (fallbackErr) {
        setError(fallbackErr.response?.data?.message || "Failed to load house data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchHouseData();
  }, [user?.id, user?.houseId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHouseData();
  };

  const handleHSIInfoPress = () => {
    setIsHSIModalVisible(true);
  };

  // Show skeleton while loading (not refreshing)
  if (loading && !refreshing) {
    return <HouseTabzSkeleton />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHouseData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!user?.houseId) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
        <MaterialIcons name="home" size={48} color="#64748b" />
        <Text style={styles.errorText}>No House Assigned</Text>
        <Text style={styles.subErrorText}>Join a house to view this screen</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        {selectedTab === "house" ? (
          <>
            {/* Header */}
            <View style={styles.headerContainer}>
              <HouseHeader
                houseName={house?.name}
                onInvitePress={() => setShowInviteModal(true)}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#34d399"
                />
              }
            >
              {/* UPDATED: House Financial Health (replaces just HSI) */}
              <View style={styles.section}>
                <HouseFinancialHealth
                  house={house}
                  onCurrentTabPress={() => setIsCurrentTabVisible(true)}
                  onInfoPress={handleHSIInfoPress}
                />
              </View>
              
              {/* Section: Scoreboard */}
              <View style={styles.section}>
                <Scoreboard
                  house={house}
                  houseFinance={house?.finance}
                />
              </View>
              
              {/* Section: Action Cards */}
              <View style={styles.actionCardsSection}>
                <ActionCards
                  houseBalance={house?.houseBalance}
                  onCurrentTabPress={() => setIsCurrentTabVisible(true)}
                  onPaidTabPress={() => setIsPaidTabVisible(true)}
                />
              </View>
            </ScrollView>
          </>
        ) : (
          <View style={styles.billTakeoverContainer}>
            <Text style={styles.billTitle}>Bill Takeover Feature</Text>
            <Text style={styles.billSubtitle}>
              This feature is coming soon! You'll be able to take over bills from your roommates.
            </Text>
          </View>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <TouchableWithoutFeedback onPress={() => setShowInviteModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContainer}>
                  <InviteModalContent
                    houseId={user?.houseId}
                    onCopy={copyToClipboard}
                    onShare={handleShare}
                    onClose={() => setShowInviteModal(false)}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* HSI Modal */}
        {isHSIModalVisible && (
          <ModalComponent
            visible={true}
            onClose={() => setIsHSIModalVisible(false)}
            fullScreen={true}
            hideCloseButton={true}
            backgroundColor="#dff6f0"
            useBackArrow={false}
          >
            <HSIModal 
              onClose={() => setIsHSIModalVisible(false)} 
            />
          </ModalComponent>
        )}

        {/* UPDATED: CurrentHouseTab Modal - now passes pre-loaded data */}
        {isCurrentTabVisible && (
          <ModalComponent
            visible={true}
            onClose={() => setIsCurrentTabVisible(false)}
            fullScreen={true}
            hideCloseButton={true}
            backgroundColor="#dff6f0"
            useBackArrow={false}
          >
            <CurrentHouseTab 
              onClose={() => setIsCurrentTabVisible(false)} 
              house={house}
              bills={unpaidBills} // Pass pre-loaded bills data
            />
          </ModalComponent>
        )}

        {/* UPDATED: PaidHouseTabz Modal - now passes pre-loaded data */}
        {isPaidTabVisible && (
          <ModalComponent
            visible={true}
            onClose={() => setIsPaidTabVisible(false)}
            fullScreen={true}
            hideCloseButton={true}
            backgroundColor="#dff6f0"
            useBackArrow={false}
          >
            <PaidHouseTabz 
              onClose={() => setIsPaidTabVisible(false)} 
              house={house}
              paidBills={paidBills} // Pass pre-loaded bills data
            />
          </ModalComponent>
        )}

        {/* HouseServices Modal */}
        {isServicesVisible && (
          <ModalComponent
            visible={true}
            onClose={() => setIsServicesVisible(false)}
            fullScreen={true}
            hideCloseButton={true}
            backgroundColor="#dff6f0"
            useBackArrow={false}
          >
            <HouseServicesModal 
              onClose={() => setIsServicesVisible(false)} 
              house={house}
            />
          </ModalComponent>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  headerContainer: {
    paddingBottom: 8,
    backgroundColor: "#dff6f0",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff6f0",
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  actionCardsSection: {
    marginBottom: 24,
  },
  billTakeoverContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "#dff6f0",
  },
  billTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  billSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#34d399",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  subErrorText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 9000,
  },
  modalContainer: {
    width: "100%",
    maxWidth: width - 48,
  },
});

export default HouseTabzScreen;