import React, { useMemo, useState } from 'react';
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
} from 'react-native';
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
      style={[styles.chargeItem, { borderColor: dueDateStatus.color + '40' }]}
      onPress={() => onNavigateToPayment(charge)}
      activeOpacity={0.7}
    >
      <View style={styles.chargeContent}>
        <View style={styles.chargeHeader}>
          <View style={styles.chargeHeaderLeft}>
            <View style={[styles.iconContainer, { backgroundColor: dueDateStatus.color + '20', borderColor: dueDateStatus.color + '30' }]}>
              <MaterialIcons
                name="receipt"
                size={20}
                color={dueDateStatus.color}
              />
            </View>
            <View style={styles.chargeInfo}>
              <Text style={styles.chargeName}>{charge.name || 'Unknown Charge'}</Text>
              <View style={styles.dueDateBubble}>
                <Text style={[styles.dueDate, { color: dueDateStatus.color }]}>
                  {dueDateStatus.label}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.chargeAmountContainer}>
            <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.paymentPrompt, { backgroundColor: dueDateStatus.color + '20', borderColor: dueDateStatus.color + '30' }]}
          onPress={() => onNavigateToPayment(charge)}
          activeOpacity={0.7}
        >
          <Text style={[styles.paymentPromptText, { color: dueDateStatus.color }]}>Pay Now</Text>
          <MaterialIcons name="chevron-right" size={16} color={dueDateStatus.color} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const UserTabModal = ({ user, onClose }) => {
  const navigation = useNavigation();
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'overdue', 'upcoming'
  
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

  const getFilteredCharges = () => {
    if (filterStatus === 'all') return unpaidCharges;
    
    return unpaidCharges.filter(charge => {
      const status = getDueDateStatus(charge.dueDate);
      if (filterStatus === 'overdue') return status.color === '#ef4444'; // Red = overdue
      if (filterStatus === 'upcoming') return status.color === '#f59e0b'; // Orange = upcoming soon
      return true;
    });
  };

  if (!user) {
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
            <Text style={styles.headerTitle}>My Tab</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Unpaid</Text>
          <Text style={styles.summaryAmount}>${totalUnpaid.toFixed(2)}</Text>
          
          {unpaidCharges.length > 0 && (
            <TouchableOpacity 
              style={styles.payAllButton}
              onPress={() => handleNavigateToPayment()}
              activeOpacity={0.8}
            >
              <Text style={styles.payAllText}>Go to Payments</Text>
              <MaterialIcons name="chevron-right" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter tabs */}
        {unpaidCharges.length > 0 && (
          <View style={styles.filterContainer}>
            {[
              { id: 'all', label: 'All Charges' },
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
        )}

        <FlatList
          data={getFilteredCharges()}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <ChargeItem 
              charge={item} 
              onNavigateToPayment={handleNavigateToPayment}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialIcons name="check-circle" size={48} color="#34d399" />
              <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
              <Text style={styles.emptyStateText}>No unpaid charges.</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dff6f0',
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
    marginBottom: 16,
  },
  payAllButton: {
    backgroundColor: '#34d399',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  payAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
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
  list: {
    padding: 16,
    paddingTop: 0,
  },
  chargeItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(203, 213, 225, 0.15)',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chargeContent: {
    padding: 16,
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chargeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
  },
  chargeInfo: {
    flex: 1,
  },
  chargeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  dueDateBubble: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  chargeAmountContainer: {
    alignItems: 'flex-end',
  },
  chargeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  paymentPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  paymentPromptText: {
    fontSize: 15,
    fontWeight: '600',
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
    textAlign: 'center',
  },
});

export default UserTabModal;