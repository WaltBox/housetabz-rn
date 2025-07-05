// HouseTabzSkeleton.js
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
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

const { width } = Dimensions.get('window');

// Skeleton for HouseHeader
const HouseHeaderSkeleton = () => (
  <View style={styles.header}>
    <SkeletonText width={180} height={24} />
    <View style={styles.inviteContainer}>
      <SkeletonCircle size={40} />
      <SkeletonText width={60} height={14} />
    </View>
  </View>
);

// Skeleton for HSI Component
const HSIComponentSkeleton = () => (
  <View style={styles.hsiWrapper}>
    <SkeletonText width={160} height={20} style={styles.hsiTitle} />
    
    <SkeletonCard style={styles.hsiCard}>
      <View style={styles.hsiMainContent}>
        <View style={styles.gaugeWrapper}>
          {/* Semi-circle gauge background */}
          <SkeletonBox 
            width={120} 
            height={60} 
            borderRadius={60}
            style={styles.gaugeBg}
          />
          
          {/* Score overlay */}
          <View style={styles.valueOverlay}>
            <SkeletonText width={40} height={32} />
          </View>
        </View>
      </View>
      
      <SkeletonText width="80%" height={16} style={styles.hsiFooter} />
    </SkeletonCard>
  </View>
);

// Skeleton for Scoreboard
const ScoreboardSkeleton = () => (
  <View style={styles.scoreboardWrapper}>
    <SkeletonText width={140} height={20} style={styles.scoreboardTitle} />
    
    <SkeletonCard style={styles.scoreboardCard}>
      {/* Main scoreboard content */}
      <View style={styles.scoreboardContent}>
        {/* User stats section */}
        <View style={styles.userStatsSection}>
          <SkeletonText width={80} height={14} />
          <SkeletonText width={60} height={24} />
        </View>
        
        {/* Center divider */}
        <View style={styles.scoreboardDivider} />
        
        {/* House stats section */}
        <View style={styles.houseStatsSection}>
          <SkeletonText width={80} height={14} />
          <SkeletonText width={60} height={24} />
        </View>
      </View>
      
      {/* Secondary stats row */}
      <View style={styles.secondaryStats}>
        <View style={styles.secondaryStat}>
          <SkeletonText width={60} height={12} />
          <SkeletonText width={40} height={16} />
        </View>
        <View style={styles.secondaryStat}>
          <SkeletonText width={60} height={12} />
          <SkeletonText width={40} height={16} />
        </View>
      </View>
    </SkeletonCard>
  </View>
);

// Skeleton for Action Cards
const ActionCardsSkeleton = () => (
  <View style={styles.actionCardsWrapper}>
    <View style={styles.actionCards}>
      {/* CurrentTab Card */}
      <SkeletonCard style={styles.currentTabCard}>
        <SkeletonText width={100} height={16} />
        <SkeletonText width={80} height={24} />
        <SkeletonCircle size={40} style={styles.cardIconCircle} />
      </SkeletonCard>
      
      {/* PaidTabz Card */}
      <SkeletonCard style={styles.paidTabCard}>
        <SkeletonText width={80} height={16} />
        <SkeletonText width={100} height={14} />
        <SkeletonCircle size={40} style={styles.cardIconCircle} />
      </SkeletonCard>
    </View>
  </View>
);

// Main HouseTabz Skeleton Component
const HouseTabzSkeleton = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={SKELETON_COLORS.background} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <HouseHeaderSkeleton />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HSI Component Section */}
          <View style={styles.section}>
            <HSIComponentSkeleton />
          </View>
          
          {/* Scoreboard Section */}
          <View style={styles.section}>
            <ScoreboardSkeleton />
          </View>
          
          {/* Action Cards Section */}
          <View style={styles.actionCardsSection}>
            <ActionCardsSkeleton />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SKELETON_COLORS.background,
  },
  scrollContent: {
    paddingBottom: getSkeletonSpacing.xxl,
  },

  // Header styles
  headerContainer: {
    paddingHorizontal: getSkeletonSpacing.lg,
    paddingVertical: getSkeletonSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SKELETON_COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSkeletonSpacing.sm,
  },

  // HSI Component styles
  hsiWrapper: {
    paddingHorizontal: getSkeletonSpacing.lg,
    marginBottom: getSkeletonSpacing.lg,
  },
  hsiTitle: {
    marginBottom: getSkeletonSpacing.md,
  },
  hsiCard: {
    padding: getSkeletonSpacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hsiMainContent: {
    alignItems: 'center',
    marginBottom: getSkeletonSpacing.lg,
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeBg: {
    backgroundColor: SKELETON_COLORS.secondary,
  },
  valueOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hsiFooter: {
    textAlign: 'center',
  },

  // Scoreboard styles
  scoreboardWrapper: {
    paddingHorizontal: getSkeletonSpacing.lg,
    marginBottom: getSkeletonSpacing.lg,
  },
  scoreboardTitle: {
    marginBottom: getSkeletonSpacing.md,
  },
  scoreboardCard: {
    padding: getSkeletonSpacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreboardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: getSkeletonSpacing.lg,
  },
  userStatsSection: {
    alignItems: 'center',
    gap: getSkeletonSpacing.sm,
  },
  houseStatsSection: {
    alignItems: 'center',
    gap: getSkeletonSpacing.sm,
  },
  scoreboardDivider: {
    width: 1,
    height: 60,
    backgroundColor: SKELETON_COLORS.tertiary,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: getSkeletonSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: SKELETON_COLORS.secondary,
  },
  secondaryStat: {
    alignItems: 'center',
    gap: getSkeletonSpacing.xs,
  },

  // Action Cards styles
  actionCardsSection: {
    paddingHorizontal: getSkeletonSpacing.lg,
  },
  actionCardsWrapper: {
    marginTop: getSkeletonSpacing.lg,
  },
  actionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: getSkeletonSpacing.md,
  },
  currentTabCard: {
    flex: 1,
    padding: getSkeletonSpacing.lg,
    backgroundColor: '#34d399',
    alignItems: 'center',
    gap: getSkeletonSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paidTabCard: {
    flex: 1,
    padding: getSkeletonSpacing.lg,
    alignItems: 'center',
    gap: getSkeletonSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Section spacing
  section: {
    marginBottom: getSkeletonSpacing.lg,
  },
});

export default HouseTabzSkeleton;