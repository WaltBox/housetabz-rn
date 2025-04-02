import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
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
  
  // Handle different property names for charges
  const charges = bill?.Charges || bill?.charges || [];
  const dueDateStatus = getDueDateStatus(bill.dueDate);
  
  const pendingCharges = charges.filter(charge => charge.status === 'pending' || charge.status === 'unpaid');
  const unpaidAmount = pendingCharges.reduce((sum, charge) => 
    sum + Number(charge.amount), 0
  );
  
  const paidCharges = charges.filter(charge => charge.status === 'paid');
  const paidAmount = paidCharges.reduce((sum, charge) => 
    sum + Number(charge.amount), 0
  );
  
  const totalAmount = unpaidAmount + paidAmount;
  const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  
  const userHasCharge = pendingCharges.some(charge => charge.userId === user?.id);
  
  // Get color based on payment progress
  const getProgressColor = () => {
    if (progressPercentage < 25) return '#ef4444'; // Red for low progress
    if (progressPercentage < 50) return '#f59e0b'; // Orange for medium progress
    if (progressPercentage < 75) return '#3b82f6'; // Blue for good progress
    return '#34d399'; // Green for excellent progress
  };

  return (
    <TouchableOpacity 
      style={styles.billItem}
      activeOpacity={0.7}
    >
      {/* Thin progress bar at the top */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${progressPercentage}%`,
              backgroundColor: getProgressColor()
            }
          ]} 
        />
      </View>
      
      <View style={styles.billHeader}>
        <View style={styles.billTitleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: dueDateStatus.color + '20' }]}>
            <MaterialIcons
              name={bill.houseService?.type === 'marketplace_onetime' ? 'shopping-cart' : 'receipt'}
              size={20}
              color={dueDateStatus.color}
            />
          </View>
          <View style={styles.billInfo}>
            <Text style={styles.billName}>{bill.name}</Text>
            <Text style={[styles.dueDate, { color: dueDateStatus.color }]}>
              {dueDateStatus.label}
            </Text>
          </View>
        </View>
        <Text style={styles.billAmount}>${unpaidAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.chargesContainer}>
        {pendingCharges.map((charge) => {
          // Handle different property names for user data in charge
          const chargeUser = charge.User || charge.user || {};
          const isCurrentUser = charge.userId === user?.id;
          
          return (
            <View key={charge.id} style={styles.chargeRow}>
              <Text style={[
                styles.chargeName,
                isCurrentUser && styles.currentUserText
              ]}>
                {isCurrentUser ? "You" : chargeUser?.username || "User"}
              </Text>
              <Text style={styles.chargeAmount}>
                ${Number(charge.amount).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>

      {userHasCharge && (
        <TouchableOpacity 
          style={[styles.paymentPrompt, { backgroundColor: dueDateStatus.color + '20' }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.paymentPromptText, { color: dueDateStatus.color }]}>Pay Now</Text>
          <MaterialIcons name="chevron-right" size={16} color={dueDateStatus.color} />
        </TouchableOpacity>
      )}
      
      {/* Payment progress indicator */}
      <View style={styles.progressInfoContainer}>
        <Text style={styles.progressText}>
          {progressPercentage.toFixed(0)}% Collected
        </Text>
        <Text style={styles.progressDetail}>
          ${paidAmount.toFixed(2)} of ${totalAmount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CurrentHouseTab = ({ house, onClose }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'overdue', 'upcoming'

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await apiClient.get(`/api/houses/${house.id}/bills`);
        
        // Response may be an object with bills property, or directly an array
        const billsData = response.data.bills || response.data;
        setBills(billsData);
        
        // Calculate total unpaid amount, handling different charge property names
        const total = billsData.reduce((sum, bill) => {
          const charges = bill.Charges || bill.charges || [];
          const unpaidCharges = charges.filter(c => c.status === 'pending' || c.status === 'unpaid') || [];
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

  const getFilteredBills = () => {
    if (filterStatus === 'all') return bills;
    
    return bills.filter(bill => {
      const status = getDueDateStatus(bill.dueDate);
      if (filterStatus === 'overdue') return status.color === '#ef4444'; // Red = overdue
      if (filterStatus === 'upcoming') return status.color === '#f59e0b'; // Orange = upcoming soon
      return true;
    });
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
            <Text style={styles.headerTitle}>Current Tab</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Unpaid</Text>
          <Text style={styles.summaryAmount}>${totalUnpaid.toFixed(2)}</Text>
          
          {/* Display house balance if available */}
          {(house?.finance?.balance !== undefined || house?.balance !== undefined) && (
            <View style={styles.houseBalanceContainer}>
              <Text style={styles.houseBalanceLabel}>House Balance:</Text>
              <Text style={styles.houseBalanceValue}>
                ${(house?.finance?.balance ?? house?.balance ?? 0).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Filter tabs */}
        <View style={styles.filterContainer}>
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'upcoming', label: 'Due Soon' }
          ].map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                filterStatus === filter.id && styles.activeFilterTab
              ]}
              onPress={() => setFilterStatus(filter.id)}
            >
              <Text style={[
                styles.filterTabText,
                filterStatus === filter.id && styles.activeFilterTabText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={getFilteredBills()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <BillCard bill={item} />}
          contentContainerStyle={styles.billsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialIcons name="check-circle" size={48} color="#34d399" />
              <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
              <Text style={styles.emptyStateText}>No pending payments at the moment.</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
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
  summaryCard: {
    padding: 20,
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  houseBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(203, 213, 225, 0.3)',
  },
  houseBalanceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  houseBalanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34d399',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(203, 213, 225, 0.3)',
  },
  activeFilterTab: {
    backgroundColor: '#34d399',
  },
  filterTabText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: 'white',
    fontWeight: '600',
  },
  // ...rest of the styles remain the same
  billsList: {
    padding: 16,
    paddingTop: 0,
  },
  billItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(203, 213, 225, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  progressContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(203, 213, 225, 0.3)',
  },
  progressBar: {
    height: 4,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  billTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billInfo: {
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    fontVariant: ['tabular-nums'],
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  chargesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  chargeName: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  currentUserText: {
    color: '#34d399',
    fontWeight: '600',
  },
  chargeAmount: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  paymentPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  paymentPromptText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  progressInfoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  progressDetail: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
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
    backgroundColor: '#dff6f0',
  },
});

export default CurrentHouseTab;