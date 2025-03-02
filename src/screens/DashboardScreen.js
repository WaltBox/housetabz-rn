// DashboardScreen.jsx
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
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import DashboardHeader from '../components/DashboardHeader';

import ChargesPieChart from '../components/ChargesPieChart';
import TaskSection from '../components/TaskSection';
import AcceptServicePayment from '../modals/AcceptServicePayment';

const DashboardScreen = () => {
  const { user } = useAuth();
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [yourBalance, setYourBalance] = useState(0);
  const [yourChargesData, setYourChargesData] = useState([]);
  const [houseBalance, setHouseBalance] = useState(0);
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

      // Fetch user data
      const userResponse = await axios.get(`http://localhost:3004/api/users/${user.id}`);
      const { balance = 0, charges = [], houseId } = userResponse.data;
      setYourBalance(balance);

      // Process charges for the pie chart
      const processedCharges =
        charges.length > 0
          ? charges.map((charge) => ({
              x: charge.name || 'Charge',
              y: parseFloat(charge.amount) || 0,
              color: charge.paid ? '#22c55e' : '#ef4444',
            }))
          : [{ x: 'No Charges', y: 1, color: '#22c55e' }];
      setYourChargesData(processedCharges);

      // Fetch tasks
      const tasksResponse = await axios.get(`http://localhost:3004/api/tasks/user/${user.id}`);
      const pendingTasks = tasksResponse.data.tasks.filter((task) => task.status === false);
      setTasks(pendingTasks);
      setTaskCount(pendingTasks.length);

      // Fetch house data if available
      if (houseId) {
        const houseResponse = await axios.get(`http://localhost:3004/api/houses/${houseId}`);
        const { bills = [], users = [] } = houseResponse.data;

        const totalHouseBalance = bills.reduce(
          (sum, bill) => sum + (parseFloat(bill.amount) || 0),
          0
        );
        setHouseBalance(totalHouseBalance);

        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
        const roommateData = users.map((user, index) => ({
          x: user.username || `User ${index + 1}`,
          y: user.charges?.reduce(
              (sum, charge) => sum + (parseFloat(charge.amount) || 0),
              0
            ) || 1,
          color: colors[index % colors.length],
        }));
        setRoommateChartData(roommateData);
      } else {
        setHouseBalance(0);
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
        await axios.patch(`http://localhost:3004/api/tasks/${taskId}`, {
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
        await axios.patch(`http://localhost:3004/api/tasks/${selectedPaymentTask.taskId}`, {
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
    backgroundColor: '#dff1f0',
  },
  scrollContent: {
    paddingVertical: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dff6f0',
    paddingHorizontal: 24,
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
  },
});

export default DashboardScreen;
