import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const Scoreboard = ({ house }) => {
  // Sort users by points, getting points from finance relation or falling back to legacy points field
  const sortedUsers = house?.users?.sort((a, b) => {
    const pointsA = a.finance?.points ?? a.points ?? 0;
    const pointsB = b.finance?.points ?? b.points ?? 0;
    return pointsB - pointsA;
  }) || [];

  // Render each user row in grid
  const renderUserItem = (user, index) => {
    const isFirstPlace = index === 0;
    const points = user.finance?.points ?? user.points ?? 0;
    const balance = user.finance?.balance ?? user.balance ?? 0;
    
    return (
      <View key={user.id} style={styles.userRow}>
        {/* Position indicator */}
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        
        {/* User info with crown for first place */}
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            {isFirstPlace && (
              <MaterialIcons name="emoji-events" size={16} color="#f59e0b" style={styles.crownIcon} />
            )}
            <Text style={styles.username} numberOfLines={1}>
              {user.username}
            </Text>
          </View>
          <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
        </View>
        
        {/* Points */}
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Score Board</Text>
        <MaterialIcons name="leaderboard" size={22} color="#64748b" />
      </View>
      
      {sortedUsers.length > 0 ? (
        <View style={styles.grid}>
          {/* Create pairs of users, dividing the array into chunks of 2 */}
          {Array.from({ length: Math.ceil(sortedUsers.length / 2) }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {/* First column */}
              {rowIndex * 2 < sortedUsers.length && (
                <View style={{ width: '48%' }}>
                  {renderUserItem(sortedUsers[rowIndex * 2], rowIndex * 2)}
                </View>
              )}
              
              {/* Second column */}
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
          <Text style={styles.emptyText}>No scores yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: -0.5,
    fontFamily: "Montserrat-Black",
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
  balanceText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
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