// HouseTabzSkeleton.js
import React, { useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
  Animated,
  Platform,
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

// Skeleton for HouseHeader
const HouseHeaderSkeleton = () => (
  <View style={skeletonStyles.header}>
    <SkeletonShimmer style={skeletonStyles.headerTitle} />
    <View style={skeletonStyles.inviteContainer}>
      <SkeletonShimmer style={skeletonStyles.inviteCircle} />
      <SkeletonShimmer style={skeletonStyles.inviteLabel} />
    </View>
  </View>
);

// Skeleton for HSI Component
const HSIComponentSkeleton = () => (
  <View style={skeletonStyles.hsiWrapper}>
    <SkeletonShimmer style={skeletonStyles.hsiTitle} />
    
    <View style={skeletonStyles.hsiCard}>
      <View style={skeletonStyles.hsiMainContent}>
        <View style={skeletonStyles.gaugeWrapper}>
          {/* Semi-circle gauge background */}
          <SkeletonShimmer style={skeletonStyles.gaugeBg} />
          
          {/* Score overlay */}
          <View style={skeletonStyles.valueOverlay}>
            <SkeletonShimmer style={skeletonStyles.scoreText} />
          </View>
        </View>
      </View>
      
      <SkeletonShimmer style={skeletonStyles.hsiFooter} />
    </View>
  </View>
);

// Skeleton for Scoreboard
const ScoreboardSkeleton = () => (
  <View style={skeletonStyles.scoreboardWrapper}>
    <SkeletonShimmer style={skeletonStyles.scoreboardTitle} />
    
    <View style={skeletonStyles.scoreboardCard}>
      {/* Main scoreboard content */}
      <View style={skeletonStyles.scoreboardContent}>
        {/* User stats section */}
        <View style={skeletonStyles.userStatsSection}>
          <SkeletonShimmer style={skeletonStyles.statLabel} />
          <SkeletonShimmer style={skeletonStyles.statValue} />
        </View>
        
        {/* Center divider */}
        <View style={skeletonStyles.scoreboardDivider} />
        
        {/* House stats section */}
        <View style={skeletonStyles.houseStatsSection}>
          <SkeletonShimmer style={skeletonStyles.statLabel} />
          <SkeletonShimmer style={skeletonStyles.statValue} />
        </View>
      </View>
      
      {/* Secondary stats row */}
      <View style={skeletonStyles.secondaryStats}>
        <View style={skeletonStyles.secondaryStat}>
          <SkeletonShimmer style={skeletonStyles.secondaryLabel} />
          <SkeletonShimmer style={skeletonStyles.secondaryValue} />
        </View>
        <View style={skeletonStyles.secondaryStat}>
          <SkeletonShimmer style={skeletonStyles.secondaryLabel} />
          <SkeletonShimmer style={skeletonStyles.secondaryValue} />
        </View>
      </View>
    </View>
  </View>
);

// Skeleton for Action Cards
const ActionCardsSkeleton = () => (
  <View style={skeletonStyles.actionCardsWrapper}>
    <View style={skeletonStyles.actionCards}>
      {/* CurrentTab Card */}
      <View style={skeletonStyles.currentTabCard}>
        <SkeletonShimmer style={skeletonStyles.cardTitle} />
        <SkeletonShimmer style={skeletonStyles.balanceText} />
        <SkeletonShimmer style={skeletonStyles.cardIconCircle} />
      </View>
      
      {/* PaidTabz Card */}
      <View style={skeletonStyles.paidTabCard}>
        <SkeletonShimmer style={skeletonStyles.cardTitle} />
        <SkeletonShimmer style={skeletonStyles.paidFeatureText} />
        <SkeletonShimmer style={skeletonStyles.cardIconCircle} />
      </View>
    </View>
  </View>
);

// Main HouseTabz Skeleton Component
const HouseTabzSkeleton = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={skeletonStyles.container}>
        {/* Header */}
        <View style={skeletonStyles.headerContainer}>
          <HouseHeaderSkeleton />
        </View>

        <ScrollView
          contentContainerStyle={skeletonStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HSI Component Section */}
          <View style={skeletonStyles.section}>
            <HSIComponentSkeleton />
          </View>
          
          {/* Scoreboard Section */}
          <View style={skeletonStyles.section}>
            <ScoreboardSkeleton />
          </View>
          
          {/* Action Cards Section */}
          <View style={skeletonStyles.actionCardsSection}>
            <ActionCardsSkeleton />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  headerContainer: {
    paddingBottom: 8,
    backgroundColor: "#dff6f0",
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  actionCardsSection: {
    marginBottom: 24,
  },

  // Header skeleton
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dff6f0',
  },
  headerTitle: {
    width: 150,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e5e7eb',
  },
  inviteContainer: {
    alignItems: 'center',
  },
  inviteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34d399',
  },
  inviteLabel: {
    width: 90,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },

  // HSI Component skeleton
  hsiWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  hsiTitle: {
    width: 160,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  hsiCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  hsiMainContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },
  gaugeBg: {
    width: 150,
    height: 75,
    borderTopLeftRadius: 75,
    borderTopRightRadius: 75,
    backgroundColor: '#e5e7eb',
  },
  valueOverlay: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 5,
  },
  scoreText: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
  },
  hsiFooter: {
    height: 48,
    backgroundColor: '#34d399',
  },

  // Scoreboard skeleton
  scoreboardWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scoreboardTitle: {
    width: 120,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  scoreboardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreboardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userStatsSection: {
    flex: 1,
    alignItems: 'center',
  },
  houseStatsSection: {
    flex: 1,
    alignItems: 'center',
  },
  scoreboardDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  statLabel: {
    width: 80,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  statValue: {
    width: 100,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryStat: {
    alignItems: 'center',
  },
  secondaryLabel: {
    width: 60,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginBottom: 6,
  },
  secondaryValue: {
    width: 80,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },

  // Action Cards skeleton
  actionCardsWrapper: {
    backgroundColor: "#dff6f0",
  },
  actionCards: {
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#dff6f0",
  },
  currentTabCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    height: 160,
    justifyContent: "space-between",
    backgroundColor: "#10b981",
    shadowColor: "#0d9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paidTabCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    height: 160,
    justifyContent: "space-between",
    backgroundColor: "#7c3aed",
    shadowColor: "#6d28d9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    width: 100,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  balanceText: {
    width: 120,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginTop: 10,
  },
  paidFeatureText: {
    width: 130,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginTop: 10,
  },
  cardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'flex-end',
  },
});

export default HouseTabzSkeleton;