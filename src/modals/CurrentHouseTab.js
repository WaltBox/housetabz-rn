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

  const getProgressColor = () => {
    if (progress < 25) return '#ef4444';
    if (progress < 50) return '#f59e0b';
    if (progress < 75) return '#3b82f6';
    return '#34d399';
  };

  const color = getProgressColor();

  return (
    <TouchableOpacity style={styles.billCard} onPress={onPress} activeOpacity={0.8}>
      {/* Roof-style progress bar */}
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
          <Text style={styles.dueDate}>{dueLabel}</Text>
          <View style={[styles.percentBadge, { backgroundColor: color + '20' }]}> 
            <Text style={[styles.percentText, { color }]}>{progress.toFixed(0)}% Funded</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CurrentHouseTab = ({ house, onClose }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
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
        const res = await apiClient.get(`/api/houses/${house.id}/bills`);
        const data = res.data.bills || res.data;
        setBills(data);
        const sum = data.reduce((sAcc, bill) => {
          const ch = bill.Charges || bill.charges || [];
          const pend = ch.filter(c => c.status === 'pending' || c.status === 'unpaid');
          return sAcc + pend.reduce((cAcc, c) => cAcc + Number(c.amount), 0);
        }, 0);
        setTotalUnpaid(sum);
      } catch (e) {
        console.error(e);
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

  // Filter bills that have pending charges
  const pendingBills = bills.filter(bill => {
    const ch = bill.Charges || bill.charges || [];
    return ch.some(c => c.status === 'pending' || c.status === 'unpaid');
  });

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
          ) : (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Unpaid</Text>
                <Text style={styles.summaryAmount}>${totalUnpaid.toFixed(2)}</Text>
              </View>

              <Text style={styles.billsHeader}>Pending Bills</Text>

              <FlatList
                data={pendingBills}
                keyExtractor={item => item.id.toString()}
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
                    <Text style={styles.emptyText}>No pending bills.</Text>
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
    backgroundColor: '#dff6f0' 
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
    borderRadius: 12, 
    marginHorizontal: 16,
    padding: 20, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2, 
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
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b'
  },

  billCard: {
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    marginHorizontal: 16,
    marginVertical: 4, 
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05,
    shadowRadius: 3, 
    elevation: 1
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
  },
  progressBar: { 
    height: '100%' 
  },
  cardContent: { 
    padding: 12 
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
    marginTop: 4
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
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10 
  },
  percentText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  dueDate: { 
    fontSize: 12, 
    fontWeight: '500',
    color: '#94a3b8'  // Lighter gray (slate-400)
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