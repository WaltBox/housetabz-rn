import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MethodsTab = ({ defaultMethod, paymentMethods }) => {
  return (
    <View style={styles.container}>
      {/* Default Method Header */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.defaultMethodContainer}>
          {defaultMethod ? (
            <>
              <View style={styles.defaultMethodInfo}>
                <MaterialIcons
                  name={defaultMethod.type === 'card' ? 'credit-card' : 'account-balance'}
                  size={20}
                  color="#34d399"
                />
                <Text style={styles.defaultMethodText}>
                  {defaultMethod.type === 'card'
                    ? `${defaultMethod.brand} •••• ${defaultMethod.last4}`
                    : `Bank Account •••• ${defaultMethod.last4}`}
                </Text>
              </View>
              <Text style={styles.defaultLabel}>Default Method</Text>
            </>
          ) : (
            <Text style={styles.noDefaultText}>No default payment method set</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add New Method Section */}
        <TouchableOpacity style={styles.addMethodCard}>
          <MaterialIcons name="add-circle-outline" size={24} color="#34d399" />
          <Text style={styles.addMethodText}>Add New Payment Method</Text>
        </TouchableOpacity>

        {/* Other Methods Section */}
        {paymentMethods.filter(method => !method.isDefault).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Payment Methods</Text>
            {paymentMethods
              .filter(method => !method.isDefault)
              .map(method => (
                <View key={method.id} style={styles.methodItem}>
                  <View style={styles.methodHeader}>
                    <View style={styles.methodTitleContainer}>
                      <MaterialIcons
                        name={method.type === 'card' ? 'credit-card' : 'account-balance'}
                        size={18}
                        color="#64748b"
                        style={styles.icon}
                      />
                      <View>
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
                    </View>
                    <TouchableOpacity style={styles.methodActions}>
                      <Text style={styles.setDefaultText}>Set Default</Text>
                      <MaterialIcons name="more-vert" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        )}
        
        {/* Info Section */}
        <View style={styles.infoSection}>
          <MaterialIcons name="info-outline" size={18} color="#64748b" />
          <Text style={styles.infoText}>
            Your default payment method will be used for recurring payments and pledges
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  headerCard: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 16,
  },
  defaultMethodContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  defaultMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  defaultMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  defaultLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  noDefaultText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  addMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addMethodText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#34d399',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  methodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '500',
    marginRight: 12,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});

export default MethodsTab;