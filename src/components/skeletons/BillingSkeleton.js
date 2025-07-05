// BillingSkeleton.js
import React from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  StyleSheet, 
  StatusBar 
} from 'react-native';
import { 
  SkeletonShimmer, 
  SkeletonCard, 
  SkeletonBox, 
  SkeletonCircle, 
  SkeletonText, 
  SKELETON_COLORS, 
  getSkeletonSpacing, 
  getSkeletonSizes 
} from './SkeletonUtils';

// Skeleton for header section
const HeaderSkeleton = () => (
  <View style={styles.header}>
    <SkeletonText width={200} height={28} />
    <SkeletonText width={150} height={16} />
  </View>
);

// Skeleton for charge card
const ChargeCardSkeleton = ({ isSelected = false }) => (
  <SkeletonCard style={[
    styles.chargeItem,
    isSelected && styles.selectedChargeItem
  ]}>
    <View style={styles.chargeHeader}>
      <View style={styles.chargeTitleContainer}>
        <View style={styles.chargeTextContent}>
          <SkeletonText 
            width="75%" 
            height={18} 
            style={isSelected ? styles.selectedElement : {}}
          />
          <SkeletonText 
            width="60%" 
            height={14} 
            style={isSelected ? styles.selectedElement : {}}
          />
        </View>
      </View>
      <SkeletonText 
        width={80} 
        height={24} 
        style={isSelected ? styles.selectedElement : {}}
      />
    </View>
    <View style={styles.selectIndicator}>
      <SkeletonText 
        width={100} 
        height={14} 
        style={isSelected ? styles.selectedElement : {}}
      />
      <SkeletonCircle 
        size={20} 
        style={isSelected ? styles.selectedElement : {}}
      />
    </View>
  </SkeletonCard>
);

// Skeleton for payment summary
const PaymentSummarySkeleton = () => (
  <SkeletonCard style={styles.summaryCard}>
    <View style={styles.summaryHeader}>
      <SkeletonText width={140} height={20} />
    </View>
    <View style={styles.summaryContent}>
      <View style={styles.summaryRow}>
        <SkeletonText width={100} height={16} />
        <SkeletonText width={80} height={16} />
      </View>
      <View style={styles.summaryRow}>
        <SkeletonText width={120} height={16} />
        <SkeletonText width={60} height={16} />
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryRow}>
        <SkeletonText width={80} height={18} />
        <SkeletonText width={100} height={18} />
      </View>
    </View>
  </SkeletonCard>
);

// Skeleton for tabs
const TabsSkeleton = () => (
  <View style={styles.tabContainer}>
    <View style={styles.tabIndicator} />
    <View style={styles.tabsWrapper}>
      <View style={styles.tab}>
        <SkeletonText width={80} height={16} style={styles.activeTab} />
        <SkeletonBox 
          width={80} 
          height={3} 
          borderRadius={2}
          style={styles.activeIndicator}
        />
      </View>
      <View style={styles.tab}>
        <SkeletonText width={70} height={16} />
      </View>
    </View>
  </View>
);

// Skeleton for payment button
const PaymentButtonSkeleton = () => (
  <View style={styles.paymentButtonContainer}>
    <SkeletonBox 
      width="100%" 
      height={50} 
      borderRadius={12}
      style={styles.paymentButton}
    />
  </View>
);

// Skeleton for charges list
const ChargesListSkeleton = () => (
  <ScrollView 
    contentContainerStyle={styles.chargesList}
    showsVerticalScrollIndicator={false}
  >
    <ChargeCardSkeleton isSelected={true} />
    <ChargeCardSkeleton />
    <ChargeCardSkeleton />
    <ChargeCardSkeleton />
    <ChargeCardSkeleton />
  </ScrollView>
);

// Main Billing Skeleton Component
const BillingSkeleton = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={SKELETON_COLORS.background} />
      <SafeAreaView style={styles.container}>
        <HeaderSkeleton />
        <TabsSkeleton />
        <ChargesListSkeleton />
        <PaymentSummarySkeleton />
        <PaymentButtonSkeleton />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SKELETON_COLORS.background,
  },

  // Header styles
  header: {
    paddingHorizontal: getSkeletonSpacing.lg,
    paddingVertical: getSkeletonSpacing.lg,
    gap: getSkeletonSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: SKELETON_COLORS.secondary,
  },

  // Tab styles
  tabContainer: {
    backgroundColor: SKELETON_COLORS.cardBackground,
    paddingTop: getSkeletonSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: SKELETON_COLORS.tertiary,
  },
  tabsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: getSkeletonSpacing.lg,
  },
  tab: {
    marginRight: getSkeletonSpacing.xxl,
    paddingBottom: getSkeletonSpacing.lg,
    alignItems: 'center',
    gap: getSkeletonSpacing.sm,
  },
  activeTab: {
    backgroundColor: SKELETON_COLORS.accent,
  },
  activeIndicator: {
    backgroundColor: SKELETON_COLORS.accent,
  },

  // Charges list styles
  chargesList: {
    flex: 1,
    padding: getSkeletonSpacing.lg,
    gap: getSkeletonSpacing.md,
  },

  // Charge card styles
  chargeItem: {
    paddingHorizontal: getSkeletonSpacing.lg,
    paddingVertical: getSkeletonSpacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedChargeItem: {
    borderColor: SKELETON_COLORS.accent,
    backgroundColor: `${SKELETON_COLORS.accent}10`, // 10% opacity
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getSkeletonSpacing.md,
  },
  chargeTitleContainer: {
    flex: 1,
    marginRight: getSkeletonSpacing.md,
  },
  chargeTextContent: {
    gap: getSkeletonSpacing.sm,
  },
  selectIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: getSkeletonSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: SKELETON_COLORS.secondary,
  },
  selectedElement: {
    backgroundColor: SKELETON_COLORS.accent,
  },

  // Payment summary styles
  summaryCard: {
    margin: getSkeletonSpacing.lg,
    padding: getSkeletonSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    marginBottom: getSkeletonSpacing.lg,
    paddingBottom: getSkeletonSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SKELETON_COLORS.secondary,
  },
  summaryContent: {
    gap: getSkeletonSpacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: SKELETON_COLORS.tertiary,
    marginVertical: getSkeletonSpacing.sm,
  },

  // Payment button styles
  paymentButtonContainer: {
    padding: getSkeletonSpacing.lg,
    paddingBottom: getSkeletonSpacing.xxl,
  },
  paymentButton: {
    backgroundColor: SKELETON_COLORS.accent,
  },
});

export default BillingSkeleton;