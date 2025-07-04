// src/components/RewardsAnnouncementBanner.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import apiClient from '../config/api';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width * 0.9;

const RewardsAnnouncementBanner = ({ onPress }) => {
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    fetchPromotion();
  }, []);

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.get('/api/promotions');
      
      if (data && data.length > 0) {
        // Use the first active promotion
        setPromotion(data[0]);
      } else {
        // Fallback promotion
        setPromotion({
          id: 'default',
          points: "COMING SOON",
          title: "Exciting rewards are coming to HouseTabz",
          cta: "Stay Tuned →"
        });
      }
    } catch (err) {
      console.error('Error fetching promotion:', err);
      setError('Failed to load promotion');
      // Don't set fallback data - let error state show instead
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    try {
      // Track the interaction if it's a real promotion (has a numeric ID)
      if (promotion && typeof promotion.id === 'number') {
        await apiClient.post(`/api/promotions/${promotion.id}/interact`, {
          interaction_type: 'CLICK'
        });
      }
      
      // Call the parent handler
      onPress?.(promotion);
    } catch (error) {
      console.error('Error tracking promotion click:', error);
      // Still call parent handler even if tracking fails
      onPress?.(promotion);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.banner, styles.loadingBanner]}>
          <ActivityIndicator color="#34d399" size="large" />
          <Text style={styles.loadingText}>Loading promotion...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !promotion) {
    return (
      <View style={styles.container}>
        <View style={[styles.banner, styles.errorBanner]}>
          <Text style={styles.errorText}>Unable to load promotion</Text>
          <TouchableOpacity onPress={fetchPromotion} style={styles.retryButton}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Don't render anything if no promotion
  if (!promotion) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.banner} onPress={handlePress} activeOpacity={0.95}>
        {/* Background gradient effect */}
        <View style={styles.gradientOverlay} />
        
        {/* Decorative elements */}
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />
        
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.pointsBadge}>
            <Text style={[styles.pointsText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
              {promotion.points}
            </Text>
          </View>
          
          <Text style={[styles.mainText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
            {promotion.title}
          </Text>
          
          <View style={styles.ctaContainer}>
            <Text style={[styles.ctaText, fontsLoaded && { fontFamily: 'Poppins-Medium' }]}>
              {promotion.cta}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  banner: {
    width: BANNER_WIDTH,
    minHeight: 140,
    backgroundColor: '#34d399',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  topCircle: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    opacity: 0.15,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    opacity: 0.1,
  },
  content: {
    padding: 20,
    zIndex: 2,
  },
  pointsBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    maxWidth: '85%',
  },
  ctaContainer: {
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  // Loading and error states
  loadingBanner: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 8,
  },
  errorBanner: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#34d399',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RewardsAnnouncementBanner;