import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../config/api";

const PaymentAuthScreen = ({ onSuccess, onCancel, onError, paymentData }) => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to check house service status
  const checkHouseServiceStatus = async (apiKey, houseId) => {
    try {
      console.log('🔍 Checking house service status after auth for:', { apiKey, houseId });
      
      // First get partner ID from API key
      const partnerLookup = await apiClient.get('/api/partners/by-api-key', { 
        params: { apiKey } 
      });
      
      console.log('🔍 Partner lookup response:', partnerLookup.data);
      
      if (!partnerLookup.data.success) {
        throw new Error('Invalid API key');
      }
      
      const partnerId = partnerLookup.data.partnerId;
      console.log('🔍 Found partnerId:', partnerId);
      
      // Check house service status
      console.log('🔍 Making house service status request with:', { partnerId, houseId });
      const response = await apiClient.post('/api/sdk/check-house-service-status', {
        partnerId,
        houseId
      });
      
      console.log('🔍 House service status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking house service status:', error);
      console.error('❌ Error details:', error.response?.data);
      return { exists: false }; // Default to allowing new connection on error
    }
  };

  const handleLogin = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Authenticate user
      console.log('🔐 Starting authentication...');
      const loginResult = await login(email, password);
      console.log('✅ Authentication successful:', loginResult);
      
      // Get user from context after successful login
      const currentUser = user;
      console.log('🔍 Current user from context:', currentUser);
      
      // Step 2: Check if house already has this service
      if (paymentData && paymentData.apiKey && currentUser && currentUser.houseId) {
        console.log('🏠 Checking house service status after authentication...');
        console.log('🏠 Payment data:', paymentData);
        console.log('🏠 User house ID:', currentUser.houseId);
        
        const statusCheck = await checkHouseServiceStatus(paymentData.apiKey, currentUser.houseId);
        
        if (statusCheck.exists) {
          console.log('🎯 Service already exists:', statusCheck);
          
          // SIMPLIFIED: Always show ExistingRequestModal regardless of status
          console.log('🔄 Existing service found, showing existing request modal');
          onSuccess({
            type: 'existing_service',
            serviceStatus: statusCheck
          });
          return;
        } else {
          console.log('🆕 No existing service found');
        }
      } else {
        console.log('⚠️ Skipping status check - missing data:', {
          hasPaymentData: !!paymentData,
          hasApiKey: !!(paymentData && paymentData.apiKey),
          hasUser: !!currentUser,
          hasHouseId: !!(currentUser && currentUser.houseId),
          houseId: currentUser?.houseId
        });
      }
      
      // Step 3: No existing service found - proceed with normal flow
      console.log('📝 Proceeding to RequestConfirmationScreen');
      onSuccess({
        type: 'new_request',
        message: 'Proceeding to confirmation screen'
      });
      
    } catch (err) {
      console.error('❌ Error during authentication or status check:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/housetabzlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>
        Connect to <Text style={styles.housetabz}>HouseTabz</Text>
      </Text>
      <Text style={styles.subtitle}>
        Enter your credentials to continue
      </Text>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Authenticate</Text>
          )}
        </TouchableOpacity>

        {/* Separator with horizontal lines and "or" text */}
        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Inverse pill white container for "Get the App" */}
        <TouchableOpacity
          style={styles.getAppButton}
          onPress={() => {
            alert("Download the HouseTabz app to create an account");
          }}
        >
          <Text style={styles.getAppButtonText}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "System",
  },
  housetabz: {
    fontFamily: "Montserrat-Black",
    color: "#34d399",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "System",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "System",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#1e293b",
    fontFamily: "System",
  },
  button: {
    backgroundColor: "#34d399",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  errorText: {
    color: "#ef4444",
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "System",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#34d399",
  },
  separatorText: {
    marginHorizontal: 8,
    color: "#34d399",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  getAppButton: {
    backgroundColor: "#fff",
    borderColor: "#34d399",
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  getAppButtonText: {
    color: "#34d399",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
});

export default PaymentAuthScreen;