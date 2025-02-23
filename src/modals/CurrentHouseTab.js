import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";

const getDueDateStatus = (dueDate) => {
  if (!dueDate) return { color: '#64748b', label: 'No due date' };
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: '#ef4444', label: 'Late' };
  if (diffDays <= 3) return { color: '#f59e0b', label: 'Due Soon' };
  if (diffDays <= 7) return { color: '#3b82f6', label: 'Upcoming' };
  return { color: '#34d399', label: 'Due Later' };
};

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

const BillCard = ({ bill }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const charges = bill?.Charges || [];
  const dueDateStatus = getDueDateStatus(bill.dueDate);

  const pendingCharges = charges.filter(charge => charge.status === 'pending');
  const unpaidAmount = pendingCharges.reduce((sum, charge) => 
    sum + Number(charge.amount), 0
  );

  return (
    <TouchableOpacity 
      style={[styles.billCard, { borderLeftColor: dueDateStatus.color, borderLeftWidth: 4 }]}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.9}
    >
      <View style={styles.billHeader}>
        <View style={styles.billInfo}>
          <Text style={styles.billName}>{bill.name}</Text>
          <View style={[styles.dueDateBadge, { backgroundColor: dueDateStatus.color + '20' }]}>
            <Text style={[styles.dueDateText, { color: dueDateStatus.color }]}>
              {dueDateStatus.label} • {formatDate(bill.dueDate)}
            </Text>
          </View>
        </View>
        <Text style={styles.unpaidAmount}>${unpaidAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.userStatusContainer}>
        {pendingCharges.map((charge) => {
          const isCurrentUser = charge.userId === user?.id;
          const isLate = new Date(bill.dueDate) < new Date();
          
          return (
            <View key={charge.id} style={styles.userChip}>
           <Text style={[
  styles.userChipText,
  isCurrentUser && styles.currentUserText,
  isLate && styles.lateUserText
]}>
  {isCurrentUser ? "You" : charge.User?.username}
</Text>
              <Text style={styles.userChipAmount}>
                ${Number(charge.amount).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>

      {pendingCharges.some(charge => charge.userId === user?.id) && (
        <TouchableOpacity style={styles.paymentPrompt}>
          <Text style={styles.paymentPromptText}>Navigate to Pay</Text>
          <MaterialIcons name="chevron-right" size={16} color="#34d399" />
        </TouchableOpacity>
      )}

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.expandedTitle}>Payment Status</Text>
          {charges.map((charge) => {
            const isCurrentUser = charge.userId === user?.id;
            return (
              <View key={charge.id} style={styles.chargeRow}>
                <View style={styles.chargeUserInfo}>
                  <MaterialIcons 
                    name={charge.status === 'paid' ? "check-circle" : "timer"} 
                    size={16} 
                    color={charge.status === 'paid' ? "#34d399" : "#f59e0b"} 
                  />
                <Text style={[
  styles.chargeUsername,
  isCurrentUser && styles.currentUserText
]}>
  {isCurrentUser ? "You" : charge.User?.username}
</Text>
                </View>
                <View style={styles.chargeDetails}>
                  <Text style={[
                    styles.chargeAmount,
                    { color: charge.status === 'paid' ? "#34d399" : "#f59e0b" }
                  ]}>
                    ${Number(charge.amount).toFixed(2)}
                  </Text>
                  <Text style={styles.chargeStatus}>
                    {charge.status.charAt(0).toUpperCase() + charge.status.slice(1)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
};

const CurrentHouseTab = ({ house }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnpaid, setTotalUnpaid] = useState(0);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get(`http://localhost:3004/api/houses/${house.id}/bills`);
        console.log('Bills response:', response.data);
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
      <View style={styles.header}>
        <Text style={styles.title}>Current Tab</Text>
        <View style={styles.totalAmountCard}>
          <Text style={styles.totalAmountLabel}>Total House Balance</Text>
          <Text style={styles.totalAmountValue}>${totalUnpaid.toFixed(2)}</Text>
        </View>
      </View>

      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BillCard bill={item} />}
        contentContainerStyle={styles.billsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="check-circle" size={48} color="#34d399" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>No pending payments at the moment.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  totalAmountCard: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
  },
  totalAmountLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  totalAmountValue: {
    fontSize: 28,
    fontWeight: "700",
    color: '#1e293b',
  },
  billsList: {
    padding: 16,
  },
  billCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  billInfo: {
    flex: 1,
    marginRight: 12,
  },
  billName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  dueDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  unpaidAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  userStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  userChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userChipText: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 6,
  },
  currentUserText: {
    color: '#34d399',
    fontWeight: '600',
  },
  lateUserText: {
    color: '#ef4444',
  },
  userChipAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
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
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: '#1e293b',
    marginBottom: 12,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chargeUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargeUsername: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
  },
  chargeDetails: {
    alignItems: 'flex-end',
  },
  chargeAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  chargeStatus: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
  },
});

export default CurrentHouseTab;