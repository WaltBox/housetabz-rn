import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = 120;

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
  const activeMessages = messages.filter(m => !m.isResolved && !m.body.includes('(RESOLVED)'));
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
            <LinearGradient
              colors={['#FF5F6D', '#FFC371']} /* Keep original gradient colors */
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={getMessageIcon(message.type)}
                    size={28}
                    color="#fff"
                  />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={[styles.title, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                    {message.title}
                  </Text>
                  <Text 
                    style={[styles.message, fontsLoaded && { fontFamily: 'Poppins-Medium' }]} 
                    numberOfLines={3}
                  >
                    {message.body}
                  </Text>
                </View>
                <View style={styles.chevronContainer}>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#fff"
                  />
                </View>
              </View>
            </LinearGradient>
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
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    width: '100%',
    height: CARD_HEIGHT,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    marginLeft: 16,
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#F3F4F6',
    lineHeight: 20,
  },
  chevronContainer: {
    marginLeft: 8,
    opacity: 0.7,
  }
});

export default UrgentMessageCards;