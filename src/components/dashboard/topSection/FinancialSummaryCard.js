// FinancialSummaryCard.js - Premium Klarna-inspired design
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FinancialSummaryCard = ({ 
  title, 
  balance, 
  iconName, 
  onPress, 
  statusText = "Available",
  isNegative = false
}) => {
  return (
    <TouchableOpacity 
      style={[styles.card, isNegative && styles.negativeCard]} 
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Header with icon */}
      <View style={styles.header}>
        <View style={[styles.iconWrapper, isNegative && styles.negativeIconWrapper]}>
          <MaterialIcons 
            name={iconName} 
            size={24} 
            color={isNegative ? '#ef4444' : '#34d399'} 
          />
        </View>
        <View style={styles.chevronWrapper}>
          <MaterialIcons 
            name="chevron-right" 
            size={18} 
            color="#94a3b8" 
          />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {title}
      </Text>
      
      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.currency}>$</Text>
        <Text style={[styles.balance, isNegative && styles.negativeBalance]}>
          {balance}
        </Text>
      </View>

      {/* Enhanced background pattern with decorative shapes */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternDot, styles.dot1]} />
        <View style={[styles.patternDot, styles.dot2]} />
        <View style={[styles.patternDot, styles.dot3]} />
        
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  negativeCard: {
    backgroundColor: '#fefefe',
    borderColor: '#fee2e2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34d399',
    shadowColor: '#34d399',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    // Create moon-like crescent effect
    position: 'relative',
    overflow: 'visible',
  },
  negativeIconWrapper: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  chevronWrapper: {
    opacity: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 2,
    marginBottom: 2,
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -1,
    fontFamily: 'System', // Use system font for better number display
  },
  negativeBalance: {
    color: '#dc2626',
  },
  status: {
    fontSize: 13,
    fontWeight: '500',
    color: '#34d399',
    marginTop: 4,
  },
  negativeStatus: {
    color: '#ef4444',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  patternDot: {
    position: 'absolute',
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
    borderRadius: 50,
  },
  dot1: {
    width: 60,
    height: 60,
    top: -10,
    right: -20,
  },
  dot2: {
    width: 30,
    height: 30,
    bottom: 20,
    right: 10,
  },
  dot3: {
    width: 20,
    height: 20,
    top: 40,
    right: 5,
  },
});

export default FinancialSummaryCard;