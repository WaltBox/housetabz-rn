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
import { getHouseTabsData } from '../../config/api';
import apiClient from '../../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

// UPDATED: Add unpaidBills prop
const DashboardTopSection = ({ userFinance, houseFinance, userCharges, house, unpaidBills = [] }) => {
  const { user } = useAuth();

  // Modal visibility state
  const [isUserModalVisible, setUserModalVisible] = useState(false);
  const [isHouseModalVisible, setHouseModalVisible] = useState(false);
  const [showDawgMode, setShowDawgMode] = useState(false);
  
  // Local state for bills if we need to fetch them
  const [localUnpaidBills, setLocalUnpaidBills] = useState(unpaidBills);
  const [fetchingBills, setFetchingBills] = useState(false);

  // Handlers
  const handleUserFinancePress = () => setUserModalVisible(true);
  const handleHouseFinancePress = async () => {
    console.log("🔍 HouseTabz modal opening with data:", {
      houseDataKeys: houseData ? Object.keys(houseData) : 'no houseData',
      houseBalance: houseData?.houseBalance,
      billsCount: localUnpaidBills.length,
      firstBill: localUnpaidBills[0] || 'no bills',
      fetchingBills: fetchingBills,
      modalWillReceive: {
        house: houseData,
        bills: localUnpaidBills
      }
    });
    
    // 🚨 DEBUG: Check bill structure from Dashboard endpoint
    console.log("🚨 DASHBOARD BILLS STRUCTURE DEBUG:", {
      billsCount: localUnpaidBills.length,
      firstBillStructure: localUnpaidBills[0] ? {
        id: localUnpaidBills[0].id,
        hasCharges: !!localUnpaidBills[0].charges,
        hasChargesArray: Array.isArray(localUnpaidBills[0].charges),
        chargesCount: localUnpaidBills[0].charges?.length || 0,
        chargesKeys: localUnpaidBills[0].charges?.[0] ? Object.keys(localUnpaidBills[0].charges[0]) : 'no charges',
        hasUserData: !!localUnpaidBills[0].charges?.[0]?.User,
        userNameField: localUnpaidBills[0].charges?.[0]?.userName,
        billKeys: Object.keys(localUnpaidBills[0])
      } : 'no bills',
      dataSource: 'DASHBOARD_ENDPOINT'
    });
    
    // 🔧 FIX: If bills from dashboard are incomplete, fetch from house tabs endpoint like MyHouseScreen
    if (user?.houseId && (localUnpaidBills.length === 0 || !localUnpaidBills[0]?.charges?.[0]?.User)) {
      console.log("🔧 FIXING: Fetching complete bill data from house tabs endpoint...");
      setFetchingBills(true);
      
      try {
        const houseTabsData = await getHouseTabsData(user.houseId);
        if (houseTabsData?.unpaidBills) {
          console.log("✅ FIXED: Got complete bill data from house tabs endpoint:", {
            billsCount: houseTabsData.unpaidBills.length,
            firstBillStructure: houseTabsData.unpaidBills[0] ? {
              id: houseTabsData.unpaidBills[0].id,
              hasCharges: !!houseTabsData.unpaidBills[0].charges,
              chargesCount: houseTabsData.unpaidBills[0].charges?.length || 0,
              hasUserData: !!houseTabsData.unpaidBills[0].charges?.[0]?.User,
              userNameField: houseTabsData.unpaidBills[0].charges?.[0]?.userName
            } : 'no bills',
            dataSource: 'HOUSE_TABS_ENDPOINT_FALLBACK'
          });
          setLocalUnpaidBills(houseTabsData.unpaidBills);
        }
      } catch (error) {
        console.log("❌ Failed to fetch house tabs data for modal:", error.message);
      } finally {
        setFetchingBills(false);
      }
    }
    
    setHouseModalVisible(true);
  };
  const handleDawgModePress = () => setShowDawgMode(true);

  // Enhanced user for UserTabModal
  const enhancedUser = {
    ...user,
    balance: userFinance?.balance || 0,
    credit: userFinance?.credit || 0,
    points: userFinance?.points || 0,
  };

  useEffect(() => {
    // Update local bills when prop changes
    setLocalUnpaidBills(unpaidBills);
    
    // Debug log to check house data
    console.log("🏠 DashboardTopSection received props:", {
      hasHouse: !!house,
      houseName: house?.name,
      houseBalance: house?.houseBalance,
      financeBalance: house?.finance?.balance,
      houseKeys: house ? Object.keys(house) : 'no house',
      unpaidBillsCount: unpaidBills.length,
      unpaidBillsArray: unpaidBills,
      hasUserFinance: !!userFinance,
      userFinanceBalance: userFinance?.balance,
      hasHouseFinance: !!houseFinance,
      houseFinanceBalance: houseFinance?.balance
      });
      
    // ENHANCED: Log when finance data changes for real-time update tracking
    console.log("💰 DashboardTopSection finance update:", {
      timestamp: new Date().toISOString(),
      userBalance: userFinance?.balance || 0,
      houseBalance: house?.balance || house?.houseBalance || houseFinance?.balance || 0,
      updateTrigger: 'props changed'
    });
  }, [house, unpaidBills, userFinance, houseFinance]);

  // Note: With backend API changes, unpaidBills should now be provided directly in props
  // Remove redundant fetching logic since dashboard API now provides unpaidBills properly

  // FIXED: House data for CurrentHouseTab - now includes bills
  const houseData = {
    id: user?.houseId || house?.id || '1',
    name: house?.name || user?.house?.name || 'Your House',
    finance: houseFinance,
    balance: houseFinance?.balance || 0,
    // IMPORTANT: Use the correct balance - house.balance instead of house.houseBalance
    houseBalance: house?.balance || house?.houseBalance || houseFinance?.balance || 0,
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
            // FIXED: Use the correct balance field - house.balance (127.85) not house.houseBalance (0)
            balance={house?.balance || house?.houseBalance || houseFinance?.balance || 0}
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
          userCharges={userCharges}
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
          bills={localUnpaidBills} // IMPORTANT: Pass the local bills data (includes fetched bills)
          onClose={() => setHouseModalVisible(false)}
          isLoading={fetchingBills} // Pass loading state
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