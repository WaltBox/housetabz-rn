import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';

const ViewForm = ({ route }) => {
  const { partnerId } = route.params;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({}); // Store user inputs for the form

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`https://d96e-2605-a601-a0c6-4f00-c98b-de38-daaa-fde7.ngrok-free.app/api/partners/${partnerId}/forms`);
        const fetchedForm = response.data[0]; // Assuming the partner has only one form
        setForm(fetchedForm);

        // Initialize form data state with empty values
        const initialData = {};
        fetchedForm.parameters.forEach((param) => {
          if (param.type === 'dropdown') {
            initialData[param.name] = param.choices.split(',')[0]; // Default to the first choice
          } else {
            initialData[param.name] = '';
          }
        });
        setFormData(initialData);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [partnerId]);

  const handleInputChange = (paramName, value) => {
    setFormData((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleSubmit = () => {
    console.log('Submitted Data:', formData);
    // Add submission logic here (e.g., POST to the backend API)
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#22c55e" style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Form Name */}
      <Text style={styles.title}>{form?.name || 'Form'}</Text>

      {/* Parameters */}
      {form?.parameters.map((param) => (
        <View key={param.id} style={styles.parameterContainer}>
          <Text style={styles.parameterLabel}>{param.name}</Text>
          {param.type === 'text' && (
            <TextInput
              style={styles.input}
              placeholder={`Enter ${param.name}`}
              value={formData[param.name]}
              onChangeText={(value) => handleInputChange(param.name, value)}
            />
          )}
          {param.type === 'number' && (
            <TextInput
              style={styles.input}
              placeholder={`Enter ${param.name}`}
              value={formData[param.name]}
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange(param.name, value)}
            />
          )}
          {param.type === 'dropdown' && (
            <View style={styles.radioGroup}>
              {param.choices.split(',').map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.radioButtonContainer}
                  onPress={() => handleInputChange(param.name, choice.trim())}
                >
                  <View style={styles.radioCircle}>
                    {formData[param.name] === choice.trim() && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>{choice.trim()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Form</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  parameterContainer: {
    marginBottom: 20,
  },
  parameterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  radioGroup: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  radioLabel: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ViewForm;
