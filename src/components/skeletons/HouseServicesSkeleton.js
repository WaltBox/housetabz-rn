// HouseServicesSkeleton.js
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
    <SkeletonText width={160} height={24} />
  </View>
);

// Skeleton for individual service card
const ServiceCardSkeleton = () => (
  <SkeletonCard style={styles.serviceCard}>
    <View style={styles.serviceContent}>
      <View style={styles.serviceInfo}>
        {/* Service name */}
        <SkeletonText width="70%" height={18} style={styles.serviceName} />
        
        {/* Funding info line */}
        <View style={styles.fundingInfo}>
          <SkeletonText width={80} height={14} />
          <SkeletonText width={120} height={14} />
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <SkeletonBox 
            width="35%" 
            height={6} 
            borderRadius={3}
            style={styles.progressBarFill}
          />
        </View>
        
        {/* Amount info */}
        <View style={styles.amountInfo}>
          <SkeletonText width={120} height={14} />
          <SkeletonText width={100} height={14} />
        </View>
      </View>
      
      {/* Chevron */}
      <SkeletonCircle size={24} />
    </View>
  </SkeletonCard>
);

// Skeleton for tab indicator (Active/Pending tabs)
const TabsSkeleton = () => (
  <View style={styles.tabContainer}>
    <View style={styles.tabIndicator} />
    <View style={styles.tabsWrapper}>
      <View style={styles.tab}>
        <SkeletonText width={60} height={16} style={styles.activeTab} />
        <SkeletonBox 
          width={60} 
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

// Skeleton for services list
const ServicesListSkeleton = () => (
  <ScrollView 
    contentContainerStyle={styles.servicesList}
    showsVerticalScrollIndicator={false}
  >
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
    <ServiceCardSkeleton />
  </ScrollView>
);

// Main House Services Skeleton Component
const HouseServicesSkeleton = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={SKELETON_COLORS.background} />
      <SafeAreaView style={styles.container}>
        <HeaderSkeleton />
        <TabsSkeleton />
        <ServicesListSkeleton />
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

  // Services list styles
  servicesList: {
    padding: getSkeletonSpacing.lg,
    gap: getSkeletonSpacing.md,
  },

  // Service card styles
  serviceCard: {
    paddingHorizontal: getSkeletonSpacing.lg,
    paddingVertical: getSkeletonSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSkeletonSpacing.lg,
  },
  serviceInfo: {
    flex: 1,
    gap: getSkeletonSpacing.sm,
  },
  serviceName: {
    marginBottom: getSkeletonSpacing.xs,
  },
  fundingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSkeletonSpacing.sm,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: SKELETON_COLORS.secondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: getSkeletonSpacing.xs,
  },
  progressBarFill: {
    backgroundColor: SKELETON_COLORS.accent,
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default HouseServicesSkeleton;