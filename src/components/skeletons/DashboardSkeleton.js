// DashboardSkeleton.js - Main skeleton screen
import React from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  View, 
  Dimensions 
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

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = height * 0.2;

// Skeleton for FinancialSummaryCard
const FinancialCardSkeleton = () => (
  <SkeletonCard width={CARD_WIDTH} height={CARD_HEIGHT} style={styles.financialCard}>
    <View style={styles.cardMain}>
      <View style={styles.cardTop}>
        <SkeletonCircle size={getSkeletonSizes.icon.medium} />
        <SkeletonText width={80} height={getSkeletonSizes.text.medium} />
      </View>
      <View style={styles.balanceContainer}>
        <SkeletonText width={20} height={20} />
        <SkeletonText width={120} height={32} />
      </View>
    </View>
    <SkeletonBox 
      width="100%" 
      height={CARD_HEIGHT * 0.25} 
      borderRadius={0}
      style={styles.cardFooter}
    />
  </SkeletonCard>
);

// Skeleton for DawgModeCard
const DawgModeCardSkeleton = () => (
  <SkeletonCard width={width * 0.38} height={CARD_HEIGHT} style={styles.dawgModeCard}>
    <View style={styles.dawgModeContent}>
      <SkeletonText width={100} height={20} style={styles.dawgModeTitle} />
      <SkeletonCircle size={40} style={styles.dawgModeIcon} />
    </View>
  </SkeletonCard>
);

// Skeleton for TopSection
const TopSectionSkeleton = () => (
  <View style={styles.topSection}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.topScrollContent}
    >
      <View style={styles.cardWrapper}>
        <FinancialCardSkeleton />
      </View>
      <View style={styles.cardWrapper}>
        <FinancialCardSkeleton />
      </View>
      <View style={styles.dawgCardWrapper}>
        <DawgModeCardSkeleton />
      </View>
    </ScrollView>
  </View>
);



// Skeleton for TaskCard
const TaskCardSkeleton = ({ isAlternate = false }) => (
  <SkeletonCard 
    width={width * 0.85} 
    height={120} 
    style={[styles.taskCard, isAlternate ? styles.taskCardAlternate : null]}
  >
    <View style={styles.taskContent}>
      <SkeletonCircle size={26} />
      <View style={styles.taskTextContainer}>
        <SkeletonText width={140} height={12} />
        <SkeletonText width="85%" height={16} />
        <SkeletonText width="70%" height={14} />
      </View>
    </View>
    <View style={styles.taskFooter}>
      <SkeletonText width={100} height={14} />
      <SkeletonCircle size={20} />
    </View>
  </SkeletonCard>
);

// Skeleton for PopupSection
const PopupSectionSkeleton = () => (
  <View style={styles.popupSection}>
    {/* Tasks Section */}
    <View style={styles.sectionWithHeader}>
      <SkeletonText width={80} height={18} style={styles.sectionHeader} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.taskScrollContent}
      >
        <TaskCardSkeleton />
        <TaskCardSkeleton isAlternate={true} />
        <TaskCardSkeleton />
      </ScrollView>
    </View>
  </View>
);

// Skeleton for MiddleSection
const MiddleSectionSkeleton = () => (
  <View style={styles.middleSection}>
    <SkeletonCard 
      width={width * 0.9} 
      height={height * 0.25} 
      style={styles.billTakeoverCard}
    >
      <View style={styles.billTakeoverContent}>
        <SkeletonText width="60%" height={16} />
        <SkeletonText width="40%" height={14} />
      </View>
    </SkeletonCard>
  </View>
);

// Skeleton for PartnerCard
const PartnerCardSkeleton = () => {
  const cardSize = (width - getSkeletonSpacing.lg * 3) / 2;
  
  return (
    <SkeletonCard 
      width={cardSize} 
      height={cardSize + 36} 
      style={styles.partnerCard}
    >
      <SkeletonBox width={cardSize} height={cardSize} borderRadius={16} />
      <View style={styles.partnerLogoContainer}>
        <SkeletonCircle size={cardSize * 0.25} />
    </View>
      <View style={styles.partnerNameContainer}>
        <SkeletonText width="70%" height={14} />
    </View>
    </SkeletonCard>
);
};

