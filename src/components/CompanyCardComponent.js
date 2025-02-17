import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CompanyCardComponent = ({ name, description, logoUrl, coverUrl, onPress, cardWidth }) => {
  const displayName = name || "Company Name";
  const displayDescription = description || "No description available";

  const coverImage = { uri: coverUrl };
  const logoImage = { uri: logoUrl };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { width: cardWidth }]}>
      {/* Cover Photo with Gradient Overlay */}
      <View style={styles.coverPhotoContainer}>
        <Image source={coverImage} style={styles.coverPhoto} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.1)", "transparent"]}
          style={styles.imageOverlay}
        />
      </View>

      <View style={styles.content}>
        {/* Logo + Name & Description */}
        <View style={styles.row}>
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {displayName}
            </Text>
            <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
              {displayDescription}
            </Text>
          </View>
        </View>

        {/* Cost Section */}
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>Est / Roommate:</Text>
          <Text style={styles.costValue}>$123</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16, // More rounded corners for a premium look
    overflow: "hidden",
    height: 240, // Slightly taller for balance
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  coverPhotoContainer: {
    width: "100%",
    height: "55%", // More space for the cover image
    position: "relative",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  content: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoContainer: {
    width: 45,
    height: 45,
    borderRadius: 12, // Softer, rounded logo container
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2, // Light shadow for depth
  },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 8, // Subtle rounding for better aesthetics
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  description: {
    fontSize: 12,
    color: "#64748b",
  },
  costContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    marginTop: 8,
  },
  costLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  costValue: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "bold",
  },
});

export default CompanyCardComponent;
