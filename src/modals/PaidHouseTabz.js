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

const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatMonth = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long'
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
          <Text style={styles.detailLabel}>Final Payment Received:</Text>
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

const MonthAccordion = ({ month, bills, isExpanded, onToggle }) => {
  const [animation] = useState(new Animated.Value(isExpanded ? 1 : 0));
  
  // Calculate total amount for this month
  const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const bodyHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bills.length * 140], // Approximate height based on number of bills
  });

  return (
    <View style={styles.transactionContainer}>
      {/* Thin color indicator at top */}
      <View style={styles.colorIndicator} backgroundColor="#34d399" />
      
      <TouchableOpacity 
        style={[styles.paymentItem, isExpanded && styles.paymentItemActive]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentHeaderLeft}>
            <View style={[styles.monthIconContainer, { backgroundColor: "#34d39920" }]}>
              <MaterialIcons 
                name="date-range" 
                size={20} 
                color="#34d399" 
              />
            </View>
            <Text style={styles.monthTitle}>{month}</Text>
          </View>
          
          <View style={styles.paymentHeaderRight}>
            <Text style={styles.monthTotal}>${totalAmount.toFixed(2)}</Text>
            <MaterialIcons 
              name={isExpanded ? "expand-less" : "expand-more"} 
              size={24} 
              color={isExpanded ? "#34d399" : "#64748b"} 
            />
          </View>
        </View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.chargesContainer, { 
        height: bodyHeight,
        opacity: animation
      }]}>
        {isExpanded && bills.map((bill) => (
          <PaidBillItem key={bill.id} bill={bill} />
        ))}
      </Animated.View>
    </View>
  );
};

// UPDATED: Component now accepts paidBills as props instead of fetching them
const PaidHouseTabz = ({ house, onClose, paidBills = [] }) => {
  const [expandedMonth, setExpandedMonth] = useState(null);
  
  // No more loading state or API call since data is pre-loaded
  const loading = false;

  useEffect(() => {
    console.log('PaidHouseTabz received data:', {
      paidBillsCount: paidBills.length,
      houseName: house?.name
    });
  }, [house, paidBills]);

  // Group bills by month based on due date or payment date
  const groupedBills = paidBills.reduce((groups, bill) => {
    const dueDate = bill.dueDate || bill.paymentDate || bill.updatedAt;
    if (!dueDate) return groups;
    
    const date = new Date(dueDate);
    const monthYear = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(bill);
    return groups;
  }, {});

  // Sort months in reverse chronological order
  const sortedMonths = Object.keys(groupedBills).sort((a, b) => {
    const dateA = new Date(a + " 1"); // Add day to make it a valid date
    const dateB = new Date(b + " 1");
    return dateB - dateA;
  });

  const toggleAccordion = (month) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

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
            <Text style={styles.headerTitle}>PaidTabz</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <FlatList
          data={sortedMonths}
          keyExtractor={(item) => item}
          renderItem={({ item: month }) => (
            <MonthAccordion
              month={month}
              bills={groupedBills[month]}
              isExpanded={expandedMonth === month}
              onToggle={() => toggleAccordion(month)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialIcons name="history" size={48} color="#fff" />
              </View>
              <Text style={styles.emptyTitle}>No Paid Tabz</Text>
              <Text style={styles.emptyText}>
                Your payment history will appear here once you've paid bills
              </Text>
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
  list: {
    padding: 16,
    flexGrow: 1,
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
    backgroundColor: 'rgba(240, 253, 244, 0.5)',
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
  monthIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  monthTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginRight: 8,
  },
  chargesContainer: {
    overflow: "hidden",
    backgroundColor: 'rgba(240, 253, 244, 0.5)',
    paddingHorizontal: 16,
  },
  billItem: {
    marginTop: 16,
    marginBottom: 8,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  }
});

export default PaidHouseTabz;