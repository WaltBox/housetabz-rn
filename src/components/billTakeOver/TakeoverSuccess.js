import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TakeoverSuccess = ({ data, onDone }) => {
  // Debug logging to check received data
  useEffect(() => {
    console.log("TakeoverSuccess received data:", data);
  }, [data]);
  
  // Extract the relevant information from the complex data structure
  const takeoverData = data?.takeOverRequest || {};
  
  // Format currency values
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Variable';
    return `$${parseFloat(value).toFixed(2)}`;
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="check" size={40} color="#34d399" />
          </View>
          <Text style={styles.title}>Takeover Request Submitted!</Text>
          <Text style={styles.subtitle}>Your roommates have been notified to accept!</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.detailsContainer}>
            {/* Service Name */}
            <View style={styles.detailItem}>
              <MaterialIcons name="business" size={18} color="#34d399" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailValue}>{takeoverData.serviceName || 'Not specified'}</Text>
              </View>
            </View>
            
            {/* Account Number */}
            <View style={styles.detailItem}>
              <MaterialIcons name="badge" size={18} color="#34d399" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Account</Text>
                <Text style={styles.detailValue}>{takeoverData.accountNumber || 'Not specified'}</Text>
              </View>
            </View>
            
            {/* Service Type */}
            <View style={styles.detailItem}>
              <MaterialIcons name="tune" size={18} color="#34d399" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {takeoverData.serviceType === 'fixed' ? 'Fixed Amount' : 'Variable Amount'}
                </Text>
              </View>
            </View>
            
            {/* Monthly Amount - only shown for fixed service */}
            {takeoverData.serviceType === 'fixed' && takeoverData.monthlyAmount !== undefined && (
              <View style={styles.detailItem}>
                <MaterialIcons name="attach-money" size={18} color="#34d399" style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Monthly</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(takeoverData.monthlyAmount)}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Due Date */}
            <View style={styles.detailItem}>
              <MaterialIcons name="calendar-today" size={18} color="#34d399" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>
                  {takeoverData.dueDate ? `Day ${takeoverData.dueDate}` : 'Not specified'}
                </Text>
              </View>
            </View>
            
            {/* Upfront Payment - only shown if greater than 0 */}
            {takeoverData.requiredUpfrontPayment !== undefined && parseFloat(takeoverData.requiredUpfrontPayment) > 0 && (
              <View style={styles.detailItem}>
                <MaterialIcons name="security" size={18} color="#34d399" style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Upfront</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(takeoverData.requiredUpfrontPayment)}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Number of Roommates to Notify */}
            {data.tasks && (
              <View style={styles.detailItem}>
                <MaterialIcons name="people" size={18} color="#34d399" style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Roommates Notified</Text>
                  <Text style={styles.detailValue}>
                    {data.tasks.filter(task => task.userId !== data.serviceRequestBundle?.userId).length} people
                  </Text>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <MaterialIcons name="info" size={18} color="#34d399" />
            <Text style={styles.infoText}>
              Your roommates have been notified to confirm their share of this service.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={onDone}
          >
            <Text style={styles.doneButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  detailsContainer: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241, 245, 249, 0.5)',
  },
  detailIcon: {
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
  doneButton: {
    backgroundColor: '#34d399',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  }
});

export default TakeoverSuccess;