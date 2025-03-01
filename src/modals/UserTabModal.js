import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

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

const ChargeItem = ({ charge, onNavigateToPayment }) => {
  const dueDateStatus = getDueDateStatus(charge.dueDate);
  
  return (
    <TouchableOpacity
      style={styles.chargeItem}
      onPress={() => onNavigateToPayment(charge)}
      activeOpacity={0.7}
    >
      <View style={styles.chargeHeader}>
        <View>
          <Text style={styles.chargeName}>{charge.name || 'Unknown Charge'}</Text>
          <Text style={[styles.dueDate, { color: dueDateStatus.color }]}>
            {dueDateStatus.label}
          </Text>
        </View>
        <View style={styles.chargeAmountContainer}>
          <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
          <MaterialIcons name="chevron-right" size={20} color="#64748b" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const UserTabModal = ({ user }) => {
  const navigation = useNavigation();
  
  // Filter unpaid charges
  const unpaidCharges = useMemo(() => 
    (user?.charges || []).filter(charge => charge.status === 'unpaid' || charge.status === 'pending'),
    [user?.charges]
  );

  // Calculate total unpaid amount
  const totalUnpaid = useMemo(() => 
    unpaidCharges.reduce((sum, charge) => sum + Number(charge.amount), 0),
    [unpaidCharges]
  );
  
  const handleNavigateToPayment = (charge) => {
    // First go back to close the modal
    navigation.goBack();
    
    // Then navigate to the Make Payment tab in the TabNavigator
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'TabNavigator', 
            params: { 
              screen: 'Make Payment',
              params: {
                screen: 'MakePaymentScreen',
                params: { preselectedChargeId: charge?.id }
              }
            }
          },
        ],
      });
    }, 300); // Short delay to ensure modal closes smoothly before navigation
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tab</Text>
        <Text style={styles.totalAmount}>${totalUnpaid.toFixed(2)}</Text>
        {unpaidCharges.length > 0 && (
          <TouchableOpacity 
            style={styles.payAllButton}
            onPress={() => handleNavigateToPayment()}
          >
            <Text style={styles.payAllText}>Go to Payments</Text>
            <MaterialIcons name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={unpaidCharges}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <ChargeItem 
            charge={item} 
            onNavigateToPayment={handleNavigateToPayment}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="check-circle" size={48} color="#e2e8f0" />
            <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
            <Text style={styles.emptyStateText}>No unpaid charges.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  payAllButton: {
    backgroundColor: '#34d399',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  list: {
    padding: 16,
  },
  chargeItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
  },
  chargeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chargeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: "500",
  },
  chargeAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginRight: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
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
  },
});

export default UserTabModal;