// DashboardSkeleton.js - Main skeleton screen
import React, { useRef, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  View, 
  Animated,
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

// Custom skeleton shimmer animation
const SkeletonShimmer = ({ children, style }) => {
  const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerOpacity]);

  return (
    <Animated.View style={[style, { opacity: shimmerOpacity }]}>
      {children}
    </Animated.View>
  );
};

// Skeleton for FinancialSummaryCard
const FinancialCardSkeleton = () => (
  <View style={skeletonStyles.financialCard}>
    <View style={skeletonStyles.cardMain}>
      <View style={skeletonStyles.cardTop}>
        <SkeletonShimmer style={skeletonStyles.iconSkeleton} />
        <SkeletonShimmer style={skeletonStyles.titleSkeleton} />
      </View>
      <View style={skeletonStyles.balanceContainer}>
        <SkeletonShimmer style={skeletonStyles.currencySkeleton} />
        <SkeletonShimmer style={skeletonStyles.amountSkeleton} />
      </View>
    </View>
    <SkeletonShimmer style={skeletonStyles.cardFooter} />
  </View>
);

// Skeleton for DawgModeCard
const DawgModeCardSkeleton = () => (
  <SkeletonShimmer style={skeletonStyles.dawgModeCard}>
    <View style={skeletonStyles.dawgModeContent}>
      <View style={skeletonStyles.dawgModeTitle} />
      <View style={skeletonStyles.dawgModeIcon} />
    </View>
  </SkeletonShimmer>
);

// Skeleton for TopSection
const TopSectionSkeleton = () => (
  <View style={skeletonStyles.topSection}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={skeletonStyles.topScrollContent}
    >
      <View style={skeletonStyles.cardWrapper}>
        <FinancialCardSkeleton />
      </View>
      <View style={skeletonStyles.cardWrapper}>
        <FinancialCardSkeleton />
      </View>
      <View style={skeletonStyles.dawgCardWrapper}>
        <DawgModeCardSkeleton />
      </View>
    </ScrollView>
  </View>
);

// Skeleton for UrgentMessageCard
const UrgentMessageCardSkeleton = () => (
  <SkeletonShimmer style={skeletonStyles.urgentCard}>
    <View style={skeletonStyles.urgentContent}>
      <View style={skeletonStyles.urgentIcon} />
      <View style={skeletonStyles.urgentTextContainer}>
        <View style={skeletonStyles.urgentTitle} />
        <View style={skeletonStyles.urgentMessage1} />
        <View style={skeletonStyles.urgentMessage2} />
      </View>
      <View style={skeletonStyles.urgentChevron} />
    </View>
  </SkeletonShimmer>
);

// Skeleton for TaskCard
const TaskCardSkeleton = ({ isAlternate = false }) => (
  <View style={[
    skeletonStyles.taskCard, 
    isAlternate ? skeletonStyles.taskCardAlternate : null
  ]}>
    <View style={skeletonStyles.taskContent}>
      <SkeletonShimmer style={[
        skeletonStyles.taskIcon,
        isAlternate ? skeletonStyles.taskIconAlternate : null
      ]} />
      <View style={skeletonStyles.taskTextContainer}>
        <SkeletonShimmer style={[
          skeletonStyles.taskCategory,
          isAlternate ? skeletonStyles.taskCategoryAlternate : null
        ]} />
        <SkeletonShimmer style={[
          skeletonStyles.taskTitle,
          isAlternate ? skeletonStyles.taskTitleAlternate : null
        ]} />
        <SkeletonShimmer style={[
          skeletonStyles.taskSubtitle,
          isAlternate ? skeletonStyles.taskSubtitleAlternate : null
        ]} />
      </View>
    </View>
    <View style={skeletonStyles.taskFooter}>
      <SkeletonShimmer style={[
        skeletonStyles.taskAction,
        isAlternate ? skeletonStyles.taskActionAlternate : null
      ]} />
      <SkeletonShimmer style={[
        skeletonStyles.taskChevron,
        isAlternate ? skeletonStyles.taskChevronAlternate : null
      ]} />
    </View>
  </View>
);

