import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from 'expo-font';

const Scoreboard = ({ house }) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  // Sort users by points (finance.points or legacy points)
  const sortedUsers = house?.users?.sort((a, b) => {
    const pointsA = a.finance?.points ?? a.points ?? 0;
    const pointsB = b.finance?.points ?? b.points ?? 0;
    return pointsB - pointsA;
  }) || [];

  const renderUserItem = (user, index) => {
    const isFirstPlace = index === 0;
    const points = user.finance?.points ?? user.points ?? 0;

    return (
      <View key={user.id} style={styles.userRow}>
        {/* Position */}
        <View style={styles.rankContainer}>
          <Text style={[
            styles.rankText,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>
            {index + 1}
          </Text>
        </View>
        
        {/* Name + crown */}
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            {isFirstPlace && (
              <MaterialIcons 
                name="emoji-events" 
                size={16} 
                color="#f59e0b" 
                style={styles.crownIcon} 
              />
            )}
            <Text style={[
              styles.username,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]} numberOfLines={1}>
              {user.username}
            </Text>
          </View>
        </View>
        
        {/* Points */}
        <View style={styles.pointsContainer}>
          <Text style={[
            styles.points,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>
            {points}
          </Text>
          <Text style={[
            styles.pointsLabel,
            fontsLoaded && { fontFamily: 'Poppins-Medium' }
          ]}>
            pts
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[
          styles.title,
          fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
        ]}>
          Score Board
        </Text>
      </View>
      
      {sortedUsers.length > 0 ? (
        <View style={styles.grid}>
          {Array.from({ length: Math.ceil(sortedUsers.length / 2) }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {/* Left */}
              {rowIndex * 2 < sortedUsers.length && (
                <View style={{ width: '48%' }}>
                  {renderUserItem(sortedUsers[rowIndex * 2], rowIndex * 2)}
                </View>
              )}
              {/* Right */}
              {rowIndex * 2 + 1 < sortedUsers.length ? (
                <View style={{ width: '48%' }}>
                  {renderUserItem(sortedUsers[rowIndex * 2 + 1], rowIndex * 2 + 1)}
                </View>
              ) : (
                <View style={{ width: '48%' }} />
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="emoji-events" size={32} color="#94a3b8" />
          <Text style={[
            styles.emptyText,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            No scores yet
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  grid: {
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(203, 213, 225, 0.3)",
  },
  rankContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#f1f5f9",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  crownIcon: {
    marginRight: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: 8,
  },
  points: {
    fontSize: 16,
    fontWeight: "800",
    color: "#34d399",
  },
  pointsLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 2,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 8,
  },
});

export default Scoreboard;