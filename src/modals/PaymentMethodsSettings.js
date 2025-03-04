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
  BackHandler
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../context/AuthContext';
import ModalComponent from '../components/ModalComponent';
import axios from 'axios';

const API_URL = 'http://localhost:3004';

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
      const response = await axios.get(`${API_URL}/api/payment-methods`);
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
      const setupResponse = await axios.post(
        `${API_URL}/api/payment-methods/setup-intent`,
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
      await axios.post(`${API_URL}/api/payment-methods/complete`, { setupIntentId });
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
      await axios.put(`${API_URL}/api/payment-methods/${methodId}/default`);
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
              await axios.delete(`${API_URL}/api/payment-methods/${methodId}`);
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

  const renderPaymentMethod = (method) => (
    <View key={method.id} style={styles.methodCard}>
      <View style={styles.methodLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons 
            name={method.type === 'bank' ? 'account-balance' : 'credit-card'} 
            size={20} 
            color="#34d399" 
          />
        </View>
        <View>
          <Text style={styles.methodTitle}>
            {method.type === 'bank'
              ? method.name
              : `${method.brand?.toUpperCase()} •••• ${method.last4}`}
          </Text>
          {method.type === 'card' && (
            <Text style={styles.methodSubtitle}>
              Expires {String(method.expiryMonth).padStart(2, '0')}/{String(method.expiryYear).slice(-2)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.methodRight}>
        {method.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetDefault(method.id)}
            disabled={processing}
          >
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={() => handleDelete(method.id)}
          style={styles.deleteButton}
          disabled={processing}
        >
          <MaterialIcons name="delete-outline" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const content = (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Default Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Default Payment Method</Text>
            <Text style={styles.sectionSubtitle}>Used for all transactions</Text>
          </View>
          
          {paymentMethods.length > 0 ? (
            paymentMethods.some(method => method.isDefault) ? 
              paymentMethods.map(method => method.isDefault && renderPaymentMethod(method)) :
              <View style={styles.emptyState}>
                <MaterialIcons name="payment" size={40} color="#e2e8f0" />
                <Text style={styles.emptyText}>No default method set</Text>
              </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="payment" size={40} color="#e2e8f0" />
              <Text style={styles.emptyText}>No default method set</Text>
            </View>
          )}
        </View>

        {/* Other Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
            <Text style={styles.sectionSubtitle}>Manage your payment options</Text>
          </View>
          
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="credit-card-off" size={40} color="#e2e8f0" />
              <Text style={styles.emptyText}>No payment methods found</Text>
              <Text style={styles.emptySubtext}>Add a payment method to get started</Text>
            </View>
          ) : (
            paymentMethods.filter(method => !method.isDefault).length > 0 ? 
              paymentMethods.map(method => !method.isDefault && renderPaymentMethod(method)) :
              <View style={styles.emptyState}>
                <MaterialIcons name="credit-card-off" size={40} color="#e2e8f0" />
                <Text style={styles.emptyText}>No additional methods</Text>
              </View>
          )}
        </View>
        
        {/* Footer space for floating button */}
        <View style={styles.footerSpace} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={[styles.addButton, (loading || processing) && styles.addButtonDisabled]}
        onPress={handleAddPaymentMethod}
        disabled={loading || processing}
        activeOpacity={0.8}
      >
        {processing ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </>
        )}
      </TouchableOpacity>
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
    backgroundColor: "#dff6f0",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 100,
    backgroundColor: "#dff6f0",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#dff6f0",
  },
  sectionHeader: {
    marginBottom: 16,
    backgroundColor: "#dff6f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    gap: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  actionButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  defaultText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#34d399',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  footerSpace: {
    height: 80,
  }
});

export default PaymentMethodsSettings;
