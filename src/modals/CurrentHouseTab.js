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
  Platform,
  Animated
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import apiClient from "../config/api";

const getDueDateStatus = (dueDate) => {
  if (!dueDate) return { color: '#64748b', label: 'No due date' };
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { color: '#ef4444', label: `${Math.abs(diff)}d overdue` };
  if (diff <= 3) return { color: '#f59e0b', label: `Due in ${diff}d` };
  if (diff <= 7) return { color: '#3b82f6', label: `Due in ${diff}d` };
  return { color: '#34d399', label: `Due in ${diff}d` };
};

const BillCard = ({ bill, onPress }) => {
  const charges = bill.Charges || bill.charges || [];
  const pending = charges.filter(c => c.status === 'pending' || c.status === 'unpaid');
  const paid = charges.filter(c => c.status === 'paid');
  const unpaidAmount = pending.reduce((sum, c) => sum + Number(c.amount), 0);
  const paidAmount = paid.reduce((sum, c) => sum + Number(c.amount), 0);
  const total = unpaidAmount + paidAmount;
  const progress = total > 0 ? (paidAmount / total) * 100 : 0;
  const { label: dueLabel, color: dueColor } = getDueDateStatus(bill.dueDate);
  
  // Use brand color for progress
  const getProgressColor = () => {
    // Use the brand color
    return '#34d399'; // Brand color
  };

  const color = getProgressColor();

  return (
    <TouchableOpacity style={styles.billCard} onPress={onPress} activeOpacity={0.8}>
      {/* Subtle progress indicator */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.billName}>{bill.name}</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.billAmount}>${unpaidAmount.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.dueDate, { color: dueColor }]}>{dueLabel}</Text>
          {/* Only show progress indicator if there's been some payment */}
          {progress > 0 && (
            <View style={[styles.percentBadge, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}> 
              <Text style={[styles.percentText, { color: '#34d399' }]}>{progress.toFixed(0)}% Paid</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CurrentHouseTab = ({ house, onClose }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [error, setError] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    const load = async () => {
      try {
        setError(false);
        const res = await apiClient.get(`/api/houses/${house.id}/bills`);
        const data = res.data.bills || res.data;
        const houseBalance = res.data.houseBalance || 0;
        
        setBills(data);
        setTotalUnpaid(houseBalance);
      } catch (e) {
        console.error(e);
        setError(true);
        setBills([]);
        setTotalUnpaid(0);
      } finally {
        setLoading(false);
      }
    };
    
    if (house?.id) load();
  }, [house.id]);

  const handleBillPress = (bill) => {
    console.log('Bill pressed:', bill.id);
    // Navigate to bill details or open action sheet
  };

  // Only show bills that are not paid (more explicit filtering)
  // Make sure to handle case differences and trim whitespace
  const unpaidBills = bills.filter(bill => {
    // Get the status and normalize it (lowercase and trim)
    const status = (bill.status || '').toLowerCase().trim();
    // Only include if status is pending or partial_paid, exclude paid bills
    return status === 'pending' || status === 'partial_paid';
  });

  console.log('Bills filtered:', bills.length, 'total,', unpaidBills.length, 'unpaid');

  const retryLoading = () => {
    setLoading(true);
    // Trigger the useEffect to reload data
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/houses/${house.id}/bills`);
        const data = res.data.bills || res.data;
        const houseBalance = res.data.houseBalance || 0;
        
        setBills(data);
        setTotalUnpaid(houseBalance);
        setError(false);
      } catch (e) {
        console.error(e);
        setError(true);
        setBills([]);
        setTotalUnpaid(0);
      } finally {
        setLoading(false);
      }
    };
    
    if (house?.id) load();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeIcon}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.title}>Current Tab</Text>
            <View style={{ width: 28 }} />
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#34d399" />
            </View>
          ) : error ? (
            <View style={styles.error}>
              <MaterialIcons name="error-outline" size={48} color="#ef4444" />
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorText}>We couldn't load your bills at this time.</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={retryLoading}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>You Currently Owe</Text>
                <Text style={styles.summaryAmount}>${totalUnpaid.toFixed(2)}</Text>
              </View>

              <Text style={styles.billsHeader}>Your Charges</Text>

              <FlatList
                data={unpaidBills}
                keyExtractor={item => item.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                  <BillCard 
                    bill={item} 
                    onPress={() => handleBillPress(item)}
                  />
                )} 
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={styles.empty}>
                    <MaterialIcons name="check-circle" size={48} color="#34d399" />
                    <Text style={styles.emptyTitle}>All Caught Up!</Text>
                    <Text style={styles.emptyText}>You have no unpaid bills.</Text>
                  </View>
                )}
              />
            </>
          )}
        </Animated.View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#dff6f0' // Restoring original brand color
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'android' ? 28 : 20, 
    paddingBottom: 12,
    backgroundColor: '#dff6f0'
  },
  closeIcon: { 
    padding: 8 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System'
  },
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  summaryCard: {
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    marginHorizontal: 16,
    padding: 20, 
    marginBottom: 16, 
    ...Platform.select({
      ios: {
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, 
        shadowRadius: 10,
      },
      android: {
    
      }
    }),
    alignItems: 'flex-start'
  },
  summaryLabel: { 
    fontSize: 14, 
    color: '#64748b', 
    marginBottom: 4 
  },
  summaryAmount: {
    fontSize: 32, 
    fontWeight: '700', 
    color: '#1e293b',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Montserrat-Black',
    fontVariant: ['tabular-nums']
  },
  
  billsHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b'
  },

  billCard: {
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    marginHorizontal: 16,
    marginVertical: 6, 
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
 
      }
    })
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#f1f5f9',
  },
  progressBar: { 
    height: '100%',
    borderTopRightRadius: 1.5,
    borderBottomRightRadius: 1.5,
  },
  cardContent: { 
    padding: 16 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  billName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b' 
  },
  amountContainer: { 
    marginLeft: 12 
  },
  billAmount: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  percentBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 3, 
    borderRadius: 12
  },
  percentText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  dueDate: { 
    fontSize: 13, 
    fontWeight: '500'
  },

  error: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 32, 
    paddingHorizontal: 32 
  },
  errorTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginTop: 12 
  },
  errorText: { 
    fontSize: 14, 
    color: '#64748b', 
    marginTop: 6, 
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600'
  },

  empty: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 32, 
    paddingHorizontal: 32 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginTop: 12 
  },
  emptyText: { 
    fontSize: 14, 
    color: '#64748b', 
    marginTop: 6, 
    textAlign: 'center' 
  }
});

export default CurrentHouseTab;