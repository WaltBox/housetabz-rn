import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = height * 0.2;

const FinancialSummaryCard = ({ 
  title, 
  balance, 
  iconName = 'account-balance-wallet',
  onPress,
}) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Montserrat-Black': require('../../../../assets/fonts/Montserrat-Black.ttf'), // Keep loading Montserrat
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Main content */}
      <View style={styles.mainContent}>
        <View style={styles.topContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={iconName} size={28} color="#34d399" />
          </View>
          <Text style={[
            styles.title,
            fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
          ]}>
            {title}
          </Text>
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={[
            styles.amountPrefix,
            fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
          ]}>
            $
          </Text>
          <Text style={styles.amount}>{balance.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* View more footer */}
      <View style={styles.viewMoreFooter}>
        <Text style={[
          styles.viewMoreText,
          fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
        ]}>
          View More
        </Text>
        <MaterialIcons name="chevron-right" size={24} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden', // Ensures the footer doesn't overflow the rounded corners
  },
  mainContent: {
    height: CARD_HEIGHT * 0.75, // Takes up top 75% of card
    padding: 20,
    justifyContent: 'space-between',
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amountPrefix: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -1,
    fontFamily: 'Montserrat-Black', // Kept as Montserrat-Black
  },
  viewMoreFooter: {
    height: CARD_HEIGHT * 0.25, // Takes up bottom 25% of card
    backgroundColor: '#34d399',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  viewMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinancialSummaryCard;