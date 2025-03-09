import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryPie } from 'victory-native';

const { width } = Dimensions.get('window');

// Modern color palette with better contrast
const COLORS = [
  '#5E60CE', // Primary purple
  '#64DFDF', // Teal
  '#FF5C8D', // Pink
  '#FFBD3E', // Amber
  '#7400B8', // Deep purple
  '#52B788', // Green
];

const ChargesPieChart = ({ title, amount, count, data }) => {
  // Process data for the chart
  const enhancedData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));
  
  // Group data into columns if more than 3 items
  const shouldUseColumns = enhancedData.length > 3;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
          <Text style={styles.details}>unpaid • ${amount.toFixed(2)} total</Text>
        </View>
      </View>

      {/* Chart and Labels Section */}
      <View style={styles.chartRow}>
        {/* Thin Ring Chart */}
        <View style={styles.chartWrapper}>
          <VictoryPie
            data={enhancedData}
            colorScale={enhancedData.map(item => item.color)}
            width={width * 0.5}
            height={width * 0.5}
            innerRadius={width * 0.22} // Very thin ring
            padAngle={1.5}
            cornerRadius={2}
            style={{
              labels: { fill: 'transparent' },
              data: { strokeWidth: 0 }
            }}
            animate={{
              duration: 800,
              easing: "bounce"
            }}
          />
          
          {/* Center amount */}
          <View style={styles.centerAmount}>
            <Text style={styles.amountPrefix}>$</Text>
            <Text style={styles.amountValue}>{amount.toFixed(0)}</Text>
          </View>
        </View>

        {/* Label List - will adapt to columns based on count */}
        <View style={[
          styles.labelContainer, 
          shouldUseColumns ? styles.labelColumns : styles.labelList
        ]}>
          {enhancedData.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.labelItem,
                shouldUseColumns ? styles.columnItem : {}
              ]}
            >
              <View style={styles.labelHeader}>
                <Text style={[styles.labelName, { color: item.color }]} numberOfLines={1}>
                  {item.x}
                </Text>
              </View>
              <View style={styles.valueRow}>
                <Text style={styles.labelValue}>
                  ${item.y.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2B2D42',
    marginBottom: 8,
    letterSpacing: -0.5,
    fontFamily:'Sigmar-Regular'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#5E60CE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  countText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 13,
  },
  details: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartWrapper: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerAmount: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  amountPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2B2D42',
    marginTop: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2B2D42',
  },
  labelContainer: {
    flex: 1,
    marginLeft: 16,
  },
  labelList: {
    // Single column layout
  },
  labelColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  labelItem: {
    marginBottom: 16,
  },
  columnItem: {
    width: '48%', // Allow for two columns with spacing
  },
  labelHeader: {
    marginBottom: 4,
  },
  labelName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2B2D42',
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    paddingLeft: 0,
  },
  labelValue: {
    fontSize: 14,
    color: '#6C757D',
  },
});

export default ChargesPieChart;