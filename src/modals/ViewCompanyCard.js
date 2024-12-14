import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const ViewCompanyCard = ({ visible, onClose, partner }) => {
  const [showBrowser, setShowBrowser] = useState(false);

  if (!visible || !partner) return null;

  return (
    <View style={styles.overlay}>
      {!showBrowser ? (
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Cover Image */}
            <View style={styles.coverImageContainer}>
              <Image
                source={{
                  uri: `https://d96e-2605-a601-a0c6-4f00-c98b-de38-daaa-fde7.ngrok-free.app/${partner.company_cover}`,
                }}
                style={styles.coverImage}
                onError={(error) =>
                  console.error("Image Load Error:", error.nativeEvent.error)
                }
              />
            </View>

            {/* Company Details */}
            <View style={styles.companyDetailsContainer}>
              <Text style={styles.title}>{partner.name}</Text>
              <Text style={styles.description}>{partner.description}</Text>
              <Text style={styles.avgRoommate}>AVG / Roommate: $50 (example)</Text>
            </View>

            {/* Additional Information Sections */}
            <View style={styles.textSection}>
              <Text style={styles.sectionTitle}>How to Use HouseTabz</Text>
              <Text style={styles.paragraph}>
                {partner.how_to || "No instructions available at the moment."}
              </Text>
            </View>

            <View style={styles.textSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.paragraph}>
                {partner.about || "No additional information available."}
              </Text>
            </View>

            <View style={styles.textSection}>
              <Text style={styles.sectionTitle}>Important Information</Text>
              <Text style={styles.paragraph}>
                {partner.important_information ||
                  "No additional information available."}
              </Text>
            </View>
          </ScrollView>

          {/* Shop Now Button */}
          <View style={styles.shopButtonContainer}>
            <TouchableOpacity style={styles.shopButton} onPress={() => setShowBrowser(true)}>
              <Text style={styles.shopButtonText}>Shop {partner.name}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.browserOverlay}>
          {/* Header with Back Button and URL */}
          <View style={styles.browserHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowBrowser(false)} // Close WebView and go back to the modal
            >
              <Ionicons name="arrow-back" size={24} color="#6A0DAD" />
            </TouchableOpacity>
            <Text style={styles.urlText} numberOfLines={1}>
              {partner.link || "No URL Provided"}
            </Text>
          </View>

          {/* WebView */}
          <WebView
            source={{ uri: partner.link }}
            style={styles.webView}
            onLoadStart={() => console.log("WebView Started Loading")}
            onLoadEnd={() => console.log("WebView Finished Loading")}
            onError={(error) => console.error("WebView Error:", error.nativeEvent)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    height: screenHeight * 0.85,
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    padding: 5,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  coverImageContainer: {
    height: 250,
    backgroundColor: "#ddd",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  companyDetailsContainer: {
    marginTop: -20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  avgRoommate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 10,
  },
  textSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  shopButtonContainer: {
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: "#ffffff",
    borderColor: "#6A0DAD",
    borderWidth: 2,
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
    width: screenWidth - 40,
  },
  shopButtonText: {
    color: "#6A0DAD",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  browserOverlay: {
    marginTop:50,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
  },
  browserHeader: {
    height: 60,
    marginTop: 20,
    backgroundColor: "#f8f8f8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  urlText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    textAlign: "left",
  },
  webView: {
    flex: 1,
  },
});

export default ViewCompanyCard;
