// ActionCards.jsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ActionCards = ({ onCurrentTabPress, onPaidTabPress, onServicesPress }) => (
  <View style={styles.actionCards}>
    <TouchableOpacity style={styles.actionCard} onPress={onCurrentTabPress}>
      <MaterialIcons name="receipt" size={28} color="#34d399" />
      <Text style={styles.actionCardText}>CurrentTab</Text>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionCard} onPress={onPaidTabPress}>
      <MaterialIcons name="history" size={28} color="#34d399" />
      <Text style={styles.actionCardText}>PaidTabz</Text>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionCard} onPress={onServicesPress}>
      <MaterialIcons name="build" size={28} color="#34d399" />
      <Text style={styles.actionCardText}>House Services</Text>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
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
});

export default ActionCards;
