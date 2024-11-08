import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, RefreshControl } from 'react-native';
import { VictoryPie } from 'victory-native';

let realData = [];
let roommateColors = [];
let houseBalance = 0;

const DashboardScreen = () => {
  const [data, setData] = useState([]);
  const [colors, setColors] = useState([]);
  const [roommateSlice, setRoommateSlice] = useState(null);
  const [chargeSlice, setChargeSlice] = useState(null);
  const [yourData, setYourData] = useState([{ y: 1 }]);
  const [houseSliceInfo, setHouseSliceInfo] = useState({ width: 0, height: 0 });
  const [yourSliceInfo, setYourSliceInfo] = useState({ width: 0, height: 0 });


  useEffect(() => {
    realData = [];
    roommateColors = [];
    houseBalance = 0;
    houseData.forEach((roommate) => {
      const total = Object.values(roommate.charges).reduce((total, charge) => total + charge, 0);
      realData.push({ x: roommate.name, y: 1, description: total });
      houseBalance += total;
      roommateColors.push(total > 0 ? '#d1040b' : '#04d115');
    });

    setData(realData);
    setColors(roommateColors);
    setYourData([{ x: 'Rent', y: 150 }, { x: 'Netflix', y: 40 }, { x: 'Cleaning', y: 10 }]);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      showsVerticalScrollIndicator={true}
      refreshControl={<RefreshControl refreshing={false} />}
    >
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Your Tab</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceText}>Balance: $200</Text>
        </View>

        <View style={styles.pieChartContainer}>
          <VictoryPie
            data={yourData}
            style={{
              data: {
                fillOpacity: ({ datum }) => (chargeSlice ? (chargeSlice.x === datum.x ? 1 : 0.5) : 1),
              },
            }}
            labels={() => null}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPressIn: (event, props) => {
                    setChargeSlice(props.datum);
                  },
                },
              },
            ]}
            width={400}
            height={400}
            padding={{ left: 50, right: 50 }}
            colorScale={['#A4D65E', '#32CD32', '#228B22']}
            innerRadius={80}
          />

          {chargeSlice && (
            <View   
            style={[styles.centerTextContainer,
              {
                top: '50%',
                left: '50%',
                marginLeft: -yourSliceInfo.width / 2,
                marginTop: -yourSliceInfo.height / 2,
              },
            ]}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setYourSliceInfo({ width, height });
            }}>
              <Text style={styles.sliceLabel}>{chargeSlice.x}</Text>
              <Text style={styles.sliceValue}>Charge: ${parseFloat(chargeSlice.y.toFixed(2))}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>House Tab</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceText}>Balance: ${houseBalance}</Text>
        </View>

        <View style={styles.pieChartContainer}>
          <VictoryPie
            data={data}
            style={{
              data: {
                fillOpacity: ({ datum }) => (roommateSlice ? (roommateSlice.x === datum.x ? 1 : 0.5) : 1),
              },
            }}
            labels={() => null}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPressIn: (event, props) => {
                    setRoommateSlice(props.datum);
                  },
                },
              },
            ]}
            width={400}
            height={400}
            padding={{ left: 50, right: 50 }}
            colorScale={colors}
            innerRadius={80}
            padAngle={5}
            startAngle={0}
            endAngle={360}
          />

          {roommateSlice && (
            <View   
            style={[styles.centerTextContainer,
              {
                top: '50%',
                left: '50%',
                marginLeft: -houseSliceInfo.width / 2,
                marginTop: -houseSliceInfo.height / 2,
              },
            ]}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setHouseSliceInfo({ width, height });
            }}>
              <Text style={styles.sliceLabel}>{roommateSlice.x}</Text>
              <Text style={styles.sliceValue}>Balance: ${parseFloat(roommateSlice.description.toFixed(2))}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.taskCard}>
        <Text style={styles.taskCardTitle}>Tasks to Complete</Text>
        {Object.entries(houseData[1].charges).map(([charge, amount]) => (
          <View key={charge} style={styles.taskItem}>
            <Text style={styles.taskText}>
              Pay {charge} of ${amount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 80,
  },
  chartContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chartTitle: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  pieChartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 350,
    height: 350,
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFFE6',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sliceLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sliceValue: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  taskCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  taskItem: {
    paddingVertical: 8,
  },
  taskText: {
    fontSize: 16,
    color: '#555',
  },
});

const houseData = [
  { name: 'Ishan', charges: { Rent: 0, Netflix: 0, Cleaning: 0 } },
  { name: 'Dhairya', charges: { Rent: 200, Netflix: 40, Cleaning: 10 } },
  { name: 'Kathir', charges: { Rent: 200, Netflix: 30, Cleaning: 10 } },
  { name: 'Samhith', charges: { Rent: 200, Netflix: 40, Cleaning: 10 } },
  { name: 'Nathan', charges: { Rent: 200, Netflix: 40, Cleaning: 10 } },
];

export default DashboardScreen;