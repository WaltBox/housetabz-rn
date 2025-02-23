import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MethodsTab = ({ defaultMethod, paymentMethods }) => {
  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.defaultMethodHeader}>
          <Text style={styles.sectionTitle}>Default Payment Method</Text>
          <Text style={styles.defaultMethodNote}>Used for pledges & autopay</Text>
        </View>
        {defaultMethod ? (
          <View style={styles.defaultMethodCard}>
            <MaterialIcons
              name={defaultMethod.type === 'card' ? 'credit-card' : 'account-balance'}
              size={20}
              color="#34d399"
              style={styles.icon}
            />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>
                {defaultMethod.type === 'card'
                  ? `${defaultMethod.brand} •••• ${defaultMethod.last4}`
                  : `Bank Account •••• ${defaultMethod.last4}`}
              </Text>
              <Text style={styles.methodSubtitle}>Default Payment Method</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeMethodText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.defaultMethodCard}>
            <Text style={styles.methodSubtitle}>No default payment method set</Text>
          </View>
        )}
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Payment Methods</Text>
        </View>
        <TouchableOpacity style={styles.addMethodCard}>
          <View style={styles.addMethodContent}>
            <MaterialIcons name="add-circle-outline" size={24} color="#34d399" />
            <Text style={styles.addMethodText}>Add New Payment Method</Text>
          </View>
        </TouchableOpacity>
        {paymentMethods
          .filter((method) => !method.isDefault)
          .map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <MaterialIcons
                name={method.type === 'card' ? 'credit-card' : 'account-balance'}
                size={20}
                color="#34d399"
                style={styles.icon}
              />
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>
                  {method.type === 'card'
                    ? `${method.brand} •••• ${method.last4}`
                    : `Bank Account •••• ${method.last4}`}
                </Text>
                {method.type === 'card' && (
                  <Text style={styles.methodSubtitle}>
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Text>
                )}
              </View>
              <TouchableOpacity>
                <MaterialIcons name="more-vert" size={20} color="#34d399" style={styles.icon} />
              </TouchableOpacity>
            </View>
          ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  defaultMethodHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  defaultMethodNote: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  defaultMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  changeMethodText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addMethodText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#34d399',
    marginLeft: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

export default MethodsTab;
