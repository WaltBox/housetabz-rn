import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const CurrentHouseTab = ({ house }) => {
  // Filter unpaid bills
  const unpaidBills = house?.bills?.filter((bill) => !bill.paid) || [];

  const renderBill = ({ item }) => (
    <View style={styles.billItem}>
      <Text style={styles.billDescription}>
        {item.name || "Unknown Bill"}
      </Text>
      <Text style={styles.billAmount}>${item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Tab</Text>
      {house ? (
        <>
          <Text style={styles.info}>Unpaid Bills</Text>
          {unpaidBills.length > 0 ? (
            <FlatList
              data={unpaidBills}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderBill}
              contentContainerStyle={styles.billList}
            />
          ) : (
            <Text style={styles.noBillsText}>No unpaid bills!</Text>
          )}
        </>
      ) : (
        <Text style={styles.content}>Loading house details...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  billList: {
    marginTop: 10,
  },
  billItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  billDescription: {
    fontSize: 16,
    color: "#333",
  },
  billAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c", // Red for unpaid bills
  },
  noBillsText: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
  content: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default CurrentHouseTab;
