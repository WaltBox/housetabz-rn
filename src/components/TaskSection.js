import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ServiceRequestTask from './ServiceRequestTask';
import BillSubmissionTask from './BillSubmissionTask';
import BillSubmissionModal from '../modals/BillSubmissionModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const TaskSection = ({ tasks = [], billSubmissions = [], activeTaskIndex, taskCount, handleTaskAction, handleScroll, onBillSubmitted }) => {
  const [selectedBillSubmission, setSelectedBillSubmission] = useState(null);
  const [isBillSubmissionModalVisible, setIsBillSubmissionModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Combine regular tasks and bill submissions
  const pendingTasks = tasks.filter(task => task.response === 'pending');
  const allTasks = [
    ...pendingTasks,
    ...billSubmissions.map(submission => ({
      ...submission,
      type: 'billSubmission' // Add a type to distinguish from regular tasks
    }))
  ];
  
  // Calculate initial padding to center the first card
  const initialPadding = (width - CARD_WIDTH) / 2;

  const handleBillSubmissionPress = (submission) => {
    setSelectedBillSubmission(submission);
    setIsBillSubmissionModalVisible(true);
  };

  const handleBillSubmissionSuccess = (result) => {
    if (onBillSubmitted && typeof onBillSubmitted === 'function') {
      onBillSubmitted(result);
    }
    setIsBillSubmissionModalVisible(false);
    setSelectedBillSubmission(null);
  };

  const renderTaskItem = ({ item }) => {
    if (item.type === 'billSubmission') {
      return (
        <View style={styles.taskItemContainer}>
          <BillSubmissionTask 
            task={item} 
            onPress={handleBillSubmissionPress}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.taskItemContainer}>
    <ServiceRequestTask
  task={item}
  onAccept={(task) => handleTaskAction(task, 'accepted')}
  onReject={(task) => handleTaskAction(task, 'rejected')}
/>

      </View>
    );
  };

  const toggleExpanded = () => {
    // Only allow toggling if there are no tasks
    if (allTasks.length === 0) {
      setIsExpanded(!isExpanded);
    }
  };

  // Header section that's always visible
  const renderHeader = () => (
    <TouchableOpacity 
      onPress={toggleExpanded}
      activeOpacity={allTasks.length > 0 ? 1 : 0.7} // Only make it look pressable if there are no tasks
      style={styles.taskHeader}
    >
      <View style={styles.taskTitleGroup}>
        <MaterialIcons name="checklist" size={24} color="#22c55e" />
        <Text style={styles.sectionTitle}>To-Dos</Text>
      </View>
      
      <View style={styles.rightHeaderContent}>
        {allTasks.length > 0 && (
          <View style={styles.taskBadge}>
            <Text style={styles.taskBadgeText}>{allTasks.length} pending</Text>
          </View>
        )}
        {/* Only show arrow when there are no tasks */}
        {allTasks.length === 0 && (
          <MaterialIcons 
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color="#64748b" 
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // Main content based on task existence and expansion state
  const renderContent = () => {
    // If we have tasks, always show them
    if (allTasks.length > 0) {
      return (
        <View>
          {/* Task Carousel */}
          <FlatList
            data={allTasks}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => (item.type === 'billSubmission' ? `bill-${item.id}` : item.id.toString())}
            renderItem={renderTaskItem}
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
            {allTasks.map((_, index) => (
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
      );
    }
    
    // If no tasks and expanded, show the empty state
    if (isExpanded) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons name="auto-awesome" size={48} color="#22c55e" />
          </View>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>No pending tasks at the moment.</Text>
        </View>
      );
    }
    
    // If not expanded and no tasks, return nothing (header will still be visible)
    return null;
  };

  return (
    <View style={styles.section}>
      {renderHeader()}
      {renderContent()}

      {/* Bill Submission Modal */}
      <BillSubmissionModal
        visible={isBillSubmissionModalVisible}
        onClose={() => setIsBillSubmissionModalVisible(false)}
        billSubmission={selectedBillSubmission}
        onSuccess={handleBillSubmissionSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
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
  rightHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
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