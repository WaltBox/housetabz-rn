import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';

import DashboardTopSection from '../components/dashboard/DashboardTopSection';
import DashboardPopupSection from '../components/dashboard/DashboardPopupSection';
import DashboardMiddleSection from '../components/dashboard/DashboardMiddleSection';
import DashboardBottomSection from '../components/dashboard/DashboardBottomSection';
import AcceptServicePayment from '../modals/AcceptServicePayment';
import UrgentMessageModal from '../modals/UrgentMessageModal';
import BillSubmissionModal from '../modals/BillSubmissionModal';

// Import the new skeleton component
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

const ErrorScreen = ({ error = 'Something went wrong', onRetry }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={48} color="#ef4444" />
      <Text style={styles.errorText}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  </SafeAreaView>
);

const DashboardScreen = () => {
  const { user } = useAuth();

  // Data states
  const [userFinance, setUserFinance] = useState({ balance: 0, credit: 0, points: 0 });
  const [houseFinance, setHouseFinance] = useState({ balance: 0, ledger: 0 });
  const [tasks, setTasks] = useState([]);
  const [billSubmissions, setBillSubmissions] = useState([]);
  const [userCharges, setUserCharges] = useState([]);
  const [urgentMessages, setUrgentMessages] = useState([]);
  
  // FIXED: Add missing state declarations
  const [house, setHouse] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentTask, setSelectedPaymentTask] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  
  // Add state for BillSubmissionModal
  const [isBillSubmissionModalVisible, setIsBillSubmissionModalVisible] = useState(false);
  const [selectedBillSubmission, setSelectedBillSubmission] = useState(null);

  // FIXED: Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      setError(null);
      if (!refreshing) setIsLoading(true);

      // Try the new dashboard endpoint
      const dashboardRes = await apiClient.get(`/api/users/${user.id}/dashboard`);
      const data = dashboardRes.data;
      
      console.log('Dashboard raw data received:', {
        tasksCount: data.tasks?.length || 0,
        billSubmissionsCount: data.billSubmissions?.length || 0,
        urgentMessagesCount: data.urgentMessages?.length || 0,
        userChargesCount: data.userCharges?.length || 0
      });
      
      // Set state from dashboard response
      setUserFinance(data.user.finance);
      setHouseFinance(data.house.finance);
      
      // Store the complete house data
      setHouse(data.house);
      
      // FIXED: Store unpaid bills data
      setUnpaidBills(data.unpaidBills || []);
      
      // ENHANCED: Map task data to match your frontend expectations
      const mappedTasks = data.tasks.map(task => {
        console.log('Raw task data:', {
          id: task.id,
          type: task.type,
          serviceRequestBundleId: task.serviceRequestBundleId,
          hasServiceRequestBundle: !!task.serviceRequestBundle,
          paymentRequired: task.paymentRequired,
          paymentAmount: task.paymentAmount
        });
        
        return {
          id: task.id,
          taskId: task.id, // Ensure both id and taskId are available
          type: task.type,
          status: task.status,
          response: task.response,
          paymentRequired: task.paymentRequired,
          amount: task.paymentAmount,
          paymentAmount: task.paymentAmount, // Keep original field name too
          monthlyAmount: task.monthlyAmount,
          paymentStatus: task.paymentStatus,
          serviceRequestBundle: task.serviceRequestBundle,
          serviceRequestBundleId: task.serviceRequestBundleId, // Make sure this is included
          bundleId: task.serviceRequestBundleId, // Alternative field name
          name: task.type,
          dueDate: task.createdAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          // Include any metadata that might help identify task type
          metadata: task.metadata || {}
        };
      });

      // Enhanced debug log after mapping:
      console.log('Mapped tasks summary:', mappedTasks.map(t => ({
        id: t.id,
        type: t.type,
        serviceRequestBundleId: t.serviceRequestBundleId,
        bundleId: t.bundleId,
        hasBundle: !!t.serviceRequestBundle,
        paymentRequired: t.paymentRequired,
        paymentAmount: t.paymentAmount
      })));

      // Separate tasks by type for debugging
      const serviceRequestTasks = mappedTasks.filter(t => t.serviceRequestBundleId);
      const otherTasks = mappedTasks.filter(t => !t.serviceRequestBundleId);

      console.log('Task breakdown:', {
        total: mappedTasks.length,
        serviceRequests: serviceRequestTasks.length,
        otherTasks: otherTasks.length,
        serviceRequestIds: serviceRequestTasks.map(t => t.serviceRequestBundleId),
        otherTaskTypes: otherTasks.map(t => t.type)
      });
      
      setTasks(mappedTasks);
      setBillSubmissions(data.billSubmissions || []);
      setUserCharges(data.userCharges || []);
      setUrgentMessages(data.urgentMessages || []);

      // Debug log to verify data
      console.log('Dashboard data loaded:', {
        house: data.house?.name,
        houseBalance: data.house?.houseBalance,
        unpaidBillsCount: data.unpaidBills?.length || 0,
        finalTasksCount: mappedTasks.length,
        finalBillSubmissionsCount: (data.billSubmissions || []).length,
        finalUrgentMessagesCount: (data.urgentMessages || []).length
      });

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Unable to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Handle message press
  const handleMessagePress = async (message) => {
    try {
      // Mark the message as read
      await apiClient.patch(`/api/urgent-messages/${message.id}/read`);
      
      // Update the local state to mark the message as read
      setUrgentMessages(currentMessages =>
        currentMessages.map(msg => 
          msg.id === message.id ? { ...msg, isRead: true } : msg
        )
      );
      
      // Show message details
      setSelectedMessage(message);
      setIsMessageModalVisible(true);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Handle message actions (pay, remind)
  const handleMessageAction = async (action, id, customMessage) => {
    try {
      if (action === 'pay') {
        // Find the charge related to this bill
        const charge = userCharges.find(c => c.billId === id);
        if (charge) {
          // Set up payment modal with this charge
          setSelectedPaymentTask({
            id: charge.id,
            amount: charge.amount || charge.baseAmount,
            name: charge.name,
            dueDate: charge.dueDate
          });
          setIsMessageModalVisible(false);
          setIsPaymentModalVisible(true);
        } else {
          console.error('No charge found for bill', id);
        }
      } else if (action === 'remind') {
        // The UrgentMessageModal now handles all the reminder logic,
        // including checking cooldown status and sending the notification
        // So we just need to close the modal here
        setIsMessageModalVisible(false);
      }
    } catch (error) {
      console.error(`Error handling message action (${action}):`, error);
    }
  };
  
  // ENHANCED: Task handling functions
  const handleTaskAction = async (data, action) => {
    try {
      console.log('handleTaskAction called with:', { data, action });
      
      const taskId = typeof data === 'object' ? (data.id || data.taskId) : data;

      if (!taskId) {
        console.error("Task ID is undefined. Data received:", data);
        throw new Error("Task ID is undefined");
      }
      
      if (action === 'accepted' || action === 'view') {
        // For accepted or view actions, show the payment modal
        console.log('Opening payment modal with task data:', data);
        
        // Ensure we have all necessary fields
        const updatedTask = { 
          ...data, 
          id: taskId,
          taskId: taskId,
          // Make sure we have the bundle ID
          serviceRequestBundleId: data.serviceRequestBundleId || data.bundleId,
          bundleId: data.serviceRequestBundleId || data.bundleId
        };
        
        console.log('Updated task for modal:', updatedTask);
        setSelectedPaymentTask(updatedTask);
        setIsPaymentModalVisible(true);
      } else {
        // For other actions (like rejected), update the task directly
        await apiClient.patch(`/api/tasks/${taskId}`, {
          response: action,
          userId: user.id,
        });
        fetchDashboardData(); // Refresh data after task action
      }
    } catch (error) {
      console.error(`Error handling task action (${action}):`, error);
    }
  };

  const handlePaymentSuccess = async () => {
    if (selectedPaymentTask) {
      try {
        const taskId = selectedPaymentTask.id || selectedPaymentTask.taskId;
        if (!taskId) {
          throw new Error('Task ID is missing in selectedPaymentTask');
        }
        await apiClient.patch(`/api/tasks/${taskId}`, {
          response: 'accepted',
          paymentStatus: 'completed',
          userId: user.id,
        });
        fetchDashboardData(); // Refresh data after successful payment
      } catch (error) {
        console.error('Error updating task after payment:', error);
      }
    }
    setIsPaymentModalVisible(false);
    setSelectedPaymentTask(null);
  };
  
  // Handle bill submission success
  const handleBillSubmissionSuccess = (result) => {
    // Handle the result from bill submission
    console.log('Bill submission successful:', result);
    // Refresh dashboard data
    fetchDashboardData();
    // Close the modal
    setIsBillSubmissionModalVisible(false);
    setSelectedBillSubmission(null);
  };

  // ENHANCED: Handle task press based on type
  const handleTaskPress = (task) => {
    console.log('handleTaskPress called with task:', task);
    
    // Check if it's a bill submission
    const isBillSubmission = 
      task.type === 'billSubmission' || // If already tagged as billSubmission
      task.houseService || // If it has houseService property
      task.metadata?.type === 'billSubmission' || // If it has metadata type
      !task.serviceRequestBundle && !task.serviceRequestBundleId; // If it doesn't have service request data
      
    console.log('Task analysis:', {
      taskId: task.id,
      taskType: task.type,
      isBillSubmission,
      hasServiceRequestBundle: !!task.serviceRequestBundle,
      hasServiceRequestBundleId: !!task.serviceRequestBundleId,
      hasHouseService: !!task.houseService
    });
      
    if (isBillSubmission) {
      console.log('Opening bill submission modal for task:', task.id);
      setSelectedBillSubmission(task);
      setIsBillSubmissionModalVisible(true);
    } else {
      // It's a regular service request task
      console.log('Opening service payment modal for task:', task.id);
      
      // Validate that we have the necessary data for a service request
      if (!task.serviceRequestBundleId && !task.serviceRequestBundle?.id) {
        console.error('Service request task missing bundle ID:', task);
        Alert.alert(
          'Error', 
          `Unable to open task: Missing service request data. Task type: ${task.type}`
        );
        return;
      }
      
      handleTaskAction(task, 'view');
    }
  };
  
  const handleViewAllTasks = () => {
    // Handle view all tasks (implement as needed)
    console.log('View all tasks pressed');
  };
  
  const handleViewAllMessages = () => {
    // Handle view all messages (implement as needed)
    console.log('View all messages pressed');
  };

  // Show skeleton while loading (not refreshing)
  if (isLoading && !refreshing) {
    return <DashboardSkeleton />;
  }

  // Show error screen
  if (error) {
    return <ErrorScreen error={error} onRetry={fetchDashboardData} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor="#34d399" 
          />
        }
      >
        <View style={styles.sectionContainer}>
          <DashboardTopSection
            userFinance={userFinance}
            houseFinance={houseFinance}
            userCharges={userCharges}
            house={house}
            unpaidBills={unpaidBills}
          />
        </View>

        <View style={styles.sectionContainer}>
          <DashboardPopupSection
            urgentMessages={urgentMessages}
            tasks={tasks}
            billSubmissions={billSubmissions}
            onTaskPress={handleTaskPress}
            onMessagePress={handleMessagePress}
            onViewAllTasks={handleViewAllTasks}
            onViewAllMessages={handleViewAllMessages}
          />
        </View>

        <View style={styles.sectionContainer}>
          <DashboardMiddleSection 
            tasks={tasks}
            billSubmissions={billSubmissions}
            onTaskAction={handleTaskAction}
            onDataChange={fetchDashboardData}
          />
        </View>

        <View style={styles.sectionContainer}>
          <DashboardBottomSection 
            userData={user}
          />
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <AcceptServicePayment
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
        taskData={selectedPaymentTask}
      />

      {/* Message Detail Modal */}
      <UrgentMessageModal
        visible={isMessageModalVisible}
        message={selectedMessage}
        onClose={() => {
          setIsMessageModalVisible(false);
          setSelectedMessage(null);
        }}
        onAction={handleMessageAction}
      />
      
      {/* Bill Submission Modal - Added */}
      <BillSubmissionModal
        visible={isBillSubmissionModalVisible}
        onClose={() => setIsBillSubmissionModalVisible(false)}
        billSubmission={selectedBillSubmission}
        onSuccess={handleBillSubmissionSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dff6f0' },
  scrollContent: { paddingTop: 8, paddingBottom: 12 },
  sectionContainer: { marginBottom: 8 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  errorText: { marginTop: 16, marginBottom: 24, fontSize: 16, color: '#ef4444', textAlign: 'center' },
  retryButton: { backgroundColor: '#34d399', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});

export default DashboardScreen;