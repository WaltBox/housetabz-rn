import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3004';

const PaymentMethodsSettings = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPaymentMethods();
    }
  }, [user?.id]);

  const fetchPaymentMethods = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to view payment methods');
        return;
      }

      const response = await axios.get(`${API_URL}/api/payment-methods`);
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to fetch payment methods');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to add a payment method');
        return;
      }

      setLoading(true);

      // Get setupIntent client secret
      const response = await axios.post(`${API_URL}/api/payment-methods/setup-intent`);
      const { clientSecret } = response.data;

      // Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: 'HouseTabz',
        style: 'automatic',
        returnURL: 'housetabz://stripe-redirect',
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      // Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return;
        }
        Alert.alert('Error', presentError.message);
        return;
      }

      Alert.alert('Success', 'Payment method added successfully');
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      if (!user) return;

      await axios.put(`${API_URL}/api/payment-methods/${methodId}/default`);
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
    }
  };

  const handleDelete = async (methodId) => {
    if (!user) return;

    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/payment-methods/${methodId}`);
              await fetchPaymentMethods();
            } catch (error) {
              console.error('Error removing payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            }
          }
        }
      ]
    );
  };

  const renderPaymentMethod = (method) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.methodInfo}>
        <MaterialIcons 
          name={method.type === 'bank' ? 'account-balance' : 'credit-card'} 
          size={24} 
          color="#22c55e" 
        />
        <View style={styles.methodDetails}>
          <Text style={styles.methodName}>
            {method.type === 'bank' ? method.name : `${method.brand?.toUpperCase()} •••• ${method.last4}`}
          </Text>
          {method.type === 'card' && method.expiryMonth && method.expiryYear && (
            <Text style={styles.methodExpiry}>
              Expires {method.expiryMonth}/{method.expiryYear}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.methodActions}>
        {!method.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetDefault(method.id)}
          >
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(method.id)}
        >
          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          <View style={styles.methodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={handleAddPaymentMethod}
        disabled={loading}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>
          {loading ? 'Adding...' : 'Add Payment Method'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  methodsList: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  methodExpiry: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
  defaultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
  },
  defaultText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#22c55e',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    backgroundColor: '#22c55e',
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default PaymentMethodsSettings;