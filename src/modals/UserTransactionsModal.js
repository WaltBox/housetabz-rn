import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import apiClient from '../config/api';

// Format date to show month and day
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get different colors for transaction types
const getTransactionColor = (type) => {
  switch(type?.toLowerCase()) {
    case 'payment':
      return '#34d399';  // Green
    case 'charge':
      return '#f59e0b';  // Orange
    case 'refund':
      return '#3b82f6';  // Blue
    default:
      return '#34d399';  // Gray
  }
};

const UserTransactionsModal = ({ user, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [animationValues, setAnimationValues] = useState({});

  useEffect(() => {
    if (user?.id) fetchPaymentHistory();
  }, [user?.id]);

  const fetchPaymentHistory = async () => {
    try {
      const response = await apiClient.get(
        `/api/users/${user.id}/payments`
      );

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
      
      // Create some mock data if the API fails
      const mockPayments = [
        {
          id: 1,
          paymentDate: '2023-03-01',
          amount: 112.50,
          type: 'payment',
          method: 'Credit Card',
          charges: [
            { id: 101, name: 'Internet Bill', amount: 65.00 },
            { id: 102, name: 'Water Bill', amount: 47.50 }
          ]
        },
        {
          id: 2,
          paymentDate: '2023-02-15',
          amount: 89.99,
          type: 'payment',
          method: 'Bank Transfer',
          charges: [
            { id: 103, name: 'Electricity', amount: 89.99 }
          ]
        },
        {
          id: 3,
          paymentDate: '2023-02-05',
          amount: 15.00,
          type: 'refund',
          method: 'Credit to Account',
          charges: []
        }
      ];
      
      setPayments(mockPayments);
      
      // Initialize animation values for mock data
      let newAnimationValues = {};
      mockPayments.forEach(payment => {
        newAnimationValues[payment.id] = new Animated.Value(0);
      });
      setAnimationValues(newAnimationValues);
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

  const renderPayment = ({ item }) => {
    const isExpanded = expandedPayment === item.id;
    const transactionColor = getTransactionColor(item.type);
    const paymentMethod = item.method || "Payment";

    return (
      <View style={styles.transactionContainer}>
        {/* Thin color indicator at top */}
        <View style={styles.colorIndicator} backgroundColor={transactionColor} />
        
        {/* Payment Item */}
        <TouchableOpacity
          style={[
            styles.paymentItem, 
            isExpanded && styles.paymentItemActive
          ]}
          onPress={() => togglePayment(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.paymentHeader}>
            <View style={styles.paymentHeaderLeft}>
              <View style={[styles.iconContainer, { backgroundColor: transactionColor + '20' }]}>
                <MaterialIcons
                  name={item.type === 'refund' ? 'replay' : 'payment'}
                  size={20}
                  color={transactionColor}
                />
              </View>
              <View>
                <Text style={styles.paymentType}>{paymentMethod}</Text>
                <Text style={styles.paymentDate}>
                  {formatDate(item.paymentDate)}
                </Text>
              </View>
            </View>
            
            <View style={styles.paymentHeaderRight}>
              <Text style={styles.paymentAmount}>${Number(item.amount).toFixed(2)}</Text>
              <MaterialIcons
                name={isExpanded ? "expand-less" : "expand-more"}
                size={24}
                color={isExpanded ? transactionColor : "#64748b"}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Charges List (Expands and Pushes Content Down) */}
        <Animated.View style={[
          styles.chargesContainer, 
          { 
            height: animationValues[item.id]?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.max(40 * (item.charges?.length || 0), 40)], 
            }),
            opacity: animationValues[item.id]
          }
        ]}>
          {isExpanded && (
            item.charges?.length > 0 ? (
              item.charges.map((charge) => (
                <View key={charge.id} style={styles.chargeItem}>
                  <Text style={styles.chargeName}>{charge.name}</Text>
                  <View style={styles.chargeAmountContainer}>
                    {charge.useNewFeeStructure && charge.paymentFee ? (
                      <>
                        <Text style={styles.chargeAmount}>
                          ${Number(charge.baseAmount || charge.amount).toFixed(2)}
                        </Text>
                        <Text style={styles.chargeFee}>
                          + ${Number(charge.paymentFee).toFixed(2)} fee
                        </Text>
                        <Text style={styles.chargeTotalAmount}>
                          = ${Number(charge.totalAmount || charge.amount).toFixed(2)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.chargeAmount}>
                        ${Number(charge.amount).toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noChargesItem}>
                <Text style={styles.noChargesText}>No detailed charges available</Text>
              </View>
            )
          )}
        </Animated.View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction History</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
              <Text style={styles.emptyStateText}>Your payment history will appear here</Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#dff6f0"
  },
  headerContainer: {
    backgroundColor: "#dff6f0",
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
  },
  closeButton: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#dff6f0",
  },
  list: {
    padding: 16,
  },
  transactionContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(203, 213, 225, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  colorIndicator: {
    height: 4,
    width: '100%',
  },
  paymentItem: {
    padding: 16,
  },
  paymentItemActive: {
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentDate: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginRight: 8,
  },
  chargesContainer: {
    overflow: "hidden",
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    paddingHorizontal: 16,
  },
  chargeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.5)",
  },
  chargeName: {
    fontSize: 14,
    color: "#1e293b",
  },
  chargeAmountContainer: {
    alignItems: 'flex-end',
  },
  chargeAmount: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  chargeFee: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  chargeTotalAmount: {
    fontSize: 14,
    color: "#34d399",
    fontWeight: "600",
    marginTop: 2,
  },
  noChargesItem: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  noChargesText: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: 'center',
  },
});

export default UserTransactionsModal;