// Skeleton for BottomSection
const BottomSectionSkeleton = () => (
  <View style={styles.bottomSection}>
    <View style={styles.sectionWithHeader}>
      <SkeletonText width={120} height={18} style={styles.sectionHeader} />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.partnerScrollContent}
    >
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
    </ScrollView>
    </View>
  </View>
);

// Main Dashboard Skeleton Component
const DashboardSkeleton = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionContainer}>
          <TopSectionSkeleton />
        </View>

        <View style={styles.sectionContainer}>
          <PopupSectionSkeleton />
        </View>

        <View style={styles.sectionContainer}>
          <MiddleSectionSkeleton />
        </View>

        <View style={styles.sectionContainer}>
          <BottomSectionSkeleton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: SKELETON_COLORS.background 
  },
  scrollContent: { 
    paddingTop: getSkeletonSpacing.sm, 
    paddingBottom: getSkeletonSpacing.md 
  },
  sectionContainer: { 
    marginBottom: getSkeletonSpacing.sm 
  },

  // Top Section Styles
  topSection: { 
    marginVertical: getSkeletonSpacing.lg 
  },
  topScrollContent: { 
    paddingLeft: 15, 
    paddingRight: getSkeletonSpacing.lg 
  },
  cardWrapper: { 
    marginRight: getSkeletonSpacing.md 
  },
  dawgCardWrapper: { 
    marginRight: getSkeletonSpacing.md 
  },

  // Financial Card Styles
  financialCard: {
    overflow: 'hidden',
  },
  cardMain: {
    height: CARD_HEIGHT * 0.75,
    padding: getSkeletonSpacing.xl,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSkeletonSpacing.md,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: getSkeletonSpacing.xs,
  },
  cardFooter: {
    backgroundColor: SKELETON_COLORS.secondary,
  },

  // Dawg Mode Card Styles
  dawgModeCard: {
    backgroundColor: '#a855f7',
    overflow: 'hidden',
  },
  dawgModeContent: {
    flex: 1,
    padding: getSkeletonSpacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: getSkeletonSpacing.lg,
  },
  dawgModeTitle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dawgModeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Popup Section Styles
  popupSection: {
    marginVertical: getSkeletonSpacing.sm,
  },
  sectionWithHeader: {
    marginBottom: getSkeletonSpacing.xxl + getSkeletonSpacing.xs,
  },
  sectionHeader: {
    marginLeft: getSkeletonSpacing.lg,
    marginBottom: getSkeletonSpacing.md,
  },



  // Task Card Styles
  taskScrollContent: {
    paddingLeft: 15,
    paddingRight: getSkeletonSpacing.lg,
  },
  taskCard: {
    backgroundColor: '#34d399',
    marginRight: getSkeletonSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardAlternate: {
    backgroundColor: '#f0f9f6',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: getSkeletonSpacing.lg,
    flex: 1,
    gap: getSkeletonSpacing.md,
  },
  taskTextContainer: {
    flex: 1,
    gap: getSkeletonSpacing.xs,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSkeletonSpacing.lg,
    paddingVertical: getSkeletonSpacing.sm,
  },

  // Middle Section Styles
  middleSection: {
    alignItems: 'center',
    marginVertical: getSkeletonSpacing.lg,
  },
  billTakeoverCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billTakeoverContent: {
    padding: getSkeletonSpacing.lg,
    gap: getSkeletonSpacing.sm,
  },

  // Bottom Section Styles
  bottomSection: {
    marginVertical: getSkeletonSpacing.lg,
  },
  partnerScrollContent: {
    paddingLeft: getSkeletonSpacing.lg,
    paddingRight: getSkeletonSpacing.sm,
  },
  partnerCard: {
    marginRight: getSkeletonSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  partnerLogoContainer: {
    position: 'absolute',
    bottom: 36 + getSkeletonSpacing.sm,
    left: getSkeletonSpacing.sm,
    backgroundColor: SKELETON_COLORS.cardBackground,
    padding: 2,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  partnerNameContainer: {
    height: 36,
    backgroundColor: SKELETON_COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSkeletonSpacing.sm,
  },
});

export default DashboardSkeleton;