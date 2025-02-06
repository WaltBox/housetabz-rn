import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const UserTabModal = ({ user }) => {
  const unpaidCharges = user?.charges?.filter((charge) => !charge.paid) || [];
  const totalUnpaid = unpaidCharges.reduce((sum, charge) => sum + charge.amount, 0);

  const renderCharge = ({ item }) => (
    <View style={styles.chargeCard}>
      <View style={styles.chargeHeader}>
        <View style={styles.chargeTitleContainer}>
          <MaterialIcons name="account-balance" size={24} color="#22c55e" />
          <Text style={styles.chargeTitle}>
            {item.name || 'Unknown Charge'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>

      <View style={styles.chargeDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Due:</Text>
          <Text style={styles.chargeAmount}>${item.amount.toFixed(2)}</Text>
        </View>
        {item.dueDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>{item.dueDate}</Text>
          </View>
        )}
        {item.category && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{item.category}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.payButton}>
        <Text style={styles.payButtonText}>Pay This Charge</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading your details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Tab</Text>
          <TouchableOpacity style={styles.historyButton}>
            <MaterialIcons name="history" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        {unpaidCharges.length > 0 && (
          <TouchableOpacity 
            style={styles.payAllButton}
            onPress={() => alert('Pay all charges')}
          >
            <MaterialIcons name="payment" size={20} color="white" />
            <Text style={styles.payAllText}>Pay All (${totalUnpaid.toFixed(2)})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Balance Cards */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#22c55e" />
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            ${user?.balance?.toFixed(2) || '0.00'}
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <MaterialIcons name="warning" size={24} color="#f59e0b" />
          <Text style={styles.balanceLabel}>Pending Charges</Text>
          <Text style={styles.balanceAmount}>
            ${totalUnpaid.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Charges Section */}
      <View style={styles.chargesSection}>
        <Text style={styles.sectionTitle}>Unpaid Charges</Text>
        
        {unpaidCharges.length > 0 ? (
          <FlatList
            data={unpaidCharges}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderCharge}
            contentContainerStyle={styles.chargeList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="check-circle" size={48} color="#22c55e" />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>You have no unpaid charges.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  historyButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  chargesSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chargeList: {
    paddingBottom: 24,
  },
  chargeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chargeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chargeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#d97706',
    fontSize: 12,
    fontWeight: '500',
  },
  chargeDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  chargeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  payButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  payAllButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default UserTabModal;