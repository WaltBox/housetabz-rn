// SpecialDeals.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Import apiClient instead of axios
import apiClient from '../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Use the same width as TaskSection

const SpecialDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // Use apiClient with relative path instead of axios with absolute URL
        const response = await apiClient.get('/api/deals');
        setDeals(response.data.deals || []);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + 16));
    setCurrentIndex(index);
  };

  // Calculate initial padding to center the first card
  const initialPadding = (width - CARD_WIDTH) / 2;

  // Render a single deal card
  const renderDealCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.dealCard}
      activeOpacity={0.7}
    >
      {/* Header with Icon and Deal Name */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#dcfce7', '#f0fdf4']}
            style={styles.iconBackground}
          >
            <MaterialIcons name="local-offer" size={24} color="#22c55e" />
          </LinearGradient>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.partnerName}>{item.provider || 'Exclusive Offer'}</Text>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.details}>
            {item.details}
          </Text>
        </View>
      </View>
      
      {/* Price and Expiry on the same row */}
      <View style={styles.footerRow}>
        <LinearGradient
          colors={['#22c55e', '#34d399']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.savingsPill}
        >
          <Text style={styles.savingsText}>Save {item.discount || '$10'}</Text>
        </LinearGradient>
        
        <View style={styles.expiryContainer}>
          <MaterialIcons name="schedule" size={14} color="#64748b" style={styles.clockIcon} />
          <Text style={styles.expiryText}>
            Expires {new Date(item.expiration_date).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading deals...</Text>
      </View>
    );
  }

  if (deals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialIcons name="auto-awesome" size={48} color="#22c55e" />
        </View>
        <Text style={styles.emptyTitle}>No Deals Available</Text>
        <Text style={styles.emptyText}>Check back later for special offers.</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={deals}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => (item.id || index.toString())}
        renderItem={renderDealCard}
        contentContainerStyle={[
          styles.dealsListContent,
          { paddingLeft: initialPadding }
        ]}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 16}
        snapToAlignment="center"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.paginationDots}>
        {deals.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex ? '#22c55e' : '#e2e8f0',
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dealsListContent: {
    paddingRight: 16,
  },
  dealCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 18,
    marginRight: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,

  },
  iconContainer: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 28,
    marginRight: 16,
  },
  iconBackground: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
    
  },
  details: {
    fontSize: 14,
    color: '#64748b',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  savingsPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
  },
  clockIcon: {
    marginRight: 4,
  },
  expiryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default SpecialDeals;