import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const HSIComponent = ({ house, onInfoPress }) => {
  // Get HSI score from statusIndex relation or fall back to legacy hsi field
  const hsiScore = house?.statusIndex?.score ?? house?.hsi ?? 0;
  const hsiProgress = hsiScore / 100;
  
  // Get balance from finance relation or fall back to legacy balance field
  const houseBalance = house?.finance?.balance ?? house?.balance ?? 0;
  
  // Determine color based on HSI value
  const getStatusColor = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 80) return ["#34d399", "#4ade80"];
    if (numValue >= 60) return ["#4ade80", "#a3e635"];
    if (numValue >= 40) return ["#facc15", "#eab308"];
    return ["#f87171", "#ef4444"];
  };
  
  const [primaryColor, secondaryColor] = getStatusColor(hsiScore);

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const generateSemiCircle = (progress) => {
    const startAngle = 180;
    const sweepAngle = 180 * progress;
    const endAngle = startAngle + sweepAngle;
    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, endAngle);
    const largeArcFlag = sweepAngle >= 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>House Status</Text>
        <TouchableOpacity 
          onPress={onInfoPress} 
          style={styles.infoButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <MaterialIcons name="info-outline" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
        <Svg height="160" width="160" viewBox="0 0 100 100">
          {/* Background blur effect */}
          <Defs>
            <LinearGradient id="semiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={secondaryColor} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Shadow Circle - subtle effect */}
          <Circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(203, 213, 225, 0.4)"
            strokeWidth="1"
          />
          
          {/* Background track */}
          <Path
            d={generateSemiCircle(1)}
            stroke="#e2e8f0"
            strokeWidth="12"
            fill="none"
          />
          
          {/* Progress arc */}
          <Path
            d={generateSemiCircle(hsiProgress)}
            stroke="url(#semiGradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
        
        <View style={styles.valueContainer}>
          <Text style={[styles.hsiText, { color: primaryColor }]}>{hsiScore}</Text>
          <Text style={styles.hsiSubtext}>/100</Text>
        </View>
        
        {/* Status indicator below the gauge */}
        <View style={[styles.statusIndicator, { backgroundColor: `${primaryColor}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: primaryColor }]} />
          <Text style={[styles.statusText, { color: primaryColor }]}>
            {hsiProgress >= 0.8 ? 'Excellent' :
             hsiProgress >= 0.6 ? 'Good' :
             hsiProgress >= 0.4 ? 'Fair' : 'Needs Attention'}
          </Text>
        </View>
      </View>
      
      {/* Add house balance display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>House Balance:</Text>
        <Text style={styles.balanceValue}>${houseBalance.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: -0.5,
    fontFamily: "Montserrat-Black",
  },
  infoButton: {
    padding: 4,
  },
  progressContainer: {
    alignItems: "center",
    position: "relative",
  },
  valueContainer: {
    position: "absolute",
    top: "50%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  hsiText: {
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
  },
  hsiSubtext: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
    marginLeft: 2,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#34d399",
  },
});

export default HSIComponent;