import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';

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

const ChargeItem = ({ charge }) => {
  const status = getDueDateStatus(charge.dueDate);
  return (
    <View style={styles.chargeItem}>
      <View style={styles.chargeRow}>
        <View style={styles.chargeContent}>
          <View style={styles.chargeHeader}>
            <Text style={styles.chargeName}>{charge.name || 'Unnamed Charge'}</Text>
            <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
          </View>
          <View style={styles.chargeFooter}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.dueDate, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const UserTabModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/users/${user.id}`);
      setUserData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchUserData();
  }, [visible]);

  const charges = useMemo(
    () => (userData?.charges || []).filter(c => c.status === 'unpaid'),
    [userData]
  );
  const totalUnpaid = useMemo(
    () => charges.reduce((sum, c) => sum + Number(c.amount || 0), 0),
    [charges]
  );

  const handleNavigateToPayment = () => {
    onClose(); // Close modal first
    navigation.navigate('Pay Tab'); // Navigate to Pay Tab
  };

  if (!visible) return null;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tab</Text>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton} 
            hitSlop={{top:15,bottom:15,left:15,right:15}}
          >
            <MaterialIcons name="close" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#34d399" />
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="account-balance-wallet" size={28} color="#34d399" />
                <Text style={styles.summaryLabel}>Total Outstanding</Text>
              </View>
              <Text style={styles.summaryAmount}>${totalUnpaid.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={handleNavigateToPayment}
                activeOpacity={0.8}
              >
                <MaterialIcons name="payment" size={20} color="white" style={styles.payIcon} />
                <Text style={styles.payButtonText}>Make Payment</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chargesSection}>
              <Text style={styles.chargesHeader}>Your charges ({charges.length})</Text>

              <FlatList
                data={charges}
                keyExtractor={(item,i) => item.id?.toString() || i.toString()}
                renderItem={({ item }) => <ChargeItem charge={item} />}
                ListEmptyComponent={() => (
                  <View style={styles.empty}>
                    <View style={styles.emptyIcon}>
                      <MaterialIcons name="check-circle" size={48} color="#34d399" />
                    </View>
                    <Text style={styles.emptyTitle}>All caught up!</Text>
                    <Text style={styles.emptyText}>You have no unpaid charges.</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom:16 }}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
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
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  summaryCard: {
    backgroundColor: 'white', 
    borderRadius: 16, 
    marginHorizontal: 20,
    padding: 24, 
    marginBottom: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, 
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: { 
    fontSize: 16, 
    color: '#64748b', 
    marginLeft: 8,
    fontWeight: '500'
  },
  summaryAmount: {
    fontSize: 36, 
    fontWeight: '800', 
    color: '#1e293b', 
    marginBottom: 20,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
  },
  payButton: {
    backgroundColor: '#34d399', 
    paddingVertical: 16, 
    paddingHorizontal: 24,
    borderRadius: 12, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payIcon: {
    marginRight: 8,
  },
  payButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600' 
  },

  chargesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chargesHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },

  chargeItem: {
    backgroundColor: 'white', 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chargeRow: { 
    padding: 16 
  },
  chargeContent: {
    flex: 1,
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chargeName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  chargeAmount: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  chargeFooter: {
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
    fontSize: 14, 
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginBottom: 8 
  },
  emptyText: { 
    fontSize: 14, 
    color: '#64748b', 
    textAlign: 'center' 
  }
});

export default UserTabModal;