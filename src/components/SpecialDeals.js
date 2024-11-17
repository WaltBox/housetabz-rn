import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const SpecialDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('http://localhost:3004/api/deals'); // Replace with your API endpoint
        setDeals(response.data);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (screenWidth * 0.8)); // Match the smaller card size
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.dealName}>{item.name}</Text>
      <Text style={styles.dealDetails}>{item.details}</Text>
      <Text style={styles.dealExpiration}>
        Expires: {new Date(item.expiration_date).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Special Deals ({deals.length})
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" />
      ) : deals.length > 0 ? (
        <>
          <FlatList
            data={deals}
            renderItem={renderItem}
            keyExtractor={(item, index) => `deal-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            decelerationRate="fast"
            snapToInterval={screenWidth * 0.8 + 20} // Match card width and margin
            snapToAlignment="center"
            contentContainerStyle={styles.listContainer}
          />
          <View style={styles.dotsContainer}>
            {deals.slice(0, 3).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.noDealsText}>No special deals available at the moment.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 60,
    paddingHorizontal: 20, // Add horizontal padding for better spacing
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'left', // Align text to the left
  },
  listContainer: {
    alignItems: 'center',
  },
  card: {
    width: screenWidth * 0.8, // Smaller card size
    height: 150, // Reduced height
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  dealDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  dealExpiration: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#22c55e',
  },
  noDealsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});


export default SpecialDeals;
