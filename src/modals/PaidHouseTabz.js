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
import apiClient from "../config/api";

const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PaidBillItem = ({ bill }) => {
  return (
    <View style={styles.billItem}>
      <View style={styles.billHeader}>
        <View style={styles.billTitleContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={20} color="#34d399" />
          </View>
          <Text style={styles.billName}>{bill.name || "Paid Bill"}</Text>
        </View>
        <Text style={styles.billAmount}>${parseFloat(bill.amount || 0).toFixed(2)}</Text>
      </View>
      
      <View style={styles.billDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Paid on:</Text>
          <Text style={styles.detailValue}>{formatDate(bill.paymentDate || bill.updatedAt)}</Text>
        </View>
        
        {bill.paymentMethod && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Method:</Text>
            <Text style={styles.detailValue}>{bill.paymentMethod}</Text>
          </View>
        )}
        
        {bill.paidBy && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paid by:</Text>
            <Text style={styles.detailValue}>{bill.paidBy}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const PaidHouseTabz = ({ house, onClose }) => {
  const [paidBills, setPaidBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaidBills = async () => {
      try {
        if (!house?.id) {
          setLoading(false);
          return;
        }
        
        const response = await apiClient.get(`/api/houses/${house.id}/bills/paid`);
        setPaidBills(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching paid bills:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPaidBills();
  }, [house?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  const mockPaidBills = [
    { id: 1, name: "Internet Bill", amount: 89.99, paymentDate: "2024-02-15", paymentMethod: "Credit Card" },
    { id: 2, name: "Water & Sewer", amount: 45.75, paymentDate: "2024-02-10", paymentMethod: "Bank Transfer" },
    { id: 3, name: "Electricity", amount: 124.50, paymentDate: "2024-01-28", paymentMethod: "Credit Card" },
    { id: 4, name: "Netflix Subscription", amount: 17.99, paymentDate: "2024-02-05", paymentMethod: "Split Payment" }
  ];

  // Use mock data for demonstration until real API endpoint is available
  const billsToDisplay = paidBills.length > 0 ? paidBills : mockPaidBills;

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
            <Text style={styles.headerTitle}>Payment History</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => setLoading(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={billsToDisplay}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <PaidBillItem bill={item} />}
            contentContainerStyle={styles.billsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="history" size={48} color="#64748b" />
                <Text style={styles.emptyTitle}>No Payment History</Text>
                <Text style={styles.emptyText}>
                  Paid bills and transactions will appear here
                </Text>
              </View>
            )}
          />
        )}
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
  billsList: {
    padding: 16,
  },
  billItem: {
    marginBottom: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    fontVariant: ['tabular-nums'],
  },
  billDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dff6f0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  }
});

export default PaidHouseTabz;