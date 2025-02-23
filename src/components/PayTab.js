import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FIXED_HEADER_HEIGHT = 240; // adjust as needed

const PayTab = ({
  charges,
  totalCharges,
  selectedCharges,
  handlePayAllCharges,
  handlePaySelectedCharges,
  handleChargeSelectToggle,
  categorizeCharges,
}) => {
  const { late, upcoming, other } = categorizeCharges(charges);

  const renderChargeSection = (title, chargesGroup, color) => {
    if (chargesGroup.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: color }]} />
        </View>
        {chargesGroup.map((charge) => (
          <View
            key={charge.id}
            style={[styles.chargeCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
          >
            <View style={styles.chargeHeader}>
              <MaterialIcons
                name={charge.metadata?.icon || 'error-outline'}
                size={20}
                color={color}
                style={styles.icon}
              />
              <View style={styles.chargeTextContainer}>
                <Text style={styles.chargeTitle}>{charge.name}</Text>
                <Text style={styles.chargeSubtitle}>
                  {charge.status === 'late'
                    ? `${charge.daysLate} days overdue`
                    : `Due in ${charge.daysUntilDue} days`}
                </Text>
              </View>
            </View>
            <View style={styles.chargeDetails}>
              <Text style={styles.chargeAmount}>${Number(charge.amount).toFixed(2)}</Text>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: selectedCharges.includes(charge.id) ? '#34d399' : color },
                ]}
                onPress={() => handleChargeSelectToggle(charge)}
              >
                <Text style={styles.payButtonText}>
                  {selectedCharges.includes(charge.id) ? 'Selected' : 'Select to pay'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const selectedTotal = charges
    .filter((charge) => selectedCharges.includes(charge.id))
    .reduce((sum, charge) => sum + parseFloat(charge.amount), 0);
  const amountStyle = selectedCharges.length > 0 ? styles.balanceAmountSmall : styles.balanceAmount;

  const renderFixedPayHeader = () => (
    <View style={styles.fixedPayWrapper}>
      <View style={styles.fixedPayContainer}>
        {selectedCharges.length === 0 ? (
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceTitle}>Total Amount Due</Text>
              <MaterialIcons name="info-outline" size={18} color="#64748b" />
            </View>
            <Text style={amountStyle}>${totalCharges.toFixed(2)}</Text>
            <TouchableOpacity style={styles.payAllButton} onPress={handlePayAllCharges}>
              <Text style={styles.payAllButtonText}>Pay All Outstanding Balance</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.balanceRow}>
            <View style={[styles.balanceCard, styles.halfBalanceCard]}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceTitle}>Total{'\n'}Due</Text>
                <MaterialIcons name="info-outline" size={18} color="#64748b" />
              </View>
              <Text style={amountStyle}>${totalCharges.toFixed(2)}</Text>
              <TouchableOpacity style={styles.payAllButton} onPress={handlePayAllCharges}>
                <Text style={styles.payAllButtonText}>Pay All</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.balanceCard, styles.halfBalanceCard]}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceTitle}>Selected Charges</Text>
                <MaterialIcons name="check-circle-outline" size={18} color="#34d399" />
              </View>
              <Text style={amountStyle}>${selectedTotal.toFixed(2)}</Text>
              <TouchableOpacity
                style={[styles.payAllButton, { backgroundColor: '#34d399' }]}
                onPress={handlePaySelectedCharges}
              >
                <Text style={styles.payAllButtonText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderFixedPayHeader()}
      <ScrollView
        style={[styles.tabContent, { marginTop: FIXED_HEADER_HEIGHT }]}
        showsVerticalScrollIndicator={false}
      >
        {renderChargeSection('Late Payments', late, '#ef4444')}
        {renderChargeSection('Upcoming Payments', upcoming, '#eab308')}
        {renderChargeSection('Other Charges', other, '#34d399')}
        {charges.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="check-circle" size={40} color="#34d399" />
            <Text style={styles.emptyStateTitle}>All payments complete!</Text>
            <Text style={styles.emptyStateText}>No outstanding charges found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  fixedPayWrapper: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  fixedPayContainer: {
    backgroundColor: '#dff6f0',
    paddingVertical: 8,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBalanceCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#1e293b',
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 16,
  },
  balanceAmountSmall: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
  },
  payAllButton: {
    backgroundColor: '#34d399',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 8,
    borderLeftWidth: 4,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chargeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  chargeTextContainer: {
    flex: 1,
  },
  chargeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  chargeSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  chargeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  payButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginVertical: 8,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PayTab;
