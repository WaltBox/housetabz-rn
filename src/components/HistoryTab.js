import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HistoryTab = () => {
  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionCard}>
          <View style={styles.transactionLeft}>
            <MaterialIcons name="wifi" size={20} color="#34d399" style={styles.icon} />
            <View>
              <Text style={styles.transactionTitle}>Internet Bill</Text>
              <Text style={styles.transactionDate}>Jan 15, 2025</Text>
            </View>
          </View>
          <Text style={styles.transactionAmount}>-$35.00</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default HistoryTab;
