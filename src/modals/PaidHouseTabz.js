// src/modals/PaidHouseTabz.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PaidHouseTabz = ({ house }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paid House Tab</Text>
      {house && house.bills && house.bills.length > 0 ? (
        <View>
          {house.bills
            .filter((bill) => bill.paid) // Only show paid bills
            .map((bill, index) => (
              <Text key={index} style={styles.billText}>
                Bill ID: {bill.id}, Amount: ${bill.amount}
              </Text>
            ))}
        </View>
      ) : (
        <Text style={styles.content}>No paid bills yet!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  billText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 5,
  },
  content: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default PaidHouseTabz;
