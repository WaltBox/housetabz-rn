import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import UrgentMessageCards from './UrgentMessageCards';
import TaskCards from './TaskCards';

const DashboardPopupSection = ({
  urgentMessages = [],
  tasks = [],
  billSubmissions = [],
  onTaskPress,
  onMessagePress,
  onViewAllTasks,
  onViewAllMessages,
}) => {
  // Log for debugging purposes
  console.log('DashboardPopupSection props:', {
    tasksCount: tasks?.length || 0,
    billSubmissionsCount: billSubmissions?.length || 0,
    urgentMessagesCount: urgentMessages?.length || 0
  });

  // Check if we have data to display
  const hasUrgentMessages = urgentMessages && urgentMessages.length > 0;
  const hasTasks = tasks && tasks.length > 0;
  const hasBillSubmissions = billSubmissions && billSubmissions.length > 0;
  
  // If there's nothing to display, return null (section won't render)
  if (!hasUrgentMessages && !hasTasks && !hasBillSubmissions) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {/* Urgent Messages Cards */}
      {hasUrgentMessages && (
        <UrgentMessageCards 
          messages={urgentMessages}
          onMessagePress={onMessagePress}
          onViewAll={onViewAllMessages}
        />
      )}
      
      {/* Tasks Cards */}
      {(hasTasks || hasBillSubmissions) && (
        <TaskCards 
          tasks={tasks}
          billSubmissions={billSubmissions}
          onTaskPress={onTaskPress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});

export default DashboardPopupSection;