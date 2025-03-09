import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const HouseHeader = ({ houseName, onInvitePress }) => (
  <View style={styles.header}>
    <TouchableOpacity 
      style={styles.bridgeContainer}
      onPress={onInvitePress}
      activeOpacity={0.8}
    >
      {/* Left side - House icon */}
      <View style={styles.leftSide}>
        <LinearGradient
          colors={['#34d399', '#10b981']}
          style={styles.iconBubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="home" size={22} color="white" />
        </LinearGradient>
      </View>
      
      {/* Middle - House name */}
      <View style={styles.middleSection}>
        <Text style={styles.houseName} numberOfLines={1}>
          {houseName || "Loading..."}
        </Text>
      </View>
      
      {/* Right side - Invite button */}
      <View style={styles.rightSide}>
        <LinearGradient
          colors={['#34d399', '#10b981']}
          style={styles.inviteButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="person-add" size={18} color="white" />
          <Text style={styles.inviteButtonText}>Invite</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
    
    {/* Subtle divider */}
    <View style={styles.divider}>
      {[...Array(5)].map((_, i) => (
        <View 
          key={i} 
          style={[
            styles.bubble, 
            { 
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              opacity: 0.2 + Math.random() * 0.3,
              marginHorizontal: 10 + Math.random() * 12
            }
          ]} 
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  bridgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 28,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    padding: 6,
  },
  leftSide: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  middleSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  houseName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    fontFamily: "Quicksand-Bold",
    textAlign: 'center',
  },
  rightSide: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    height: 44,
  },
  inviteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 16,
  },
  bubble: {
    backgroundColor: "#34d399",
    borderRadius: 50,
  },
});

export default HouseHeader;