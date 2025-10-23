import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  TextInput,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient, { invalidateCache, clearUserCache, clearHouseCache } from '../../config/api';

import TakeoverSuccess from './TakeoverSuccess';

const { width } = Dimensions.get('window');

/** 
 * Stable FormField component so it doesn’t get re‑declared on every render.
 */
function FormField({ label, field, prefix, keyboardType, placeholder, value, onChange }) {
  const handleChangeText = (text) => {
    onChange(field, text);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
        <TextInput
          style={[styles.textInput, prefix && styles.textInputWithPrefix]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={handleChangeText}
          keyboardType={keyboardType || 'default'}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

/** 
 * Stable ServiceTypeToggle component.
 */
function ServiceTypeToggle({ isFixed, onToggle }) {
  const handleToggle = (value) => {
    onToggle('isFixedService', value);
  };

  return (
    <View style={styles.fixedContainer}>
      <Text style={styles.toggleLabel}>Fixed Monthly Cost?</Text>
      <View style={styles.toggleFixedContainer}>
        <Text style={[styles.toggleOption, !isFixed && styles.toggleOptionActive]}>Variable</Text>
        <Switch
          value={isFixed}
          onValueChange={handleToggle}
          trackColor={{ false: '#D1D5DB', true: '#9FEDD7' }}
          thumbColor={isFixed ? '#34d399' : '#9CA3AF'}
          ios_backgroundColor="#D1D5DB"
          style={styles.toggle}
        />
        <Text style={[styles.toggleOption, isFixed && styles.toggleOptionActive]}>Fixed</Text>
      </View>
      <Text style={styles.toggleFixedDescription}>
        {isFixed
          ? 'The bill is the same amount each month'
          : 'The bill amount varies from month to month'}
      </Text>
    </View>
  );
}

export default function BillTakeoverForm({ onBack }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [houseData, setHouseData] = useState(null);

  useEffect(() => {
    async function fetchHouseData() {
      try {
        if (user?.houseId) {
          const { data } = await apiClient.get(`/api/houses/${user.houseId}`);
          setHouseData(data);
        }
      } catch (err) {
        console.error('Error fetching house data:', err);
      }
    }
    fetchHouseData();
  }, [user]);

  const [formData, setFormData] = useState({
    serviceName: '',
    accountNumber: '',
    monthlyAmount: '',
    dueDate: '',
    requiredUpfrontPayment: '0',
    isFixedService: true,
  });

  function handleFieldChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function goToNextStep() {
    setCurrentStep(step => step + 1);
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        userId: user.id,
        monthlyAmount: formData.isFixedService ? parseFloat(formData.monthlyAmount) : null,
        dueDate: parseInt(formData.dueDate, 10),
        requiredUpfrontPayment: parseFloat(formData.requiredUpfrontPayment) || 0,
        serviceType: formData.isFixedService ? 'fixed' : 'variable',
        bundleType: formData.isFixedService ? 'fixed_recurring' : 'variable_recurring',
      };
      const { data } = await apiClient.post('/api/take-over-requests', payload);
      
      console.log('🎉 House service created successfully:', data);
      
      // Note: HouseServicesScreen will refresh when user navigates back via focus listener
      
      setSubmittedData(data);
      setShowSuccess(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit takeover request');
    } finally {
      setLoading(false);
    }
  }

  if (showSuccess && submittedData) {
    return <TakeoverSuccess data={submittedData} onDone={onBack} />;
  }

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Bill Information</Text>
      <Text style={styles.stepDescription}>Enter details about the service provider and account</Text>
      <FormField
        label="Provider Name"
        field="serviceName"
        placeholder="AT&T, Spectrum, etc."
        value={formData.serviceName}
        onChange={handleFieldChange}
      />
      <FormField
        label="Account Number"
        field="accountNumber"
        placeholder="Account or reference number"
        value={formData.accountNumber}
        onChange={handleFieldChange}
      />
      <ServiceTypeToggle
        isFixed={formData.isFixedService}
        onToggle={handleFieldChange}
      />
      <TouchableOpacity style={styles.nextButton} onPress={goToNextStep} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Next</Text>
        <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment Details</Text>
      <Text style={styles.stepDescription}>How much is the bill and when is it due?</Text>
      {formData.isFixedService && (
        <FormField
          label="Monthly Amount"
          field="monthlyAmount"
          placeholder="0.00"
          keyboardType="decimal-pad"
          prefix="$"
          value={formData.monthlyAmount}
          onChange={handleFieldChange}
        />
      )}
      <FormField
        label="Due Date"
        field="dueDate"
        placeholder="Day of month (1-31)"
        keyboardType="number-pad"
        value={formData.dueDate}
        onChange={handleFieldChange}
      />
      <FormField
        label="Security Deposit or Setup Fee (optional)"
        field="requiredUpfrontPayment"
        placeholder="0.00"
        keyboardType="decimal-pad"
        prefix="$"
        value={formData.requiredUpfrontPayment}
        onChange={handleFieldChange}
      />
      <TouchableOpacity style={styles.nextButton} onPress={goToNextStep} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>Review</Text>
        <MaterialIcons name="done" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderSummaryStep = () => {
    const count = houseData?.users?.length || 2;
    const amount = formData.isFixedService ? parseFloat(formData.monthlyAmount || 0) : 0;
    const base = formData.isFixedService
      ? (amount / count).toFixed(2)
      : 'Varies';
    const total = formData.isFixedService
      ? ((amount / count) + 2).toFixed(2)
      : 'Varies + $2.00';

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Review Your Request</Text>
        {/* ... (rest of your summary layout stays the same) ... */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Request</Text>
              <MaterialIcons name="check" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderSummaryStep();
      default: return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.progressSteps}>
          {[0, 1, 2].map(step => (
            <View
              key={step}
              style={[styles.progressStep, currentStep >= step && styles.progressStepActive]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {renderCurrentStep()}
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dff6f0' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#dff6f0', borderBottomColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 42 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  progressSteps: { flexDirection: 'row', alignItems: 'center' },
  progressStep: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  progressStepActive: { backgroundColor: '#34d399', width: 24 },
  scrollView: { flex: 1, backgroundColor: '#dff6f0' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  stepContainer: { width: '100%', marginBottom: 20 },
  stepTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 12, fontFamily: Platform.OS === 'android' ? 'sans-serif-black' : 'Montserrat-Black' },
  stepDescription: { fontSize: 16, color: '#475569', marginBottom: 24, fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System' },
  fieldContainer: { marginBottom: 20 },
  fieldLabel: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8, fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2},
  prefixText: { fontSize: 18, color: '#64748B', marginRight: 4 },
  textInput: { flex: 1, height: 52, fontSize: 18, color: '#1e293b', fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System' },
  textInputWithPrefix: { paddingLeft: 0 },
  fixedContainer: { backgroundColor: '#dff6f0', marginBottom: 20 },
  toggleLabel: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12, fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
  toggleFixedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dff6f0', padding: 12, borderRadius: 12, marginBottom: 10},
  toggle: { marginHorizontal: 12 },
  toggleOption: { fontSize: 16, color: '#64748B', fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System' },
  toggleOptionActive: { color: '#34d399', fontWeight: '600' },
  toggleFixedDescription: { fontSize: 14, color: '#64748B', textAlign: 'center', backgroundColor: '#dff6f0', padding: 12, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2},
  nextButton: { backgroundColor: '#34d399', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 999, marginTop: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6},
  nextButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginRight: 8, fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
  submitButton: { backgroundColor: '#34d399', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6, marginTop: 16 },
  submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginRight: 8, fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
  disabledButton: { backgroundColor: '#9CA3AF', opacity: 0.7 },
  summarySection: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16, fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingVertical: 4 },
  summaryLabel: { fontSize: 15, color: '#475569' },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#1e293b', fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  detailLabel: { flex: 1, fontSize: 15, color: '#475569' },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#1e293b', fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 8 },
  totalLabel: { fontSize: 17, fontWeight: '700', color: '#1e293b', fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
  totalValue: { fontSize: 17, fontWeight: '700', color: '#34d399', fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
  upfrontNote: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 8 },
  upfrontAmount: { fontSize: 24, fontWeight: '700', color: '#34d399', textAlign: 'center', fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System' },
});
