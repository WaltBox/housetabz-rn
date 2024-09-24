import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PageHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>HouseTabz</Text>
      <MaterialIcons name="notifications-none" size={24} color="green" />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#fff', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, 
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
  },
});

export default PageHeader;
