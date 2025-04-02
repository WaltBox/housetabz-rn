import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ServiceRequestTask from '../components/ServiceRequestTask';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const TaskSection = ({ tasks, activeTaskIndex, taskCount, handleTaskAction, handleScroll }) => {
  // Filter tasks to show only those with a "pending" response
  const pendingTasks = tasks.filter(task => task.response === 'pending');
  
  // Calculate initial padding to center the first card
  const initialPadding = (width - CARD_WIDTH) / 2;

  return (
    <View style={styles.section}>
      {/* Header Section */}
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleGroup}>
          <MaterialIcons name="rocket-launch" size={24} color="#22c55e" />
          <Text style={styles.sectionTitle}>Tasks</Text>
        </View>
        {pendingTasks.length > 0 && (
          <View style={styles.taskBadge}>
            <Text style={styles.taskBadgeText}>{pendingTasks.length} pending</Text>
          </View>
        )}
      </View>
      
      {pendingTasks.length > 0 ? (
        <View>
          {/* Task Carousel */}
          <FlatList
            data={pendingTasks}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.taskItemContainer}>
                <ServiceRequestTask
                  task={item}
                  onAccept={(taskId) => handleTaskAction(taskId, 'accepted')}
                  onReject={(taskId) => handleTaskAction(taskId, 'rejected')}
                />
              </View>
            )}
            contentContainerStyle={[
              styles.taskListContent, 
              { paddingLeft: initialPadding }
            ]}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
            snapToAlignment="center"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          
          {/* Pagination Indicators */}
          <View style={styles.paginationDots}>
            {pendingTasks.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: index === activeTaskIndex ? '#22c55e' : '#e2e8f0',
                    width: index === activeTaskIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons name="auto-awesome" size={48} color="#22c55e" />
          </View>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>No pending tasks at the moment.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
    paddingHorizontal: 0,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  taskTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1e293b',
    letterSpacing: -0.5,
    fontFamily: 'Montserrat-Black',
  },
  taskBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  taskBadgeText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
  taskListContent: {
    paddingRight: 16,
  },
  taskItemContainer: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 16,
    marginTop: 8,
    marginHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default TaskSection;
