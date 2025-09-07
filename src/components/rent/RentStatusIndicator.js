import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RentStatusIndicator = ({ status, size = 'medium', showText = true }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: '#10b981',
          backgroundColor: '#ecfdf5',
          icon: 'check-circle',
          text: 'Approved'
        };
      case 'pending':
        return {
          color: '#f59e0b',
          backgroundColor: '#fffbeb',
          icon: 'schedule',
          text: 'Pending'
        };
      case 'declined':
        return {
          color: '#ef4444',
          backgroundColor: '#fef2f2',
          icon: 'cancel',
          text: 'Declined'
        };
      case 'draft':
        return {
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          icon: 'edit',
          text: 'Draft'
        };
      case 'submitted':
        return {
          color: '#3b82f6',
          backgroundColor: '#eff6ff',
          icon: 'send',
          text: 'Submitted'
        };
      default:
        return {
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          icon: 'help',
          text: 'Unknown'
        };
    }
  };

  const getSizeConfig = (size) => {
    switch (size) {
      case 'small':
        return {
          containerPadding: 6,
          iconSize: 14,
          fontSize: 12,
          borderRadius: 12
        };
      case 'large':
        return {
          containerPadding: 12,
          iconSize: 20,
          fontSize: 16,
          borderRadius: 20
        };
      case 'medium':
      default:
        return {
          containerPadding: 8,
          iconSize: 16,
          fontSize: 14,
          borderRadius: 16
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: statusConfig.backgroundColor,
        paddingHorizontal: sizeConfig.containerPadding,
        paddingVertical: sizeConfig.containerPadding / 2,
        borderRadius: sizeConfig.borderRadius,
      }
    ]}>
      <MaterialIcons 
        name={statusConfig.icon} 
        size={sizeConfig.iconSize} 
        color={statusConfig.color} 
      />
      {showText && (
        <Text style={[
          styles.text,
          {
            color: statusConfig.color,
            fontSize: sizeConfig.fontSize,
            marginLeft: showText ? 4 : 0
          }
        ]}>
          {statusConfig.text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    fontFamily: 'Quicksand-SemiBold',
  },
});

export default RentStatusIndicator;

