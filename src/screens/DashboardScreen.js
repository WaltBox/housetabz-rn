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
} from 'react-native';
import { VictoryPie } from 'victory-native';
import { MaterialIcons } from "@expo/vector-icons";
import axios from 'axios';
import ServiceRequestTask from '../components/ServiceRequestTask';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
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

  const fetchData = async () => {
    try {
      setError(null);
      const userResponse = await axios.get('http://localhost:3004/api/users/1');
      const { balance, charges, houseId, tasks } = userResponse.data;

      setYourBalance(balance || 0);
      setYourChargesData(
        charges.length > 0
          ? charges.map((charge) => ({
              x: charge.name || 'Charge',
              y: charge.amount,
              color: charge.paid ? '#22c55e' : '#ef4444',
            }))
          : [{ x: 'No Charges', y: 1, color: '#22c55e' }]
      );

      const incompleteTasks = tasks.filter((task) => !task.status);
      setTasks(incompleteTasks);
      setTaskCount(incompleteTasks.length);

      if (houseId) {
        const houseResponse = await axios.get(`http://localhost:3004/api/houses/${houseId}`);
        const { bills, users } = houseResponse.data;

        const totalHouseBalance = bills.reduce((sum, bill) => sum + bill.amount, 0);
        setHouseBalance(totalHouseBalance);

        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
        setRoommateChartData(
          users.map((user, index) => ({
            x: user.username,
            y: user.charges?.reduce((sum, charge) => sum + charge.amount, 0) || 1,
            color: colors[index % colors.length],
          }))
        );
      }
    } catch (err) {
      setError('Unable to load dashboard data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const renderLabel = (chartName, data, index) =>
    activeChart === chartName && selectedSegment === index ? `${data.x}\n$${data.y}` : '';

  const handleTaskAction = async (taskId, action) => {
    try {
      await axios.patch(`http://localhost:3004/api/tasks/${taskId}`, {
        response: action,
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setTaskCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
      }
    >
    {/* Tasks Section */}
{/* Tasks Section */}
<View style={styles.chartCard}>
  <View style={styles.taskHeader}>
    <View style={styles.taskTitleGroup}>
      <MaterialIcons name="assignment" size={20} color="#22c55e" />
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
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={[
            styles.taskItemContainer,
            index === 0 && { marginLeft: 0 }
          ]}>
            <ServiceRequestTask
              task={item}
              onAccept={(taskId) => handleTaskAction(taskId, 'accepted')}
              onReject={(taskId) => handleTaskAction(taskId, 'rejected')}
            />
          </View>
        )}
        decelerationRate={0.9}
        snapToInterval={width * 0.75}
        snapToAlignment="center"
        contentContainerStyle={styles.taskList}
      />
      <View style={styles.paginationDots}>
        {tasks.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: index === 0 ? '#22c55e' : '#e2e8f0' }
            ]}
          />
        ))}
      </View>
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="check-circle" size={48} color="#22c55e" />
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptyText}>No pending tasks at the moment.</Text>
    </View>
  )}
</View>
      {/* Balance Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#22c55e" />
            <Text style={styles.summaryLabel}>Your Balance</Text>
          </View>
          <Text style={styles.summaryAmount}>${yourBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="group" size={24} color="#22c55e" />
            <Text style={styles.summaryLabel}>House Balance</Text>
          </View>
          <Text style={styles.summaryAmount}>${houseBalance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Your Tab Chart Section */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Your Charges</Text>
          <TouchableOpacity style={styles.chartButton}>
            <MaterialIcons name="more-horiz" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.centerAmount}>${yourBalance.toFixed(2)}</Text>
          <VictoryPie
            data={yourChargesData}
            colorScale={yourChargesData.map(data => data.color)}
            width={width - 80}
            height={220}
            innerRadius={70}
            padAngle={2}
            animate={{ duration: 500, easing: 'cubic' }}
            style={{
              labels: { fill: '#1e293b', fontSize: 14, fontWeight: '500' },
              data: { stroke: '#fff', strokeWidth: 2 }
            }}
            labels={({ datum, index }) => renderLabel('YourTab', datum, index)}
            events={[{
              target: 'data',
              eventHandlers: {
                onPressIn: (_, props) => handlePress('YourTab', yourChargesData, props.index),
              },
            }]}
          />
        </View>
      </View>

      {/* House Tab Chart Section */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>House Distribution</Text>
          <TouchableOpacity style={styles.chartButton}>
            <MaterialIcons name="more-horiz" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.centerAmount}>${houseBalance.toFixed(2)}</Text>
          <VictoryPie
            data={roommateChartData}
            colorScale={roommateChartData.map(data => data.color)}
            width={width - 80}
            height={220}
            innerRadius={70}
            padAngle={2}
            animate={{ duration: 500, easing: 'cubic' }}
            style={{
              labels: { fill: '#1e293b', fontSize: 14, fontWeight: '500' },
              data: { stroke: '#fff', strokeWidth: 2 }
            }}
            labels={({ datum, index }) => renderLabel('HouseTab', datum, index)}
            events={[{
              target: 'data',
              eventHandlers: {
                onPressIn: (_, props) => handlePress('HouseTab', roommateChartData, props.index),
              },
            }]}
          />
        </View>
      </View>

      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingVertical: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
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
    gap: 8,
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
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16, // Reduced padding
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
  tasksCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tasksCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced margin
  },
  taskTitleGroup: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
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
  taskCount: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  taskCountText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalTaskList: {
    paddingHorizontal: 4,  // Small padding to accommodate shadows
  },
  taskList: {
    marginTop: 4, // Reduced margin
  },
  taskItemContainer: {
    width: width * 0.75,
    marginRight: 12,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12, // Reduced margin
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
});

export default DashboardScreen;