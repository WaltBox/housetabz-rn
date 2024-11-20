import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CurrentHouseTab = ({ house }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current House Tab</Text>
      {house ? (
        <Text style={styles.content}>
          Details about {house.name} will go here.
        </Text>
      ) : (
        <Text style={styles.content}>Loading house details...</Text>
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
  content: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default CurrentHouseTab;
