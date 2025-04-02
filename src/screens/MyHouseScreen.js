// HouseTabzScreen.jsx
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import apiClient from "../config/api";

// Existing modals/components
import ModalComponent from "../components/ModalComponent";
import CurrentHouseTab from "../modals/CurrentHouseTab";
import PaidHouseTabz from "../modals/PaidHouseTabz";
import HouseServicesModal from "../modals/HouseServicesModal";

// New components
import HouseHeader from "../components/myhouse/HouseHeader";
import HSIComponent from "../components/myhouse/HSIComponent";
import StatsSection from "../components/myhouse/StatsSection";
import Scoreboard from "../components/myhouse/Scoreboard";
import ActionCards from "../components/myhouse/ActionCards";
import InviteModalContent from "../components/myhouse/InviteModalContent";

const { width } = Dimensions.get("window");

const HouseTabzScreen = () => {
  const { user } = useAuth();
  const [house, setHouse] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isCurrentTabVisible, setIsCurrentTabVisible] = useState(false);
  const [isPaidTabVisible, setIsPaidTabVisible] = useState(false);
  const [isServicesVisible, setIsServicesVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Tab navigation state
  const [selectedTab, setSelectedTab] = useState("house"); // "house" or "billTakeover"

  const getInviteLink = () => `https://housetabz.com/join/${user?.houseId}`;

  const handleShare = async (shareType = 'default', houseData = null) => {
    try {
      let shareOptions = {
        message: `Join my house on HouseTabz!\n${getInviteLink()}`,
        url: getInviteLink(),
        title: "Join my house on HouseTabz",
      };
      
      // You can customize the share options based on shareType
      if (shareType === 'email') {
        shareOptions.subject = "Join my HouseTabz";
      } else if (shareType === 'message') {
        // Custom options for messaging apps
      }
      
      const result = await Share.share(shareOptions);
      if (result.action === Share.sharedAction) {
        setShowInviteModal(false);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const copyToClipboard = (text = null) => {
    const contentToCopy = text || getInviteLink();
    Clipboard.setString(contentToCopy);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const fetchHouseData = async () => {
    try {
      if (!user?.houseId) {
        setError("No house assigned. Please join a house first.");
        setLoading(false);
        return;
      }
      const response = await apiClient.get(`/api/houses/${user.houseId}`);
      setHouse(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching house data:", err);
      setError(err.response?.data?.message || "Failed to load house data");
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

  if (loading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );

  if (error)
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHouseData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  if (!user?.houseId)
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="home" size={48} color="#64748b" />
        <Text style={styles.errorText}>No House Assigned</Text>
        <Text style={styles.subErrorText}>Join a house to view this screen</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {selectedTab === "house" ? (
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
          <HouseHeader
            houseName={house?.name}
            onInvitePress={() => setShowInviteModal(true)}
          />

<HSIComponent 
  house={house} 
  houseBalance={house?.finance?.balance} 
  houseLedger={house?.finance?.ledger}
  onInfoPress={() => setShowTooltip(true)} 
/>
          {/* <StatsSection house={house} /> */}

          <Scoreboard 
  house={house} 
  houseFinance={house?.finance} 
/>

<ActionCards
  houseBalance={house?.finance?.balance}
  onCurrentTabPress={() => setIsCurrentTabVisible(true)}
  onPaidTabPress={() => setIsPaidTabVisible(true)}
  onServicesPress={() => setIsServicesVisible(true)}
/>
        </ScrollView>
      ) : (
        <View style={styles.billTakeoverContainer}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 20 }}>
            Bill Takeover Feature
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b' }}>
            This feature is coming soon! You'll be able to take over bills from your roommates.
          </Text>
        </View>
      )}
      
      {/* Current Tab Modal */}
      <ModalComponent
        visible={isCurrentTabVisible}
        onClose={() => setIsCurrentTabVisible(false)}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <CurrentHouseTab 
          house={house} 
          onClose={() => setIsCurrentTabVisible(false)} 
        />
      </ModalComponent>
      
      {/* Paid Tab Modal */}
      <ModalComponent
        visible={isPaidTabVisible}
        onClose={() => setIsPaidTabVisible(false)}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <PaidHouseTabz 
          house={house} 
          onClose={() => setIsPaidTabVisible(false)} 
        />
      </ModalComponent>
      
      {/* House Services Modal */}
      <ModalComponent
        visible={isServicesVisible}
        onClose={() => setIsServicesVisible(false)}
        fullScreen={true}
        backgroundColor="#dff6f0"
      >
        <HouseServicesModal 
          house={house} 
          onClose={() => setIsServicesVisible(false)} 
        />
      </ModalComponent>

      {/* HSI Info Tooltip */}
      {showTooltip && (
        <TouchableOpacity
          style={styles.tooltipOverlay}
          activeOpacity={1}
          onPress={() => setShowTooltip(false)}
        >
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>House Status Index (HSI)</Text>
            <Text style={styles.tooltipText}>
              The HSI represents the health and activity of your house. Higher numbers indicate a more active and responsible house.
            </Text>
            <TouchableOpacity
              style={styles.tooltipButton}
              onPress={() => setShowTooltip(false)}
            >
              <Text style={styles.tooltipButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Invite Modal - Now using the same approach as tooltip */}
      {showInviteModal && (
        <TouchableOpacity
          style={styles.tooltipOverlay}
          activeOpacity={1}
          onPress={() => setShowInviteModal(false)}
        >
          <View style={styles.tooltip}>
            <InviteModalContent
              houseId={user?.houseId}
              onCopy={copyToClipboard}
              onShare={handleShare}
              onClose={() => setShowInviteModal(false)}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#34d399',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#34d399',
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff6f0",
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
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
  billTakeoverContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "#dff6f0",
  },
  tooltipOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: width - 48,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  tooltipText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 16,
  },
  tooltipButton: {
    backgroundColor: "#34d399",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  tooltipButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HouseTabzScreen;