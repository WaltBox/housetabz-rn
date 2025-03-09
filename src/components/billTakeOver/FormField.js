import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FormField = ({
  field,
  label,
  value,
  placeholder,
  icon,
  keyboardType = 'default',
  prefix,
  maxLength,
  onChange,
  onNext,
  isLast = false
}) => {
  // Determine if the Next button should be enabled
  const isNextEnabled = value.trim().length > 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <MaterialIcons name={icon} size={24} color="#34d399" style={styles.labelIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        {prefix && (
          <Text style={styles.prefix}>{prefix}</Text>
        )}
        <TextInput
          style={[
            styles.input,
            prefix && styles.inputWithPrefix
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={field === 'serviceName' ? 'words' : 'none'}
          returnKeyType={isLast ? 'done' : 'next'}
          onSubmitEditing={isNextEnabled ? onNext : null}
        />
      </View>
      
      <TouchableOpacity
        style={[
          styles.nextButton,
          !isNextEnabled && styles.nextButtonDisabled
        ]}
        onPress={onNext}
        disabled={!isNextEnabled}
      >
        <MaterialIcons 
          name="arrow-forward" 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
      
      <Text style={styles.helperText}>
        {isNextEnabled 
          ? isLast 
            ? "Press to review" 
            : "Press to continue" 
          : "Please enter information to continue"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  labelIcon: {
    marginRight: 12,
  },
  label: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    flexShrink: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  prefix: {
    fontSize: 22,
    color: '#1e293b',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '500',
    color: '#1e293b',
    paddingVertical: 12,
  },
  inputWithPrefix: {
    marginLeft: 8,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  }
});

export default FormField;