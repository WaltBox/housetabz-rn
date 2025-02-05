import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions, FlatList } from 'react-native';
import { VictoryPie } from 'victory-native';
import axios from 'axios';
import ServiceRequestTask from '../components/ServiceRequestTask';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const [yourBalance, setYourBalance] = useState(0);
  const [yourChargesData, setYourChargesData] = useState([]);
  const [houseBalance, setHouseBalance] = useState(0);
 
  const [roommateChartData, setRoommateChartData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskCount, setTaskCount] = useState(0);

  // For managing active labels
  const [activeChart, setActiveChart] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:3004/api/users/1');
        const { balance, charges, houseId, tasks } = userResponse.data;

        // Set user's balance and charges
        setYourBalance(balance || 0);
        setYourChargesData(
          charges.length > 0
            ? charges.map((charge) => ({
                x: charge.name || 'Charge',
                y: charge.amount,
              }))
            : [{ x: 'No Charges', y: 1 }]
        );

        // Filter tasks to only include those with `status: false`
        const incompleteTasks = tasks.filter((task) => !task.status);
        setTasks(incompleteTasks);
        setTaskCount(incompleteTasks.length);

        if (houseId) {
          const houseResponse = await axios.get(`http://localhost:3004/api/houses/${houseId}`);
          const { bills, users } = houseResponse.data;

          const totalHouseBalance = bills.reduce((sum, bill) => sum + bill.amount, 0);


          setHouseBalance(totalHouseBalance);

          setRoommateChartData(
            users.map((user) => ({
              x: user.username,
              y: 1,
              color: totalHouseBalance === 0 ? 'green' : 'red',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

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
    activeChart === chartName && selectedSegment === index ? `${data.x}: ${data.y}` : '';

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

  const renderTask = ({ item }) => (
    <ServiceRequestTask
      task={item}
      onAccept={(taskId) => handleTaskAction(taskId, 'accepted')}
      onReject={(taskId) => handleTaskAction(taskId, 'rejected')}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Your Tab Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>YourTab</Text>
        <View style={styles.centeredContainer}>
          <Text style={styles.balanceText}>${yourBalance || 0}</Text>
          <VictoryPie
            data={yourChargesData}
            colorScale={['#45B7D1', '#FDCB6E', '#6C5CE7']}
            width={screenWidth - 40}
            height={220}
            innerRadius={110}
            animate={{ duration: 1000, easing: 'bounce' }}
            style={{ labels: { fill: 'black', fontSize: 18 } }}
            labels={({ datum, index }) => renderLabel('YourTab', datum, index)}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPressIn: (_, props) => handlePress('YourTab', yourChargesData, props.index),
                },
              },
            ]}
          />
        </View>
      </View>

      {/* House Tab Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>HouseTab</Text>
        <View style={styles.centeredContainer}>
          <Text style={styles.balanceText}>${houseBalance || 0}</Text>
          <VictoryPie
            data={roommateChartData}
            colorScale={roommateChartData.map((user) => user.color)}
            width={screenWidth - 40}
            height={220}
            innerRadius={110}
            animate={{ duration: 1000, easing: 'bounce' }}
            style={{
              data: { stroke: 'white', strokeWidth: 1 },
              labels: { fill: 'black', fontSize: 18 },
            }}
            labels={({ datum, index }) => renderLabel('HouseTab', datum, index)}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPressIn: (_, props) => handlePress('HouseTab', roommateChartData, props.index),
                },
              },
            ]}
          />
        </View>
      </View>

      {/* Tasks Section */}
      <View style={styles.taskSection}>
  <Text style={styles.sectionTitle}>Tasks ({taskCount})</Text>
  <View style={styles.taskContainer}>
    {tasks.length > 0 ? (
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
      />
    ) : (
      <View style={styles.emptyTaskOutline}>
        <Text style={styles.noTasksText}>No tasks right now</Text>
      </View>
    )}
  </View>
</View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f5f0',
    padding: 20,
  },
  chartSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskSection: {
    marginTop: 20,
  },
  taskContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  emptyTaskOutline: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  noTasksText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
    fontFamily: 'Roboto', // Use Roboto font
  },
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  balanceText: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DashboardScreen;
