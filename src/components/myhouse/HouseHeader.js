import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const HouseHeader = ({ houseName, onInvitePress }) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Montserrat-Black': require('../../../assets/fonts/Montserrat-Black.ttf'), // Keep Montserrat
  });

  return (
    <View style={styles.header}>
      {/* House name */}
      <Text style={[
        styles.headerTitle,
        fontsLoaded && { fontFamily: 'Montserrat-Black' } // Keep Montserrat for header
      ]}>
        {houseName || 'My House'}
      </Text>

      {/* Invite button with plus and label beneath */}
      <View style={styles.inviteContainer}>
        <TouchableOpacity
          onPress={onInvitePress}
          activeOpacity={0.8}
          style={styles.inviteTouch}
        >
          <View style={styles.inviteCircle}>
            <MaterialIcons name="add" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={[
          styles.inviteLabel,
          fontsLoaded && { fontFamily: 'Poppins-Medium' }
        ]}>
          Invite Roommates
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dff6f0',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
  },
  inviteContainer: {
    alignItems: 'center',
  },
  inviteTouch: {
    // tighten touch area if needed
  },
  inviteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inviteLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default HouseHeader;