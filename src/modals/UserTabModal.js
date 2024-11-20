import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserTabModal = ({ user }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Tab</Text>
      <Text style={styles.info}>Welcome, {user.username}!</Text>
      <Text style={styles.info}>Your current balance: ${user.balance}</Text>
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
});

export default UserTabModal;
