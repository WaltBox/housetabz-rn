import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
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

  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        const response = await axios.get("http://localhost:3004/api/houses/1");
        setHouse(response.data);
      } catch (err) {
        setError("Failed to load house data");
        console.error(err);
      }
    };

    fetchHouseData();
  }, []);

  const generateArc = (progress) => {
    const startAngle = -90; // Start from the top
    const endAngle = -90 + 360 * progress; // Calculate the end angle
    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, endAngle);
    const largeArcFlag = progress > 0.5 ? 1 : 0; // Determines if the arc is larger than half a circle
    return `M ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const hsiProgress = house ? house.hsi / 100 : 0; // Convert HSI to progress (0-1)

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : house ? (
          <Text style={styles.houseName}>{house.name}</Text>
        ) : (
          <Text style={styles.houseName}>Loading...</Text>
        )}

        <View style={{ transform: [{ scale: 1.4 }] }}>
          <Svg height="120" width="120" viewBox="0 0 100 100">
            {/* Background Circle */}
            <Circle
              cx="50"
              cy="50"
              r="40"
              stroke="#ddd"
              strokeWidth="10"
              fill="none"
            />
            {/* Arc for HSI Progress */}
            <Path
              d={generateArc(hsiProgress)}
              stroke="#4CAF50" // Green for progress
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            {/* HSI Value */}
            <SvgText
              x="50"
              y="55"
              fill="#4CAF50"
              fontSize="20"
              fontWeight="bold"
              textAnchor="middle"
            >
              {house ? house.hsi : "0"}
            </SvgText>
          </Svg>
        </View>
      </View>

      <Text style={styles.houseStatus}>House Status: Great</Text>

      {/* Score Board Section */}
      <Text style={[styles.sectionHeader, styles.leftAlign]}>Score Board</Text>
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

      {/* Clickable Sections */}
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

      {/* CurrentHouseTab Modal */}
      <ModalComponent
        visible={isCurrentTabVisible}
        onClose={() => setIsCurrentTabVisible(false)}
      >
        <CurrentHouseTab house={house} />
      </ModalComponent>

      {/* PaidHouseTabz Modal */}
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
    backgroundColor: "#e6f2f8",
    padding: 20,
  },
  houseName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a90e2",
    textAlign: "center",
    marginBottom: 10,
  },
  houseStatus: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  svgContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  scoreboard: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    borderColor: "#ddd",
    borderWidth: 1,
    maxHeight: 200,
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
    color: "#4a90e2",
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  leftAlign: {
    alignSelf: "flex-start",
  },
});

export default HouseTabzScreen;
