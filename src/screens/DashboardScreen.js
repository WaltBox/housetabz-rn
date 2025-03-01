import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { VictoryPie } from 'victory-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ServiceRequestTask from '../components/ServiceRequestTask';
import AcceptServicePayment from '../modals/AcceptServicePayment';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Dashboard Header
const DashboardHeader = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Dashboard</Text>
    <TouchableOpacity style={styles.headerButton}>
    </TouchableOpacity>
  </View>
);

// Helper Components
const SummaryCard = ({ icon, label, amount }) => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryHeader}>
      <MaterialIcons name={icon} size={24} color="#34d399" style={styles.icon} />
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
          activeChart && selectedSegment === index 
            ? `${datum.x}\n$${datum.y.toFixed(2)}\n${datum.percentage || ''}`
            : ''
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
  const queryClient = useQueryClient();
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [activeChart, setActiveChart] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentTask, setSelectedPaymentTask] = useState(null);

  // Helper function for safer API requests
 // Replace your existing safeApiCall function with this one
const safeApiCall = async (url, defaultValue) => {
  try {
    console.log(`Fetching: ${url}`);
    const response = await axios.get(url);
    console.log(`Success for ${url}: ${response.status}`);
    return response.data;
  } catch (error) {
    // Special case: If it's a 404 from the tasks endpoint, don't log as error
    if (error.response?.status === 404 && url.includes('/api/tasks/user/')) {
      console.log(`No tasks found at ${url} (returning empty list)`);
      // Return the empty array structure that matches your expected format
      return { 
        message: "No tasks found for this user",
        tasks: [] 
      };
    }
    
    // For other errors, log them as usual
    console.error(`Error fetching ${url}: ${JSON.stringify({
      status: error.response?.status,
      message: error.message
    })}`);
    return defaultValue;
  }
};
  // Main dashboard data query
  const { 
    data: dashboardData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Fetch user data
      const userData = await safeApiCall(`http://localhost:3004/api/users/${user.id}`, {});
      const { balance = 0, charges = [], houseId } = userData;

      // Filter to only show unpaid charges for the user
      const unpaidCharges = charges.filter(charge => charge.status === 'unpaid');

      // Process user's charges for the pie chart
      const processedCharges =
        unpaidCharges.length > 0
          ? unpaidCharges.map((charge) => ({
              x: charge.name || 'Charge',
              y: parseFloat(charge.amount) || 0,
              color: '#ef4444', // All unpaid charges are red
            }))
          : [{ x: 'No Unpaid Charges', y: 1, color: '#34d399' }];

      // Fetch tasks - handle 404 responses by using empty array as default
      const tasksData = await safeApiCall(`http://localhost:3004/api/tasks/user/${user.id}`, { tasks: [] });
      const pendingTasks = tasksData.tasks ? tasksData.tasks.filter((task) => task.status === false) : [];

      // Initialize house data
      let houseBalance = 0;
      let roommateChartData = [{ x: 'No Unpaid Charges', y: 1, color: '#34d399' }];

      // Fetch house data if available
      if (houseId) {
        // Get the house data - use empty object as default
        const houseData = await safeApiCall(`http://localhost:3004/api/houses/${houseId}`, {});
        
        // Get all bills for the house - use empty array as default
        const bills = await safeApiCall(`http://localhost:3004/api/houses/${houseId}/bills`, []);
        
        // Initialize user totals
        const userTotals = {};
        let totalPendingAmount = 0;
        
        // Process all bills and their charges
        if (Array.isArray(bills)) {
          bills.forEach(bill => {
            // Only consider pending bills
            if (bill && bill.status === 'pending' && bill.Charges) {
              bill.Charges.forEach(charge => {
                // Only consider pending charges
                if (charge && charge.status === 'unpaid') {
                  const userId = charge.userId;
                  const amount = parseFloat(charge.amount) || 0;
                  
                  // Add to user total
                  if (!userTotals[userId]) {
                    userTotals[userId] = {
                      userId,
                      username: charge.User?.username || `User ${userId}`,
                      total: 0
                    };
                  }
                  
                  userTotals[userId].total += amount;
                  totalPendingAmount += amount;
                }
              });
            }
          });
        }
        
        // Set house balance to the calculated total
        houseBalance = totalPendingAmount;
        
        // Generate chart data from user totals
        const colors = ['#34d399', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
        
        const userTotalsArray = Object.values(userTotals);
        
        if (userTotalsArray.length > 0) {
          roommateChartData = userTotalsArray.map((user, index) => ({
            x: user.username,
            y: user.total,
            color: colors[index % colors.length],
            percentage: totalPendingAmount > 0 
              ? ((user.total / totalPendingAmount) * 100).toFixed(0) + '%' 
              : '0%'
          }));
        }
      }

      // Return all the data
      return {
        yourBalance: balance,
        yourChargesData: processedCharges,
        houseBalance,
        roommateChartData,
        tasks: pendingTasks,
        taskCount: pendingTasks.length
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Try up to 3 times total (initial + 2 retries)
    retryDelay: 1000, // Wait 1 second between retries
  });

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch(); // Always refetch when the screen comes into focus
      return () => {
        // Cleanup if needed
      };
    }, [refetch])
  );

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (width * 0.75 + 12));
    setActiveTaskIndex(index);
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
        
        // Invalidate queries to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
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
        
        // Invalidate queries to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
      } catch (error) {
        console.error('Error updating task after payment:', error);
      }
    }
    setIsPaymentModalVisible(false);
    setSelectedPaymentTask(null);
  };

  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34d399" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error?.message || 'An error occurred'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // We should have data by this point
  const { 
    yourBalance = 0, 
    yourChargesData = [{ x: 'No Charges', y: 1, color: '#34d399' }], 
    houseBalance = 0, 
    roommateChartData = [{ x: 'No Charges', y: 1, color: '#34d399' }], 
    tasks = [], 
    taskCount = 0 
  } = dashboardData || {};

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isFetching} 
            onRefresh={() => refetch()} 
            tintColor="#34d399" 
          />
        }
      >
        {/* Tasks Section */}
        <View style={styles.chartCard}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleGroup}>
              <MaterialIcons name="assignment" size={20} color="#34d399" style={styles.icon} />
              <Text style={styles.chartTitle}>Tasks</Text>
            </View>
            {taskCount > 0 && (
              <View style={styles.taskBadge}>
                <Text style={styles.taskBadgeText}>{taskCount} pending</Text>
              </View>
            )}
          </View>
          {tasks && tasks.length > 0 ? (
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
                          index === activeTaskIndex ? '#34d399' : '#e2e8f0',
                        width: index === activeTaskIndex ? 12 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="check-circle" size={48} color="#34d399" style={styles.icon} />
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
            amount={yourBalance || 0}
          />
          <SummaryCard icon="group" label="House Balance" amount={houseBalance || 0} />
        </View>

        {/* User's Charges Chart */}
        <ChargesPieChart
          title="Your Charges"
          amount={yourBalance || 0}
          data={yourChargesData || [{ x: 'No Charges', y: 1, color: '#34d399' }]}
          onSegmentPress={(props) => handlePress('YourTab', yourChargesData, props.index)}
          activeChart={activeChart === 'YourTab'}
          selectedSegment={selectedSegment}
        />

        {/* House Distribution Chart */}
        <ChargesPieChart
          title="House Distribution"
          amount={houseBalance || 0}
          data={roommateChartData || [{ x: 'No Charges', y: 1, color: '#34d399' }]}
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

// Define your styles here
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
    backgroundColor: '#34d399',
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
    color: '#34d399',
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