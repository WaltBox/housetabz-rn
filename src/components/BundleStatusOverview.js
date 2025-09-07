import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const BundleStatusOverview = ({ 
  tasks = [], 
  onPress,
  bundleType = 'marketplace_onetime'
}) => {
  // Calculate progress statistics
  const totalTasks = tasks.length;
  const consentedTasks = tasks.filter(task => 
    task.paymentStatus === 'authorized' || task.paymentStatus === 'completed'
  ).length;
  const paidTasks = tasks.filter(task => task.paymentStatus === 'completed').length;
  const rejectedTasks = tasks.filter(task => task.response === 'rejected').length;
  const cancelledTasks = tasks.filter(task => task.paymentStatus === 'cancelled').length;

  // Determine overall status
  let status, statusText, statusColor, statusIcon;
  
  if (cancelledTasks > 0 || rejectedTasks > 0) {
    status = 'cancelled';
    statusText = 'Request Declined';
    statusColor = '#dc2626';
    statusIcon = 'cancel';
  } else if (paidTasks === totalTasks && totalTasks > 0) {
    status = 'completed';
    statusText = 'All Paid - Service Authorized!';
    statusColor = '#34d399';
    statusIcon = 'check-circle';
  } else if (consentedTasks === totalTasks && totalTasks > 0) {
    status = 'charging';
    statusText = 'Charging Everyone Now...';
    statusColor = '#3b82f6';
    statusIcon = 'hourglass-empty';
  } else {
    status = 'pending';
    statusText = `${consentedTasks}/${totalTasks} Roommates Agreed to Pay`;
    statusColor = '#f59e0b';
    statusIcon = 'people';
  }

  // Don't show if no tasks
  if (totalTasks === 0) return null;

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={statusIcon} 
            size={20} 
            color={statusColor} 
          />
        </View>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>

      {/* Progress Bar */}
      {status === 'pending' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(consentedTasks / totalTasks) * 100}%`,
                  backgroundColor: statusColor 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((consentedTasks / totalTasks) * 100)}%
          </Text>
        </View>
      )}

      {/* Individual Status Indicators */}
      <View style={styles.participantsContainer}>
        {tasks.map((task, index) => {
          let participantColor, participantIcon;
          
          if (task.paymentStatus === 'completed') {
            participantColor = '#34d399';
            participantIcon = 'check-circle';
          } else if (task.paymentStatus === 'authorized') {
            participantColor = '#3b82f6';
            participantIcon = 'thumb-up';
          } else if (task.response === 'rejected' || task.paymentStatus === 'cancelled') {
            participantColor = '#dc2626';
            participantIcon = 'cancel';
          } else {
            participantColor = '#94a3b8';
            participantIcon = 'radio-button-unchecked';
          }

          return (
            <View key={task.id || index} style={styles.participant}>
              <View style={[styles.participantAvatar, { borderColor: participantColor }]}>
                <Text style={styles.participantInitial}>
                  {task.user?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <MaterialIcons 
                name={participantIcon} 
                size={16} 
                color={participantColor}
                style={styles.participantStatus}
              />
            </View>
          );
        })}
      </View>

      {/* Status Messages */}
      {status === 'cancelled' && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Payments cancelled - no charges were made
          </Text>
        </View>
      )}

      {status === 'charging' && (
        <View style={[styles.messageContainer, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.messageText, { color: '#1e40af' }]}>
            Processing simultaneous payments...
          </Text>
        </View>
      )}

      {status === 'completed' && (
        <View style={[styles.messageContainer, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.messageText, { color: '#166534' }]}>
            Service has been authorized and activated
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 35,
    textAlign: 'right',
    fontFamily: 'Poppins-SemiBold',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  participant: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    fontFamily: 'Poppins-Bold',
  },
  participantStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  messageContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
});

export default BundleStatusOverview;