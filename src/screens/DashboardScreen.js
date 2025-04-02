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
  const [houseBalance, setHouseBalance] = useState(0);
  const [houseLedger, setHouseLedger] = useState(0);
  const [roommateChartData, setRoommateChartData] = useState([]);
  const [tasks, setTasks] = useState([]);
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
    const index = Math.round(contentOffset / (0.75 * event.nativeEvent.layoutMeasurement.width + 12));
    setActiveTaskIndex(index);
  };

  const fetchData = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      setError(null);
      setLoading(true);

      // Fetch user data with finance information
      const userResponse = await apiClient.get(`/api/users/${user.id}`);
      const userData = userResponse.data;
      const houseId = userData.houseId;
      
      // Get financial data (balance) from the finance relation or the legacy balance field
      const finance = userData.finance || {};
      setYourBalance(finance.balance !== undefined ? finance.balance : (userData.balance || 0));
      setYourCredit(finance.credit !== undefined ? finance.credit : (userData.credit || 0));
      setYourPoints(finance.points !== undefined ? finance.points : (userData.points || 0));

      // Get charges
      const charges = userData.charges || [];

      // Process charges for the pie chart
      const processedCharges =
        charges.length > 0
          ? charges.map((charge) => ({
              x: charge.name || 'Charge',
              y: parseFloat(charge.amount) || 0,
              color: charge.status === 'paid' ? '#22c55e' : '#ef4444',
            }))
          : [{ x: 'No Charges', y: 1, color: '#22c55e' }];
      setYourChargesData(processedCharges);

      // Fetch tasks
      const tasksResponse = await apiClient.get(`/api/tasks/user/${user.id}`);
      const pendingTasks = tasksResponse.data.tasks.filter((task) => task.status === false);
      setTasks(pendingTasks);
      setTaskCount(pendingTasks.length);

      // Fetch house data if available
      if (houseId) {
        const houseResponse = await apiClient.get(`/api/houses/${houseId}`);
        const houseData = houseResponse.data;
        const bills = houseData.bills || [];
        const users = houseData.users || [];
        
        // Get house finance data from the finance relation or the legacy balance field
        const houseFinance = houseData.finance || {};
        setHouseBalance(houseFinance.balance !== undefined ? houseFinance.balance : (houseData.balance || 0));
        setHouseLedger(houseFinance.ledger !== undefined ? houseFinance.ledger : (houseData.ledger || 0));

        // Calculate total from bills as well for validation
        const totalHouseBalance = bills.reduce(
          (sum, bill) => sum + (parseFloat(bill.amount) || 0),
          0
        );
        
        // If finance data is missing, fall back to calculated total
        if (houseFinance.balance === undefined && houseData.balance === undefined) {
          setHouseBalance(totalHouseBalance);
        }

        // Create roommate data for the chart
        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
        
        // Attempt to get user finance data, fallback to charges if available
        const roommateData = users.map((roommate, index) => {
          // Try to get balance from finance relation first
          const roommateFinance = roommate.finance || {};
          const roommateBalance = roommateFinance.balance !== undefined 
            ? roommateFinance.balance 
            : (roommate.balance || 0);
            
          // If we have charges, sum them as fallback
          const chargesSum = roommate.charges?.reduce(
            (sum, charge) => sum + (parseFloat(charge.amount) || 0),
            0
          ) || 0;
          
          // Use finance balance if available, otherwise use charges sum
          const balanceToUse = roommateFinance.balance !== undefined ? roommateBalance : chargesSum;
          
          return {
            x: roommate.username || `User ${index + 1}`,
            y: balanceToUse || 1, // Use 1 as minimum to ensure visibility
            color: colors[index % colors.length],
          };
        });
        
        setRoommateChartData(roommateData.length > 0 
          ? roommateData 
          : [{ x: 'No Data', y: 1, color: '#22c55e' }]
        );
      } else {
        setHouseBalance(0);
        setHouseLedger(0);
        setRoommateChartData([{ x: 'No Data', y: 1, color: '#22c55e' }]);
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
      const taskId = typeof data === 'object' ? data.taskId : data;

      if (typeof data === 'object' && action === 'accepted') {
        setSelectedPaymentTask(data);
        setIsPaymentModalVisible(true);
      } else {
        // Using apiClient with relative path
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

  const handlePaymentSuccess = async () => {
    if (selectedPaymentTask) {
      try {
        // Using apiClient with relative path
        await apiClient.patch(`/api/tasks/${selectedPaymentTask.taskId}`, {
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

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        {/* Task Section */}
        <TaskSection
          tasks={tasks}
          activeTaskIndex={activeTaskIndex}
          taskCount={taskCount}
          handleTaskAction={handleTaskAction}
          handleScroll={handleScroll}
        />

        {/* Charts */}
        <ChargesPieChart
          title="Your Charges"
          amount={yourBalance}
          data={yourChargesData}
          onSegmentPress={(props) => handlePress('YourTab', yourChargesData, props.index)}
          activeChart={activeChart === 'YourTab'}
          selectedSegment={selectedSegment}
        />

        <ChargesPieChart
          title="House Distribution"
          amount={houseBalance}
          data={roommateChartData}
          onSegmentPress={(props) => handlePress('HouseTab', roommateChartData, props.index)}
          activeChart={activeChart === 'HouseTab'}
          selectedSegment={selectedSegment}
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

export default DashboardScreen