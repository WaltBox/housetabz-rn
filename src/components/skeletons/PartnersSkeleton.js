// PartnersSkeleton.js
import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
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
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2;

// Skeleton for individual announcement card
const AnnouncementCardSkeleton = () => (
  <SkeletonCard 
    width={300} 
    height={180} 
    style={styles.announcementCard}
  >
    <SkeletonBox 
      width="100%" 
      height={120} 
      borderRadius={0} 
      style={styles.announcementImage}
    />
    <View style={styles.announcementContent}>
      <SkeletonText width="85%" height={18} />
      <SkeletonText width="65%" height={14} />
      <SkeletonText width={80} height={24} style={styles.announcementButton} />
    </View>
  </SkeletonCard>
);

// Skeleton for swipeable announcements section
const AnnouncementsSkeleton = () => (
  <View style={styles.announcementSection}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.announcementScrollContent}
    >
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
      <AnnouncementCardSkeleton />
    </ScrollView>
  </View>
);

// Skeleton for partners grid header
const HeaderSkeleton = () => (
  <View style={styles.headerContainer}>
    <SkeletonText width={160} height={20} />
  </View>
);

// Skeleton for individual partner card
const PartnerCardSkeleton = () => (
  <SkeletonCard 
    width={CARD_WIDTH} 
    height={CARD_WIDTH + 36} 
    style={styles.partnerCard}
  >
    <SkeletonBox 
      width={CARD_WIDTH} 
      height={CARD_WIDTH} 
      borderRadius={16}
      style={styles.partnerCover}
    />
    <View style={styles.partnerLogoContainer}>
      <SkeletonCircle size={CARD_WIDTH * 0.25} />
    </View>
    <View style={styles.partnerNameContainer}>
      <SkeletonText width="70%" height={14} />
    </View>
  </SkeletonCard>
);

// Skeleton for partners grid
const PartnersGridSkeleton = () => (
  <View style={styles.section}>
    <HeaderSkeleton />
    <View style={styles.grid}>
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
      <PartnerCardSkeleton />
    </View>
  </View>
);

// Skeleton for footer
const FooterSkeleton = () => (
  <View style={styles.footerContainer}>
    <SkeletonText width={160} height={13} />
  </View>
);

// Main Partners Skeleton Component
const PartnersSkeleton = () => {
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        <AnnouncementsSkeleton />
        <PartnersGridSkeleton />
        <FooterSkeleton />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SKELETON_COLORS.background,
  },

  // Content skeleton
  scroll: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: getSkeletonSpacing.xxl + getSkeletonSpacing.sm,
  },
  
  // Announcements skeleton
  announcementSection: {
    paddingVertical: getSkeletonSpacing.xxl,
  },
  announcementScrollContent: {
    paddingLeft: getSkeletonSpacing.xxl,
    paddingRight: getSkeletonSpacing.sm,
  },
  announcementCard: {
    marginRight: getSkeletonSpacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementImage: {
    backgroundColor: SKELETON_COLORS.secondary,
  },
  announcementContent: {
    padding: getSkeletonSpacing.lg,
    flex: 1,
    justifyContent: 'space-between',
    gap: getSkeletonSpacing.sm,
  },
  announcementButton: {
    alignSelf: 'flex-end',
    backgroundColor: SKELETON_COLORS.accent,
  },

  // Header skeleton
  headerContainer: { 
    paddingHorizontal: CARD_GUTTER, 
    marginBottom: getSkeletonSpacing.xl,
    marginTop: getSkeletonSpacing.sm,
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
    marginBottom: CARD_GUTTER,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partnerCover: {
    backgroundColor: SKELETON_COLORS.secondary,
  },
  partnerLogoContainer: {
    position: 'absolute',
    bottom: 36 + getSkeletonSpacing.sm,
    left: getSkeletonSpacing.sm,
    width: CARD_WIDTH * 0.25 + 4,
    height: CARD_WIDTH * 0.25 + 4,
    borderRadius: (CARD_WIDTH * 0.25 + 4) / 2,
    backgroundColor: SKELETON_COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Footer skeleton
  footerContainer: { 
    alignItems: "center", 
    paddingVertical: getSkeletonSpacing.xxl + getSkeletonSpacing.sm,
  },
});

export default PartnersSkeleton;