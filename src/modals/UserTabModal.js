import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const UserTabModal = ({ user }) => {
  // Filter unpaid charges
  const unpaidCharges = user.charges.filter((charge) => !charge.paid);

  const renderCharge = ({ item }) => (
    <View style={styles.chargeItem}>
      <Text style={styles.chargeDescription}>
        {item.name || 'Unknown Charge'}
      </Text>
      <Text style={styles.chargeAmount}>${item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Tab</Text>
      <Text style={styles.info}>Welcome, {user.username}!</Text>
      <Text style={styles.info}>Your current balance: ${user.balance}</Text>

      <Text style={styles.subtitle}>Unpaid Charges:</Text>
      {unpaidCharges.length > 0 ? (
        <FlatList
          data={unpaidCharges}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCharge}
          contentContainerStyle={styles.chargeList}
        />
      ) : (
        <Text style={styles.noChargesText}>No unpaid charges!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  chargeList: {
    marginTop: 10,
  },
  chargeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chargeDescription: {
    fontSize: 16,
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c', // Red for unpaid charges
  },
  noChargesText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});

export default UserTabModal;
