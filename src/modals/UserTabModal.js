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
import { useFonts } from 'expo-font';

const getDueDateStatus = (charge) => {
  // Backend now provides proper dueDate, but fallback to bill.dueDate if needed
  const dueDate = charge?.dueDate || charge?.Bill?.dueDate || charge?.bill?.dueDate;
                  
  if (!dueDate) return { color: '#64748b', label: 'No due date' };
  
  const now = new Date();
  const due = new Date(dueDate);
  
  // Check if date is valid
  if (isNaN(due.getTime())) return { color: '#64748b', label: 'Invalid date' };
  
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { color: '#ef4444', label: `${Math.abs(diffDays)}d overdue` };
  if (diffDays <= 3) return { color: '#f59e0b', label: `Due in ${diffDays}d` };
  if (diffDays <= 7) return { color: '#3b82f6', label: `Due in ${diffDays}d` };
  return { color: '#34d399', label: `Due in ${diffDays}d` };
};

const ChargeItem = ({ charge }) => {
  const status = getDueDateStatus(charge);
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

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const fetchUserData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/users/${user.id}`);
      console.log("👤 UserTabModal received user data:", {
        hasCharges: !!res.data?.charges,
        chargesCount: res.data?.charges?.length || 0,
        unpaidCharges: res.data?.charges?.filter(c => c.status === 'unpaid')?.length || 0,
        firstCharge: res.data?.charges?.[0],
        chargeKeys: res.data?.charges?.[0] ? Object.keys(res.data.charges[0]) : 'no charges'
      });
      
      // ✅ Backend now provides complete data with due dates - no additional fetching needed
      console.log("✅ Received user charges with due dates:", {
        chargesWithDueDates: res.data?.charges?.filter(c => c.dueDate).length || 0,
        totalCharges: res.data?.charges?.length || 0,
        sampleCharge: res.data?.charges?.[0]
      });
      
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
          <Text style={[
            styles.title,
            fontsLoaded && { fontFamily: 'Poppins-Bold' }
          ]}>
            My Tab
          </Text>
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
            {/* Clean Header with Integrated Amount */}
            <View style={styles.amountHeader}>
              <View style={styles.amountRow}>
                <View style={styles.amountInfo}>
                  <Text style={styles.amountLabel}>Outstanding Balance</Text>
                  <Text style={styles.amountValue}>${totalUnpaid.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handleNavigateToPayment}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="payment" size={18} color="white" />
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
              
              {/* Subtle divider */}
              <View style={styles.headerDivider} />
            </View>

            <View style={styles.chargesSection}>
              <Text style={styles.chargesHeader}>Charges • {charges.length}</Text>

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
  headerDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 20,
    marginHorizontal: -4,
  },
  payButton: {
    backgroundColor: '#34d399',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  chargesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chargesHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  chargeItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  chargeRow: {
    padding: 20,
  },
  chargeContent: {
    flex: 1,
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  chargeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 16,
    lineHeight: 22,
  },
  chargeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
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
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.2,
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