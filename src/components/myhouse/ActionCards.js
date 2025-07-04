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
        {/* CurrentTab Card - Now Horizontal */}
        <TouchableOpacity 
          style={styles.currentTabCard} 
          onPress={onCurrentTabPress}
          activeOpacity={0.9}
        >
          {/* Background Design Element for CurrentTab */}
          <View style={styles.backgroundDesign}>
            <Svg height="80" width="100%" viewBox="0 0 320 80" style={styles.backgroundSvg}>
              <Defs>
                <LinearGradient id="gradientCurrent" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#34d399" />
                  <Stop offset="100%" stopColor="#10b981" />
                </LinearGradient>
                <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="320" height="80" rx="16" fill="url(#gradientCurrent)" />
              <Circle cx="280" cy="20" r="30" fill="url(#accentGradient)" />
              <Circle cx="40" cy="60" r="25" fill="url(#accentGradient)" />
            </Svg>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Text style={[
                styles.titleText,
                fontsLoaded && { fontFamily: 'Poppins-Bold' }
              ]}>
                CurrentTab
              </Text>
              <Text style={[
                styles.balanceText,
                fontsLoaded && { fontFamily: 'Poppins-Black' }
              ]}>
                {formattedBalance}
              </Text>
            </View>
            
            <View style={styles.iconCircle}>
              <MaterialIcons name="chevron-right" size={24} color="#10b981" />
            </View>
          </View>
        </TouchableOpacity>
        
        {/* PaidTabz Card - Now Horizontal */}
        <TouchableOpacity 
          style={styles.paidTabCard} 
          onPress={onPaidTabPress}
          activeOpacity={0.9}
        >
          {/* Background Design Element for PaidTabz */}
          <View style={styles.backgroundDesign}>
            <Svg height="80" width="100%" viewBox="0 0 320 80" style={styles.backgroundSvg}>
              <Defs>
                <LinearGradient id="gradientPaid" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#8b5cf6" />
                  <Stop offset="100%" stopColor="#7c3aed" />
                </LinearGradient>
                <LinearGradient id="accentGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="320" height="80" rx="16" fill="url(#gradientPaid)" />
              
              {/* Decorative bars suggesting history/timeline */}
              <Rect x="240" y="50" width="8" height="20" rx="2" fill="url(#accentGradient2)" />
              <Rect x="255" y="40" width="8" height="30" rx="2" fill="url(#accentGradient2)" />
              <Rect x="270" y="35" width="8" height="35" rx="2" fill="url(#accentGradient2)" />
              <Rect x="285" y="25" width="8" height="45" rx="2" fill="url(#accentGradient2)" />
            </Svg>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Text style={[
                styles.paidTitleText,
                fontsLoaded && { fontFamily: 'Poppins-Bold' }
              ]}>
                PaidTabz
              </Text>
              <Text style={[
                styles.paidFeatureText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                View Payment History
              </Text>
            </View>
            
            <View style={styles.paidIconCircle}>
              <MaterialIcons name="chevron-right" size={24} color="#7c3aed" />
            </View>
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
    backgroundColor: "#dff6f0", // Match parent background color
  },
  currentTabCard: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#0d9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    height: 80,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#10b981", // Fallback background color
  },
  paidTabCard: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#6d28d9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    height: 80,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#7c3aed", // Fallback background color
  },
  backgroundDesign: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: "hidden",
  },
  backgroundSvg: {
    position: "absolute",
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: '100%',
    zIndex: 2,
  },
  cardLeft: {
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  paidTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  paidFeatureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  paidIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
});

export default ActionCards;