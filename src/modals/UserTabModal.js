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
        <View style={styles.chargeText}>
          <Text style={styles.chargeName}>{charge.name || 'Unnamed Charge'}</Text>
          <Text style={[styles.dueDate, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={styles.chargeAmountWrapper}>
          <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
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
    navigation.goBack();
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'TabNavigator', params: { screen: 'Make Payment', params: { screen: 'MakePaymentScreen' } } }
        ],
      });
    }, 300);
  };

  if (!visible) return null;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon} hitSlop={{top:15,bottom:15,left:15,right:15}}>
            <MaterialIcons name="close" size={28} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.title}>My Tab</Text>
          <View style={{ width:28 }} />
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#34d399" />
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>You Currently Owe</Text>
              <Text style={styles.summaryAmount}>${totalUnpaid.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={handleNavigateToPayment}
                activeOpacity={0.8}
              >
                <Text style={styles.payButtonText}>Make Payment</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.chargesHeader}>Your charges</Text>

            <FlatList
              data={charges}
              keyExtractor={(item,i) => item.id?.toString() || i.toString()}
              renderItem={({ item }) => <ChargeItem charge={item} />}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <MaterialIcons name="check-circle" size={48} color="#34d399" />
                  <Text style={styles.emptyTitle}>All caught up!</Text>
                  <Text style={styles.emptyText}>You have no unpaid charges.</Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom:16 }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#dff6f0' },
  header: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    paddingHorizontal:16, paddingTop: Platform.OS==='android'?28:20, paddingBottom:12,
    backgroundColor:'#dff6f0'
  },
  closeIcon:{padding:8},
  title: { fontSize:20, fontWeight:'700', color:'#1e293b' },
  loading: { flex:1, justifyContent:'center', alignItems:'center' },

  summaryCard: {
    backgroundColor:'#ffffff', borderRadius:12, marginHorizontal:16,
    padding:20, marginBottom:12, shadowColor:'#000', shadowOffset:{width:0,height:2},
    shadowOpacity:0.1, shadowRadius:4, alignItems:'flex-start'
  },
  summaryLabel: { fontSize:14, color:'#64748b', marginBottom:4 },
  summaryAmount: {
    fontSize:32, fontWeight:'700', color:'#1e293b', marginBottom:16,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Montserrat-Black',
    fontVariant: ['tabular-nums']
  },
  payButton: {
    backgroundColor:'#34d399', paddingVertical:12, paddingHorizontal:32,
    borderRadius:999, alignSelf:'stretch', alignItems:'center'
  },
  payButtonText: { color:'#ffffff', fontSize:16, fontWeight:'600' },

  chargesHeader: {
    marginHorizontal:16,
    marginTop:8,
    marginBottom:4,
    fontSize:16,
    fontWeight:'500',
    color:'#1e293b'
  },

  chargeItem: {
    backgroundColor:'#ffffff', borderRadius:12, marginHorizontal:16,
    marginVertical:4, paddingVertical:8, paddingHorizontal:12,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05,
    shadowRadius:3, 
  },
  chargeRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  chargeText: { flex:1 },
  chargeName: { fontSize:16, fontWeight:'600', color:'#1e293b' },
  dueDate: { fontSize:12, color:'#64748b', marginTop:2 },
  chargeAmountWrapper: { marginLeft:12 },
  chargeAmount: { fontSize:16, fontWeight:'700', color:'#1e293b' },

  empty: { justifyContent:'center', alignItems:'center', marginTop:32, paddingHorizontal:32 },
  emptyTitle: { fontSize:18, fontWeight:'600', color:'#1e293b', marginTop:12 },
  emptyText: { fontSize:14, color:'#64748b', marginTop:6, textAlign:'center' }
});

export default UserTabModal;