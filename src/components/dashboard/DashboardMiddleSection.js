import React from 'react';
import { View, StyleSheet } from 'react-native';
import BillTakeoverCard from '../../components/dashboard/middleSection/BillTakeOverCard';

const DashboardMiddleSection = ({ onBillTakeoverPress }) => (
  <View style={styles.container}>
    <BillTakeoverCard onPress={onBillTakeoverPress} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    alignItems: 'center',
  },
});

export default DashboardMiddleSection;
