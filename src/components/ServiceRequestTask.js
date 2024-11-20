import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ServiceRequestTask = ({ task, onAccept, onReject }) => {
  return (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>Service Request</Text>
      <Text style={styles.taskDescription}>Name: Static Service Name</Text>
      <View style={styles.taskActions}>
        <Button
          title="Accept"
          onPress={() => onAccept(task.id)}
          color="#4CAF50"
        />
        <Button
          title="Reject"
          onPress={() => onReject(task.id)}
          color="#F44336"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  taskDescription: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ServiceRequestTask;
