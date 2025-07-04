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
import { useFonts } from 'expo-font';

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

const BillCard = ({ bill, onPress, isExpanded, animationValue }) => {
  const charges = bill.Charges || bill.charges || [];
  const unpaidCharges = charges.filter(c => c.status === 'unpaid' || c.status === 'processing');
  const paidCharges = charges.filter(c => c.status === 'paid');
  const unpaidAmount = unpaidCharges.reduce((sum, c) => sum + Number(c.amount), 0);
  const paidAmount = paidCharges.reduce((sum, c) => sum + Number(c.amount), 0);
  const total = unpaidAmount + paidAmount;
  const progress = total > 0 ? (paidAmount / total) * 100 : 0;
  const { label: dueLabel, color: dueColor } = getDueDateStatus(bill.dueDate);
  
  // Check if bill is overdue for styling context
  const isOverdue = bill.dueDate && new Date(bill.dueDate) < new Date();
  
  return (
    <>
      {/* Bill Card */}
      <TouchableOpacity style={styles.billCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.billContent}>
          <View style={styles.billHeader}>
            <Text style={styles.billName}>{bill.name}</Text>
            <Text style={styles.billAmount}>${unpaidAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.billFooter}>
            <View style={[styles.statusDot, { backgroundColor: dueColor }]} />
            <Text style={[styles.dueDate, { color: dueColor }]}>{dueLabel}</Text>
            <View style={styles.expandIndicator}>
              <MaterialIcons
                name={isExpanded ? "expand-less" : "expand-more"}
                size={20}
                color="#64748b"
              />
            </View>
          </View>
          {/* Progress info */}
          {progress > 0 && (
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{progress.toFixed(0)}% Paid</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Expandable Unpaid Users Section */}
      <Animated.View style={[
        styles.unpaidUsersContainer,
        {
          height: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.max(56 * unpaidCharges.length, 56)]
          }),
          opacity: animationValue
        }
      ]}>
        {isExpanded && (
          unpaidCharges.length > 0 ? (
            unpaidCharges.map((charge, index) => {
              // Get username from multiple possible sources
              const username = charge.userName || 
                              charge.User?.username || 
                              charge.user?.username || 
                              `User ${charge.userId}`;
              
              return (
                <View 
                  key={charge.id} 
                  style={[
                    styles.unpaidUserItem,
                    // Remove border from last item
                    index === unpaidCharges.length - 1 && styles.lastUnpaidUserItem
                  ]}
                >
                  <View style={styles.userInfo}>
                    <View style={[
                      styles.userIconContainer,
                      // Only use red background if bill is actually overdue
                      isOverdue ? styles.userIconOverdue : styles.userIconNeutral
                    ]}>
                      <MaterialIcons 
                        name="person" 
                        size={16} 
                        color={isOverdue ? "#dc2626" : "#6b7280"} 
                      />
                    </View>
                    <Text style={styles.unpaidUserName}>
                      {username}
                    </Text>
                  </View>
                  <Text style={[
                    styles.unpaidUserAmount,
                    // Only use red text if bill is actually overdue
                    isOverdue && styles.unpaidUserAmountOverdue
                  ]}>
                    ${Number(charge.amount).toFixed(2)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.noUnpaidItem}>
              <MaterialIcons name="check-circle" size={20} color="#34d399" />
              <Text style={styles.noUnpaidText}>
                All roommates have paid
              </Text>
            </View>
          )
        )}
      </Animated.View>
    </>
  );
};

const CurrentHouseTab = ({ house, onClose, bills = [] }) => {
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [expandedBill, setExpandedBill] = useState(null);
  const [animationValues, setAnimationValues] = useState({});

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    // Calculate total unpaid from house data
    const houseBalance = house?.houseBalance || 0;
    setTotalUnpaid(houseBalance);
    
    // Initialize animation values for each bill
    let newAnimationValues = {};
    bills.forEach(bill => {
      newAnimationValues[bill.id] = new Animated.Value(0);
    });
    setAnimationValues(newAnimationValues);
    
    console.log('CurrentHouseTab received data:', {
      billsCount: bills.length,
      houseBalance,
      houseName: house?.name
    });
  }, [house, bills]);

  const toggleBill = (billId) => {
    if (expandedBill === billId) {
      setExpandedBill(null);
      animateBill(billId, false);
    } else {
      if (expandedBill !== null) {
        animateBill(expandedBill, false);
      }
      setExpandedBill(billId);
      animateBill(billId, true);
    }
  };

  const animateBill = (billId, expand) => {
    if (animationValues[billId]) {
      Animated.timing(animationValues[billId], {
        toValue: expand ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Filter bills - only show pending/partial_paid bills
  const unpaidBills = bills.filter(bill => {
    const status = (bill.status || '').toLowerCase().trim();
    return status === 'pending' || status === 'partial_paid';
  });

  // Get house name for display
  const houseName = house?.name || 'House';

  const renderBillItem = ({ item }) => {
    const isExpanded = expandedBill === item.id;
    
    return (
      <BillCard
        bill={item}
        onPress={() => toggleBill(item.id)}
        isExpanded={isExpanded}
        animationValue={animationValues[item.id] || new Animated.Value(0)}
      />
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#1e293b" />
            </TouchableOpacity>
            <Text style={[
              styles.title,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>
              Current Tab
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Summary card with house name */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="home" size={28} color="#34d399" />
              <Text style={[
                styles.summaryLabel,
                fontsLoaded && { fontFamily: 'Poppins-Regular' }
              ]}>
                {houseName} Currently Owes
              </Text>
            </View>
            <Text style={[
              styles.summaryAmount,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>
              ${totalUnpaid.toFixed(2)}
            </Text>
          </View>

          <View style={styles.billsSection}>
            <Text style={[
              styles.billsHeader,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>
              Unpaid Bills ({unpaidBills.length})
            </Text>

            <FlatList
              data={unpaidBills}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              renderItem={renderBillItem}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <MaterialIcons name="check-circle" size={48} color="#34d399" />
                  </View>
                  <Text style={[
                    styles.emptyTitle,
                    fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
                  ]}>
                    All Caught Up!
                  </Text>
                  <Text style={[
                    styles.emptyText,
                    fontsLoaded && { fontFamily: 'Poppins-Regular' }
                  ]}>
                    No unpaid bills found.
                  </Text>
                </View>
              )}
            />
          </View>
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
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b',
    flex: 1,
    textAlign: 'center'
  },
  closeButton: {
    padding: 8
  },

  summaryCard: {
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    marginHorizontal: 16,
    padding: 24, 
    marginBottom: 16, 
    ...Platform.select({
      ios: {
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, 
        shadowRadius: 10,
      },
      android: {
        elevation: 2
      }
    }),
    alignItems: 'flex-start'
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: { 
    fontSize: 14, 
    color: '#64748b', 
    marginLeft: 8,
    fontWeight: '500'
  },
  summaryAmount: {
    fontSize: 32, 
    fontWeight: '700', 
    color: '#1e293b',
    fontVariant: ['tabular-nums']
  },

  billsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  billsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },

  billCard: {
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1
      }
    })
  },
  billContent: {
    padding: 16,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  billAmount: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  billFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dueDate: { 
    fontSize: 13, 
    fontWeight: '500',
    flex: 1
  },
  expandIndicator: {
    marginLeft: 8,
  },
  progressInfo: {
    marginTop: 8
  },
  progressText: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '600'
  },
  
  // Expandable section styles
  unpaidUsersContainer: {
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginTop: -4,
    marginBottom: 8,
    marginHorizontal: 4,
    paddingHorizontal: 18,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1
      }
    })
  },
  unpaidUserItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  lastUnpaidUserItem: {
    borderBottomWidth: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  userIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  userIconNeutral: {
    backgroundColor: '#f3f4f6',
  },
  userIconOverdue: {
    backgroundColor: '#fef2f2',
  },
  unpaidUserName: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1
  },
  unpaidUserAmount: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600'
  },
  unpaidUserAmountOverdue: {
    color: '#dc2626',
  },
  noUnpaidItem: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noUnpaidText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500'
  },
  
  empty: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40, 
    paddingHorizontal: 32 
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4
      }
    })
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