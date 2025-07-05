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
      {isExpanded && (
        <Animated.View style={[
          styles.unpaidUsersContainer,
          {
            opacity: animationValue,
            transform: [{
              scaleY: animationValue
            }]
          }
        ]}>
          {unpaidCharges.length > 0 ? (
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
          )}
        </Animated.View>
      )}
    </>
  );
};

const CurrentHouseTab = ({ house, onClose, bills = [], isLoading = false }) => {
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

    // Calculate total unpaid from house data - use same logic as MyHouseScreen
    const houseBalance = house?.balance || house?.houseBalance || house?.finance?.balance || 0;
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
      houseName: house?.name,
      houseBalanceSource: house?.balance ? 'house.balance' : 
                         house?.houseBalance ? 'house.houseBalance' : 
                         house?.finance?.balance ? 'house.finance.balance' : 'default'
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
            <Text style={[
              styles.title,
              fontsLoaded && { fontFamily: 'Poppins-Bold' }
            ]}>
              Current Tab
            </Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialIcons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          {/* Clean Header with Integrated Amount */}
          <View style={styles.amountHeader}>
            <View style={styles.amountRow}>
              <View style={styles.amountInfo}>
                <Text style={[
                  styles.amountLabel,
                  fontsLoaded && { fontFamily: 'Poppins-Regular' }
                ]}>
                  {houseName} Currently Owes
                </Text>
                <Text style={[
                  styles.amountValue,
                  fontsLoaded && { fontFamily: 'Poppins-Bold' }
                ]}>
                  ${totalUnpaid.toFixed(2)}
                </Text>
              </View>
              <View style={styles.houseIcon}>
                <MaterialIcons name="home" size={20} color="#64748b" />
              </View>
            </View>
            
            {/* Subtle divider */}
            <View style={styles.headerDivider} />
          </View>

          <View style={styles.billsSection}>
            <Text style={[
              styles.billsHeader,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>
              Unpaid Bills • {unpaidBills.length}
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
        
        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34d399" />
              <Text style={[
                styles.loadingText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                Loading complete bill data...
              </Text>
            </View>
          </View>
        )}
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
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 28 : 20, 
    paddingBottom: 16,
    backgroundColor: '#dff6f0'
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1e293b',
    flex: 1
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Clean Amount Header Styles
  amountHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountInfo: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
  },
  houseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 20,
    marginHorizontal: -4,
  },

  billsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  billsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  billCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
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
    padding: 20,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 16,
    lineHeight: 22,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
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
    color: '#64748b',
    letterSpacing: 0.2,
    flex: 1,
  },
  expandIndicator: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
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
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  },
  
  // Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(223, 246, 240, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8
      }
    })
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  }
});

export default CurrentHouseTab;