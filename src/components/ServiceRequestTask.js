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

const ServiceRequestTask = ({ task, onAccept, onReject }) => {
  const { stagedRequest, takeOverRequest } = task.serviceRequestBundle || {};
  const isTakeOver = !!takeOverRequest && !stagedRequest;
  
  if (!task.serviceRequestBundle) return null;
  
  const request = stagedRequest || takeOverRequest;
  if (!request) return null;
  
  const iconName = getServiceIcon(request.serviceType);
  const amount = isTakeOver ? request.monthlyAmount : task.paymentAmount;
  const formattedPrice = `$${Number(amount).toFixed(2)}${isTakeOver ? '/mo' : ''}`;
  const subtitle = request.partnerName || request.accountNumber ? 
    (request.partnerName ? request.partnerName : `Account: ${request.accountNumber}`) : '';
    
  const showPledgePending = task.paymentRequired || isTakeOver;
    
  const handleConfirmPress = () => onAccept(task);

  return (
    <View style={styles.taskCard}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={iconName}
            size={20} 
            color="#22c55e" 
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {request.serviceName}
          </Text>
          {subtitle !== '' && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.pricePill}>
          <Text style={styles.pricePillText}>Price: {formattedPrice}</Text>
        </View>
        {showPledgePending && (
          <View style={styles.paymentBadge}>
            <MaterialIcons name="schedule" size={12} color="#6366f1" />
            <Text style={styles.paymentBadgeText}>Pledge Pending</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => onReject(task.id)} 
          style={[styles.button, styles.rejectButton]}
        >
          <MaterialIcons name="close" size={16} color="#dc2626" />
          <Text style={styles.rejectText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleConfirmPress} 
          style={[styles.button, styles.acceptButton]}
        >
          <MaterialIcons name="check" size={16} color="#22c55e" />
          <Text style={styles.acceptText}>Confirm Pledge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    width: CARD_WIDTH,
    backgroundColor: '#dff1f0', // updated barely tan background
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pricePill: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pricePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
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
});

export default ServiceRequestTask;
