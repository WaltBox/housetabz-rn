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
  
  // Combine tasks and bill submissions if needed
  const allTasks = [...tasks, ...billSubmissions];
  
  if (!allTasks || allTasks.length === 0) return null;

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
        {allTasks.map((task, idx) => (
          <TaskCard 
            key={`${task.type || 'task'}-${task.id || idx}`} 
            task={task} 
            isAlternate={idx % 2 === 1}
            onPress={() => onTaskPress?.(task)}
            fontsLoaded={fontsLoaded}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Separate TaskCard component to handle requester fetching
const TaskCard = ({ task, isAlternate, onPress, fontsLoaded }) => {
  const [requesterUsername, setRequesterUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine the service name based on whether it's a takeOverRequest or stagedRequest
  const getServiceName = () => {
    if (task.type === 'billSubmission') {
      return 'Bill Submission';
    }

    if (!task.serviceRequestBundle) {
      return 'Task';
    }

    if (task.serviceRequestBundle.takeOverRequest) {
      return task.serviceRequestBundle.takeOverRequest.serviceName || 'Service Request';
    }

    if (task.serviceRequestBundle.stagedRequest) {
      return task.serviceRequestBundle.stagedRequest.name || 'Service Request';
    }

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

    if (task.serviceRequestBundle?.userId) {
      fetchRequesterUsername();
    } else {
      setLoading(false);
    }
  }, [task]);

  // Get card icon based on task type
  const getIcon = () => {
    if (task.type === 'take_over_request') {
      return 'swap-horiz';
    }
    if (task.type === 'staged_request') {
      return 'shopping-cart';
    }
    if (task.type === 'billSubmission') {
      return 'receipt';
    }
    return 'check-circle-outline';
  };

  const serviceName = getServiceName();

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={[
          styles.cardInner,
          isAlternate ? styles.cardInnerAlternate : null
        ]}
        activeOpacity={0.8}
        onPress={onPress}
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
            CLICK TO VIEW
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
    elevation: 2,
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