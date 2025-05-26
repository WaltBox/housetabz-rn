import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import apiClient from "../config/api";

const ExistingRequestModal = ({ houseServiceStatus, paymentData, onSuccess, onCancel, onError }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLinkToPartner = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Linking HouseTabz to Partner via webhook resend...');
      
      // Call the resend webhook endpoint
      const response = await apiClient.post('/api/sdk/resend-webhook', {
        agreementId: houseServiceStatus.agreementId,
        transactionId: paymentData.transactionId
      });

      console.log('✅ Webhook resend response:', response.data);

      if (response.data.success) {
        // Success - send back to SDK
        onSuccess({
          type: 'webhook_resent',
          agreementId: houseServiceStatus.agreementId,
          serviceName: houseServiceStatus.serviceName,
          message: 'Successfully linked your HouseTabz account to the partner'
        });
      } else {
        throw new Error(response.data.message || 'Failed to link to partner');
      }

    } catch (err) {
      console.error('❌ Error linking to partner:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to link to partner';
      setError(errorMessage);
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Continue your setup</Text>
        <Text style={styles.headerSubtitle}>
          Your house is already set up with this service. Click below to continue.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Service Details</Text>
        <View style={styles.row}>
          <Text style={styles.serviceLabel}>Service</Text>
          <Text style={styles.serviceValue}>{houseServiceStatus.serviceName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.serviceLabel}>Provider</Text>
          <Text style={styles.serviceValue}>{houseServiceStatus.partnerName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.serviceLabel}>Status</Text>
          <Text style={styles.serviceValueHighlight}>Ready to connect</Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Make sure to complete any setup needed on the partner's side.
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.primaryButton, loading && styles.disabledButton]} 
        onPress={handleLinkToPartner} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small"/>
        ) : (
          <Text style={styles.primaryButtonText}>Continue with {houseServiceStatus.partnerName}</Text>
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
    flexGrow: 1 
  },
  header: { 
    marginBottom: 24, 
    alignItems: "center" 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "600", 
    color: "#1e293b", 
    fontFamily: "System",
    textAlign: "center",
    marginBottom: 8
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: "#64748b", 
    fontFamily: "System", 
    textAlign: "center",
    lineHeight: 20
  },
  card: { 
    backgroundColor: "#F9F9F9", 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 24 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "500", 
    color: "#1e293b", 
    marginBottom: 16, 
    fontFamily: "System" 
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    paddingVertical: 12
  },
  serviceLabel: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
    fontFamily: "System",
  },
  serviceValue: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "600",
    fontFamily: "System",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  serviceValueHighlight: {
    fontSize: 15,
    color: "#34d399",
    fontWeight: "700",
    fontFamily: "System",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 8,
  },
  disclaimer: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: "#F9F9F9", 
    borderRadius: 4, 
    marginBottom: 24 
  },
  disclaimerText: { 
    fontSize: 13, 
    color: "#64748b", 
    textAlign: "center", 
    fontFamily: "System" 
  },
  errorContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#FEE2E2", 
    borderRadius: 4, 
    padding: 12, 
    marginBottom: 24 
  },
  errorText: { 
    color: "#EF4444", 
    fontSize: 14, 
    marginLeft: 8, 
    fontFamily: "System" 
  },
  primaryButton: { 
    backgroundColor: "#34d399", 
    borderRadius: 50, 
    paddingVertical: 14, 
    alignItems: "center", 
    marginBottom: 16 
  },
  primaryButtonText: { 
    color: "#FFF", 
    fontSize: 16, 
    fontWeight: "600", 
    fontFamily: "System" 
  },
  disabledButton: { 
    opacity: 0.7 
  },
  secondaryButton: { 
    borderWidth: 1, 
    borderColor: "#E2E8F0", 
    borderRadius: 50, 
    paddingVertical: 14, 
    alignItems: "center", 
    marginBottom: 32 
  },
  secondaryButtonText: { 
    color: "#64748b", 
    fontSize: 16, 
    fontFamily: "System" 
  },
});

export default ExistingRequestModal;