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
  
  // Calculate the effective amounts for the user:
  const effectivePaymentAmount = task?.paymentAmount != null ? Number(task.paymentAmount) : 0;
  const effectiveMonthlyAmount = task?.monthlyAmount != null ? Number(task.monthlyAmount) : 0;
  
  // Determine if this is a variable recurring service
  const isVariableRecurring = request.serviceType === 'variable_recurring' || 
                             (task.serviceRequestBundle.type === 'variable_recurring');
  
  // Format the price differently for variable recurring
  let formattedPrice;
  
  if (isVariableRecurring) {
    // For variable recurring services, show "Pending" or "Variable" instead of "$0.00/mo"
    formattedPrice = effectiveMonthlyAmount > 0 
      ? `${Number(effectiveMonthlyAmount).toFixed(2)}/mo`
      : "Variable";
  } else if (takeOverRequest) {
    // For fixed recurring services (takeOverRequest)
    formattedPrice = effectiveMonthlyAmount > 0 
      ? `${Number(effectiveMonthlyAmount).toFixed(2)}/mo`
      : "Pending";
  } else {
    // For one-time payments
    formattedPrice = `${Number(effectivePaymentAmount).toFixed(2)}`;
  }

  const subtitle = request.partnerName || request.accountNumber ? 
    (request.partnerName ? request.partnerName : `Account: ${request.accountNumber}`) : '';

  const handleViewMore = () => onAccept(task);

  return (
    <TouchableOpacity 
      style={styles.taskCard} 
      onPress={handleViewMore}
      activeOpacity={0.7}
    >
      {/* This view creates an inset border for the whole card */}
      <View style={styles.innerBorder} pointerEvents="none" />

      {/* Card Content */}
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

      <View style={styles.footerRow}>
        {/* Wrapper to create an inset border effect around the price pill */}
        <View style={styles.priceWrapper}>
          <View style={styles.priceInnerBorder}>
            <LinearGradient
              colors={['#22c55e', '#34d399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pricePill}
            >
              {isVariableRecurring && effectiveMonthlyAmount === 0 ? (
                <Text style={styles.pricePillText}>{formattedPrice}</Text>
              ) : (
                <>
                  {(effectivePaymentAmount > 0 || effectiveMonthlyAmount > 0) && (
                    <Text style={styles.priceCurrency}>$</Text>
                  )}
                  <Text style={styles.pricePillText}>{formattedPrice}</Text>
                </>
              )}
            </LinearGradient>
          </View>
        </View>
        
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

    position: 'relative'
  },
  // Inset border for the whole card
  innerBorder: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#dff6f0',
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
  // Wrapper for the price area to create an inset effect
  priceWrapper: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 26,
  },
  // Inner border around the price pill (the "line" effect)
  priceInnerBorder: {
    borderWidth: 1,
    borderColor: '#dff6f0',
    borderRadius: 22,
  },
  pricePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
   
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