import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ServiceTypeSelector = ({ isFixedService, onToggle, onNext }) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <MaterialIcons name="tune" size={22} color="#34d399" />
        <Text style={styles.label}>Service Type</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.option, isFixedService && styles.optionSelected]}
          onPress={() => onToggle(true)}
        >
          <View style={styles.optionCircle}>
            <MaterialIcons 
              name={isFixedService ? "radio-button-checked" : "radio-button-unchecked"} 
              size={22} 
              color={isFixedService ? "#34d399" : "#94a3b8"} 
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, isFixedService && styles.optionTitleSelected]}>
              Fixed Amount
            </Text>
            <Text style={styles.optionDescription}>
              Same amount each month (e.g. Netflix, Internet)
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, !isFixedService && styles.optionSelected]}
          onPress={() => onToggle(false)}
        >
          <View style={styles.optionCircle}>
            <MaterialIcons 
              name={!isFixedService ? "radio-button-checked" : "radio-button-unchecked"} 
              size={22} 
              color={!isFixedService ? "#34d399" : "#94a3b8"} 
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, !isFixedService && styles.optionTitleSelected]}>
              Variable Amount
            </Text>
            <Text style={styles.optionDescription}>
              Changes each month (e.g. Electric, Water)
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <MaterialIcons name="arrow-forward" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: '#34d399',
    backgroundColor: '#f0fdf4',
  },
  optionCircle: {
    marginRight: 12,
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#0f766e',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  nextButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
});

export default ServiceTypeSelector;