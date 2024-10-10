import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";

const HouseTabzScreen = () => {
  const progress = 0.5; // Progress is 50%

  // Function to generate the semicircle arc path
  const generateArc = (progress) => {
    const startAngle = -180; // Start at the left (9 o'clock position)
    const endAngle = -180 + 180 * progress; // Progress goes from -180° to 0° (left to right)

    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, endAngle);

    const largeArcFlag = progress > 0.5 ? 1 : 0;

    // Define the arc with the 'A' command in the Path
    return `M ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Helper function to convert polar coordinates to Cartesian
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
        <View style={{ transform: [{ scale: 1.4 }] }}> {/* Set a constant scale */}
          <Svg height="120" width="120" viewBox="0 0 100 100">
            {/* Draw the background semicircle */}
            <Path
              d="M 10 50 A 40 40 0 1 1 90 50"
              stroke="#ddd"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />

            {/* Draw the progress semicircle */}
            <Path
              d={generateArc(progress)}
              stroke="green"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            {/* Display the HSI in the center */}
            <SvgText
              x="50"
              y="70"
              fill="green"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
            >
              HSI
            </SvgText>
          </Svg>
        </View>
      </View>

      {/* Center the House Status text */}
      <Text style={styles.houseStatus}>House Status: Great</Text>

      <Text style={[styles.sectionHeader, styles.leftAlign]}>Score Board</Text>
      <View style={styles.scoreboard}></View>

      <Text style={[styles.sectionHeader, styles.leftAlign]}>CurrentTab</Text>
      <View style={styles.currentTab}></View>

      <Text style={[styles.sectionHeader, styles.leftAlign]}>PaidTabz</Text>
      <View style={styles.paidTab}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f2f8",
    padding: 20,
  },
  houseStatus: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center", // Centered the text
  },
  svgContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40, // Added space between top of the page and the progress bar
  },
  scoreboard: {
    backgroundColor: "#fff",
    width: "100%",
    height: 100,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    justifyContent: "center",
    borderColor: "#ddd",
    borderWidth: 1,
  },
  currentTab: {
    backgroundColor: "#ddd",
    width: "100%",
    height: 80,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  paidTab: {
    backgroundColor: "#ddd",
    width: "100%",
    height: 80,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  leftAlign: {
    alignSelf: "flex-start", // Aligns the text to the left
  },
});

export default HouseTabzScreen;
