// SpecialDeals.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // Match exactly what ServiceRequestTask uses

const SpecialDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('http://localhost:3004/api/deals');
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
    const index = Math.round(contentOffset / (CARD_WIDTH + 12));
    setCurrentIndex(index);
  };

  // Render a single deal card
  const renderDealCard = (deal, index) => (
    <View 
      style={styles.taskItemContainer}
      key={deal.id || index}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="local-offer" size={20} color="#34d399" />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {deal.name}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>{deal.details}</Text>
          </View>
        </View>
        
        <View style={styles.expiry}>
          <MaterialIcons name="schedule" size={14} color="#6366f1" />
          <Text style={styles.expiryText}>
            Expires: {new Date(deal.expiration_date).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
        <Text style={styles.loadingText}>Loading deals...</Text>
      </View>
    );
  }

  if (deals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="check-circle" size={48} color="#34d399" style={styles.icon} />
        <Text style={styles.emptyTitle}>No Deals Available</Text>
        <Text style={styles.emptyText}>Check back later for special offers.</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={deals}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => (item.id || index.toString())}
        renderItem={({ item, index }) => renderDealCard(item, index)}
        contentContainerStyle={styles.taskListContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
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
                backgroundColor:
                  index === currentIndex ? '#34d399' : '#e2e8f0',
                width: index === currentIndex ? 12 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  taskListContent: {
    paddingHorizontal: 16,
  },
  taskItemContainer: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  card: {
    backgroundColor: '#dff1f0',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#34d399',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusRow: {
    marginBottom: 12,
  },
  pricePill: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  pricePillText: {
    fontSize: 14,
    color: '#64748b',
  },
  expiry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  expiryText: {
    fontSize: 12,
    color: '#6366f1',
    marginLeft: 4,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  icon: {
    marginRight: 8,
  },
});

export default SpecialDeals;