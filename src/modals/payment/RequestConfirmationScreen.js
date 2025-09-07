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

const RequestConfirmationScreen = ({ paymentData, houseServiceStatus, onSuccess, onCancel, onError }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingRoommates, setFetchingRoommates] = useState(true);
  const [roommates, setRoommates] = useState([]);
  const [houseName, setHouseName] = useState("");
  const [upfrontShare, setUpfrontShare] = useState(0);
  const [monthlyShare, setMonthlyShare] = useState(0);
  const [error, setError] = useState(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Check if this is an existing pending request
  const isExistingPending = houseServiceStatus && houseServiceStatus.status === 'pending';

  useEffect(() => {
    fetchRoommates();
  }, []);

  const fetchRoommates = async () => {
    if (!user?.id) return;
    setFetchingRoommates(true);
    try {
      if (!user.houseId) {
        setRoommates([{ id: user.id, username: user.username }]);
        setUpfrontShare(paymentData.upfront || 0);
        setMonthlyShare(paymentData.amount || 0);
        setHouseName("");
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
    setError(null);
    
    try {
      if (isExistingPending) {
        // For existing pending requests, just send back the existing agreement info
        console.log('Using existing pending agreement:', houseServiceStatus.agreementId);
        
        setTimeout(() => {
          onSuccess({
            type: 'reused_agreement',
            agreementId: houseServiceStatus.agreementId,
            serviceName: houseServiceStatus.serviceName,
            message: 'Using your existing HouseTabz connection request'
          });
        }, 1000); // Brief delay for user feedback
        
        return;
      }

      // Normal flow for new requests
      let { apiKey, partnerId, transactionId, serviceName, serviceType, amount, upfront } = paymentData;
      
      // Get partner ID if not provided
      if (!partnerId) {
        const lookup = await apiClient.get('/api/partners/by-api-key', { params: { apiKey } });
        if (!lookup.data.success) throw new Error('Partner lookup failed');
        partnerId = lookup.data.partnerId;
      }

      const requestPayload = {
        transactionId,
        serviceName,
        serviceType,
        estimatedAmount: amount,
        requiredUpfrontPayment: upfront,
        userId: user.id,
      };

      const response = await apiClient.post(
        `/api/partners/${partnerId}/staged-request`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.data.success) {
        // ✅ NEW: After creating staged request, immediately consent the creator
        const createdRequest = response.data;
        
        // Find the creator's task ID from the response
        const creatorTaskId = createdRequest.tasks?.find(task => task.userId === user.id)?.id;
        
        if (creatorTaskId && upfront > 0) {
          console.log('🎯 Auto-consenting creator for staged request:', creatorTaskId);
          
          // Immediately accept/consent for the creator
          const consentResponse = await apiClient.patch(`/api/tasks/${creatorTaskId}`, {
            response: 'accepted'
          });
          
          console.log('✅ Creator consent response:', consentResponse.data);
          
          // Pass both the original request data and the consent data
          onSuccess({
            ...createdRequest,
            creatorConsent: {
              paymentAuthorized: consentResponse.data.paymentAuthorized,
              paymentIntentId: consentResponse.data.paymentIntentId,
              message: consentResponse.data.message
            }
          });
        } else {
          // No payment required or no task found, proceed normally
          onSuccess(createdRequest);
        }
      } else {
        throw new Error(response.data.message || 'Request failed');
      }

    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process payment request.');
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isExistingPending ? 'Request Already Exists' : 'Confirm Request'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isExistingPending 
            ? `Your house already has a pending request for ${houseServiceStatus.serviceName}`
            : `Add this service to your HouseTabz account`
          }
        </Text>
        {houseName ? <Text style={styles.houseName}>House: {houseName}</Text> : null}
      </View>

      {isExistingPending && (
        <View style={styles.existingRequestCard}>
          <MaterialIcons name="pending" size={24} color="#f59e0b" />
          <Text style={styles.existingRequestTitle}>Pending Request Found</Text>
          <Text style={styles.existingRequestText}>
            Your house already requested {houseServiceStatus.serviceName}. Roommates need to accept their shares to complete setup.
          </Text>
        </View>
      )}

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
              {isExistingPending 
                ? "This shows the amounts from your existing request. Roommates need to accept these shares."
                : "A request will be sent to all roommates. The upfront charge is usually a security deposit."
              }
            </Text>
            <TouchableOpacity onPress={() => setShowInfoTooltip(false)}>
              <Text style={styles.tooltipClose}>Got it</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {roommates.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Roommate Split</Text>
          {roommates.map(r => (
            <View key={r.id} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{r.username.charAt(0).toUpperCase()}</Text></View>
                <Text style={styles.roommateName}>{r.username}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.amountText}>${monthlyShare.toFixed(2)}/mo</Text>
                {upfrontShare > 0 && <Text style={styles.amountSubText}>${upfrontShare.toFixed(2)} upfront</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          {isExistingPending 
            ? "Your existing request is still pending. Remind your roommates to accept their shares in the HouseTabz app."
            : "A request will be sent to all roommates. No one has to pay anything until everyone accepts."
          }
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[
          isExistingPending ? styles.reminderButton : styles.primaryButton, 
          loading && styles.disabledButton
        ]} 
        onPress={handleConfirm} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small"/>
        ) : (
          <Text style={styles.primaryButtonText}>
            {isExistingPending ? 'Remind Roommates' : 'Request Approval'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: { padding: 24, paddingBottom: 40, backgroundColor: "#FFF", flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#64748b", fontFamily: "System" },
  header: { marginBottom: 24, alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "600", color: "#1e293b", fontFamily: "System" },
  headerSubtitle: { marginTop: 8, fontSize: 14, color: "#64748b", fontFamily: "System", textAlign: "center" },
  brand: { fontFamily: "Montserrat-Black", color: "#34d399" },
  houseName: { marginTop: 4, fontSize: 13, color: "#64748b", fontFamily: "System" },
  existingRequestCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  existingRequestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
    marginTop: 8,
    marginBottom: 8,
    fontFamily: "System",
  },
  existingRequestText: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "System",
  },
  card: { backgroundColor: "#F9F9F9", borderRadius: 8, padding: 16, marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: "500", color: "#1e293b", marginBottom: 16, fontFamily: "System" },
  summaryRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  summaryCol: { alignItems: "center" },
  summaryValue: { fontSize: 20, fontWeight: "600", color: "#1e293b", fontFamily: "System" },
  summaryLabel: { marginTop: 4, fontSize: 12, color: "#9ca3af", fontFamily: "System" },
  infoIcon: { alignSelf: "center", marginTop: 8 },
  tooltip: { marginTop: 12, padding: 12, backgroundColor: "#EFEFEF", borderRadius: 4 },
  tooltipText: { fontSize: 13, color: "#4b5563", textAlign: "center", fontFamily: "System" },
  tooltipClose: { marginTop: 8, fontSize: 13, color: "#3b82f6", textAlign: "center", fontFamily: "System" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E5E5E5" },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2E8F0", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: "600", color: "#34d399", fontFamily: "System" },
  roommateName: { fontSize: 16, color: "#1e293b", fontFamily: "System" },
  rowRight: { alignItems: "flex-end" },
  amountText: { fontSize: 16, fontWeight: "600", color: "#1e293b", fontFamily: "System" },
  amountSubText: { fontSize: 12, color: "#64748b", marginTop: 4, fontFamily: "System" },
  disclaimer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#F9F9F9", borderRadius: 4, marginBottom: 24 },
  disclaimerText: { fontSize: 13, color: "#64748b", textAlign: "center", fontFamily: "System" },
  errorContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEE2E2", borderRadius: 4, padding: 12, marginBottom: 24 },
  errorText: { color: "#EF4444", fontSize: 14, marginLeft: 8, fontFamily: "System" },
  primaryButton: { backgroundColor: "#34d399", borderRadius: 50, paddingVertical: 14, alignItems: "center", marginBottom: 16 },
  reminderButton: { backgroundColor: "#f59e0b", borderRadius: 50, paddingVertical: 14, alignItems: "center", marginBottom: 16 },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600", fontFamily: "System" },
  disabledButton: { opacity: 0.7 },
  secondaryButton: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 50, paddingVertical: 14, alignItems: "center", marginBottom: 32 },
  secondaryButtonText: { color: "#64748b", fontSize: 16, fontFamily: "System" },
});

export default RequestConfirmationScreen;