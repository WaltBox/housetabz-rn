// BillingSkeleton.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  Animated
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

// Skeleton for charge card
const ChargeCardSkeleton = ({ isSelected = false }) => (
  <View style={[
    skeletonStyles.chargeItem,
    isSelected && skeletonStyles.selectedChargeItem
  ]}>
    <View style={skeletonStyles.chargeHeader}>
      <View style={skeletonStyles.chargeTitleContainer}>
        <View style={skeletonStyles.chargeTextContent}>
          <SkeletonShimmer style={[
            skeletonStyles.chargeTitle,
            isSelected && skeletonStyles.selectedElement
          ]} />
          <SkeletonShimmer style={[
            skeletonStyles.chargeSubtitle,
            isSelected && skeletonStyles.selectedElement
          ]} />
        </View>
      </View>
      <SkeletonShimmer style={[
        skeletonStyles.chargeAmount,
        isSelected && skeletonStyles.selectedElement
      ]} />
    </View>
    <View style={skeletonStyles.selectIndicator}>
      <SkeletonShimmer style={[
        skeletonStyles.selectText,
        isSelected && skeletonStyles.selectedElement
      ]} />
      <SkeletonShimmer style={[
        skeletonStyles.selectIcon,
        isSelected && skeletonStyles.selectedElement
      ]} />
    </View>
  </View>
);

// Skeleton for charge section
const ChargeSectionSkeleton = ({ title, color, cardCount = 2 }) => (
  <View style={skeletonStyles.section}>
    <View style={[skeletonStyles.sectionHeader, { borderLeftColor: color }]}>
      <Text style={skeletonStyles.sectionTitle}>{title}</Text>
      <View style={[skeletonStyles.statusDot, { backgroundColor: color }]} />
    </View>
    {Array.from({ length: cardCount }).map((_, index) => (
      <ChargeCardSkeleton 
        key={index} 
        isSelected={index === 0} // Make first card appear selected
      />
    ))}
  </View>
);

// Skeleton for header card
const HeaderCardSkeleton = () => (
  <View style={skeletonStyles.headerCard}>
    <View style={skeletonStyles.headerTop}>
      <View style={skeletonStyles.headerSplit}>
        <View style={skeletonStyles.headerSection}>
          <SkeletonShimmer style={skeletonStyles.headerLabel} />
          <SkeletonShimmer style={skeletonStyles.headerAmount} />
        </View>
        <View style={skeletonStyles.headerSection}>
          <SkeletonShimmer style={skeletonStyles.headerLabel} />
          <SkeletonShimmer style={skeletonStyles.selectedAmount} />
        </View>
      </View>
      
      <SkeletonShimmer style={skeletonStyles.addPaymentMethodBtn} />
    </View>
    
    <SkeletonShimmer style={skeletonStyles.paymentButton} />
  </View>
);

// Skeleton for tabs
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

// Main Billing Skeleton Component
const BillingSkeleton = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <View style={skeletonStyles.container}>
        {/* Header */}
        <View style={skeletonStyles.header}>
          <SkeletonShimmer style={skeletonStyles.headerTitle} />
        </View>
        
        {/* Tab Navigation */}
        <TabsSkeleton />

        {/* Header Card */}
        <HeaderCardSkeleton />

        {/* Charge Sections */}
        <ScrollView style={skeletonStyles.content} showsVerticalScrollIndicator={false}>
          <ChargeSectionSkeleton 
            title="Late Payments" 
            color="#ef4444" 
            cardCount={1}
          />
          <ChargeSectionSkeleton 
            title="Upcoming Payments" 
            color="#eab308" 
            cardCount={2}
          />
          <ChargeSectionSkeleton 
            title="Other Charges" 
            color="#34d399" 
            cardCount={3}
          />
        </ScrollView>
      </View>
    </>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  
  // Header skeleton
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    width: 140,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e5e7eb',
  },

  // Tabs skeleton
  tabContainer: {
    position: 'relative',
    paddingHorizontal: 0,
    marginBottom: 16,
    backgroundColor: "#dff6f0",
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
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
    position: 'relative',
    backgroundColor: 'transparent',
  },
  activeTab: {
    width: 40,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  inactiveTab: {
    width: 60,
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

  // Header card skeleton
  headerCard: {
    backgroundColor: '#dff6f0',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerTop: {
    marginBottom: 12
  },
  headerSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerSection: {
    flex: 1
  },
  headerLabel: {
    width: 80,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    marginBottom: 4
  },
  headerAmount: {
    width: 120,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  selectedAmount: {
    width: 100,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34d399',
  },
  addPaymentMethodBtn: {
    width: 160,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    alignSelf: 'flex-start',
  },
  paymentButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#34d399',
  },

  // Content skeleton
  content: {
    flex: 1
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },

  // Charge card skeleton
  chargeItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  selectedChargeItem: {
    backgroundColor: '#34d399',
    borderColor: '#34d399'
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  chargeTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8
  },
  chargeTextContent: {
    flex: 1
  },
  chargeTitle: {
    width: 140,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 4
  },
  chargeSubtitle: {
    width: 100,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#f3f4f6',
  },
  chargeAmount: {
    width: 80,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  selectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  selectText: {
    width: 70,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 6
  },
  selectIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
  },

  // Selected state styling
  selectedElement: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default BillingSkeleton;