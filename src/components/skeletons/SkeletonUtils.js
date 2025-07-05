import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

// HouseTabz Color Scheme for Skeletons
export const SKELETON_COLORS = {
  // Main background color (matches app background)
  background: '#dff6f0',
  
  // Card backgrounds
  cardBackground: '#ffffff',
  
  // Skeleton element colors (neutral grays)
  primary: '#e5e7eb',     // Light gray for main elements
  secondary: '#f3f4f6',   // Very light gray for secondary elements
  tertiary: '#d1d5db',    // Medium gray for contrast elements
  
  // Shimmer colors
  shimmerLight: '#f9fafb', // Almost white for shimmer highlight
  shimmerDark: '#e5e7eb',  // Light gray for shimmer base
  
  // Special colors for branded elements
  accent: '#34d399',       // App's primary mint green
  shadow: 'rgba(0, 0, 0, 0.05)', // Subtle shadow
};

// Unified Shimmer Animation Component
export const SkeletonShimmer = ({ children, style, duration = 1200 }) => {
  const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerOpacity, duration]);

  return (
    <Animated.View style={[style, { opacity: shimmerOpacity }]}>
      {children}
    </Animated.View>
  );
};

// Enhanced Shimmer with Gradient Effect
export const SkeletonGradientShimmer = ({ children, style, duration = 1500 }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerValue, duration]);

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  return (
    <Animated.View style={[style, { opacity: shimmerOpacity }]}>
      {children}
    </Animated.View>
  );
};

// Common Skeleton Element Components
export const SkeletonBox = ({ width, height, borderRadius = 8, style }) => (
  <SkeletonShimmer 
    style={[
      skeletonStyles.box,
      { width, height, borderRadius },
      style
    ]}
  />
);

export const SkeletonCircle = ({ size, style }) => (
  <SkeletonShimmer 
    style={[
      skeletonStyles.circle,
      { width: size, height: size, borderRadius: size / 2 },
      style
    ]}
  />
);

export const SkeletonText = ({ width, height = 16, style }) => (
  <SkeletonShimmer 
    style={[
      skeletonStyles.text,
      { width, height, borderRadius: height / 2 },
      style
    ]}
  />
);

export const SkeletonLine = ({ width = '100%', height = 1, style }) => (
  <SkeletonShimmer 
    style={[
      skeletonStyles.line,
      { width, height },
      style
    ]}
  />
);

// Card Container with consistent styling
export const SkeletonCard = ({ children, style, width, height }) => (
  <View style={[skeletonStyles.card, { width, height }, style]}>
    {children}
  </View>
);

// Common skeleton styles
const skeletonStyles = StyleSheet.create({
  box: {
    backgroundColor: SKELETON_COLORS.primary,
  },
  circle: {
    backgroundColor: SKELETON_COLORS.primary,
  },
  text: {
    backgroundColor: SKELETON_COLORS.primary,
  },
  line: {
    backgroundColor: SKELETON_COLORS.tertiary,
  },
  card: {
    backgroundColor: SKELETON_COLORS.cardBackground,
    borderRadius: 16,
    shadowColor: SKELETON_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
});

// Utility functions for consistent spacing
export const getSkeletonSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// Utility functions for consistent sizes
export const getSkeletonSizes = {
  icon: {
    small: 20,
    medium: 28,
    large: 40,
  },
  text: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  button: {
    height: 44,
    borderRadius: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
};

export default {
  SKELETON_COLORS,
  SkeletonShimmer,
  SkeletonGradientShimmer,
  SkeletonBox,
  SkeletonCircle,
  SkeletonText,
  SkeletonLine,
  SkeletonCard,
  getSkeletonSpacing,
  getSkeletonSizes,
}; 