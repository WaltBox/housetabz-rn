import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const getServiceIcon = (serviceType) => {
  switch (serviceType?.toLowerCase()) {
    case 'cleaning': return 'cleaning-services';
    case 'energy': return 'electric-bolt';
    case 'internet': return 'wifi';
    case 'water': return 'water-drop';
    default: return 'home';
  }
};

const ServiceRequestTask = ({ task, onAccept, onReject, onViewMore }) => {
  const stagedRequest = task.serviceRequestBundle?.stagedRequest;
  
  if (!stagedRequest) return null;

  const handleAccept = () => {
    if (task.paymentRequired) {
      onAccept({
        taskId: task.id,
        bundleId: task.serviceRequestBundleId,
        paymentAmount: task.paymentAmount,
        stagedRequest: {
          partnerName: stagedRequest.partnerName,
          serviceName: stagedRequest.serviceName,
          estimatedAmount: stagedRequest.estimatedAmount,
          requiredUpfrontPayment: stagedRequest.requiredUpfrontPayment
        }
      });
    } else {
      onAccept(task.id);
    }
  };

  return (
    <View style={styles.taskCard}>
      {/* Header with Service Info */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={getServiceIcon(stagedRequest.serviceType)} 
            size={20} 
            color="#22c55e" 
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{stagedRequest.serviceName}</Text>
          <Text style={styles.subtitle}>{stagedRequest.partnerName}</Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.paymentInfo}>
        <Text style={styles.amount}>
          ${Number(task.paymentAmount).toFixed(2)}
        </Text>
        {task.paymentRequired && (
          <View style={styles.paymentBadge}>
            <MaterialIcons name="schedule" size={12} color="#6366f1" />
            <Text style={styles.paymentBadgeText}>Due upfront</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => onReject(task.id)} 
          style={[styles.button, styles.rejectButton]}
        >
          <MaterialIcons name="close" size={16} color="#dc2626" />
          <Text style={styles.rejectText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleAccept} 
          style={[styles.button, styles.acceptButton]}
        >
          <MaterialIcons 
            name={task.paymentRequired ? "lock" : "check"} 
            size={16} 
            color="#22c55e" 
          />
          <Text style={styles.acceptText}>
            {task.paymentRequired ? 'Pay & Accept' : 'Accept'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={() => onViewMore?.(task.id)} 
        style={styles.viewMore}
      >
        <Text style={styles.viewMoreText}>View details</Text>
        <MaterialIcons name="arrow-forward" size={14} color="#64748b" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  rejectButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  rejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewMoreText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default ServiceRequestTask;