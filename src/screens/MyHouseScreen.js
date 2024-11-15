import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

const HouseTabzScreen = () => {
  const [house, setHouse] = useState(null);
  const [error, setError] = useState(null);

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

  const progress = 0.5; // Progress is 50%

  const generateArc = (progress) => {
    const startAngle = -180;
    const endAngle = -180 + 180 * progress;
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
            <Path
              d="M 10 50 A 40 40 0 1 1 90 50"
              stroke="#ddd"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={generateArc(progress)}
              stroke="green"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <SvgText
              x="50"
              y="70"
              fill="green"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
            >
              {"HSI"}
            </SvgText>
          </Svg>
        </View>
      </View>

      <Text style={styles.houseStatus}>House Status: Great</Text>

      {/* Score Board Section */}
      <Text style={[styles.sectionHeader, styles.leftAlign]}>Score Board</Text>
      <View style={styles.scoreboard}>
        <ScrollView>
          {house && house.users
            .sort((a, b) => b.points - a.points) // Sort users by points, highest first
            .map((user) => (
              <View key={user.id} style={styles.userRow}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.points}>Points: {user.points}</Text>
              </View>
            ))}
        </ScrollView>
      </View>

      {/* Clickable Sections */}
      <TouchableOpacity style={styles.clickableRow} activeOpacity={0.7}>
        <Text style={styles.clickableTitle}>CurrentTab</Text>
        <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.clickableRow} activeOpacity={0.7}>
        <Text style={styles.clickableTitle}>PaidTabz</Text>
        <MaterialIcons name="arrow-forward-ios" size={18} color="#888" />
      </TouchableOpacity>
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
    maxHeight: 200, // Set a max height for scrollable content
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
