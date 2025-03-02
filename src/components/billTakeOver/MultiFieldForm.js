import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MultiFieldForm = ({ 
  title,
  description,
  fields, 
  formData, 
  onFieldChange,
  onNext 
}) => {
  // Check if all required fields have values
  const areFieldsComplete = () => {
    return fields.every(field => formData[field.field] && formData[field.field].trim() !== '');
  };

  const isNextEnabled = areFieldsComplete();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="receipt-long" size={24} color="#34d399" style={styles.headerIcon} />
        <Text style={styles.headerText}>{title}</Text>
      </View>
      
      {description && (
        <Text style={styles.subHeaderText}>
          {description}
        </Text>
      )}

      {fields.map((fieldConfig, index) => (
        <View key={fieldConfig.field} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {fieldConfig.label}
          </Text>
          
          <View style={styles.inputContainer}>
            <MaterialIcons 
              name={fieldConfig.icon} 
              size={22} 
              color="#34d399" 
              style={styles.fieldIcon} 
            />
            
            {fieldConfig.prefix && (
              <Text style={styles.fieldPrefix}>{fieldConfig.prefix}</Text>
            )}
            
            <TextInput
              style={[styles.input, fieldConfig.prefix && styles.inputWithPrefix]}
              value={formData[fieldConfig.field]}
              onChangeText={(text) => onFieldChange(fieldConfig.field, text)}
              placeholder={fieldConfig.placeholder}
              placeholderTextColor="#94a3b8"
              keyboardType={fieldConfig.keyboardType || 'default'}
              maxLength={fieldConfig.maxLength}
              autoCapitalize={fieldConfig.field === 'serviceName' ? 'words' : 'none'}
              returnKeyType={index < fields.length - 1 ? 'next' : 'done'}
            />
          </View>
        </View>
      ))}
      
      <TouchableOpacity
        style={[
          styles.nextButton,
          !isNextEnabled && styles.nextButtonDisabled
        ]}
        onPress={onNext}
        disabled={!isNextEnabled}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
        <MaterialIcons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
      
      <Text style={styles.helperText}>
        {isNextEnabled 
          ? "Press to continue" 
          : "Please complete all fields to continue"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    paddingLeft: 36,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldIcon: {
    marginRight: 12,
  },
  fieldPrefix: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    paddingVertical: 12,
  },
  inputWithPrefix: {
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#34d399',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  }
});

export default MultiFieldForm;