import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';

import DashboardHeader from '../components/DashboardHeader';
import ChargesPieChart from '../components/ChargesPieChart';
import TaskSection from '../components/TaskSection';
import AcceptServicePayment from '../modals/AcceptServicePayment';

const DashboardScreen = () => {
  const { user } = useAuth();
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [yourBalance, setYourBalance] = useState(0);
  const [yourCredit, setYourCredit] = useState(0);
  const [yourPoints, setYourPoints] = useState(0);
  const [yourChargesData, setYourChargesData] = useState([]);
  const [unpaidCharges, setUnpaidCharges] = useState([]);
  const [houseBalance, setHouseBalance] = useState(0);
  const [houseLedger, setHouseLedger] = useState(0);
  const [roommateChartData, setRoommateChartData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [billSubmissions, setBillSubmissions] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentTask, setSelectedPaymentTask] = useState(null);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(
      contentOffset / (0.75 * event.nativeEvent.layoutMeasurement.width + 12)
    );
    setActiveTaskIndex(index);
  };

  const fetchData = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      setError(null);
      setLoading(true);

      // Fetch current user data
      const userResponse = await apiClient.get(`/api/users/${user.id}`);
      const userData = userResponse.data;
      const houseId = userData.houseId;

      // Set logged-in user's finance data
      const finance = userData.finance || {};
      setYourBalance(finance.balance !== undefined ? finance.balance : (userData.balance || 0));
      setYourCredit(finance.credit !== undefined ? finance.credit : (userData.credit || 0));
      setYourPoints(finance.points !== undefined ? finance.points : (userData.points || 0));

      // Process unpaid charges: filter and then map.
      const charges = userData.charges || [];
      const filteredUnpaidCharges = charges.filter(charge => charge.status !== 'paid');
      setUnpaidCharges(filteredUnpaidCharges);
      
      const processedCharges =
        filteredUnpaidCharges.length > 0
          ? filteredUnpaidCharges.map((charge) => ({
              x: charge.name || 'Charge',
              y: parseFloat(charge.amount) || 0,
              color: '#ef4444',
            }))
          : [{ x: 'No Unpaid Charges', y: 1, color: '#22c55e', dummy: true }];
      setYourChargesData(processedCharges);

      // Fetch tasks and bill submissions in parallel
      const [tasksResponse, billSubmissionsResponse] = await Promise.all([
        apiClient.get(`/api/tasks/user/${user.id}`),
        apiClient.get(`/api/users/${user.id}/bill-submissions`)
      ]);
      
      // Process tasks
      const pendingTasks = tasksResponse.data.tasks.filter(task => task.status === false);
      setTasks(pendingTasks);
      
      // Process bill submissions
      const submissions = billSubmissionsResponse.data.submissions || [];
      setBillSubmissions(submissions);
      
      // Calculate total task count (regular tasks + bill submissions)
      const totalTaskCount = pendingTasks.length + submissions.length;
      setTaskCount(totalTaskCount);

      // Process house distribution (roommate data)
      if (houseId) {
        const houseResponse = await apiClient.get(`/api/houses/${houseId}`);
        const houseData = houseResponse.data;
        const users = houseData.users || [];

        // Get the house balance directly from house data
        const houseFinance = houseData.finance || {};
        const houseBalance = houseFinance.balance !== undefined 
          ? Number(houseFinance.balance) 
          : (houseData.balance ? Number(houseData.balance) : 0);
          
        // Set house balance from house data
        setHouseBalance(houseBalance);
        
        // Set house ledger from the house data
        setHouseLedger(
          houseFinance.ledger !== undefined ? houseFinance.ledger : (houseData.ledger || 0)
        );

        // Colors for users
        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
        
        // Since the house data doesn't include user finance info, we need to fetch each user's data
        const userPromises = users.map(user => 
          apiClient.get(`/api/users/${user.id}`)
        );
        
        // Wait for all user data to be fetched
        let userBalances = [];
        let totalUserOwed = 0;
        
        try {
          const userResponses = await Promise.all(userPromises);
          
          // Process each user to get their finance balance
          userBalances = userResponses.map((response, index) => {
            const userData = response.data;
            const finance = userData.finance || {};
            const balance = finance.balance !== undefined 
              ? Number(finance.balance) 
              : (userData.balance ? Number(userData.balance) : 0);
            
            // Only include users with balance > 0
            if (balance > 0) {
              totalUserOwed += balance;
              return {
                user: users[index], // Use the original user from house data
                balance: balance,
                color: colors[index % colors.length]
              };
            }
            return null;
          }).filter(item => item !== null); // Remove null entries (users with 0 balance)
        } catch (error) {
          console.error('Error fetching user finances:', error);
          // Continue with empty user balances if there's an error
        }
        
        // Create roommate chart data
        if (userBalances.length > 0) {
          // Some users have balance > 0
          const roommateData = userBalances.map(item => {
            // Calculate percentage of total house balance
            const percentage = (item.balance / houseBalance) * 100;
            
            return {
              x: item.user.username || `User ${item.user.id}`,
              y: item.balance, // Use actual balance for chart slice size
              color: item.color,
              displayValue: item.balance, // Actual balance to show in legend
              percentage: percentage.toFixed(1) // Percentage of total owed
            };
          });
          
          setRoommateChartData(roommateData);
        } else if (houseBalance > 0) {
          // No users with balance > 0, but house has balance - show as Unassigned
          setRoommateChartData([{ 
            x: 'Unassigned Balance', 
            y: houseBalance,
            color: '#6c757d', // Gray for unassigned
            displayValue: houseBalance,
            percentage: '100.0'
          }]);
        } else {
          // No house balance - show empty state
          setRoommateChartData([{ 
            x: 'No Outstanding Balances', 
            y: 1, 
            color: '#22c55e', 
            dummy: true 
          }]);
        }
      } else {
        setHouseBalance(0);
        setHouseLedger(0);
        setRoommateChartData([{ x: 'No House Data', y: 1, color: '#22c55e', dummy: true }]);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePress = (chartName, data, index) => {
    if (activeChart === chartName && selectedSegment === index) {
      setActiveChart(null);
      setSelectedSegment(null);
    } else {
      setActiveChart(chartName);
      setSelectedSegment(index);
    }
  };

  const handleTaskAction = async (data, action) => {
    try {
      const taskId = typeof data === 'object' ? (data.id || data.taskId) : data;

      if (!taskId) {
        console.error("Task ID is undefined. Data received:", data);
        throw new Error("Task ID is undefined");
      }
      
      if (typeof data === 'object' && action === 'accepted') {
        const updatedTask = { ...data, id: taskId };
        setSelectedPaymentTask(updatedTask);
        setIsPaymentModalVisible(true);
      } else {
        await apiClient.patch(`/api/tasks/${taskId}`, {
          response: action,
          userId: user.id,
        });
        fetchData();
      }
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
    }
  };
  

  const handleBillSubmitted = (result) => {
    // Refresh data after a bill is submitted
    fetchData();
  };

  const handlePaymentSuccess = async () => {
    if (selectedPaymentTask) {
      try {
        // Extract task ID from either "id" or "taskId"
        const taskId = selectedPaymentTask.id || selectedPaymentTask.taskId;
        if (!taskId) {
          throw new Error('Task ID is missing in selectedPaymentTask');
        }
        await apiClient.patch(`/api/tasks/${taskId}`, {
          response: 'accepted',
          paymentStatus: 'completed',
          userId: user.id,
        });
        fetchData();
      } catch (error) {
        console.error('Error updating task after payment:', error);
      }
    }
    setIsPaymentModalVisible(false);
    setSelectedPaymentTask(null);
  };
  

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Determine if we should show the task section at all
  const hasAnyTasks = tasks.length > 0 || billSubmissions.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        {/* Task Section - always show, but it will internally handle visibility */}
        <TaskSection
          tasks={tasks}
          billSubmissions={billSubmissions}
          activeTaskIndex={activeTaskIndex}
          taskCount={taskCount}
          handleTaskAction={handleTaskAction}
          handleScroll={handleScroll}
          onBillSubmitted={handleBillSubmitted}
        />

        {/* Charts */}
        <ChargesPieChart
          title="Your Unpaid Charges"
          amount={yourBalance}
          count={unpaidCharges.length}
          data={yourChargesData}
          onSegmentPress={(props) => handlePress('YourTab', yourChargesData, props.index)}
          activeChart={activeChart === 'YourTab'}
          selectedSegment={selectedSegment}
          isDistribution={false}
        />

        <ChargesPieChart
          title="House Distribution"
          amount={houseBalance}
          data={roommateChartData}
          onSegmentPress={(props) => handlePress('HouseTab', roommateChartData, props.index)}
          activeChart={activeChart === 'HouseTab'}
          selectedSegment={selectedSegment}
          isDistribution={true}
        />
      </ScrollView>

      {/* Payment Modal */}
      <AcceptServicePayment
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
        taskData={selectedPaymentTask}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
    borderWidth: 0,
  },
  scrollContent: {
    paddingVertical: 24,
    borderWidth: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dff6f0',
    paddingHorizontal: 24,
    borderWidth: 0,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    justifyContent: 'space-between',
    borderWidth: 0,
  },
});

export default DashboardScreen;