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

const PaymentMethodsSettings = ({ visible = false, onClose }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
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
      setPaymentMethods(response.data.paymentMethods || []);
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
      await fetchPaymentMethods();
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
      
      await apiClient.put(`/api/payment-methods/${methodId}/default`);
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
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

  // Uber-style payment method card
  const renderPaymentMethod = (method) => (
    <TouchableOpacity 
      key={method.id} 
      style={styles.methodCard}
      onPress={() => handleSetDefault(method.id)}
      disabled={processing || method.isDefault}
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
        {method.isDefault && (
          <Text style={styles.defaultText}>Default</Text>
        )}
        <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
      </View>
    </TouchableOpacity>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    width: '100%',
    backgroundColor: '#dff6f0',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  // Style for empty payment method text
  emptyMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  defaultText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
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
    elevation: 2,
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
  }
});

export default PaymentMethodsSettings;