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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2;

// Enhanced skeleton shimmer animation with moving gradient effect
const SkeletonShimmer = ({ children, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View style={[style, { overflow: 'hidden', backgroundColor: '#f3f4f6' }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      {children}
    </View>
  );
};

// Skeleton for SwipeableAnnouncements section
const AnnouncementsSkeleton = () => (
  <View style={skeletonStyles.announcementSection}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={skeletonStyles.announcementScrollContent}
    >
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
    </ScrollView>
  </View>
);

// Skeleton for individual announcement card
const AnnouncementCardSkeleton = () => (
  <View style={skeletonStyles.announcementCard}>
    <SkeletonShimmer style={skeletonStyles.announcementImage} />
    <View style={skeletonStyles.announcementContent}>
      <SkeletonShimmer style={skeletonStyles.announcementTitle} />
      <SkeletonShimmer style={skeletonStyles.announcementDescription} />
      <SkeletonShimmer style={skeletonStyles.announcementButton} />
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
    <View style={skeletonStyles.headerContainer}>
      <SkeletonShimmer style={skeletonStyles.header} />
    </View>
    <View style={skeletonStyles.grid}>
      {Array.from({ length: 8 }).map((_, index) => (
        <PartnerCardSkeleton key={index} />
      ))}
    </View>
  </View>
);

// Skeleton for footer
const FooterSkeleton = () => (
  <View style={skeletonStyles.footerContainer}>
    <SkeletonShimmer style={skeletonStyles.footerText} />
  </View>
);

// Main Partners Skeleton Component
const PartnersSkeleton = () => {
  return (
    <View style={skeletonStyles.container}>
      <ScrollView 
        contentContainerStyle={skeletonStyles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        <AnnouncementsSkeleton />
        <PartnersGridSkeleton />
        <FooterSkeleton />
      </ScrollView>
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },

  // Content skeleton
  scroll: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  
  // Announcements skeleton
  announcementSection: {
    paddingVertical: 24,
  },
  announcementScrollContent: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  announcementCard: {
    width: 300,
    height: 180,
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
  announcementImage: {
    width: '100%',
    height: 120,
  },
  announcementContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  announcementTitle: {
    width: '85%',
    height: 18,
    borderRadius: 9,
    marginBottom: 8,
  },
  announcementDescription: {
    width: '65%',
    height: 14,
    borderRadius: 7,
    marginBottom: 10,
  },
  announcementButton: {
    width: 80,
    height: 24,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },

  // Header skeleton
  headerContainer: { 
    paddingHorizontal: CARD_GUTTER, 
    marginBottom: 20,
    marginTop: 8,
  },
  header: {
    width: 160,
    height: 20,
    borderRadius: 10,
  },
  
  // Partners grid skeleton
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
    marginBottom: CARD_GUTTER,
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
  },

  // Footer skeleton
  footerContainer: { 
    alignItems: "center", 
    paddingVertical: 32,
  },
  footerText: { 
    width: 160,
    height: 13,
    borderRadius: 7,
  },
});

export default PartnersSkeleton;