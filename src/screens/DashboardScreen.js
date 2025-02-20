import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { VictoryPie } from 'victory-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ServiceRequestTask from '../components/ServiceRequestTask';
import AcceptServicePayment from '../modals/AcceptServicePayment';

const { width } = Dimensions.get('window');

// ---------------------
// Dashboard Header
// ---------------------
const DashboardHeader = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Dashboard</Text>
    <TouchableOpacity style={styles.headerButton}>
    </TouchableOpacity>
  </View>
);

// ---------------------
// Helper Components
// ---------------------
const SummaryCard = ({ icon, label, amount }) => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryHeader}>
      <MaterialIcons name={icon} size={24} color="#22c55e" style={styles.icon} />
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
    <Text style={styles.summaryAmount}>${amount.toFixed(2)}</Text>
  </View>
);

const ChargesPieChart = ({
  title,
  amount,
  data,
  onSegmentPress,
  activeChart,
  selectedSegment,
}) => (
  <View style={styles.chartCard}>
    <View style={styles.chartHeader}>
      <Text style={styles.chartTitle}>{title}</Text>
      <TouchableOpacity style={styles.chartButton}>
        <MaterialIcons name="more-horiz" size={24} color="#64748b" style={styles.icon} />
      </TouchableOpacity>
    </View>
    <View style={styles.chartContainer}>
      <Text style={styles.centerAmount}>${amount.toFixed(2)}</Text>
      <VictoryPie
        data={data}
        colorScale={data.map((item) => item.color)}
        width={width - 80}
        height={220}
        innerRadius={70}
        padAngle={2}
        animate={{ duration: 500, easing: 'cubic' }}
        style={{
          labels: { fill: '#1e293b', fontSize: 14, fontWeight: '500' },
          data: { stroke: '#fff', strokeWidth: 2 },
        }}
        labels={({ datum, index }) =>
          activeChart && selectedSegment === index ? `${datum.x}\n$${datum.y}` : ''
        }
        events={[
          {
            target: 'data',
            eventHandlers: {
              onPressIn: (_, props) => onSegmentPress(props),
            },
          },
        ]}
      />
    </View>
  </View>
);

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
    const index = Math.round(contentOffset / (width * 0.75 + 12));
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
  }, [user?.id]); // Refetch when user ID changes

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
          userId: user.id
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
          userId: user.id
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
        {/* Rest of your JSX remains the same */}
      {/* Tasks Section */}
<View style={styles.chartCard}>
  <View style={styles.taskHeader}>
    <View style={styles.taskTitleGroup}>
      <MaterialIcons name="assignment" size={20} color="#22c55e" style={styles.icon} />
      <Text style={styles.chartTitle}>Tasks</Text>
    </View>
    {taskCount > 0 && (
      <View style={styles.taskBadge}>
        <Text style={styles.taskBadgeText}>{taskCount} pending</Text>
      </View>
    )}
  </View>
  {tasks.length > 0 ? (
    <View>
      <FlatList
        data={tasks}
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
        contentContainerStyle={styles.taskListContent}
        decelerationRate="fast"
        snapToInterval={width * 0.75 + 12}
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.paginationDots}>
        {tasks.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  index === activeTaskIndex ? '#22c55e' : '#e2e8f0',
                width: index === activeTaskIndex ? 12 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="check-circle" size={48} color="#22c55e" style={styles.icon} />
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptyText}>No pending tasks at the moment.</Text>
    </View>
  )}
</View>

        {/* Balance Summary */}
        <View style={styles.summaryContainer}>
          <SummaryCard
            icon="account-balance-wallet"
            label="Your Balance"
            amount={yourBalance}
          />
          <SummaryCard icon="group" label="House Balance" amount={houseBalance} />
        </View>

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
  // General Layout
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
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerButton: {
    padding: 4,
  },
  // Loading & Error Text
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
  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  // Chart Card
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  chartButton: {
    padding: 4,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerAmount: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    zIndex: 1,
  },
  // Task Section
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
  },
  taskListContent: {
    paddingHorizontal: 16,
  },
  taskItemContainer: {
    width: width * 0.75,
    marginRight: 12,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  // Icon Spacing
  icon: {
    marginRight: 8,
  },
});

export default DashboardScreen;
