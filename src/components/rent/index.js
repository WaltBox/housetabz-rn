// Rent proposal components
export { default as RentStatusIndicator } from './RentStatusIndicator';
export { default as RentAllocationCard } from './RentAllocationCard';
export { default as RentProposalSummary } from './RentProposalSummary';

// Re-export rent service functions for convenience
export {
  getRentAllocationRequest,
  claimRentAllocationRequest,
  getActiveRentProposal,
  createRentProposal,
  getRentProposalHistory,
  submitRentProposal,
  deleteRentProposal,
  getPendingRentApprovals,
  getRentProposalForApproval,
  approveRentProposal,
  declineRentProposal,
  getRentProposalDetails,
  updateRentProposal,
  formatRentAmount,
  validateProposalAllocations
} from '../../services/rentProposalService';
