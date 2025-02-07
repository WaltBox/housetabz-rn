import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PaymentMethodsSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    // Example data structure
    {
      id: '1',
      type: 'bank',
      last4: '4321',
      isDefault: true,
      name: 'Chase Checking'
    },
    {
      id: '2',
      type: 'card',
      last4: '5678',
      isDefault: false,
      brand: 'visa',
      expiryMonth: '12',
      expiryYear: '24'
    }
  ]);

  const handleSetDefault = (methodId) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const handleDelete = (methodId) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            setPaymentMethods(methods => 
              methods.filter(method => method.id !== methodId)
            );
          }
        }
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    // Navigate to Add Payment Method flow
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
            {method.type === 'bank' ? method.name : `${method.brand.toUpperCase()} •••• ${method.last4}`}
          </Text>
          {method.type === 'card' && (
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
        style={styles.addButton}
        onPress={handleAddPaymentMethod}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
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