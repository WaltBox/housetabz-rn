// src/utils/paymentUtils.js
import apiClient from '../config/api';

export const checkUserHasPaymentMethods = async () => {
  try {
    // No need to pass token - apiClient handles it automatically
    const response = await apiClient.get('/api/payment-methods');

    // Check if user has payment methods
    // Based on your backend controller, if no payment methods, it returns { message: 'You need a card on file' }
    return response.data.paymentMethods && response.data.paymentMethods.length > 0;
  } catch (error) {
    console.error('Error checking payment methods:', error);
    // If there's an error, assume they don't have payment methods to be safe
    return false;
  }
};

export const getUserPaymentMethods = async () => {
  try {
    // No need to pass token - apiClient handles it automatically
    const response = await apiClient.get('/api/payment-methods');

    if (response.data.paymentMethods) {
      return response.data.paymentMethods;
    }
    return [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
};