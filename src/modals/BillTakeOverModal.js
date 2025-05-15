import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView
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

  return (
    <ModalComponent
      visible={visible}
      title="Bill Takeover"
      onClose={onClose}
      backgroundColor="#dff6f0"
      fullScreen={true}
      hideCloseButton={false} // Changed to false to show the back arrow
      useBackArrow={true} // Explicitly set to use back arrow
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!showForm ? (
          <BillTakeoverIntro onSubmit={handleStartSubmission} />
        ) : (
          <BillTakeoverForm onBack={handleGoBack} />
        )}
      </ScrollView>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  contentContainer: { padding: 0 }
});

export default BillTakeoverModal;