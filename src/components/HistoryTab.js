import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HistoryTab = () => {
  // Example data - replace with real data
  const monthlyTotal = 325.50;
  const transactions = [
    {
      id: '1',
      title: 'Internet Bill',
      icon: 'wifi',
      date: 'Jan 15, 2025',
      amount: 35.00,
      status: 'completed',
      method: 'Visa •••• 4242',
    },
    {
      id: '2',
      title: 'Electricity',
      icon: 'bolt',
      date: 'Jan 12, 2025',
      amount: 142.50,
      status: 'completed',
      method: 'Bank Account •••• 1234',
    },
    {
      id: '3',
      title: 'Water Bill',
      icon: 'water-drop',
      date: 'Jan 8, 2025',
      amount: 78.00,
      status: 'pending',
      method: 'Processing...',
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header with Monthly Summary */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerContent}>
          <Text style={styles.monthlySpentLabel}>Monthly Spent</Text>
          <Text style={styles.monthlySpentAmount}>${monthlyTotal.toFixed(2)}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {transactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionMain}>
                <View style={styles.transactionIcon}>
                  <MaterialIcons 
                    name={transaction.icon} 
                    size={18} 
                    color="#64748b" 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <View style={styles.transactionHeader}>
                    <Text style={styles.transactionTitle}>
                      {transaction.title}
                    </Text>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.status === 'pending' ? '#eab308' : '#1e293b' }
                    ]}>
                      -${transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDate}>
                      {transaction.date}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: transaction.status === 'completed' ? '#34d399' : '#eab308' }
                      ]} />
                      <Text style={styles.transactionMethod}>
                        {transaction.method}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={40} color="#94a3b8" />
            <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
            <Text style={styles.emptyStateText}>
              Your payment history will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerCard: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
  },
  headerContent: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  monthlySpentLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  monthlySpentAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    fontVariant: ['tabular-nums'],
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  transactionItem: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  transactionMain: {
    flexDirection: 'row',
    padding: 16,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748b',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  transactionMethod: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default HistoryTab;