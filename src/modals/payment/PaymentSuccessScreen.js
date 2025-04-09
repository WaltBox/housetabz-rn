// src/modals/payment/PaymentSuccessScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const PaymentSuccessScreen = ({ paymentData, onDone }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="check-circle" size={80} color="#34d399" />
      </View>
      
      <Text style={styles.title}>Request Submitted!</Text>
      
      <Text style={styles.description}>
        Your request for {paymentData.serviceName} has been successfully submitted.
        Your roommates will be notified to confirm their shares.
      </Text>
      
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Payment Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{paymentData.serviceName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{paymentData.serviceType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <Text style={styles.detailValue}>{paymentData.transactionId}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.doneButton} onPress={onDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
      
      <View style={styles.secureFooter}>
        <MaterialIcons name="security" size={16} color="#9ca3af" />
        <Text style={styles.secureText}>Secure SSL encrypted transaction</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center"
  },
  iconContainer: {
    marginVertical: 32
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center"
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b"
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b"
  },
  doneButton: {
    width: "100%",
    backgroundColor: "#34d399",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  secureFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16
  },
  secureText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8
  }
});

export default PaymentSuccessScreen;