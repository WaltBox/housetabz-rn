import React from 'react';
import { View, StyleSheet } from 'react-native';
import UrgentMessageCards from './UrgentMessageCards';
import TaskCards from './TaskCards';

const DashboardPopupSection = ({
  urgentMessages = [],
  tasks = [],
  onTaskPress,
  onMessagePress,
}) => {
  // Check if we have data to display
  const hasUrgentMessages = urgentMessages && urgentMessages.length > 0;
  const hasTasks = tasks && tasks.length > 0;
  
  // If there's nothing to display, return null (section won't render)
  if (!hasUrgentMessages && !hasTasks) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {/* Urgent Messages Cards */}
      {hasUrgentMessages && (
        <UrgentMessageCards 
          messages={urgentMessages}
          onMessagePress={onMessagePress}
        />
      )}
      
      {/* Tasks Cards */}
      {hasTasks && (
        <TaskCards 
          tasks={tasks}
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