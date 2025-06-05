// PartnersSkeleton.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2;

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

// Skeleton for header section
const HeaderSkeleton = () => (
  <View style={skeletonStyles.headerContainer}>
    <LinearGradient
      colors={["#34d399", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={skeletonStyles.gradient}
    >
      <View style={skeletonStyles.headerContent}>
        <View style={skeletonStyles.textGroup}>
          <Text style={skeletonStyles.title}>Pay with HouseTabz at...</Text>
        </View>
        <SkeletonShimmer style={skeletonStyles.headerImage} />
      </View>
    </LinearGradient>
  </View>
);

// Skeleton for special deals section
const SpecialDealsSkeleton = () => (
  <View style={skeletonStyles.section}>
    <View style={skeletonStyles.sectionHeader}>
      <View style={skeletonStyles.sectionTitleGroup}>
        <MaterialIcons name="auto-awesome" size={24} color="#34d399" />
        <Text style={skeletonStyles.sectionTitle}>Special Deals</Text>
      </View>
      <View style={skeletonStyles.badge}>
        <SkeletonShimmer style={skeletonStyles.badgeContent} />
      </View>
    </View>
    
    {/* Special deals scroll area */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={skeletonStyles.dealsScrollContent}
    >
      <SpecialDealCardSkeleton />
      <SpecialDealCardSkeleton />
      <SpecialDealCardSkeleton />
    </ScrollView>
  </View>
);

// Skeleton for individual special deal card
const SpecialDealCardSkeleton = () => (
  <View style={skeletonStyles.dealCard}>
    <SkeletonShimmer style={skeletonStyles.dealImage} />
    <View style={skeletonStyles.dealContent}>
      <SkeletonShimmer style={skeletonStyles.dealTitle} />
      <SkeletonShimmer style={skeletonStyles.dealDescription} />
      <SkeletonShimmer style={skeletonStyles.dealButton} />
    </View>
  </View>
);

// Skeleton for partner card
const PartnerCardSkeleton = () => (
  <View style={skeletonStyles.partnerCard}>
    <SkeletonShimmer style={skeletonStyles.partnerCover} />
    
    {/* Logo circle positioned in bottom left */}
    <View style={skeletonStyles.partnerLogoContainer}>
      <SkeletonShimmer style={skeletonStyles.partnerLogo} />
    </View>
    
    {/* Name section at bottom */}
    <View style={skeletonStyles.partnerNameContainer}>
      <SkeletonShimmer style={skeletonStyles.partnerName} />
    </View>
  </View>
);

// Skeleton for partners grid
const PartnersGridSkeleton = () => (
  <View style={skeletonStyles.section}>
    <SkeletonShimmer style={skeletonStyles.subTitle} />
    <View style={skeletonStyles.grid}>
      {Array.from({ length: 8 }).map((_, index) => (
        <PartnerCardSkeleton key={index} />
      ))}
    </View>
  </View>
);

// Main Partners Skeleton Component
const PartnersSkeleton = () => {
  return (
    <View style={skeletonStyles.container}>
      <HeaderSkeleton />
      
      <ScrollView 
        contentContainerStyle={skeletonStyles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        <SpecialDealsSkeleton />
        <PartnersGridSkeleton />
      </ScrollView>
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  
  // Header skeleton
  headerContainer: {
    width: "100%",
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    fontFamily: "Montserrat-Black",
  },
  headerImage: {
    width: 120,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Content skeleton
  scroll: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  
  // Special deals skeleton
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "Montserrat-Bold",
  },
  badge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  badgeContent: {
    width: 80,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#34d399',
  },
  
  // Special deals scroll skeleton
  dealsScrollContent: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  dealCard: {
    width: 280,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f3f4f6',
  },
  dealContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  dealTitle: {
    width: '80%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 6,
  },
  dealDescription: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  dealButton: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34d399',
    alignSelf: 'flex-end',
  },

  // Partners section skeleton
  subTitle: {
    width: 140,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginLeft: CARD_GUTTER,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: CARD_GUTTER,
  },
  
  // Partner card skeleton
  partnerCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH + 36, // Square plus name section
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partnerCover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: '#f5f5f5',
  },
  partnerLogoContainer: {
    position: 'absolute',
    bottom: 36 + 8, // Above name section
    left: 8,
    width: CARD_WIDTH * 0.25 + 4,
    height: CARD_WIDTH * 0.25 + 4,
    borderRadius: (CARD_WIDTH * 0.25 + 4) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  partnerLogo: {
    width: CARD_WIDTH * 0.25,
    height: CARD_WIDTH * 0.25,
    borderRadius: (CARD_WIDTH * 0.25) / 2,
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
    width: '70%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
  },
});

export default PartnersSkeleton;