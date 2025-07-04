// Updated DashboardTopSection.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import FinancialSummaryCard from './topSection/FinancialSummaryCard';
import DawgModeCard from './topSection/DawgModeCard';
import DawgModeModal from '../../modals/DawgModeModal';
import UserTabModal from '../../modals/UserTabModal';
import CurrentHouseTab from '../../modals/CurrentHouseTab';
import ModalComponent from '../../components/ModalComponent';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

// UPDATED: Add unpaidBills prop
const DashboardTopSection = ({ userFinance, houseFinance, userCharges, house, unpaidBills = [] }) => {
  const { user } = useAuth();

  // Modal visibility state
  const [isUserModalVisible, setUserModalVisible] = useState(false);
  const [isHouseModalVisible, setHouseModalVisible] = useState(false);
  const [showDawgMode, setShowDawgMode] = useState(false);

  // Handlers
  const handleUserFinancePress = () => setUserModalVisible(true);
  const handleHouseFinancePress = () => setHouseModalVisible(true);
  const handleDawgModePress = () => setShowDawgMode(true);

  // Enhanced user for UserTabModal
  const enhancedUser = {
    ...user,
    balance: userFinance?.balance || 0,
    credit: userFinance?.credit || 0,
    points: userFinance?.points || 0,
    charges: userCharges || [],
  };

  useEffect(() => {
    // Debug log to check house data
    if (house) {
      console.log("House data in DashboardTopSection:", {
        name: house.name,
        houseBalance: house.houseBalance,
        financeBalance: house.finance?.balance,
        unpaidBillsCount: unpaidBills.length
      });
    }
  }, [house, unpaidBills]);

  // FIXED: House data for CurrentHouseTab - now includes bills
  const houseData = {
    id: user?.houseId || house?.id || '1',
    name: house?.name || user?.house?.name || 'Your House',
    finance: houseFinance,
    balance: houseFinance?.balance || 0,
    // IMPORTANT: Add the calculated house balance from bills
    houseBalance: house?.houseBalance || 0,
    // Direct reference to house object for complete data access
    ...house,
    // Ensure we have these specific properties 
    statusIndex: house?.statusIndex || null,
    hsi: typeof house?.hsi === 'number' ? house.hsi : (house?.statusIndex?.score || 45)
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        <View style={styles.cardWrapper}>
          <FinancialSummaryCard
            title="YourTab"
            balance={userFinance?.balance || 0}
            iconName="account-balance-wallet"
            onPress={handleUserFinancePress}
          />
        </View>

        <View style={styles.cardWrapper}>
          <FinancialSummaryCard
            title="HouseTab"
            // FIXED: Use the calculated house balance, not just finance balance
            balance={house?.houseBalance || houseFinance?.balance || 0}
            iconName="home"
            onPress={handleHouseFinancePress}
          />
        </View>

        <View style={styles.cardWrapperSmall}>
          <DawgModeCard onPress={handleDawgModePress} />
        </View>
      </ScrollView>

      {/* Dawg Mode Modal */}
      <ModalComponent
        visible={showDawgMode}
        onClose={() => setShowDawgMode(false)}
        fullScreen={true}
        backgroundColor="#6d28d9"
        hideCloseButton={false}
        useBackArrow={true}
        title="Dawg Mode"
        headerStyle={{ backgroundColor: 'transparent', borderBottomWidth: 0 }}
      >
        <DawgModeModal house={houseData} />
      </ModalComponent>

      {/* User Tab Modal */}
      <ModalComponent
        visible={isUserModalVisible}
        onClose={() => setUserModalVisible(false)}
        fullScreen
        backgroundColor="#dff6f0"
      >
        <UserTabModal
          visible={isUserModalVisible}
          user={enhancedUser}
          onClose={() => setUserModalVisible(false)}
        />
      </ModalComponent>

      {/* FIXED: Current House Tab Modal - now passes bills data */}
      <ModalComponent
        visible={isHouseModalVisible}
        onClose={() => setHouseModalVisible(false)}
        fullScreen
        backgroundColor="#dff6f0"
      >
        <CurrentHouseTab
          house={houseData}
          bills={unpaidBills} // IMPORTANT: Pass the bills data
          onClose={() => setHouseModalVisible(false)}
        />
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  scrollContent: { paddingLeft: 15, paddingRight: 16 },
  cardWrapper: { width: CARD_WIDTH, marginRight: 12 },
  cardWrapperSmall: { marginRight: 12, width: CARD_WIDTH * 0.5 },
});

export default DashboardTopSection;