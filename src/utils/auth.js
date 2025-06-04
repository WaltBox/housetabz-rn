import { keychainHelpers } from './keychainHelpers';

export const getAuthToken = async () => {
  return await keychainHelpers.getAuthToken();
};

export const setAuthToken = async (token) => {
  return await keychainHelpers.setAuthToken(token);
};