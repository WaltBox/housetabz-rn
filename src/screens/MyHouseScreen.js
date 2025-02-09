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
  Platform,
} from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from '../context/AuthContext';
import ModalComponent from "../components/ModalComponent";
import CurrentHouseTab from "../modals/CurrentHouseTab";
import PaidHouseTabz from "../modals/PaidHouseTabz";

const { width } = Dimensions.get('window');

const HouseTabzScreen = () => {
  const { user } = useAuth();
  const [house, setHouse] = useState(null);
  const [error, setError] = useState(null);
  const [isCurrentTabVisible, setIsCurrentTabVisible] = useState(false);
  const [isPaidTabVisible, setIsPaidTabVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);

  const getInviteLink = () => `https://housetabz.com/join/${user?.houseId}`;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Join my house on HouseTabz!\n${getInviteLink()}`,
        url: getInviteLink(),
        title: 'Join my house on HouseTabz'
      });
      if (result.action === Share.sharedAction) setShowInviteModal(false);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(getInviteLink());
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
      const response = await axios.get(`http://localhost:3004/api/houses/${user.houseId}`);
      setHouse(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching house data:', err);
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

  const generateSemiCircle = (progress) => {
    const startAngle = 180;
    const endAngle = 180 + 180 * progress;
    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, endAngle);
    const largeArcFlag = progress > 0.5 ? 1 : 0;
    return `M ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const InviteModal = () => (
    <View style={styles.inviteModalContent}>
      <Text style={styles.inviteTitle}>Invite Roommates</Text>
      <Text style={styles.inviteDescription}>
        Share this link with your roommates to join your house
      </Text>
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkText} numberOfLines={1}>{getInviteLink()}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <MaterialIcons 
            name={inviteCopied ? "check" : "content-copy"} 
            size={20} 
            color={inviteCopied ? "#22c55e" : "#64748b"} 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <MaterialIcons name="share" size={20} color="white" />
        <Text style={styles.shareButtonText}>Share Invite Link</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#22c55e" />
    </View>
  );

  if (error) return (
    <View style={styles.centerContainer}>
      <MaterialIcons name="error-outline" size={48} color="#ef4444" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchHouseData}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user?.houseId) return (
    <View style={styles.centerContainer}>
      <MaterialIcons name="home" size={48} color="#64748b" />
      <Text style={styles.errorText}>No House Assigned</Text>
      <Text style={styles.subErrorText}>Join a house to view this screen</Text>
    </View>
  );

  const hsiProgress = house ? house.hsi / 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
      >
        {/* Improved Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.houseName} numberOfLines={1}>
              {house?.name || "Loading..."}
            </Text>
            <TouchableOpacity 
              style={styles.inviteButton}
              onPress={() => setShowInviteModal(true)}
            >
              <MaterialIcons name="link" size={18} color="white" />
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.underline} />
        </View>

        <View style={styles.hsiCard}>
          <View style={styles.progressContainer}>
            <Svg height="140" width="140" viewBox="0 0 100 100">
              <Defs>
                <LinearGradient id="semiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Path
                d={generateSemiCircle(1)}
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="none"
              />
              <Path
                d={generateSemiCircle(hsiProgress)}
                stroke="url(#semiGradient)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
            </Svg>

            <View style={styles.hsiContainer}>
              <Text style={styles.hsiText}>{house?.hsi || "0"}</Text>
              <TouchableOpacity onPress={() => setShowTooltip(true)} style={styles.infoButton}>
                <MaterialIcons name="info-outline" size={20} color="#22c55e" />
              </TouchableOpacity>
            </View>
            <Text style={styles.hsiLabel}>House Status Index</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {house?.hsi >= 75 ? "Great" : "Needs Work"}
            </Text>
            <Text style={styles.statLabel}>House Status</Text>
            <MaterialIcons 
              name={house?.hsi >= 75 ? "check-circle" : "warning"} 
              size={24} 
              color={house?.hsi >= 75 ? "#22c55e" : "#f59e0b"} 
              style={styles.statIcon} 
            />
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{house?.users?.length || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
            <MaterialIcons 
              name="group" 
              size={24} 
              color="#22c55e" 
              style={styles.statIcon} 
            />
          </View>
        </View>

        <View style={styles.scoreboardCard}>
          <Text style={styles.cardTitle}>Score Board</Text>
          {house?.users?.sort((a, b) => b.points - a.points).map((user) => (
            <View key={user.id} style={styles.userRow}>
              <View style={styles.userInfo}>
                <MaterialIcons name="person" size={20} color="#64748b" />
                <Text style={styles.username}>{user.username}</Text>
              </View>
              <Text style={styles.points}>{user.points} pts</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionCards}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setIsCurrentTabVisible(true)}
          >
            <MaterialIcons name="receipt" size={28} color="#22c55e" />
            <Text style={styles.actionCardText}>Current Tab</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setIsPaidTabVisible(true)}
          >
            <MaterialIcons name="history" size={28} color="#22c55e" />
            <Text style={styles.actionCardText}>Paid Tabz</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ModalComponent visible={showInviteModal} onClose={() => setShowInviteModal(false)}>
        <InviteModal />
      </ModalComponent>

      <ModalComponent visible={isCurrentTabVisible} onClose={() => setIsCurrentTabVisible(false)}>
        <CurrentHouseTab house={house} />
      </ModalComponent>

      <ModalComponent visible={isPaidTabVisible} onClose={() => setIsPaidTabVisible(false)}>
        <PaidHouseTabz house={house} />
      </ModalComponent>

      {showTooltip && (
        <TouchableOpacity 
          style={styles.tooltipOverlay} 
          activeOpacity={1} 
          onPress={() => setShowTooltip(false)}
        >
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>House Status Index (HSI)</Text>
            <Text style={styles.tooltipText}>
              The HSI represents the health and activity of your house. Higher numbers 
              indicate a more active and responsible house.
            </Text>
            <TouchableOpacity style={styles.tooltipButton} onPress={() => setShowTooltip(false)}>
              <Text style={styles.tooltipButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  houseName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    flex: 1,
    marginRight: 16,
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 1.5,
    opacity: 0.2,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  hsiCard: {
    backgroundColor: "white",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  progressContainer: {
    alignItems: "center",
  },
  hsiContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -50,
  },
  hsiText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#22c55e",
    marginRight: 8,
  },
  hsiLabel: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 8,
  },
  infoButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: width * 0.42,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: "relative",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  statIcon: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  scoreboardCard: {
    backgroundColor: "white",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 12,
    fontWeight: "500",
  },
  points: {
    fontSize: 16,
    color: "#22c55e",
    fontWeight: "600",
  },
  actionCards: {
    paddingHorizontal: 24,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  actionCardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginLeft: 16,
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
    backgroundColor: "#22c55e",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  tooltipButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  inviteModalContent: {
    padding: 24,
  },
  inviteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  inviteDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subErrorText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  }
});

export default HouseTabzScreen;