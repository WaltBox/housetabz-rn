// CustomHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const TopBar = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.headerTitle}>HouseTabz</Text>
          </TouchableOpacity>
    
          <View style={styles.iconContainer}>
            <TouchableOpacity>
              <Icon name="notifications-outline" size={24} color="green" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="settings-outline" size={24} color="green" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 95,
    padding: 20,
    backgroundColor: 'white',
    elevation: 4,
  },
  headerTitle: {
    color: 'green',
    fontSize: 20,
    marginLeft: 5,
    marginTop: 32
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 33
  },
  icon: {
    marginLeft: 16, // Space between icons
  },
});

export default TopBar;
