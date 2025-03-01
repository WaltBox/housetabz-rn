import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import axios from 'axios';

const UserTransactionsModal = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [animationValues, setAnimationValues] = useState({});

  useEffect(() => {
    if (user?.id) fetchPaymentHistory();
  }, [user?.id]);

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/users/${user.id}/payments`
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

    return (
      <>
        {/* Payment Item */}
        <TouchableOpacity
          style={[styles.paymentItem, isExpanded && styles.paymentItemActive]}
          onPress={() => togglePayment(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.paymentHeader}>
            <View>
              <Text style={styles.paymentDate}>
                {new Date(item.paymentDate).toLocaleDateString()}
              </Text>
              <Text style={styles.paymentAmount}>${Number(item.amount).toFixed(2)}</Text>
            </View>

            <MaterialIcons
              name={isExpanded ? "expand-less" : "expand-more"}
              size={24}
              color={isExpanded ? "#10b981" : "#64748b"}
            />
          </View>
        </TouchableOpacity>

        {/* Charges List (Expands and Pushes Content Down) */}
        <Animated.View style={[styles.chargesContainer, { height: animationValues[item.id]?.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 40 * (item.charges?.length || 0)], 
        }) }]}>
          {isExpanded && item.charges?.map((charge) => (
            <View key={charge.id} style={styles.chargeItem}>
              <Text style={styles.chargeName}>{charge.name}</Text>
              <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
            </View>
          ))}
        </Animated.View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt" size={48} color="#e2e8f0" />
              <Text style={styles.emptyText}>No Transactions Found</Text>
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
    backgroundColor: "#fff", 
    padding: 16 
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  list: {
    paddingTop: 12,
  },
  paymentItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    borderRadius: 8,
    elevation: 2, 
  },
  paymentItemActive: {
    backgroundColor: "#f8fafc",
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentDate: {
    fontSize: 14,
    color: "#64748b",
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  chargesContainer: {
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    paddingLeft: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  chargeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  chargeName: {
    fontSize: 14,
    color: "#1e293b",
  },
  chargeAmount: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#64748b",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
});

export default UserTransactionsModal;