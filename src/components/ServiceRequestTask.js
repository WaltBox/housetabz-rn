import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const getServiceIcon = (serviceType) => {
  switch (serviceType?.toLowerCase()) {
    case 'cleaning': return 'cleaning-services';
    case 'energy': return 'electric-bolt';
    case 'internet': return 'wifi';
    case 'water': return 'water-drop';
    default: return 'home';
  }
};

const ServiceRequestTask = ({ task, onAccept }) => {
  const { stagedRequest, takeOverRequest } = task.serviceRequestBundle || {};
  
  if (!task.serviceRequestBundle) return null;
  
  const request = stagedRequest || takeOverRequest;
  if (!request) return null;
  
  const iconName = getServiceIcon(request.serviceType);
  const amount = takeOverRequest ? request.monthlyAmount : task.paymentAmount;
  const formattedPrice = `${Number(amount).toFixed(2)}${takeOverRequest ? '/mo' : ''}`;
  const subtitle = request.partnerName || request.accountNumber ? 
    (request.partnerName ? request.partnerName : `Account: ${request.accountNumber}`) : '';

  const handleViewMore = () => onAccept(task);

  return (
    <TouchableOpacity 
      style={styles.taskCard} 
      onPress={handleViewMore}
      activeOpacity={0.7}
    >
      {/* Header with Icon and Service Type/Name */}
      <View style={styles.header}>
        <View style={styles.iconOuterContainer}>
          <LinearGradient
            colors={['#dcfce7', '#f0fdf4']}
            style={styles.iconContainer}
          >
            <MaterialIcons 
              name={iconName}
              size={24} 
              color="#22c55e" 
            />
          </LinearGradient>
        </View>
        <View style={styles.headerContent}>
          {subtitle !== '' && <Text style={styles.providerName}>{subtitle}</Text>}
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {request.serviceName}
          </Text>
          <Text style={styles.serviceType}>
            {request.serviceType || "Service"}
          </Text>
        </View>
      </View>

      {/* Price and View More on the same row */}
      <View style={styles.footerRow}>
        <LinearGradient
          colors={['#22c55e', '#34d399']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pricePill}
        >
          <Text style={styles.priceCurrency}>$</Text>
          <Text style={styles.pricePillText}>{formattedPrice}</Text>
        </LinearGradient>
        
        <TouchableOpacity 
          style={styles.viewMoreContainer}
          onPress={handleViewMore}
        >
          <Text style={styles.viewMoreText}>View more</Text>
          <MaterialIcons name="arrow-forward-ios" size={14} color="#4f46e5" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 18,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconOuterContainer: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 28,
    marginRight: 16,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
  },
  serviceType: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  pricePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginRight: 1,
  },
  pricePillText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f5f3ff',
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4f46e5',
  },
  arrowIcon: {
    marginLeft: 4,
  }
});

export default ServiceRequestTask;