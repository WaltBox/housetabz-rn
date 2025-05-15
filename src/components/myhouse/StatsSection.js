import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from 'expo-font';

const { width } = Dimensions.get("window");

const StatsSection = ({ house }) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={[
          styles.statValue,
          fontsLoaded && { fontFamily: 'Poppins-Bold' }
        ]}>
          {house?.hsi >= 75 ? "Great" : "Needs Work"}
        </Text>
        <Text style={[
          styles.statLabel,
          fontsLoaded && { fontFamily: 'Poppins-Medium' }
        ]}>
          House Status
        </Text>
        <MaterialIcons
          name={house?.hsi >= 75 ? "check-circle" : "warning"}
          size={24}
          color={house?.hsi >= 75 ? "#34d399" : "#f59e0b"}
          style={styles.statIcon}
        />
      </View>
      <View style={styles.statCard}>
        <Text style={[
          styles.statValue,
          fontsLoaded && { fontFamily: 'Poppins-Bold' }
        ]}>
          {house?.users?.length || 0}
        </Text>
        <Text style={[
          styles.statLabel,
          fontsLoaded && { fontFamily: 'Poppins-Medium' }
        ]}>
          Members
        </Text>
        <MaterialIcons name="group" size={24} color="#34d399" style={styles.statIcon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default StatsSection;