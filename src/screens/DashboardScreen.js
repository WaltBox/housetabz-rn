import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator,
  TouchableOpacity 
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

const LoadingScreen = ({ message = 'Loading...' }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#34d399" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  </SafeAreaView>
);

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
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentTask, setSelectedPaymentTask] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      setError(null);
      if (!refreshing) setIsLoading(true);

      // 1. Fetch user data
      const userRes = await apiClient.get(`/api/users/${user.id}`);
      const userData = userRes.data;
      const houseId = userData.houseId;

      // Extract finances
      const finance = userData.finance || {};
      setUserFinance({
        balance: finance.balance ?? userData.balance ?? 0,
        credit:  finance.credit  ?? userData.credit  ?? 0,
        points:  finance.points  ?? userData.points  ?? 0
      });

      // 2. Fetch tasks, bills, charges, and urgent messages in parallel
      const [tasksRes, billsRes, chargesRes, messagesRes] = await Promise.all([
        apiClient.get(`/api/tasks/user/${user.id}`),
        apiClient.get(`/api/users/${user.id}/bill-submissions`),
        apiClient.get(`/api/users/${user.id}/charges`),
        apiClient.get(`/api/urgent-messages`) // API call for urgent messages
      ]);

      // Filter for only pending tasks (status === false)
      setTasks(tasksRes.data.tasks.filter(t => t.status === false));
      setBillSubmissions(billsRes.data.submissions || []);
      setUserCharges(chargesRes.data.charges || []);
      
      // Set urgent messages - filter out resolved ones
      const activeMessages = (messagesRes.data.messages || []).filter(m => 
        !m.isResolved && !m.body.includes('(RESOLVED)')
      );
      setUrgentMessages(activeMessages);

      // 3. Fetch house data
      if (houseId) {
        const houseRes = await apiClient.get(`/api/houses/${houseId}`);
        const hData = houseRes.data;
        const hFin = hData.finance || {};
        setHouseFinance({
          balance: hFin.balance !== undefined ? Number(hFin.balance) : Number(hData.balance || 0),
          ledger:  hFin.ledger  !== undefined ? hFin.ledger            : hData.ledger || 0
        });
      } else {
        setHouseFinance({ balance: 0, ledger: 0 });
      }
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
  // Task handling functions
  const handleTaskAction = async (data, action) => {
    try {
      const taskId = typeof data === 'object' ? (data.id || data.taskId) : data;

      if (!taskId) {
        console.error("Task ID is undefined. Data received:", data);
        throw new Error("Task ID is undefined");
      }
      
      if (action === 'accepted' || action === 'view') {
        // For accepted or view actions, show the payment modal
        const updatedTask = { ...data, id: taskId };
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

  // Navigation handlers
  const handleTaskPress = (task) => {
    // When a task is clicked, show the payment modal
    handleTaskAction(task, 'view');
  };
  
  const handleViewAllTasks = () => {
    // Handle view all tasks (implement as needed)
    console.log('View all tasks pressed');
  };
  
  const handleViewAllMessages = () => {
    // Handle view all messages (implement as needed)
    console.log('View all messages pressed');
  };

  if (isLoading) return <LoadingScreen message="Loading dashboard..." />;
  if (error)     return <ErrorScreen error={error} onRetry={fetchDashboardData} />;

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dff6f0' },
  scrollContent: { paddingTop: 8, paddingBottom: 12 },
  sectionContainer: { marginBottom: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748b', fontWeight: '500' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  errorText: { marginTop: 16, marginBottom: 24, fontSize: 16, color: '#ef4444', textAlign: 'center' },
  retryButton: { backgroundColor: '#34d399', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});

export default DashboardScreen;