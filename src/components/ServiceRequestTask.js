import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ServiceRequestTask = ({ task, onAccept, onReject, onViewMore }) => {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>Service Request</Text>
        <Text style={styles.taskSubtext}>Name: Rhythm Energy</Text>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => onAccept(task.id)} style={styles.actionButton}>
          <Text style={styles.actionTextAccept}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onReject(task.id)} style={styles.actionButton}>
          <Text style={styles.actionTextReject}>Reject</Text>
        </TouchableOpacity>
      </View>
      {/* View More Button */}
      <TouchableOpacity onPress={() => onViewMore(task.id)} style={styles.viewMoreContainer}>
        <Text style={styles.viewMoreText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskSubtext: {
    fontSize: 14,
    color: '#666',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E0E0E0',
    flex: 1,
    marginHorizontal: 4,
  },
  actionTextAccept: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50', // Green for accept
  },
  actionTextReject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336', // Red for reject
  },
  viewMoreContainer: {
    alignSelf: 'flex-start', // Aligns "View More" to the left
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#007BFF', // Blue for clickable text
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default ServiceRequestTask;
