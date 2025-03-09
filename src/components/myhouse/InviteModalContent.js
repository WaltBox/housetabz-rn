// InviteModalContent.jsx
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions 
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../config/api";

const { width } = Dimensions.get("window");

const InviteModalContent = ({ houseId, onCopy, onShare, onClose }) => {
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the passed houseId or fetch from user if available
        const id = houseId || (user?.houseId ? user.houseId : null);
        if (!id) {
          throw new Error("No house ID available");
        }
        
        const response = await apiClient.get(`/api/houses/${id}`);
        setHouse(response.data);
      } catch (err) {
        console.error("Error fetching house data:", err);
        setError("Unable to load house information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHouseData();
  }, [houseId, user]);

  const handleCopyCode = () => {
    if (house?.house_code) {
      onCopy(house.house_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleCopyMessage = () => {
    if (house) {
      const message = `Join my house "${house.name}" on HouseTabz! Use house code: ${house.house_code}`;
      onCopy(message);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
        <Text style={styles.loadingText}>Loading house information...</Text>
      </View>
    );
  }

  if (error || !house) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error || "House information not available"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Close button */}
      <View style={styles.header}>
        <Text style={styles.title}>Invite Roommates</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>
      
      {/* Main content */}
      <View style={styles.content}>
        {/* House code display */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>YOUR HOUSE CODE</Text>
          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{house.house_code}</Text>
            <TouchableOpacity 
              style={styles.smallCopyButton} 
              onPress={handleCopyCode}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={codeCopied ? "check" : "content-copy"}
                size={18}
                color={codeCopied ? "#34d399" : "#64748b"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.houseName}>{house.name}</Text>
        </View>
        
        <Text style={styles.inviteDescription}>
          Share this code or invitation message with your roommates
        </Text>
        
        {/* Message to copy */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText} numberOfLines={2}>
            Join my house "{house.name}" on HouseTabz! Use house code: {house.house_code}
          </Text>
          <TouchableOpacity 
            style={styles.copyButton} 
            onPress={handleCopyMessage}
            activeOpacity={0.7}
          >
            <View style={[styles.copyButtonView, messageCopied && styles.copiedButtonView]}>
              <MaterialIcons
                name={messageCopied ? "check" : "content-copy"}
                size={20}
                color={messageCopied ? "white" : "#64748b"}
              />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Share options */}
        <View style={styles.shareOptionsContainer}>
          <TouchableOpacity 
            style={styles.shareOption} 
            onPress={() => onShare('message', house)}
            activeOpacity={0.8}
          >
            <View style={styles.shareOptionCircle}>
              <MaterialIcons name="chat" size={22} color="white" />
            </View>
            <Text style={styles.shareOptionText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareOption} 
            onPress={() => onShare('email', house)}
            activeOpacity={0.8}
          >
            <View style={styles.shareOptionCircle}>
              <MaterialIcons name="email" size={22} color="white" />
            </View>
            <Text style={styles.shareOptionText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareOption} 
            onPress={() => onShare('more', house)}
            activeOpacity={0.8}
          >
            <View style={styles.shareOptionCircle}>
              <MaterialIcons name="share" size={22} color="white" />
            </View>
            <Text style={styles.shareOptionText}>More</Text>
          </TouchableOpacity>
        </View>
        
        {/* Done button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  codeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#34d399",
    letterSpacing: 2,
  },
  smallCopyButton: {
    marginLeft: 8,
    padding: 6,
  },
  houseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  inviteDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 20,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    marginRight: 12,
    lineHeight: 20,
  },
  copyButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  copyButtonView: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  copiedButtonView: {
    backgroundColor: "#34d399",
  },
  shareOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  shareOption: {
    alignItems: "center",
  },
  shareOptionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "#34d399",
  },
  shareOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  doneButton: {
    backgroundColor: "#34d399",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  errorContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#34d399",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default InviteModalContent