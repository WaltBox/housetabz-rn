import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import FinancialSummaryCard from './FinancialSummaryCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const FinancialSummarySection = ({ 
  userFinance, 
  houseFinance, 
  onPressUser, 
  onPressHouse,
  onScroll
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.cardWrapper}>
          <FinancialSummaryCard
            title="YourTab"
            balance={userFinance.balance || 0}
            iconName="account-balance-wallet"
            onPress={onPressUser}
            statusText=""
          />
        </View>
        
        <View style={styles.cardWrapper}>
          <FinancialSummaryCard
            title="HouseTab"
            balance={houseFinance.balance || 0}
            iconName="home"
            onPress={onPressHouse}
            statusText=""
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  scrollContent: {
    paddingLeft: 15, // Small 5px margin at the start
    paddingRight: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
});

export default FinancialSummarySection;