import apiClient from '../config/api';

/**
 * Rent Allocation API Service
 * Handles all rent allocation request and proposal related API calls
 */

// Get rent allocation request for a house
export const getRentAllocationRequest = async (houseId) => {
  try {
    const response = await apiClient.get(`/api/houses/${houseId}/rent-allocation-request`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No active request
    }
    throw error;
  }
};

// Note: claimRentAllocationRequest has been removed - users now go directly to proposal creation

// Get active rent proposal for a house
export const getActiveRentProposal = async (houseId) => {
  try {
    const response = await apiClient.get(`/api/houses/${houseId}/rent-proposals/active`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No active proposal
    }
    throw error;
  }
};

// Create new rent proposal
export const createRentProposal = async (houseId, proposalData) => {
  const response = await apiClient.post(`/api/houses/${houseId}/rent-proposals`, proposalData);
  return response.data;
};

// Get rent proposal history for a house
export const getRentProposalHistory = async (houseId) => {
  const response = await apiClient.get(`/api/houses/${houseId}/rent-proposals`);
  return response.data;
};

// Submit draft proposal for approval
export const submitRentProposal = async (proposalId) => {
  const response = await apiClient.post(`/api/rent-proposals/${proposalId}/submit`);
  return response.data;
};

// Delete draft proposal
export const deleteRentProposal = async (proposalId) => {
  const response = await apiClient.delete(`/api/rent-proposals/${proposalId}`);
  return response.data;
};

// Get user's pending rent approvals
export const getPendingRentApprovals = async () => {
  const response = await apiClient.get('/api/users/me/pending-rent-approvals');
  return response.data;
};

// Get proposal details for approval
export const getRentProposalForApproval = async (proposalId) => {
  const response = await apiClient.get(`/api/rent-proposals/${proposalId}/approval`);
  return response.data;
};

// Approve rent proposal
export const approveRentProposal = async (proposalId) => {
  const response = await apiClient.post(`/api/rent-proposals/${proposalId}/approve`);
  return response.data;
};

// Decline rent proposal
export const declineRentProposal = async (proposalId, reason = null) => {
  const payload = reason ? { reason } : {};
  const response = await apiClient.post(`/api/rent-proposals/${proposalId}/decline`, payload);
  return response.data;
};

// Get full proposal details
export const getRentProposalDetails = async (proposalId) => {
  const response = await apiClient.get(`/api/rent-proposals/${proposalId}`);
  return response.data;
};

// Update draft proposal
export const updateRentProposal = async (proposalId, proposalData) => {
  const response = await apiClient.put(`/api/rent-proposals/${proposalId}`, proposalData);
  return response.data;
};

// Helper function to format rent amount for display
export const formatRentAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to validate proposal allocations
export const validateProposalAllocations = (allocations, totalRentAmount) => {
  const totalAllocated = allocations.reduce((sum, allocation) => {
    return sum + (parseFloat(allocation.amount) || 0);
  }, 0);

  const isValid = Math.abs(totalAllocated - totalRentAmount) < 0.01; // Allow for small floating point differences
  const difference = totalRentAmount - totalAllocated;

  return {
    isValid,
    totalAllocated,
    difference,
    message: isValid 
      ? 'Allocations are valid' 
      : `Allocations ${difference > 0 ? 'under' : 'over'} by ${formatRentAmount(Math.abs(difference))}`
  };
};