// Skeleton for PopupSection
const PopupSectionSkeleton = () => (
  <View style={skeletonStyles.popupSection}>
    {/* Urgent Messages Section */}
    <View style={skeletonStyles.sectionWithHeader}>
      <SkeletonShimmer style={skeletonStyles.sectionHeader} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={skeletonStyles.urgentScrollContent}
      >
        <UrgentMessageCardSkeleton />
        <UrgentMessageCardSkeleton />
      </ScrollView>
    </View>

    {/* Tasks Section */}
    <View style={skeletonStyles.sectionWithHeader}>
      <SkeletonShimmer style={skeletonStyles.sectionHeader} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={skeletonStyles.taskScrollContent}
      >
        <TaskCardSkeleton />
        <TaskCardSkeleton isAlternate={true} />
        <TaskCardSkeleton />
      </ScrollView>
    </View>
  </View>
);

// Skeleton for MiddleSection (Bill Takeover Card)
const MiddleSectionSkeleton = () => (
  <View style={skeletonStyles.middleSection}>
    <SkeletonShimmer style={skeletonStyles.billTakeoverCard}>
      <View style={skeletonStyles.billTakeoverContent}>
        <View style={skeletonStyles.billTakeoverText}>
          <View style={skeletonStyles.billTakeoverLine1} />
          <View style={skeletonStyles.billTakeoverLine2} />
          <View style={skeletonStyles.billTakeoverLink} />
        </View>
      </View>
    </SkeletonShimmer>
  </View>
);

// Skeleton for PartnerCard
const PartnerCardSkeleton = () => (
  <View style={skeletonStyles.partnerCard}>
    <SkeletonShimmer style={skeletonStyles.partnerCover} />
    <View style={skeletonStyles.partnerLogoContainer}>
      <SkeletonShimmer style={skeletonStyles.partnerLogo} />
    </View>
    <View style={skeletonStyles.partnerNameContainer}>
      <SkeletonShimmer style={skeletonStyles.partnerName} />
    </View>
  </View>
);

// Skeleton for BottomSection
const BottomSectionSkeleton = () => (
  <View style={skeletonStyles.bottomSection}>
    <View style={skeletonStyles.bottomHeader}>
      <SkeletonShimmer style={skeletonStyles.bottomTitle} />
      <SkeletonShimmer style={skeletonStyles.viewAllButton} />
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={skeletonStyles.partnerScrollContent}
    >
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
    </ScrollView>
  </View>
);

