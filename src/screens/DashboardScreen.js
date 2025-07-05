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
import apiClient, { 
  getDashboardData, 
  getHouseTabsData,
  invalidateCache, 
  clearUserCache
} from '../config/api';
import { startBackgroundPrefetch, getPrefetchStatus } from '../services/PrefetchService';

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
  const [unpaidBills, setUnpaidBills] = useState([]);
  
  const [house, setHouse] = useState(null);
  
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

  // Fetch all dashboard data with cached API call
  const fetchDashboardData = async () => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      setError(null);
      if (!refreshing) setIsLoading(true);

      console.log('🚀 Fetching dashboard data for user:', user.id);
      console.log('🔐 User auth status:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email
      });

      // ✅ UPDATED: Use cached API function
      const data = await getDashboardData(user.id);
      
      console.log('📊 Dashboard data received:', {
        billSubmissionsCount: Array.isArray(data.billSubmissions) ? data.billSubmissions.length : 0,
        tasksCount: Array.isArray(data.pendingTasks) ? data.pendingTasks.length : 0,
        chargesCount: Array.isArray(data.unpaidCharges) ? data.unpaidCharges.length : 0,
        messagesCount: Array.isArray(data.urgentMessages) ? data.urgentMessages.length : 0,
        unpaidBillsCount: Array.isArray(data.unpaidBills) ? data.unpaidBills.length : 0,
      });

      // Handle nested data structure from backend
      const responseData = data.data || data;
      
      // Set user finance data
      if (responseData.user?.finance) {
        setUserFinance(responseData.user.finance);
      }
      
      // Set house finance data  
      if (responseData.house?.finance) {
        setHouseFinance(responseData.house.finance);
      }

      // Set house data
      if (responseData.house) {
        setHouse(responseData.house);
      }

      // Set arrays with fallbacks
      setTasks(Array.isArray(responseData.pendingTasks) ? responseData.pendingTasks : []);
      setBillSubmissions(Array.isArray(responseData.billSubmissions) ? responseData.billSubmissions : []);
      setUserCharges(Array.isArray(responseData.unpaidCharges) ? responseData.unpaidCharges : []);
      setUrgentMessages(Array.isArray(responseData.urgentMessages) ? responseData.urgentMessages : []);
      setUnpaidBills(Array.isArray(responseData.unpaidBills) ? responseData.unpaidBills : []);

      console.log('✅ Dashboard data loaded successfully:', {
        userBalance: responseData.user?.finance?.balance,
        houseBalance: responseData.house?.finance?.balance,
        houseBalanceFromHouse: responseData.house?.houseBalance,
        tasksCount: Array.isArray(responseData.pendingTasks) ? responseData.pendingTasks.length : 0,
        messagesCount: Array.isArray(responseData.urgentMessages) ? responseData.urgentMessages.length : 0,
        unpaidBillsCount: Array.isArray(responseData.unpaidBills) ? responseData.unpaidBills.length : 0,
        availableDataKeys: Object.keys(responseData),
      });

      // ✅ Backend now provides complete data with unpaidBills - no fallback needed
      console.log('✅ Received dashboard data:', {
        hasUnpaidBills: Array.isArray(responseData.unpaidBills) && responseData.unpaidBills.length > 0,
        unpaidBillsCount: Array.isArray(responseData.unpaidBills) ? responseData.unpaidBills.length : 0,
        hasUserCharges: Array.isArray(responseData.unpaidCharges) && responseData.unpaidCharges.length > 0,
        userChargesCount: Array.isArray(responseData.unpaidCharges) ? responseData.unpaidCharges.length : 0,
        houseBalance: responseData.house?.houseBalance,
        houseFinanceBalance: responseData.house?.finance?.balance
      });

      // 🆕 START BACKGROUND PREFETCH after successful dashboard load
      if (!refreshing) { // Only on initial load, not on refresh
        console.log('🚀 Starting background prefetch...');
        try {
          // Start prefetching other screens in background
          startBackgroundPrefetch(user);
          
          // Log prefetch status after a short delay
          setTimeout(() => {
            const prefetchStatus = getPrefetchStatus();
            console.log('📊 Prefetch status:', prefetchStatus);
          }, 2000);
        } catch (prefetchError) {
          console.log('⚠️ Background prefetch failed to start:', prefetchError.message);
          // Don't show error to user - prefetch is background operation
        }
      }

    } catch (error) {
      console.log('❌ Dashboard data fetch failed:', error.message);
      setError(`Failed to load dashboard: ${error.message}`);
      
      // Clear cache on error and retry
      try {
        clearUserCache(user?.id);
        console.log('🧹 Cleared user cache due to error');
      } catch (cacheError) {
        console.log('⚠️ Failed to clear cache:', cacheError.message);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced refresh function that clears cache first
  const handleRefresh = () => {
    setRefreshing(true);
    // Clear cache to force fresh data
    clearUserCache(user.id);
    fetchDashboardData();
  };

  useEffect(() => { fetchDashboardData(); }, [user?.id]);

  // Handle message press
  const handleMessagePress = async (message) => {
    try {
      // Show message details immediately (don't wait for API call)
      setSelectedMessage(message);
      setIsMessageModalVisible(true);
      
      // Mark the message as read in the background
      if (message?.id) {
        await apiClient.patch(`/api/urgent-messages/${message.id}/read`);
        
        // Update the local state to mark the message as read
        setUrgentMessages(currentMessages =>
          currentMessages.map(msg => 
            msg.id === message.id ? { ...msg, isRead: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error in handleMessagePress:', error);
      // Still show the modal even if marking as read fails
      setSelectedMessage(message);
      setIsMessageModalVisible(true);
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
  
  // Handle task action with cache invalidation
  const handleTaskAction = (task, action) => {
    if (action === 'view') {
      setSelectedPaymentTask(task);
      setIsPaymentModalVisible(true);
    } else if (action === 'complete') {
      // Invalidate cache when task is completed
      invalidateCache('dashboard');
      fetchDashboardData();
    }
  };

  // Handle successful payment and invalidate cache
  const handlePaymentSuccess = (taskData) => {
    setIsPaymentModalVisible(false);
    setSelectedPaymentTask(null);
    
    // Invalidate cache to refresh data
    invalidateCache('dashboard');
    
    // Refresh dashboard data
    fetchDashboardData();
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