import React from 'react';
import BillTakeoverForm from '../components/billTakeOver/BillTakeoverForm';

const BillTakeOverScreen = ({ navigation }) => {
  return <BillTakeoverForm onBack={() => navigation.goBack()} />;
};

export default BillTakeOverScreen;