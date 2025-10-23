import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = 60;

const UrgentMessageCards = ({ messages = [], onMessagePress }) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Light': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  if (!messages || messages.length === 0) return null;
  
  // Filter out resolved messages
  const activeMessages = messages.filter(m => {
    // ✅ BACKEND FIX: Handle cases where body might be undefined
    const messageText = m.body || m.message || '';
    return !m.isResolved && !messageText.includes('(RESOLVED)');
  });
  if (activeMessages.length === 0) return null;

  // Function to determine icon based on message type
  const getMessageIcon = (type) => {
    switch(type) {
      case 'charge_funding':
      case 'charge_overdue':
        return 'warning';
      case 'single_funding':
      case 'funding_missing':
      case 'bill_multi_funding':
      case 'user_multi_funding':
      case 'house_multi_funding':
      case 'roommate_multi_funding':
      case 'house_multi_roommate_funding':
      default:
        return 'account-balance-wallet';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeader, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
        Urgent Notices
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 16}
        snapToAlignment="start"
      >
        {activeMessages.map((message, idx) => (
          <TouchableOpacity
            key={message.id || idx}
            style={styles.cardWrapper}
            onPress={() => onMessagePress && onMessagePress(message)}
            activeOpacity={0.9}
          >
            <View style={styles.cardBackground}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={getMessageIcon(message.type)}
                    size={20}
                    color="#ffffff"
                  />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={[styles.title, fontsLoaded && { fontFamily: 'Poppins-Medium' }]} numberOfLines={1}>
                    {message.title || 'Urgent Notice'}
                  </Text>
                  <Text 
                    style={[styles.message, fontsLoaded && { fontFamily: 'Poppins-Light' }]} 
                    numberOfLines={1}
                  >
                    {message.body || message.message || 'No message content'}
                  </Text>
                </View>
                <View style={styles.chevronContainer}>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color="#dc2626"
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionHeader: {
    marginLeft: 16,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  cardBackground: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: '#fef2f2', // Light red background for urgency
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8, // Square with rounded edges
    backgroundColor: '#ef4444', // Red background for urgent icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626', // Red title for urgency
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#991b1b', // Darker red for message text
    lineHeight: 16,
  },
  chevronContainer: {
    marginLeft: 8,
    opacity: 0.8,
  }
});

export default UrgentMessageCards;