import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import UrgentMessageCards from './UrgentMessageCards';
import TaskCards from './TaskCards';
import RentProposalCards from './RentProposalCards';
import FromYourLandlordSection from './FromYourLandlordSection';
import DashboardSectionSkeleton from '../skeletons/DashboardSectionSkeleton';

const DashboardPopupSection = ({
  urgentMessages = [],
  tasks = [],
  billSubmissions = [],
  rentProposals = [],
  rentAllocationRequest = null,
  rentAllocationLoading = false,
  houseId = null,
  hasLandlord = false,
  onTaskPress,
  onMessagePress,
  onRentProposalPress,
  onCreateRentProposal,
  onViewAllTasks,
  onViewAllMessages,
  recentlyCompletedTasks = new Set(),
  recentlyCompletedBillSubmissions = new Set(),
  recentlyCompletedRentProposals = new Set(),
  // ✅ NEW: Progressive loading props
  prefetchDataLoaded = false,
  prefetchLoading = false
}) => {
  // Check if we have data to display
  const hasUrgentMessages = urgentMessages && urgentMessages.length > 0;
  const hasTasks = tasks && tasks.length > 0;
  const hasBillSubmissions = billSubmissions && billSubmissions.length > 0;
  const hasRentProposals = rentProposals && rentProposals.length > 0;
  const hasRentAllocationRequest = hasLandlord && (rentAllocationLoading || (rentAllocationRequest && rentAllocationRequest.status === 'pending' && rentAllocationRequest.canCreateProposal));
  

  
  // If there's nothing to display, return null (section won't render)
  // ✅ NEW: Show skeleton while prefetch data is loading
  if (!prefetchDataLoaded && prefetchLoading) {
    return (
      <View style={styles.container}>
        <DashboardSectionSkeleton itemCount={2} />
      </View>
    );
  }

  if (!hasUrgentMessages && !hasTasks && !hasBillSubmissions && !hasRentProposals && !hasRentAllocationRequest) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {/* From Your Landlord Section - Separate dedicated section */}
      {hasRentAllocationRequest && (
        <FromYourLandlordSection
          rentAllocationRequest={rentAllocationRequest}
          loading={rentAllocationLoading}
          onCreateProposal={onCreateRentProposal}
        />
      )}
      
      {/* Urgent Messages Cards */}
      {hasUrgentMessages && (
        <UrgentMessageCards 
          messages={urgentMessages}
          onMessagePress={onMessagePress}
          onViewAll={onViewAllMessages}
        />
      )}
      
      {/* Tasks Cards */}
      {(hasTasks || hasBillSubmissions) && (
        <TaskCards 
          tasks={tasks}
          billSubmissions={billSubmissions}
          onTaskPress={onTaskPress}
          recentlyCompletedTasks={recentlyCompletedTasks}
          recentlyCompletedBillSubmissions={recentlyCompletedBillSubmissions}
        />
      )}
      
      {/* Rent Proposal Cards */}
      {hasRentProposals && (
        <RentProposalCards 
          rentProposals={rentProposals}
          onRentProposalPress={onRentProposalPress}
          recentlyCompletedRentProposals={recentlyCompletedRentProposals}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});

export default DashboardPopupSection;