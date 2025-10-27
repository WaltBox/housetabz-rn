import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

// Components
import ModalComponent from '../components/ModalComponent';
import BillTakeoverIntro from '../components/billTakeOver/BillTakeoverIntro';
import BillTakeoverForm from '../components/billTakeOver/BillTakeoverForm';

const BillTakeoverModal = ({ visible, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  
  const handleStartSubmission = () => {
    setShowForm(true);
  };
  
  const handleGoBack = () => {
    setShowForm(false);
  };

  const handleSuccess = () => {
    // Close the entire modal after successful submission
    setShowForm(false);
    onClose();
  };

  return (
    <ModalComponent
      visible={visible}
      title="Bill Takeover"
      onClose={onClose}
      backgroundColor="#dff6f0"
      fullScreen={true}
      hideCloseButton={false}
      useBackArrow={true}
    >
      <View style={styles.content}>
        {!showForm ? (
          <BillTakeoverIntro onSubmit={handleStartSubmission} />
        ) : (
          <BillTakeoverForm onBack={handleGoBack} onSuccess={handleSuccess} />
        )}
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 }
});

export default BillTakeoverModal;