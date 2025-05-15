import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';
import { useFonts } from 'expo-font';

const HistoryTab = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [animationValues, setAnimationValues] = useState({});

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    if (user?.id) fetchPaymentHistory();
  }, [user?.id]);

  const fetchPaymentHistory = async () => {
    try {
      console.log('Fetching payment history for user:', user.id);
      const response = await apiClient.get(
        `/api/users/${user.id}/payments`
      );

      console.log('Payment history response:', response.data);

      // Sort payments by date (most recent first)
      const sortedPayments = response.data.payments.sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );

      setPayments(sortedPayments);

      // Initialize animation values for each payment
      let newAnimationValues = {};
      sortedPayments.forEach(payment => {
        newAnimationValues[payment.id] = new Animated.Value(0);
      });
      setAnimationValues(newAnimationValues);
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePayment = (paymentId) => {
    if (expandedPayment === paymentId) {
      setExpandedPayment(null);
      animateItem(paymentId, false);
    } else {
      if (expandedPayment !== null) {
        animateItem(expandedPayment, false);
      }
      setExpandedPayment(paymentId);
      animateItem(paymentId, true);
    }
  };

  const animateItem = (paymentId, expand) => {
    Animated.timing(animationValues[paymentId], {
      toValue: expand ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString || 'Unknown date';
    }
  };

  const renderPayment = ({ item }) => {
    const isExpanded = expandedPayment === item.id;
    const charges = Array.isArray(item.charges) ? item.charges : [];
    const hasCharges = charges.length > 0;

    return (
      <>
        {/* Payment Item */}
        <TouchableOpacity
          style={styles.paymentItem}
          onPress={() => togglePayment(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentDate,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                {formatDate(item.paymentDate)}
              </Text>
              <Text style={[
                styles.paymentAmount,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>
                ${Number(item.amount).toFixed(2)}
              </Text>
            </View>

            <View style={styles.expandIndicator}>
              <MaterialIcons
                name={isExpanded ? "expand-less" : "expand-more"}
                size={24}
                color="#64748b"
              />
            </View>
          </View>
          
          {hasCharges && !isExpanded && (
            <Text style={[
              styles.tapToViewText,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}>
              TAP TO VIEW DETAILS
            </Text>
          )}
        </TouchableOpacity>

        {/* Charges List (Expands and Pushes Content Down) */}
        <Animated.View style={[
          styles.chargesContainer, 
          { 
            height: animationValues[item.id].interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.max(50 * (charges.length || 0), 50)], 
            }),
            opacity: animationValues[item.id]
          }
        ]}>
          {isExpanded && (
            hasCharges ? (
              charges.map((charge) => (
                <View key={charge.id} style={styles.chargeItem}>
                  <Text style={[
                    styles.chargeName,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}>
                    {charge.name || 'Charge'}
                  </Text>
                  <Text style={[
                    styles.chargeAmount,
                    fontsLoaded && { fontFamily: 'Poppins-Medium' }
                  ]}>
                    ${Number(charge.amount).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noChargesItem}>
                <Text style={[
                  styles.noChargesText,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  No detailed charges available
                </Text>
              </View>
            )
          )}
        </Animated.View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={[
            styles.loadingText,
            fontsLoaded && { fontFamily: 'Poppins-Regular' }
          ]}>
            Loading payment history...
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt" size={48} color="#e2e8f0" />
              <Text style={[
                styles.emptyTitle,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]}>
                No Payment History
              </Text>
              <Text style={[
                styles.emptyText,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                Your payment transactions will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#dff6f0",
    padding: 16
  },
  list: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 12
  },
  paymentItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  expandIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tapToViewText: {
    fontSize: 12,
    color: '#34d399',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  chargesContainer: {
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginTop: -4,
    marginBottom: 8,
    marginHorizontal: 4,
    paddingHorizontal: 16,
  },
  chargeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  chargeName: {
    fontSize: 14,
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  chargeAmount: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  noChargesItem: {
    padding: 16,
    alignItems: 'center',
  },
  noChargesText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: 'center',
  },
});

export default HistoryTab;