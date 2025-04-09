import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const BillSubmissionTask = ({ task, onPress }) => {
  // Format due date if available
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today;
  };

  // Get service name from task
  const serviceName = task.houseService?.name || task.metadata?.serviceName || 'Utility Bill';
  
  return (
    <TouchableOpacity 
      style={styles.taskCard} 
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      {/* This view creates an inset border for the whole card */}
      <View style={styles.innerBorder} pointerEvents="none" />

      {/* Card Content */}
      <View style={styles.header}>
        <View style={styles.iconOuterContainer}>
          <LinearGradient
            colors={['#dcfce7', '#f0fdf4']}
            style={styles.iconContainer}
          >
            <MaterialIcons 
              name="receipt-long"
              size={24} 
              color="#22c55e" 
            />
          </LinearGradient>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.providerName}>
            {isOverdue() ? 'OVERDUE' : 'MONTHLY BILL'}
          </Text>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {serviceName}
          </Text>
          <Text style={styles.serviceType}>
            Due: {formatDueDate(task.dueDate)}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        {/* Status Badge (Pending/Overdue) */}
        <View style={styles.priceWrapper}>
          <View style={styles.priceInnerBorder}>
            <LinearGradient
              colors={isOverdue() ? ['#ef4444', '#f87171'] : ['#22c55e', '#34d399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pricePill}
            >
              <Text style={styles.pricePillText}>
                {isOverdue() ? 'OVERDUE' : 'PENDING'}
              </Text>
            </LinearGradient>
          </View>
        </View>
        
        {/* Submit Now Button */}
        <TouchableOpacity 
          style={styles.viewMoreContainer}
          onPress={() => onPress(task)}
        >
          <Text style={styles.viewMoreText}>Submit Now</Text>
          <MaterialIcons name="arrow-forward-ios" size={14} color="#4f46e5" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 18,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative'
  },
  // Inset border for the whole card
  innerBorder: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#dff6f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconOuterContainer: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 28,
    marginRight: 16,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
  },
  serviceType: {
    fontSize: 14,
    color: '#64748b',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  // Wrapper for the price/status area to create an inset effect
  priceWrapper: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 26,
  },
  // Inner border around the pill (the "line" effect)
  priceInnerBorder: {
    borderWidth: 1,
    borderColor: '#dff6f0',
    borderRadius: 22,
  },
  pricePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  pricePillText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f5f3ff',
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4f46e5',
  },
  arrowIcon: {
    marginLeft: 4,
  }
});

export default BillSubmissionTask;