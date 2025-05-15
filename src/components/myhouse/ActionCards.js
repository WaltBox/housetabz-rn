import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useFonts } from 'expo-font';

const ActionCards = ({ houseBalance = 0, onCurrentTabPress, onPaidTabPress }) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-ExtraBold': require('../../../assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
    'Poppins-Black': require('../../../assets/fonts/Poppins/Poppins-Black.ttf'),
  });

  // Format the balance to display properly
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(houseBalance || 0);

  return (
    <View style={styles.container}>
      <View style={styles.actionCards}>
        <TouchableOpacity 
          style={styles.currentTabCard} 
          onPress={onCurrentTabPress}
          activeOpacity={0.9}
        >
          {/* Background Design Element for CurrentTab */}
          <View style={styles.backgroundDesign}>
            <Svg height="160" width="100%" viewBox="0 0 160 160" style={styles.backgroundSvg}>
              <Defs>
                <LinearGradient id="gradientCurrent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#34d399" />
                  <Stop offset="100%" stopColor="#10b981" />
                </LinearGradient>
                <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="160" height="160" rx="16" fill="url(#gradientCurrent)" />
              <Circle cx="140" cy="20" r="40" fill="url(#accentGradient)" />
              <Circle cx="30" cy="140" r="50" fill="url(#accentGradient)" />
            </Svg>
          </View>
          
          <Text style={[
            styles.titleText,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>
            CurrentTab
          </Text>
          
          <View style={styles.balanceContainer}>
            <Text style={[
              styles.balanceText,
              fontsLoaded && { fontFamily: 'Poppins-Black' }
            ]}>
              {formattedBalance}
            </Text>
          </View>
          
          <View style={styles.iconCircle}>
            <MaterialIcons name="chevron-right" size={22} color="#10b981" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.paidTabCard} 
          onPress={onPaidTabPress}
          activeOpacity={0.9}
        >
          {/* Background Design Element for PaidTabz */}
          <View style={styles.backgroundDesign}>
            <Svg height="160" width="100%" viewBox="0 0 160 160" style={styles.backgroundSvg}>
              <Defs>
                <LinearGradient id="gradientPaid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#8b5cf6" />
                  <Stop offset="100%" stopColor="#7c3aed" />
                </LinearGradient>
                <LinearGradient id="accentGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="160" height="160" rx="16" fill="url(#gradientPaid)" />
              
              {/* Decorative bars suggesting history/timeline */}
              <Rect x="40" y="120" width="15" height="20" rx="2" fill="url(#accentGradient2)" />
              <Rect x="65" y="110" width="15" height="30" rx="2" fill="url(#accentGradient2)" />
              <Rect x="90" y="100" width="15" height="40" rx="2" fill="url(#accentGradient2)" />
              <Rect x="115" y="90" width="15" height="50" rx="2" fill="url(#accentGradient2)" />
            </Svg>
          </View>
          
          <Text style={[
            styles.paidTitleText,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>
            PaidTabz
          </Text>
          
          <View style={styles.paidFeatureContainer}>
            <Text style={[
              styles.paidFeatureText,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>
              View Payment History
            </Text>
          </View>
          
          <View style={styles.paidIconCircle}>
            <MaterialIcons name="chevron-right" size={22} color="#7c3aed" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#dff6f0", // Match parent background color
  },
  actionCards: {
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#dff6f0", // Match parent background color
  },
  currentTabCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#0d9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    height: 160,
    justifyContent: "space-between",
    overflow: "hidden", // Ensure content respects the border radius
    position: "relative",
    backgroundColor: "#10b981", // Fallback background color
  },
  paidTabCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#6d28d9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    height: 160,
    justifyContent: "space-between",
    overflow: "hidden", // Ensure content respects the border radius
    position: "relative",
    backgroundColor: "#7c3aed", // Fallback background color
  },
  backgroundDesign: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16, // Match the parent's border radius
    overflow: "hidden", // Ensure SVG respects the border radius
  },
  backgroundSvg: {
    position: "absolute",
    borderRadius: 16, // Match the parent's border radius
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    zIndex: 2,
  },
  paidTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    zIndex: 2,
  },
  balanceContainer: {
    zIndex: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  balanceText: {
    fontSize: 30,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  paidFeatureContainer: {
    zIndex: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  paidFeatureText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    zIndex: 2,
  },
  paidIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    zIndex: 2,
  },
});

export default ActionCards;