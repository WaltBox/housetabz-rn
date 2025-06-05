// HouseServicesSkeleton.js
import React, { useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  FlatList,
  Animated,
  Platform
} from 'react-native';

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

// Skeleton for individual service card
const ServiceCardSkeleton = () => (
  <View style={skeletonStyles.serviceCard}>
    <View style={skeletonStyles.serviceContent}>
      <View style={skeletonStyles.serviceInfo}>
        {/* Service name */}
        <SkeletonShimmer style={skeletonStyles.serviceName} />
        
        {/* Funding info line */}
        <View style={skeletonStyles.fundingInfo}>
          <SkeletonShimmer style={skeletonStyles.fundingText} />
          <SkeletonShimmer style={skeletonStyles.contributorText} />
        </View>
        
        {/* Progress bar */}
        <View style={skeletonStyles.progressBarContainer}>
          <SkeletonShimmer style={skeletonStyles.progressBarFill} />
        </View>
        
        {/* Amount info */}
        <View style={skeletonStyles.amountInfo}>
          <SkeletonShimmer style={skeletonStyles.amountText} />
          <SkeletonShimmer style={skeletonStyles.remainingText} />
        </View>
      </View>
      
      {/* Chevron */}
      <SkeletonShimmer style={skeletonStyles.chevron} />
    </View>
  </View>
);

// Skeleton for tab indicator (Active/Pending tabs)
const TabsSkeleton = () => (
  <View style={skeletonStyles.tabContainer}>
    <View style={skeletonStyles.tabIndicator} />
    <View style={skeletonStyles.tabsWrapper}>
      <View style={skeletonStyles.tab}>
        <SkeletonShimmer style={skeletonStyles.activeTab} />
        <View style={skeletonStyles.activeIndicator} />
      </View>
      <View style={skeletonStyles.tab}>
        <SkeletonShimmer style={skeletonStyles.inactiveTab} />
      </View>
    </View>
  </View>
);

// Main HouseServices Skeleton Component
const HouseServicesSkeleton = () => {
  // Create dummy data for skeleton cards
  const skeletonData = Array.from({ length: 6 }, (_, index) => ({ id: index }));

  const renderSkeletonItem = ({ item }) => <ServiceCardSkeleton />;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={skeletonStyles.container}>
        {/* Header */}
        <View style={skeletonStyles.header}>
          <SkeletonShimmer style={skeletonStyles.headerTitle} />
        </View>

        {/* Tabs */}
        <TabsSkeleton />

        {/* Service List */}
        <FlatList
          data={skeletonData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSkeletonItem}
          contentContainerStyle={skeletonStyles.servicesList}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  
  // Header skeleton
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    width: 180,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e5e7eb',
  },

  // Tabs skeleton
  tabContainer: {
    position: 'relative',
    marginBottom: 16,
    backgroundColor: "#dff6f0",
  },
  tabsWrapper: {
    flexDirection: 'row',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  tab: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    width: 60,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  inactiveTab: {
    width: 70,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#94a3b8',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1e293b',
    zIndex: 1,
  },

  // Service list
  servicesList: {
    padding: 20,
    paddingBottom: 80,
  },

  // Service card skeleton
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },

  // Service name skeleton
  serviceName: {
    width: '70%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },

  // Funding info skeleton
  fundingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fundingText: {
    width: 80,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  contributorText: {
    width: 90,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },

  // Progress bar skeleton
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    width: '60%', // Default to 60% filled for skeleton
    backgroundColor: '#34d399',
    borderRadius: 3,
  },

  // Amount info skeleton
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountText: {
    width: 120,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  remainingText: {
    width: 100,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },

  // Chevron skeleton
  chevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
});

export default HouseServicesSkeleton;