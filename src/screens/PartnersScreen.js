// src/screens/PartnersScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  RefreshControl,
  Animated,
} from "react-native";
import CompanyCardComponent from "../components/CompanyCardComponent";
import ViewCompanyCard from "../modals/ViewCompanyCard";
import SwipeableAnnouncements from "../components/SwipeableAnnouncements";
import { useAuth } from "../context/AuthContext";
import apiClient, { 
  getPartnersData, 
  invalidateCache, 
  clearScreenCache
} from "../config/api";
import { isScreenPrefetched, getPrefetchStatus } from '../services/PrefetchService';
import PartnersSkeleton from "../components/skeletons/PartnersSkeleton";

const { width } = Dimensions.get("window");
const CARD_GUTTER = 16;
const CARD_WIDTH = (width - CARD_GUTTER * 3) / 2;

const PartnersScreen = () => {
  const { user, token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const cardScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setError(null);
      
      // 🆕 CHECK IF ALREADY PREFETCHED
      const isPrefetched = isScreenPrefetched('Partners');
      const prefetchStatus = getPrefetchStatus();
      
      if (isPrefetched) {
        console.log('⚡ Partners already prefetched - loading from cache');
        setLoading(false); // Skip loading state since data should be cached
      } else {
        console.log('🔄 Partners not prefetched - showing loading state');
        if (!refreshing) setLoading(true);
      }
      
      console.log('🚀 Fetching partners data...');
      console.log('📊 Prefetch info:', {
        isPrefetched,
        prefetchComplete: prefetchStatus.isComplete,
        completedScreens: prefetchStatus.completedScreens
      });
      
      // ✅ UPDATED: Use cached API function
      const data = await getPartnersData();
      
      console.log('📊 Partners data received:', {
        partners: Array.isArray(data) ? data.length : 0,
        dataType: typeof data,
        isPrefetched,
        loadTime: isPrefetched ? 'instant' : 'fetched'
      });

      // Set partners data
      if (Array.isArray(data)) {
        setPartners(data);
      } else if (data?.partners && Array.isArray(data.partners)) {
        setPartners(data.partners);
      } else {
        console.log('⚠️ Partners data not in expected format:', data);
        setPartners([]);
      }

      console.log('✅ Partners data loaded successfully');

    } catch (error) {
      console.log('❌ Partners fetch failed:', error.message);
      setError(`Failed to load partners: ${error.message}`);
      
      // Clear cache on error
      try {
        clearScreenCache('partners');
        console.log('🧹 Cleared partners cache due to error');
      } catch (cacheError) {
        console.log('⚠️ Failed to clear partners cache:', cacheError.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced refresh function that clears cache first
  const onRefresh = () => {
    setRefreshing(true);
    // Clear cache to force fresh data
    clearScreenCache('partners');
    fetchPartners();
  };

  const handlePress = (partner) => {
    setSelectedPartner(partner);
    Animated.spring(cardScale, { toValue: 0.96, friction: 3, useNativeDriver: true }).start();
  };

  const handleClose = () => {
    Animated.spring(cardScale, { toValue: 1, friction: 3, useNativeDriver: true }).start(() => {
      setSelectedPartner(null);
    });
  };

  const handleRewardsPress = (announcement) => {
    // Handle announcement press - could navigate based on announcement type
    console.log('Announcement pressed:', announcement);
  };

  if (loading && !refreshing) return <PartnersSkeleton />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34d399" />
        }
      >
        {/* Swipeable Announcements */}
        <View style={styles.announcementSection}>
          <SwipeableAnnouncements onAnnouncementPress={handleRewardsPress} />
        </View>

        {/* Partners Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Featured Services</Text>
        </View>

        {/* Partners Grid */}
        <View style={styles.grid}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorSubtext} onPress={onRefresh}>Pull to retry</Text>
            </View>
          ) : (
            partners.map((p) => (
              <Animated.View key={p.id} style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
                <CompanyCardComponent
                  name={p.name}
                  logoUrl={p.logo}
                  coverUrl={p.marketplace_cover}
                  onPress={() => handlePress(p)}
                  cardWidth={CARD_WIDTH}
                />
              </Animated.View>
            ))
          )}
        </View>

        {/* Simple footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>More services coming soon</Text>
        </View>
      </ScrollView>

      <Modal visible={!!selectedPartner} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          {selectedPartner && (
            <ViewCompanyCard partner={selectedPartner} visible onClose={handleClose} userId={user.id} jwtToken={token} />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PartnersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#dff6f0" },
  scroll: { paddingBottom: 40 },
  
  announcementSection: {
    paddingVertical: 24,
  },
  
  headerContainer: { 
    paddingHorizontal: CARD_GUTTER, 
    marginBottom: 20,
    marginTop: 8,
  },
  header: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#1e293b" 
  },
  
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: CARD_GUTTER,
  },
  cardWrapper: { 
    marginBottom: CARD_GUTTER 
  },
  
  footerContainer: { 
    alignItems: "center", 
    paddingVertical: 32,
  },
  footerText: { 
    fontSize: 13, 
    color: "#64748b" 
  },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.6)", 
    justifyContent: "flex-end" 
  },
  
  errorContainer: { 
    width: CARD_WIDTH * 2 + CARD_GUTTER, 
    alignItems: "center", 
    marginTop: 20 
  },
  errorText: { 
    color: "#ef4444", 
    fontSize: 16, 
    marginBottom: 8 
  },
  errorSubtext: { 
    color: "#34d399", 
    fontSize: 14 
  }
});