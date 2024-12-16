import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";

const screenHeight = Dimensions.get("window").height;
const MODAL_HEIGHT = screenHeight * 0.94;

const ViewCompanyCard = ({ visible, onClose, partner }) => {
  const [showBrowser, setShowBrowser] = useState(false);

  if (!visible || !partner) return null;

  return (
    <View style={styles.modalContainer}>
      {Platform.OS === "ios" && <View style={styles.iosStatusBarBackground} />}

      {/* Fixed Close Button */}
      <TouchableOpacity
  style={[styles.fixedCloseButton, { display: showBrowser ? "none" : "flex" }]}
  onPress={onClose}
>
  <MaterialIcons name="close" size={24} color="#fff" />
</TouchableOpacity>


      {!showBrowser ? (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Cover Image with Dissolving Effect */}
            <View style={styles.coverImageContainer}>
              <Image
                source={{
                  uri: partner.company_cover
                    ? `https://d96e-2605-a601-a0c6-4f00-c98b-de38-daaa-fde7.ngrok-free.app/${partner.company_cover}`
                    : null,
                }}
                style={styles.coverImage}
                onError={(error) =>
                  console.error("Image Load Error:", error.nativeEvent.error)
                }
              />
              {/* Linear Gradient for Dissolve Effect */}
              <LinearGradient
                colors={["transparent", "#f8f8f8"]}
                style={styles.dissolveGradient}
              />
            </View>

            {/* Company Details */}
            <View style={styles.companyDetailsContainer}>
              <View style={styles.card}>
                <Text style={styles.title}>{partner.name}</Text>
                <Text style={styles.description}>{partner.description}</Text>
                <Text style={styles.avgRoommate}>AVG / Roommate: $50 (example)</Text>
              </View>
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
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => setShowBrowser(true)}
            >
              <Text style={styles.shopButtonText}>Shop {partner.name}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.browserOverlay}>
          <View style={styles.browserHeader}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowBrowser(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#6A0DAD" />
            </TouchableOpacity>
            <Text style={styles.urlText} numberOfLines={1}>
              {partner.link || "No URL Provided"}
            </Text>
          </View>
          <WebView
            source={{ uri: partner.link }}
            style={styles.webView}
            onLoadStart={() => console.log("WebView Started Loading")}
            onLoadEnd={() => console.log("WebView Finished Loading")}
            onError={(error) =>
              console.error("WebView Error:", error.nativeEvent)
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    width: "100%",
    height: MODAL_HEIGHT,
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    bottom: 0,
  },

  fixedCloseButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    padding: 5,
  },

  coverImageContainer: {
    height: 200,
    position: "relative",
    backgroundColor: "#000",
  },

  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  dissolveGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50, // Height of the fade effect
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 80,
  },

  companyDetailsContainer: {
    marginTop: -50,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },

  avgRoommate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
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
    marginBottom: 20,
  },

  shopButton: {
    backgroundColor: "#ffffff",
    borderColor: "#6A0DAD",
    borderWidth: 2,
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
    width: "90%",
  },

  shopButtonText: {
    color: "#6A0DAD",
    fontSize: 16,
    fontWeight: "bold",
  },

  browserOverlay: {
    flex: 1,
    backgroundColor: "#fff",
  },

  browserHeader: {
    height: 60,
    backgroundColor: "#f8f8f8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  backButton: {
    padding: 5,
  },

  urlText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    flex: 1,
  },

  webView: {
    flex: 1,
  },
});

export default ViewCompanyCard;
