// SpecialDeals.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
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

  const scrollToIndex = (index) => {
    if (scrollViewRef.current && index >= 0 && index < deals.length) {
      // Calculate the x position to scroll to
      const xOffset = index * (CARD_WIDTH + 12);
      scrollViewRef.current.scrollTo({ x: xOffset, animated: true });
      setCurrentIndex(index);
    }
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + 12));
    
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // Render a single deal card
  const renderDealCard = (deal, index) => (
    <View 
      style={[
        styles.card,
        index === deals.length - 1 ? { marginRight: 0 } : null
      ]}
      key={index}
    >
      <View style={styles.cardHeader}>
        <MaterialIcons name="local-offer" size={20} color="#34d399" />
        <Text style={styles.title}>{deal.name}</Text>
      </View>
      <Text style={styles.details}>{deal.details}</Text>
      <View style={styles.expiry}>
        <MaterialIcons name="schedule" size={14} color="#6366f1" />
        <Text style={styles.expiryText}>
          Expires: {new Date(deal.expiration_date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#34d399" />
      ) : deals.length > 0 ? (
        <View>
          <View style={styles.scrollContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + 12}
              snapToAlignment="center"
              contentContainerStyle={styles.scrollContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentOffset={{ x: 0, y: 0 }}
            >
              {/* Left padding view to center first card */}
              <View style={{ width: (width - CARD_WIDTH) / 2 }} />
              
              {/* Deal cards */}
              {deals.map((deal, index) => renderDealCard(deal, index))}
              
              {/* Right padding view to center last card */}
              <View style={{ width: (width - CARD_WIDTH) / 2 }} />
            </ScrollView>
          </View>
          
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {deals.map((_, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => scrollToIndex(index)}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === currentIndex ? "#34d399" : "#e2e8f0",
                      width: index === currentIndex ? 12 : 6,
                    }
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No special deals available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 220,
  },
  scrollContainer: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center', // Align cards vertically centered
  },
  card: {
    width: CARD_WIDTH,
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
    marginRight: 12, // Space between cards
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  details: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
  },
});

export default SpecialDeals;