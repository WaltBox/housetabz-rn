import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import ModalComponent from "../components/ModalComponent";
import CurrentHouseTab from "../modals/CurrentHouseTab";
import PaidHouseTabz from "../modals/PaidHouseTabz";

const HouseTabzScreen = () => {
  const [house, setHouse] = useState(null);
  const [error, setError] = useState(null);
  const [isCurrentTabVisible, setIsCurrentTabVisible] = useState(false);
  const [isPaidTabVisible, setIsPaidTabVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        const response = await axios.get(
          "https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/api/houses/1"
        );
        setHouse(response.data);
      } catch (err) {
        setError("Failed to load house data");
        console.error(err);
      }
    };

    fetchHouseData();
  }, []);

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

  const hsiProgress = house ? house.hsi / 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.houseName}>
        {error ? "Error" : house ? house.name : "Loading..."}
      </Text>
      <View style={styles.underline} />

      {/* Semi-circle Progress */}
      <View style={styles.progressContainer}>
        <Svg height="140" width="140" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="semiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#4CAF50" stopOpacity="1" />
              <Stop offset="100%" stopColor="#81C784" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Background Path */}
          <Path
            d={generateSemiCircle(1)}
            stroke="#ddd"
            strokeWidth="10"
            fill="none"
          />
          {/* Foreground Path */}
          <Path
            d={generateSemiCircle(hsiProgress)}
            stroke="url(#semiGradient)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>

        {/* HSI Value */}
        <View style={styles.hsiContainer}>
          <Text style={styles.hsiText}>{house ? house.hsi : "0"}</Text>
          <TouchableOpacity onPress={() => setShowTooltip(true)}>
            <MaterialIcons name="info-outline" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tooltip */}
      {showTooltip && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipText}>
              The HSI (House Status Index) represents the health and activity of
              your house. Higher numbers indicate a more active and responsible
              house.
            </Text>
            <TouchableOpacity onPress={() => setShowTooltip(false)}>
              <MaterialIcons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* House Status */}
      <Text style={styles.houseStatus}>
        House Status: {house && house.hsi >= 75 ? "Great" : "Needs Improvement"}
      </Text>

      {/* Scoreboard */}
      <Text style={styles.sectionHeader}>Score Board</Text>
      <View style={styles.scoreboard}>
        <ScrollView>
          {house &&
            house.users
              .sort((a, b) => b.points - a.points)
              .map((user) => (
                <View key={user.id} style={styles.userRow}>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.points}>Points: {user.points}</Text>
                </View>
              ))}
        </ScrollView>
      </View>

      {/* Tabs */}
      <TouchableOpacity
        style={styles.clickableRow}
        activeOpacity={0.7}
        onPress={() => setIsCurrentTabVisible(true)}
      >
        <Text style={styles.clickableTitle}>CurrentTab</Text>
        <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.clickableRow}
        activeOpacity={0.7}
        onPress={() => setIsPaidTabVisible(true)}
      >
        <Text style={styles.clickableTitle}>PaidTabz</Text>
        <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
      </TouchableOpacity>

      {/* Modals */}
      <ModalComponent
        visible={isCurrentTabVisible}
        onClose={() => setIsCurrentTabVisible(false)}
      >
        <CurrentHouseTab house={house} />
      </ModalComponent>
      <ModalComponent
        visible={isPaidTabVisible}
        onClose={() => setIsPaidTabVisible(false)}
      >
        <PaidHouseTabz house={house} />
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  houseName: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
  },
  underline: {
    height: 3,
    width: "60%",
    backgroundColor: "#4CAF50",
    alignSelf: "center",
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  hsiContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -60,
  },
  hsiText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginRight: 5,
  },
  tooltip: {
    position: "absolute",
    top: 120,
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tooltipText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    marginRight: 10,
  },
  houseStatus: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  scoreboard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
  },
  points: {
    fontSize: 16,
    color: "#4CAF50",
  },
  clickableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  clickableTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
});

export default HouseTabzScreen;
