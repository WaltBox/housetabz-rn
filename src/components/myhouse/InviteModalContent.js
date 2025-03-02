import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Adjust path as needed

const InviteModalContent = ({ houseId, onCopy, onShare }) => {
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
        
        const response = await axios.get(`http://localhost:3004/api/houses/${id}`);
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
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#34d399', '#10b981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.iconCircle}>
          <MaterialIcons name="group-add" size={28} color="white" />
        </View>
        <Text style={styles.inviteTitle}>Invite Roommates</Text>
      </LinearGradient>
      
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
            <LinearGradient
              colors={messageCopied ? ['#4ade80', '#22c55e'] : ['#f1f5f9', '#e2e8f0']}
              style={styles.copyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons
                name={messageCopied ? "check" : "content-copy"}
                size={20}
                color={messageCopied ? "white" : "#64748b"}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Share options */}
        <View style={styles.shareOptionsContainer}>
          <TouchableOpacity 
            style={styles.shareOption} 
            onPress={() => onShare('message', house)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#34d399', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareOptionCircle}
            >
              <MaterialIcons name="chat" size={22} color="white" />
            </LinearGradient>
            <Text style={styles.shareOptionText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareOption} 
            onPress={() => onShare('email', house)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#34d399', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareOptionCircle}
            >
              <MaterialIcons name="email" size={22} color="white" />
            </LinearGradient>
            <Text style={styles.shareOptionText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareOption} 
            onPress={() => onShare('more', house)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#34d399', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareOptionCircle}
            >
              <MaterialIcons name="share" size={22} color="white" />
            </LinearGradient>
            <Text style={styles.shareOptionText}>More</Text>
          </TouchableOpacity>
        </View>
        
        {/* QR Code option */}
        <TouchableOpacity 
          style={styles.qrButton} 
          onPress={() => onShare('qr', house)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="qr-code" size={20} color="#34d399" />
          <Text style={styles.qrButtonText}>Show QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inviteTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "white",
  },
  content: {
    padding: 24,
  },
  codeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 2,
  },
  smallCopyButton: {
    marginLeft: 12,
    padding: 8,
  },
  houseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  inviteDescription: {
    fontSize: 15,
    color: "#1e293b",
    marginBottom: 20,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 24,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    marginRight: 12,
    lineHeight: 20,
  },
  copyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  copyButtonGradient: {
    padding: 10,
    borderRadius: 12,
  },
  shareOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shareOption: {
    alignItems: 'center',
  },
  shareOptionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34d399',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default InviteModalContent;