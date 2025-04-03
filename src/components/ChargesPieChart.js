import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryPie } from 'victory-native';

const { width } = Dimensions.get('window');

// Predefined color palette
const COLORS = [
  '#5E60CE', // Primary purple
  '#64DFDF', // Teal
  '#FF5C8D', // Pink
  '#FFBD3E', // Amber
  '#7400B8', // Deep purple
  '#52B788', // Green
];

const ChargesPieChart = ({ 
  title, 
  amount, 
  count, 
  data, 
  onSegmentPress, 
  activeChart, 
  selectedSegment,
  isDistribution = false 
}) => {
  // Check if there's dummy data (indicating no real charges/data)
  const hasDummy = data.some(item => item.dummy);

  // Enhance each data item:
  // For dummy slices, use the provided color; otherwise assign a palette color.
  const enhancedData = data.map((item, index) =>
    item.dummy ? { ...item, color: item.color } : { ...item, color: COLORS[index % COLORS.length] }
  );

  // For center display:
  // Always show the actual amount for distribution charts (house balance)
  // Only show message for charges when there's a dummy
  const shouldShowMessage = !isDistribution && hasDummy;
  const centerMessage = "None";
  
  // For the legend, don't show dummy items
  // Filter out dummies for all charts
  const labelData = enhancedData.filter(item => !item.dummy);
    
  const useColumns = labelData.length > 3;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
                  <View style={styles.badgeRow}>
          {/* For charges chart: Show count badge if there are real charges */}
          {/* For distribution chart: Always show the count of users */}
          {(isDistribution || !hasDummy) && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count || labelData.length}</Text>
            </View>
          )}
          <Text style={styles.details}>
            {!isDistribution ? '' : ''}
            {hasDummy && !isDistribution ? 'No unpaid charges' : `${amount.toFixed(2)} total`}
          </Text>
        </View>
      </View>
      
      {/* Chart and Legend */}
      <View style={styles.chartRow}>
        <View style={styles.chartWrapper}>
          <VictoryPie
            data={enhancedData}
            colorScale={enhancedData.map(item => item.color)}
            width={width * 0.5}
            height={width * 0.5}
            innerRadius={width * 0.22}
            padAngle={1.5}
            cornerRadius={2}
            style={{
              labels: { fill: 'transparent' },
              data: { strokeWidth: 0 },
            }}
            events={[
              {
                target: "data",
                eventHandlers: {
                  onPress: (evt, targetProps) => {
                    if (onSegmentPress && !enhancedData[targetProps.index]?.dummy) {
                      onSegmentPress(targetProps);
                    }
                    return null;
                  }
                }
              }
            ]}
            animate={{
              duration: 800,
              easing: 'bounce',
            }}
          />
          <View style={styles.centerAmount}>
            <Text style={styles.amountPrefix}>$</Text>
            <Text style={styles.amountValue}>{amount.toFixed(0)}</Text>
          </View>
        </View>
        
        {/* Only show legend if there are real items to display */}
        {labelData.length > 0 && (
          <View style={[
            styles.labelContainer,
            useColumns ? styles.labelColumns : styles.labelList,
          ]}>
            {labelData.map((item, index) => {
              // Get the actual value to display - use displayValue if available
              const displayAmount = isDistribution && item.displayValue !== undefined
                ? item.displayValue
                : item.y;
                
              // Don't show the item value if it's a dummy
              const shouldHideValue = item.dummy;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.labelItem,
                    useColumns ? styles.columnItem : {},
                    activeChart && index === selectedSegment ? styles.selectedLabel : {},
                  ]}
                >
                  <View style={styles.labelHeader}>
                    <Text 
                      style={[styles.labelName, { color: item.color }]} 
                      numberOfLines={1}
                    >
                      {item.x}
                    </Text>
                  </View>
                  {!shouldHideValue && (
                    <View style={styles.valueRow}>
                      <Text style={styles.labelValue}>
                        ${displayAmount.toFixed(2)}
                      </Text>
                  
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 24 },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '600', color: '#2B2D42', marginBottom: 8, letterSpacing: -0.5, fontFamily: 'Montserrat-Black' },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  countBadge: { backgroundColor: '#5E60CE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  countText: { color: 'white', fontWeight: '500', fontSize: 13 },
  details: { fontSize: 14, color: '#6C757D', fontWeight: '400' },
  chartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartWrapper: { width: width * 0.5, height: width * 0.5, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  centerAmount: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  amountPrefix: { fontSize: 18, fontWeight: '600', color: '#2B2D42', marginTop: 4 },
  amountValue: { fontSize: 36, fontWeight: '700', color: '#2B2D42' },
  noneText: { fontSize: 28, fontWeight: '700', color: '#2B2D42' },
  labelContainer: { flex: 1, marginLeft: 16 },
  labelList: {},
  labelColumns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  labelItem: { marginBottom: 16 },
  columnItem: { width: '48%' },
  selectedLabel: { backgroundColor: 'rgba(94, 96, 206, 0.1)', padding: 8, borderRadius: 8 },
  labelHeader: { marginBottom: 4 },
  labelName: { fontSize: 14, fontWeight: '500', color: '#2B2D42', flex: 1 },
  valueRow: { flexDirection: 'row', paddingLeft: 0, justifyContent: 'space-between' },
  labelValue: { fontSize: 14, color: '#6C757D' },
  percentageText: { fontSize: 12, color: '#6C757D', marginLeft: 4 },
});

export default ChargesPieChart;