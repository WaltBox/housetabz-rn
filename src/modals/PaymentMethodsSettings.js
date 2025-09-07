import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  BackHandler,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../context/AuthContext';
import ModalComponent from '../components/ModalComponent';
import apiClient from '../config/api';

const { width } = Dimensions.get('window');

const PaymentMethodsSettings = ({ visible = false, onClose, onPaymentMethodsUpdated }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, refreshPaymentMethods } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [localVisible, setLocalVisible] = useState(visible);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        console.log('Hardware back button pressed - closing modal');
        handleClose();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [visible]);

  // Sync local visible state with prop
  useEffect(() => {
    setLocalVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (user?.id && visible) {
      fetchPaymentMethods();
    }
  }, [user?.id, visible]);

  const fetchPaymentMethods = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to view payment methods');
        return;
      }
      setLoading(true);
      const response = await apiClient.get('/api/payment-methods');
      const methods = response.data.paymentMethods || [];
      setPaymentMethods(methods);
      console.log('✅ Fetched payment methods:', methods.map(m => ({ id: m.id, isDefault: m.isDefault, last4: m.last4 })));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('handleClose called - attempting to close modal');
    setLocalVisible(false);
    setTimeout(() => {
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 50);
  };

  const handleAddPaymentMethod = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to add a payment method');
        return;
      }
      setProcessing(true);
      setLoading(true);
      
      const setupResponse = await apiClient.post(
        '/api/payment-methods/setup-intent',
        {}
      );
      
      const { clientSecret, setupIntentId } = setupResponse.data;
      if (!clientSecret || !setupIntentId) {
        throw new Error('No client secret or setupIntentId received');
      }
      
      const initResponse = await initPaymentSheet({
        merchantDisplayName: 'HouseTabz',
        setupIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        appearance: { colors: { primary: '#34d399' } },
      });
      
      if (initResponse.error) {
        Alert.alert('Error', initResponse.error.message);
        return;
      }
      
      const presentResponse = await presentPaymentSheet();
      if (presentResponse.error) {
        if (presentResponse.error.code === 'Canceled') return;
        Alert.alert('Error', presentResponse.error.message);
        return;
      }
      
      await apiClient.post('/api/payment-methods/complete', { setupIntentId });
      Alert.alert('Success', 'Payment method added successfully');
      
      // Refresh payment methods and notify parent components
      await fetchPaymentMethods();
      if (refreshPaymentMethods) {
        await refreshPaymentMethods();
      }
      if (onPaymentMethodsUpdated) {
        onPaymentMethodsUpdated();
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add payment method. Please try again.'
      );
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      if (!user) return;
      setProcessing(true);
      
      console.log('🔄 Setting payment method as default:', methodId);
      
      // Call the backend API to set the default
      await apiClient.put(`/api/payment-methods/${methodId}/default`);
      console.log('✅ Backend API call successful');
      
      // Update local state immediately to reflect the change
      // Only the selected method should have isDefault: true, all others should be false
      setPaymentMethods(prev => {
        const updated = prev.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }));
        console.log('🔄 Updated local state:', updated.map(m => ({ id: m.id, isDefault: m.isDefault })));
        return updated;
      });
      
      // Refresh from server to ensure consistency
      await fetchPaymentMethods();
      
      // Update the auth context payment methods status
      if (refreshPaymentMethods) {
        await refreshPaymentMethods();
      }
      
      // Notify parent components that payment methods have been updated
      if (onPaymentMethodsUpdated) {
        console.log('🔔 Notifying parent components of payment method update');
        onPaymentMethodsUpdated();
      }
      
      Alert.alert('Success', 'Default payment method updated successfully');
      
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
      
      // Revert local state on error
      await fetchPaymentMethods();
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (methodId) => {
    if (!user) return;
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              
              await apiClient.delete(`/api/payment-methods/${methodId}`);
              await fetchPaymentMethods();
            } catch (error) {
              console.error('Error removing payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  // Enhanced payment method card with explicit "Set as Default" button
  const renderPaymentMethod = (method) => (
    <View 
      key={method.id} 
      style={[
        styles.methodCard,
        method.isDefault && styles.defaultMethodCard
      ]}
    >
      <View style={styles.methodLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={method.type === 'bank' ? 'account-balance' : 'credit-card'} 
            size={20} 
            color="#34d399" 
          />
        </View>
        <Text style={styles.methodTitle}>
          {method.type === 'bank'
            ? method.name
            : `${method.brand?.toUpperCase()} •••• ${method.last4}`}
        </Text>
      </View>
      
      <View style={styles.methodRight}>
        {method.isDefault ? (
          <View style={styles.defaultBadge}>
            <MaterialIcons name="check-circle" size={16} color="#34d399" />
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.setDefaultButton,
              processing && styles.setDefaultButtonDisabled
            ]}
            onPress={() => handleSetDefault(method.id)}
            disabled={processing}
            activeOpacity={0.7}
          >
            <Text style={styles.setDefaultButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render empty payment method in Uber style
  const renderEmptyPaymentMethod = () => (
    <View style={styles.methodsList}>
      <View style={styles.methodCard}>
        <View style={styles.methodLeft}>
          <View style={styles.iconContainer}>
            <MaterialIcons 
              name="credit-card-off" 
              size={20} 
              color="#94a3b8" 
            />
          </View>
          <Text style={styles.emptyMethodTitle}>
            You have no payment methods on file
          </Text>
        </View>
        
   
      </View>
    </View>
  );

  const content = (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Payment Methods List */}
          {paymentMethods.length === 0 ? (
            renderEmptyPaymentMethod()
          ) : (
            <View style={styles.methodsList}>
              {paymentMethods.map(method => renderPaymentMethod(method))}
            </View>
          )}
          
          {/* Add Payment Method Button below the list */}
          <TouchableOpacity 
            style={[styles.addButton, (processing) && styles.addButtonDisabled]}
            onPress={handleAddPaymentMethod}
            disabled={processing}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={20} color="#34d399" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  return (
    <ModalComponent 
      visible={localVisible} 
      onClose={handleClose}
      title="Payment Methods"
      backgroundColor="#dff6f0"
      fullScreen={true}
      useBackArrow={true}
    >
      {content}
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  methodsList: {
    width: '100%',
    backgroundColor: '#dff6f0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    width: '100%',
    backgroundColor: '#dff6f0',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
  },
  // Style for empty payment method text
  emptyMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  defaultMethodCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#34d399',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  defaultBadgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  setDefaultButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#34d399',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  setDefaultButtonDisabled: {
    backgroundColor: '#94a3b8',
    borderColor: '#94a3b8',
  },
  setDefaultButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },

    marginLeft: 16,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#34d399',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
});

export default PaymentMethodsSettings;