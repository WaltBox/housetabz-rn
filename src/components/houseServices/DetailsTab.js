// components/houseServices/DetailsTab.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetailsTab = ({
  displayService,
  formatDate,
  getStatusColor,
  capitalizeFirstLetter,
}) => (
  <>
    <Text style={styles.sectionHeader}>Account Details</Text>
    <View style={styles.card}>
      {displayService.accountNumber && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Number</Text>
          <Text style={styles.detailValue}>{displayService.accountNumber}</Text>
        </View>
      )}

      {displayService.createdAt && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Added On</Text>
          <Text style={styles.detailValue}>{formatDate(displayService.createdAt)}</Text>
        </View>
      )}

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(displayService.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(displayService.status) }]}>
            {capitalizeFirstLetter(displayService.status)}
          </Text>
        </View>
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
   
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 15,
  },
  detailValue: {
    fontWeight: '500',
    color: '#1e293b',
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default DetailsTab;
