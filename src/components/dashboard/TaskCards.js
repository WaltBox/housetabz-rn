import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import apiClient from '../../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 120; // Slightly taller to accommodate more text
const BORDER_INSET = 2;

// Color palette with better whites
const COLORS = {
  green: '#34d399',
  darkText: '#1F2937', // Changed to match app theme
  softWhite: '#F9F7F2',
  coolWhite: '#F4F7FB',
  mintWhite: '#F0F9F6',
  greenCardBorder: '#dff6f0',
  whiteCardBorder: '#34d399',
};

const TaskCards = ({ tasks = [], billSubmissions = [], onTaskPress }) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  console.log('Tasks:', tasks.length, 'Bill Submissions:', billSubmissions.length);
  
  // Check if we have any content to show
  const hasContent = (tasks && tasks.length > 0) || (billSubmissions && billSubmissions.length > 0);
  
  if (!hasContent) return null;

  return (
    <View style={styles.container}>
      <Text style={[
        styles.sectionHeader,
        fontsLoaded && { fontFamily: 'Poppins-Bold' }
      ]}>To-Dos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12} // Add the margin to snap properly
      >
        {/* Render Tasks */}
        {tasks.map((task, idx) => (
          <TaskCard 
            key={`task-${task.id || idx}`} 
            task={task}
            type="task"
            isAlternate={idx % 2 === 1}
            onPress={() => onTaskPress?.(task)}
            fontsLoaded={fontsLoaded}
          />
        ))}
        
        {/* Render Bill Submissions */}
        {billSubmissions.map((submission, idx) => (
          <TaskCard 
            key={`bill-${submission.id || idx}`} 
            task={submission}
            type="billSubmission"
            isAlternate={(tasks.length + idx) % 2 === 1}
            onPress={() => onTaskPress?.(submission)}
            fontsLoaded={fontsLoaded}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Separate TaskCard component to handle requester fetching
const TaskCard = ({ task, type = "task", isAlternate, onPress, fontsLoaded }) => {
  const [requesterUsername, setRequesterUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine the service name based on the type and structure
// Add this enhanced getServiceName function with debugging to your TaskCard component

const getServiceName = () => {
  // Debug logging to see the actual task structure
  console.log('=== TaskCard Debug Info ===');
  console.log('Task ID:', task.id);
  console.log('Task type:', task.type);
  console.log('Task object keys:', Object.keys(task));
  console.log('Full task object:', JSON.stringify(task, null, 2));
  
  // For bill submissions
  if (type === 'billSubmission') {
    console.log('Processing as bill submission');
    return task.houseService?.name || task.metadata?.serviceName || 'Bill Submission';
  }
  
  // For regular tasks - enhanced debugging
  console.log('ServiceRequestBundle exists:', !!task.serviceRequestBundle);
  console.log('ServiceRequestBundleId:', task.serviceRequestBundleId);
  
  if (!task.serviceRequestBundle) {
    // Check if we have alternative fields that might contain the service name
    console.log('No serviceRequestBundle found. Checking alternatives...');
    console.log('Task.name:', task.name);
    console.log('Task.type:', task.type);
    console.log('Task.metadata:', task.metadata);
    
    // Try to get service name from alternative sources
    if (task.name && task.name !== task.type) {
      return task.name;
    }
    
    if (task.metadata?.serviceName) {
      return task.metadata.serviceName;
    }
    
    // If task.type is descriptive enough, use it
    if (task.type && task.type !== 'task' && task.type !== 'serviceRequest') {
      return task.type;
    }
    
    return 'Task';     
  }

  console.log('ServiceRequestBundle structure:');
  console.log('- takeOverRequest:', !!task.serviceRequestBundle.takeOverRequest);
  console.log('- stagedRequest:', !!task.serviceRequestBundle.stagedRequest);
  
  if (task.serviceRequestBundle.takeOverRequest) {
    console.log('TakeOverRequest data:', task.serviceRequestBundle.takeOverRequest);
    return task.serviceRequestBundle.takeOverRequest.serviceName || 
           task.serviceRequestBundle.takeOverRequest.name || 
           'Service Request';
  }

  if (task.serviceRequestBundle.stagedRequest) {
    console.log('StagedRequest data:', task.serviceRequestBundle.stagedRequest);
    return task.serviceRequestBundle.stagedRequest.name || 
           task.serviceRequestBundle.stagedRequest.serviceName ||
           'Service Request';
  }

  console.log('No nested request data found');
  return 'Task';
};

  // Fetch the requester username
  useEffect(() => {
    const fetchRequesterUsername = async () => {
      try {
        if (!task.serviceRequestBundle || !task.serviceRequestBundle.userId) {
          setRequesterUsername(null);
          setLoading(false);
          return;
        }
        
        const requesterId = task.serviceRequestBundle.userId;
        const response = await apiClient.get(`/api/users/${requesterId}`);
        
        if (response.data && response.data.username) {
          setRequesterUsername(response.data.username);
        } else {
          setRequesterUsername(null);
        }
      } catch (err) {
        console.error('Error fetching requester username:', err);
        setRequesterUsername(null);
      } finally {
        setLoading(false);
      }
    };

    if (type === 'task' && task.serviceRequestBundle?.userId) {
      fetchRequesterUsername();
    } else {
      setLoading(false);
    }
  }, [task, type]);

  // Get card icon based on task type
  const getIcon = () => {
    if (type === 'billSubmission') {
      return 'receipt';
    }
    
    // For service requests, get appropriate icon based on type
    const serviceBundle = task.serviceRequestBundle || {};
    const serviceRequest = serviceBundle.takeOverRequest || serviceBundle.stagedRequest || {};
    const serviceType = serviceRequest.serviceType?.toLowerCase() || '';
    
    switch (serviceType) {
      case 'cleaning':
        return 'cleaning-services';
      case 'energy':
        return 'electric-bolt';
      case 'internet':
        return 'wifi';
      case 'water':
        return 'water-drop';
      case 'take_over_request':
        return 'swap-horiz';
      case 'staged_request':
        return 'shopping-cart';
      default:
        return 'check-circle-outline';
    }
  };

  const serviceName = getServiceName();

  // Format due date for bill submissions
  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get additional bill submission details
  const getSubmissionDetails = () => {
    if (type === 'billSubmission' && task.dueDate) {
      return `Due: ${formatDueDate(task.dueDate)}`;
    }
    return null;
  };

  const submissionDetails = getSubmissionDetails();

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={[
          styles.cardInner,
          isAlternate ? styles.cardInnerAlternate : null
        ]}
        activeOpacity={0.8}
        onPress={() => onPress(task)}
      >
        {/* Inner border inset */}
        <View 
          style={[
            styles.innerBorder,
            isAlternate ? styles.innerBorderAlternate : null
          ]} 
        />

        <View style={styles.taskContent}>
          <MaterialIcons 
            name={getIcon()} 
            size={26} 
            color={isAlternate ? COLORS.green : "#FFFFFF"} 
          />
          <View style={styles.titleContainer}>
            {/* Category Label */}
            <Text 
              style={[
                styles.categoryLabel,
                isAlternate ? styles.categoryLabelAlternate : null,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}
            >
              {type === 'billSubmission' ? 'BILL SUBMISSION' : 'SERVICE REQUEST'}
            </Text>
            
            <Text 
              style={[
                styles.taskTitle,
                isAlternate ? styles.taskTitleAlternate : null,
                fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
              ]} 
              numberOfLines={1}
            >
              {serviceName}
            </Text>
            
            {loading ? (
              <ActivityIndicator size="small" color={isAlternate ? COLORS.green : "#FFFFFF"} />
            ) : submissionDetails ? (
              <Text 
                style={[
                  styles.requesterText,
                  isAlternate ? styles.requesterTextAlternate : null,
                  fontsLoaded && { fontFamily: 'Poppins-Medium' }
                ]}
                numberOfLines={1}
              >
                {submissionDetails}
              </Text>
            ) : requesterUsername ? (
              <Text 
                style={[
                  styles.requesterText,
                  isAlternate ? styles.requesterTextAlternate : null,
                  fontsLoaded && { fontFamily: 'Poppins-Medium' }
                ]}
                numberOfLines={1}
              >
                Requested by: {requesterUsername}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Text 
            style={[
              styles.viewDetailsText,
              isAlternate ? styles.viewDetailsTextAlternate : null,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}
          >
            {type === 'billSubmission' ? 'SUBMIT NOW' : 'CLICK TO VIEW'}
          </Text>
          <MaterialIcons 
            name="chevron-right" 
            size={20} 
            color={isAlternate ? COLORS.green : "#FFFFFF"} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionHeader: {
    marginLeft: 16,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText, // Changed to darkText
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingLeft: 15,
    paddingRight: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  cardInner: {
    height: CARD_HEIGHT,
    backgroundColor: COLORS.green,
    borderRadius: 14,
    overflow: 'hidden',

  },
  // Alternate card style (mint white background)
  cardInnerAlternate: {
    backgroundColor: COLORS.mintWhite,
  },
  innerBorder: {
    position: 'absolute',
    top: BORDER_INSET,
    bottom: BORDER_INSET,
    left: BORDER_INSET,
    right: BORDER_INSET,
    borderWidth: 2,
    borderColor: COLORS.greenCardBorder,
    borderRadius: 12,
  },
  // Alternate inner border style (green border)
  innerBorderAlternate: {
    borderColor: COLORS.whiteCardBorder,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  // Category label style
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  // Alternate category label style
  categoryLabelAlternate: {
    color: COLORS.green,
  },
  // Alternate task title style (dark text)
  taskTitleAlternate: {
    color: COLORS.darkText,
  },
  requesterText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  requesterTextAlternate: {
    color: '#4B5563',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Alternate view details text style (green text)
  viewDetailsTextAlternate: {
    color: COLORS.green,
  },
});

export default TaskCards;