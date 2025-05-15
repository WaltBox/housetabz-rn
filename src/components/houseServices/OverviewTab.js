// components/houseServices/OverviewTab.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const OverviewTab = ({
  displayService,
  tasks,
  formatDate,
  getStatusColor,
}) => {
  const pendingTasks = tasks.filter(t => !t.status);
  const total = displayService.amount || 0;
  const funded = displayService.fundedAmount ?? total * 0.7;
  const progress = total > 0 ? funded / total : 0;
  const dueDate = formatDate(displayService.dueDate || new Date(Date.now() + 15 * 86400000));
  const remaining = total - (displayService.fundedAmount || 0);

  return (
    <>
      <Text style={styles.sectionHeader}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.fundingLabel}>Amount Funded</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <View style={styles.fundingDetailsRow}>
          <Text style={styles.fundingDetailLabel}>Due: {dueDate}</Text>
          <Text style={styles.fundingDetailValue}>${remaining.toFixed(2)} remaining</Text>
        </View>
      </View>

      {pendingTasks.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Notifications</Text>
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={22} color="#34d399" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Waiting on approval from {pendingTasks.length} roommate
              {pendingTasks.length > 1 ? 's' : ''}.
            </Text>
          </View>
        </>
      )}

      {tasks.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Approval Status</Text>
          <View style={styles.participantsCard}>
            {tasks.map(task => (
              <View key={task.id} style={styles.participantRow}>
                <View style={styles.participantInfo}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>
                      {task.user?.username?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <Text style={styles.participantName}>
                    {task.user?.username || 'Unknown'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.participantStatusBadge,
                    { backgroundColor: getStatusColor(task.response) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.participantStatusText,
                      { color: getStatusColor(task.response) },
                    ]}
                  >
                    {task.response === 'pending'
                      ? 'PENDING'
                      : task.response.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionHeader}>Bill History</Text>
      <View style={styles.participantsCard}>
        <View style={styles.emptyBillContainer}>
          <MaterialIcons name="receipt" size={40} color="#cbd5e1" />
          <Text style={styles.emptyBillText}>No bills yet</Text>
        </View>
      </View>
    </>
  );
};

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
    elevation: 1,
  },
  fundingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 4,
  },
  fundingDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fundingDetailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  fundingDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderColor: '#dcfce7',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  infoText: {
    flex: 1,
    color: '#1e293b',
    lineHeight: 20,
  },
  participantsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantInitial: {
    color: '#1e293b',
    fontWeight: '600',
  },
  participantName: {
    color: '#1e293b',
    fontSize: 15,
  },
  participantStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantStatusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyBillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyBillText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 16,
  },
});

export default OverviewTab;
