import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // Slightly smaller width for better visibility

const ServiceRequestTask = ({ task, onAccept, onReject, onViewMore }) => {
  return (
    <View style={styles.taskCard}>
      {/* Header */}
      <View style={styles.taskHeader}>
        <MaterialIcons name="electric-bolt" size={20} color="#22c55e" />
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>New</Text>
        </View>
      </View>

      {/* Title and Description */}
      <View style={styles.contentContainer}>
        <Text style={styles.taskTitle}>Service Request</Text>
        <Text style={styles.taskSubtext}>Rhythm Energy</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.taskActions}>
        <TouchableOpacity 
          onPress={() => onReject(task.id)} 
          style={[styles.actionButton, styles.rejectButton]}
        >
          <MaterialIcons name="close" size={16} color="#dc2626" />
          <Text style={styles.actionTextReject}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => onAccept(task.id)} 
          style={[styles.actionButton, styles.acceptButton]}
        >
          <MaterialIcons name="check" size={16} color="#22c55e" />
          <Text style={styles.actionTextAccept}>Accept</Text>
        </TouchableOpacity>
      </View>

      {/* View Details */}
      <TouchableOpacity 
        onPress={() => onViewMore?.(task.id)} 
        style={styles.viewMoreButton}
      >
        <Text style={styles.viewMoreText}>View Details</Text>
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
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentContainer: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  taskSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#22c55e',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
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
  actionTextAccept: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  actionTextReject: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMoreText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default ServiceRequestTask;