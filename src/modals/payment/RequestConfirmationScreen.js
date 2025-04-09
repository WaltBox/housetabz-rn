import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../config/api";

const RequestConfirmationScreen = ({ paymentData, onSuccess, onCancel, onError }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingRoommates, setFetchingRoommates] = useState(true);
  const [roommates, setRoommates] = useState([]);
  const [houseName, setHouseName] = useState("");
  const [upfrontShare, setUpfrontShare] = useState(0);
  const [monthlyShare, setMonthlyShare] = useState(0);
  const [error, setError] = useState(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  useEffect(() => {
    fetchRoommates();
  }, []);

  const fetchRoommates = async () => {
    if (!user?.id) return;
    setFetchingRoommates(true);
    try {
      // If user has no house, just use the user data
      if (!user.houseId) {
        setRoommates([{ id: user.id, username: user.username }]);
        setUpfrontShare(paymentData.upfront || 0);
        setMonthlyShare(paymentData.amount || 0);
        setHouseName(""); // No house name available
        setFetchingRoommates(false);
        return;
      }
      const response = await apiClient.get(`/api/houses/${user.houseId}`);
      const house = response.data;
      if (house && house.users) {
        setRoommates(house.users);
        setHouseName(house.name);
        const count = house.users.length || 1;
        setUpfrontShare((paymentData.upfront || 0) / count);
        setMonthlyShare((paymentData.amount || 0) / count);
      }
    } catch (err) {
      console.error("Error fetching roommates:", err);
      setError("Could not fetch roommate information.");
    } finally {
      setFetchingRoommates(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { apiKey, secretKey, transactionId, serviceName, serviceType, amount, upfront } = paymentData;
      let partnerId = paymentData.partnerId;
      if (!partnerId) {
        const partnerResponse = await apiClient.get("/api/partners/by-api-key", { params: { apiKey } });
        if (partnerResponse.data.success) {
          partnerId = partnerResponse.data.partnerId;
        } else {
          throw new Error(partnerResponse.data.message || "Partner lookup failed");
        }
      }
      const response = await apiClient.post(
        `/api/partners/${partnerId}/staged-request`,
        {
          transactionId,
          serviceName,
          serviceType,
          estimatedAmount: amount,
          requiredUpfrontPayment: upfront,
          userId: user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": apiKey,
            "x-secret-key": secretKey,
          },
        }
      );
      if (response.status === 201 || response.data.success) {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error("Error creating request:", err);
      setError(err.response?.data?.message || "Failed to process payment request.");
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRoommates) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirm Request</Text>
        <Text style={styles.headerSubtitle}>
          Add this service to your <Text style={styles.brand}>HouseTabz</Text> account
        </Text>
        {houseName ? (
          <Text style={styles.houseName}>House: {houseName}</Text>
        ) : null}
      </View>

      {/* Expense Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Expense Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryValue}>${upfrontShare.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Upfront</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryValue}>${monthlyShare.toFixed(2)}/mo</Text>
            <Text style={styles.summaryLabel}>Monthly</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowInfoTooltip(!showInfoTooltip)} style={styles.infoIcon}>
          <MaterialIcons name="info-outline" size={20} color="#9ca3af" />
        </TouchableOpacity>
        {showInfoTooltip && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>
              A request will be sent to all roommates. The upfront charge is usually a security deposit.
            </Text>
            <TouchableOpacity onPress={() => setShowInfoTooltip(false)}>
              <Text style={styles.tooltipClose}>Got it</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Roommate Split */}
      {roommates.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Roommate Split</Text>
          {roommates.map((roommate) => (
            <View key={roommate.id} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{roommate.username.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.roommateName}>{roommate.username}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.amountText}>${monthlyShare.toFixed(2)}/mo</Text>
                {upfrontShare > 0 && (
                  <Text style={styles.amountSubText}>${upfrontShare.toFixed(2)} upfront</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          A request will be sent to all roommates. No one has to pay anything until everyone accepts.
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Request Approval</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "#FFF",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "System",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "System",
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    fontFamily: "System",
  },
  brand: {
    fontFamily: "Montserrat-Black",
    color: "#34d399",
  },
  houseName: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    fontFamily: "System",
  },
  card: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 16,
    fontFamily: "System",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  summaryCol: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "System",
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
    fontFamily: "System",
  },
  infoIcon: {
    alignSelf: "center",
    marginTop: 8,
  },
  tooltip: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#EFEFEF",
    borderRadius: 4,
  },
  tooltipText: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    fontFamily: "System",
  },
  tooltipClose: {
    marginTop: 8,
    fontSize: 13,
    color: "#3b82f6",
    textAlign: "center",
    fontFamily: "System",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34d399",
    fontFamily: "System",
  },
  roommateName: {
    fontSize: 16,
    color: "#1e293b",
    fontFamily: "System",
  },
  rowRight: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "System",
  },
  amountSubText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "System",
  },
  disclaimer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 4,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    fontFamily: "System",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: "System",
  },
  primaryButton: {
    backgroundColor: "#34d399",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 32,
  },
  secondaryButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontFamily: "System",
  },
});

export default RequestConfirmationScreen;