// Main Dashboard Skeleton Component
const DashboardSkeleton = () => {
  return (
    <SafeAreaView style={skeletonStyles.container}>
      <ScrollView
        contentContainerStyle={skeletonStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={skeletonStyles.sectionContainer}>
          <TopSectionSkeleton />
        </View>

        <View style={skeletonStyles.sectionContainer}>
          <PopupSectionSkeleton />
        </View>

        <View style={skeletonStyles.sectionContainer}>
          <MiddleSectionSkeleton />
        </View>

        <View style={skeletonStyles.sectionContainer}>
          <BottomSectionSkeleton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Comprehensive styles that match your actual components
const skeletonStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#dff6f0' 
  },
  scrollContent: { 
    paddingTop: 8, 
    paddingBottom: 12 
  },
  sectionContainer: { 
    marginBottom: 8 
  },

  // Top Section Skeletons
  topSection: { 
    marginVertical: 16 
  },
  topScrollContent: { 
    paddingLeft: 15, 
    paddingRight: 16 
  },
  cardWrapper: { 
    width: width * 0.75, 
    marginRight: 12 
  },
  dawgCardWrapper: { 
    width: width * 0.38, 
    marginRight: 12 
  },

  // Financial Card Skeleton
  financialCard: {
    width: '100%',
    height: Dimensions.get('window').height * 0.2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardMain: {
    height: '75%',
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  titleSkeleton: {
    width: 80,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currencySkeleton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginRight: 4,
    marginBottom: 4,
  },
  amountSkeleton: {
    width: 120,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  cardFooter: {
    height: '25%',
    backgroundColor: '#f3f4f6',
  },

  // Dawg Mode Card Skeleton
  dawgModeCard: {
    width: '100%',
    height: Dimensions.get('window').height * 0.2,
    backgroundColor: '#a855f7',
    borderRadius: 16,
  },
  dawgModeContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dawgModeTitle: {
    width: 100,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  dawgModeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Popup Section Skeletons
  popupSection: {
    marginVertical: 8,
  },
  sectionWithHeader: {
    marginBottom: 28,
  },
  sectionHeader: {
    width: 120,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
    marginLeft: 16,
    marginBottom: 12,
  },

  // Urgent Message Card Skeleton
  urgentScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  urgentCard: {
    width: width * 0.75,
    height: 120,
    backgroundColor: '#f97316',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  urgentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    height: '100%',
  },
  urgentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  urgentTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  urgentTitle: {
    width: 120,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 8,
  },
  urgentMessage1: {
    width: '90%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 4,
  },
  urgentMessage2: {
    width: '70%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  urgentChevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
  },

  // Task Card Skeletons
  taskScrollContent: {
    paddingLeft: 15,
    paddingRight: 16,
  },
  taskCard: {
    width: width * 0.85,
    height: 120,
    backgroundColor: '#34d399',
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
  },
  taskCardAlternate: {
    backgroundColor: '#f0fdf4',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    flex: 1,
  },
  taskIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  taskIconAlternate: {
    backgroundColor: '#34d399',
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  taskCategory: {
    width: 100,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
  taskCategoryAlternate: {
    backgroundColor: '#34d399',
  },
  taskTitle: {
    width: 140,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 6,
  },
  taskTitleAlternate: {
    backgroundColor: '#1f2937',
  },
  taskSubtitle: {
    width: 180,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  taskSubtitleAlternate: {
    backgroundColor: '#6b7280',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  taskAction: {
    width: 80,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  taskActionAlternate: {
    backgroundColor: '#34d399',
  },
  taskChevron: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  taskChevronAlternate: {
    backgroundColor: '#34d399',
  },

  // Middle Section (Bill Takeover) Skeleton
  middleSection: {
    marginVertical: 0,
    alignItems: 'center',
  },
  billTakeoverCard: {
    width: width * 0.9,
    height: (width * 0.9) / 3,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  billTakeoverContent: {
    padding: 16,
    justifyContent: 'center',
  },
  billTakeoverText: {
    width: '50%',
  },
  billTakeoverLine1: {
    width: '90%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    marginBottom: 6,
  },
  billTakeoverLine2: {
    width: '75%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  billTakeoverLink: {
    width: 120,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34d399',
  },

  // Bottom Section (Partners) Skeleton
  bottomSection: {
    marginBottom: 16,
  },
  bottomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  bottomTitle: {
    width: 80,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
  },
  viewAllButton: {
    width: 70,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34d399',
  },
  partnerScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  partnerCard: {
    width: width * 0.38,
    height: width * 0.38 + 36,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  partnerCover: {
    width: '100%',
    height: width * 0.38,
    backgroundColor: '#f5f5f5',
  },
  partnerLogoContainer: {
    position: 'absolute',
    bottom: 36 + 8,
    left: 8,
    width: (width * 0.38) * 0.25 + 4,
    height: (width * 0.38) * 0.25 + 4,
    borderRadius: ((width * 0.38) * 0.25 + 4) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerLogo: {
    width: (width * 0.38) * 0.25,
    height: (width * 0.38) * 0.25,
    borderRadius: ((width * 0.38) * 0.25) / 2,
    backgroundColor: '#e5e7eb',
  },
  partnerNameContainer: {
    height: 36,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  partnerName: {
    width: '80%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
  },
});

export default DashboardSkeleton;