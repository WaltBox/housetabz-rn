import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ReviewStep({ formData, houseData }) {
  const count = houseData?.users?.length || 2;
  const totalBill = formData.isFixedService ? parseFloat(formData.monthlyAmount || 0) : 0;
  const perPerson = formData.isFixedService ? (totalBill / count).toFixed(2) : 'Varies';

  return (
    <View style={styles.container}>
      <View style={styles.reviewHeader}>
        <Text style={styles.stepTitle}>Review Your Request</Text>
        <Text style={styles.stepDescription}>
          Your roommates will be notified to accept
        </Text>
      </View>

      {/* Split Calculation */}
      {formData.isFixedService && (
        <View style={styles.splitSection}>
          <View style={styles.splitHeader}>
            <MaterialIcons name="pie-chart" size={24} color="#34d399" />
            <Text style={styles.splitHeaderText}>Split Calculation</Text>
          </View>
          
          <View style={styles.splitMainAmount}>
            <Text style={styles.splitMainLabel}>Total Monthly Bill</Text>
            <Text style={styles.splitMainValue}>${formData.monthlyAmount}</Text>
          </View>

          <View style={styles.splitDivider}>
            <View style={styles.splitDividerLine} />
            <View style={styles.splitDividerCircle}>
              <Text style={styles.splitDividerText}>{count}</Text>
            </View>
            <View style={styles.splitDividerLine} />
          </View>

          <View style={styles.splitResult}>
            <Text style={styles.splitResultLabel}>Each person pays</Text>
            <Text style={styles.splitResultValue}>${perPerson}</Text>
            <Text style={styles.splitResultSubtext}>per month</Text>
          </View>

          {/* Service Details - Minimal */}
          <View style={styles.serviceDetailsMinimal}>
            <View style={styles.detailRowMinimal}>
              <Text style={styles.detailLabelMinimal}>Provider:</Text>
              <Text style={styles.detailValueMinimal}>{formData.serviceName || 'Not specified'}</Text>
            </View>
            <View style={styles.detailRowMinimal}>
              <Text style={styles.detailLabelMinimal}>Account:</Text>
              <Text style={styles.detailValueMinimal}>{formData.accountNumber || 'Not specified'}</Text>
            </View>
            <View style={styles.detailRowMinimal}>
              <Text style={styles.detailLabelMinimal}>Due Day:</Text>
              <Text style={styles.detailValueMinimal}>{formData.dueDate || 'Not specified'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Upfront Payment */}
      {parseFloat(formData.requiredUpfrontPayment) > 0 && (
        <View style={styles.upfrontSection}>
          <MaterialIcons name="payment" size={24} color="#f59e0b" />
          <View style={styles.upfrontContent}>
            <Text style={styles.upfrontLabel}>Upfront Payment Required</Text>
            <Text style={styles.upfrontAmount}>${formData.requiredUpfrontPayment}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  
  // Header
  reviewHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },

  // Split Calculation
  splitSection: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  splitHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },
  splitMainAmount: {
    alignItems: 'center',
    marginBottom: 12,
  },
  splitMainLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  splitMainValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  splitDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  splitDividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(52, 211, 153, 0.3)',
  },
  splitDividerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  splitDividerText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  splitResult: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  splitResultLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  splitResultValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34d399',
    marginBottom: 2,
  },
  splitResultSubtext: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },

  // Minimal Service Details
  serviceDetailsMinimal: {
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderRadius: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.2)',
  },
  detailRowMinimal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabelMinimal: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValueMinimal: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '700',
  },

  // Upfront Payment
  upfrontSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  upfrontContent: {
    marginLeft: 12,
    flex: 1,
  },
  upfrontLabel: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    marginBottom: 2,
  },
  upfrontAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f59e0b',
  },
});

