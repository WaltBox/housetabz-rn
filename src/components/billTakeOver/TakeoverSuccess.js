import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const BUTTON_HEIGHT = 90;

const TakeoverSuccess = ({ data, onDone }) => {
  useEffect(() => {
    console.log("TakeoverSuccess received data:", data);
  }, [data]);
  
  const takeoverData = data?.takeOverRequest || {};
  
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Variable';
    return `$${parseFloat(value).toFixed(2)}`;
  };
  
  const getRoommatesNotifiedCount = () => {
    if (!Array.isArray(data.tasks) || !data.serviceRequestBundle) {
      return 0;
    }
    return data.tasks.filter(task => task.userId !== data.serviceRequestBundle.userId).length;
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      
      <View style={styles.rootContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.scrollContent}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="check" size={32} color="#34d399" />
              </View>
              <Text style={styles.title}>Request Submitted!</Text>
              <Text style={styles.subtitle}>Your roommates have been notified</Text>
            </View>
            
            {/* Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Provider:</Text>
                <Text style={styles.detailValue}>{takeoverData.serviceName || 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Account:</Text>
                <Text style={styles.detailValue}>{takeoverData.accountNumber || 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>
                  {takeoverData.dueDate ? `Day ${takeoverData.dueDate}` : 'Not specified'}
                </Text>
              </View>
              
              {takeoverData.serviceType === 'fixed' && takeoverData.monthlyAmount !== undefined && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Monthly:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(takeoverData.monthlyAmount)}</Text>
                </View>
              )}
              
              {Array.isArray(data.tasks) && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Notified:</Text>
                  <Text style={styles.detailValue}>{getRoommatesNotifiedCount()} people</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Fixed Button at Bottom */}
        <View style={styles.buttonFooter}>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={onDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Back to Dashboard</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
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
  rootContainer: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  scrollContent: {
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '700',
  },
  buttonFooter: {
    backgroundColor: '#dff6f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  doneButton: {
    backgroundColor: '#34d399',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  }
});

export default TakeoverSuccess;