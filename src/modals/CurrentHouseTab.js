import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
// Import apiClient instead of axios
import apiClient from "../config/api";

const getDueDateStatus = (dueDate) => {
  if (!dueDate) return { color: '#64748b', label: 'No due date' };
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: '#ef4444', label: `${Math.abs(diffDays)}d overdue` };
  if (diffDays <= 3) return { color: '#f59e0b', label: `Due in ${diffDays}d` };
  if (diffDays <= 7) return { color: '#3b82f6', label: `Due in ${diffDays}d` };
  return { color: '#34d399', label: `Due in ${diffDays}d` };
};

const BillCard = ({ bill }) => {
  const { user } = useAuth();
  const charges = bill?.Charges || [];
  const dueDateStatus = getDueDateStatus(bill.dueDate);
  
  const pendingCharges = charges.filter(charge => charge.status === 'pending');
  const unpaidAmount = pendingCharges.reduce((sum, charge) => 
    sum + Number(charge.amount), 0
  );

  const userHasCharge = pendingCharges.some(charge => charge.userId === user?.id);

  return (
    <View style={styles.billItem}>
      <View style={styles.billHeader}>
        <View style={styles.billTitleContainer}>
          <MaterialIcons
            name={bill.houseService?.type === 'marketplace_onetime' ? 'shopping-cart' : 'receipt'}
            size={18}
            color="#64748b"
            style={styles.billIcon}
          />
          <Text style={styles.billName}>{bill.name}</Text>
        </View>
        <Text style={styles.billAmount}>${unpaidAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.dueDateContainer}>
        <Text style={[styles.dueDate, { color: dueDateStatus.color }]}>
          {dueDateStatus.label}
        </Text>
      </View>

      <View style={styles.chargesContainer}>
        {pendingCharges.map((charge) => {
          const isCurrentUser = charge.userId === user?.id;
          return (
            <View key={charge.id} style={styles.chargeRow}>
              <Text style={[
                styles.chargeName,
                isCurrentUser && styles.currentUserText
              ]}>
                {isCurrentUser ? "You" : charge.User?.username}
              </Text>
              <Text style={styles.chargeAmount}>
                ${Number(charge.amount).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>

      {userHasCharge && (
        <TouchableOpacity style={styles.paymentPrompt}>
          <Text style={styles.paymentPromptText}>Navigate to Pay</Text>
          <MaterialIcons name="chevron-right" size={16} color="#34d399" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const CurrentHouseTab = ({ house }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnpaid, setTotalUnpaid] = useState(0);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // Use apiClient with relative path
        const response = await apiClient.get(`/api/houses/${house.id}/bills`);
        setBills(response.data);
        
        const total = response.data.reduce((sum, bill) => {
          const unpaidCharges = bill.Charges?.filter(c => c.status === 'pending') || [];
          return sum + unpaidCharges.reduce((chargeSum, charge) => 
            chargeSum + Number(charge.amount), 0
          );
        }, 0);
        
        setTotalUnpaid(total);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setLoading(false);
      }
    };

    if (house?.id) {
      fetchBills();
    }
  }, [house?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>CurrentTab</Text>
        <Text style={styles.headerAmount}>${totalUnpaid.toFixed(2)}</Text>
      </View>

      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BillCard bill={item} />}
        contentContainerStyle={styles.billsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="check-circle" size={40} color="#34d399" />
            <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
            <Text style={styles.emptyStateText}>No pending payments at the moment.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  headerAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    fontVariant: ['tabular-nums'],
  },
  billsList: {
    padding: 16,
  },
  billItem: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIcon: {
    marginRight: 8,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    fontVariant: ['tabular-nums'],
  },
  dueDateContainer: {
    marginBottom: 12,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  chargesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  chargeName: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  currentUserText: {
    color: '#34d399',
    fontWeight: '600',
  },
  chargeAmount: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  paymentPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  paymentPromptText: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginVertical: 8,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CurrentHouseTab;