import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../../config/api';

const OverviewTab = ({
  displayService,
  tasks,
  formatDate,
  getStatusColor,
  activeLedger,
  ledgers = [],
  fundingSummary
}) => {
  const [allLedgers, setAllLedgers] = useState(ledgers || []);
  const [isLoading, setIsLoading] = useState(false);
  const [localActiveLedger, setLocalActiveLedger] = useState(activeLedger);
  const [houseMembers, setHouseMembers] = useState([]); // Add state for house members
  
  // STABLE enhanced data that doesn't get lost on re-renders
  const [stableEnhancedData, setStableEnhancedData] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  
  // Store enhanced data when we first receive it and prevent it from being lost
  useEffect(() => {
    if (displayService?.id !== serviceId) {
      // New service selected - reset stored data
      setServiceId(displayService.id);
      setStableEnhancedData(null);
    }
    
    if (displayService?.calculatedData && (!stableEnhancedData || displayService.id !== serviceId)) {
      
      setStableEnhancedData({
        id: displayService.id,
        name: displayService.name,
        status: displayService.status,
        amount: displayService.amount,
        dueDate: displayService.dueDate,
        calculatedData: displayService.calculatedData
      });
    }
  }, [displayService?.id, displayService?.calculatedData, displayService?.name, serviceId, stableEnhancedData]);
  
  // Use stable enhanced data if available, otherwise use current displayService
  const workingService = stableEnhancedData || displayService;
  
  // Fetch house members if we don't have enhanced data
  useEffect(() => {
    const fetchHouseMembers = async () => {
      // If we have enhanced data with contributor details, we don't need to fetch separately
      if (workingService?.calculatedData?.contributorDetails || workingService?.calculatedData?.nonContributors) {
        return;
      }
      
      // If we don't have house ID, try to get it from the service
      const houseId = displayService?.houseId;
      if (!houseId) {
  
        return;
      }
      
      try {
     
        const response = await apiClient.get(`/api/houses/${houseId}/members`);
        if (response.data?.members) {
          setHouseMembers(response.data.members);
         
        }
      } catch (error) {
       
        // Fallback: extract users from tasks if available
        if (tasks.length > 0) {
          const taskUsers = tasks.map(task => ({
            id: task.user?.id,
            username: task.user?.username || 'Unknown',
            email: task.user?.email
          })).filter(user => user.id);
          setHouseMembers(taskUsers);
         
        }
      }
    };
    
    fetchHouseMembers();
  }, [displayService?.houseId, workingService?.calculatedData, tasks]);
  
  // Load additional ledgers only if needed
  useEffect(() => {
    const fetchLedgers = async () => {
      // Skip if we have enhanced data or already have ledgers
      if (workingService?.calculatedData || ledgers.length > 0 || !displayService?.id) {
        return;
      }
      
      setIsLoading(true);
      try {
       
        const response = await apiClient.get(`/api/house-service/${displayService.id}`);
        if (response.data?.ledgers?.length > 0) {
          setAllLedgers(response.data.ledgers);
          
          if (!activeLedger) {
            const active = response.data.ledgers.find(l => l.status === 'active');
            if (active) {
              setLocalActiveLedger(active);
            }
          }
        }
      } catch (error) {
       
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLedgers();
  }, [displayService?.id, workingService?.calculatedData, ledgers.length, activeLedger]);
  
  // Memoize the funding data calculation to prevent recalculation on every render
  const fundingData = useMemo(() => {
    const currentActiveLedger = localActiveLedger || activeLedger;
    const isActive = workingService?.status === 'active';
    
 
    
    let fundingRequired, funded, percentFunded, remaining;
    let usersFunded = [];
    let unfundedUsers = [];
    let allHouseMembers = [];

    if (workingService?.calculatedData) {
      // Use enhanced backend data
  
      const calc = workingService.calculatedData;
      fundingRequired = calc.fundingRequired || 0;
      funded = calc.funded || 0;
      percentFunded = calc.percentFunded || 0;
      remaining = calc.remainingAmount || 0;
      
      // Map enhanced data to display format
      usersFunded = (calc.contributorDetails || []).map(contributor => ({
        userId: contributor.userId,
        username: contributor.username,
        fundedAmount: contributor.amount,
        fundedDate: contributor.timestamp || contributor.lastUpdated,
        hasFunded: true
      }));
      
      unfundedUsers = (calc.nonContributors || []).map(nonContributor => ({
        userId: nonContributor.userId,
        username: nonContributor.username,
        expectedAmount: nonContributor.expectedAmount || 0,
        hasFunded: false
      }));
      
      // Combine all house members for total count
      allHouseMembers = [...usersFunded, ...unfundedUsers];
      

      
    } else {
      // Fallback to ledger data + house members
   
      // Use totalRequired from backend (already includes service fee)
      fundingRequired = Number(currentActiveLedger?.totalRequired || currentActiveLedger?.fundingRequired || workingService?.amount || 0);
      
      funded = Number(currentActiveLedger?.funded || 0);
      const progress = fundingRequired > 0 ? funded / fundingRequired : 0;
      percentFunded = Math.min(100, Math.round(progress * 100));
      remaining = Math.max(0, fundingRequired - funded);

      // Create a set of funded user IDs
      const fundedUserIds = new Set();
      
      // Get funding data from activeLedger metadata
      if (currentActiveLedger?.metadata?.fundedUsers) {
        usersFunded = currentActiveLedger.metadata.fundedUsers.map(fu => {
          fundedUserIds.add(fu.userId);
          return {
            userId: fu.userId,
            username: fu.user?.username || `User ${fu.userId}`,
            fundedAmount: Number(fu.amount),
            fundedDate: fu.timestamp || fu.lastUpdated,
            hasFunded: true
          };
        });
      }
      
      // Use house members if available, otherwise fall back to tasks
      const membersToUse = houseMembers.length > 0 ? houseMembers : tasks.map(task => ({
        id: task.user?.id,
        username: task.user?.username || 'Unknown',
        email: task.user?.email
      })).filter(user => user.id);
      
      // Get unfunded users from house members
      unfundedUsers = membersToUse
        .filter(member => member.id && !fundedUserIds.has(member.id))
        .map(member => ({
          userId: member.id,
          username: member.username,
          expectedAmount: fundingRequired > 0 && membersToUse.length > 0 
            ? Math.round(fundingRequired / membersToUse.length * 100) / 100 
            : 0,
          hasFunded: false
        }));
      
      // Combine all members
      allHouseMembers = [...usersFunded, ...unfundedUsers];
      
}

    const dueDate = formatDate(currentActiveLedger?.dueDate || workingService?.dueDate || new Date(Date.now() + 15 * 86400000));
    
    return {
      fundingRequired,
      funded,
      percentFunded,
      remaining,
      usersFunded,
      unfundedUsers,
      allHouseMembers,
      dueDate,
      isActive,
      currentActiveLedger
    };
  }, [workingService, localActiveLedger, activeLedger, tasks, houseMembers, formatDate]);

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

  // If loading, show spinner
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Loading service details...</Text>
      </View>
    );
  }

  // If there's no active ledger data but we have a fundingSummary, show a message
  if (!fundingData.currentActiveLedger && fundingSummary && fundingData.isActive) {
    return (
      <View style={styles.noActiveContainer}>
        <MaterialIcons name="info-outline" size={48} color="#0891b2" />
        <Text style={styles.noActiveTitle}>No Active Bill Cycle</Text>
        <Text style={styles.noActiveText}>
          This service is active but doesn't have an ongoing bill cycle.
        </Text>
        
        {fundingSummary?.ledgerCount > 0 && (
          <View style={styles.historySummary}>
            <Text style={styles.historySummaryTitle}>Payment History</Text>
            <Text style={styles.historySummaryText}>
              {fundingSummary.ledgerCount} previous {fundingSummary.ledgerCount === 1 ? 'bill' : 'bills'} • 
              Total funded: {formatCurrency(fundingSummary.totalFunded)}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // If no active ledger but service is active, show a message
  if (!fundingData.currentActiveLedger && fundingData.isActive && fundingData.fundingRequired === 0) {
    return (
      <View style={styles.noActiveContainer}>
        <MaterialIcons name="info-outline" size={48} color="#0891b2" />
        <Text style={styles.noActiveTitle}>No Active Bill Cycle</Text>
        <Text style={styles.noActiveText}>
          This service is active but doesn't have an ongoing bill cycle.
        </Text>
        
        {allLedgers.length > 0 && (
          <View style={styles.historySummary}>
            <Text style={styles.historySummaryTitle}>Payment History</Text>
            <Text style={styles.historySummaryText}>
              {allLedgers.length} previous {allLedgers.length === 1 ? 'bill' : 'bills'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionHeader}>Overview</Text>
      <View style={styles.card}>
        <Text style={styles.fundingLabel}>Amount Funded</Text>
        <View style={styles.fundingPercentageRow}>
          <Text style={styles.fundingPercentage}>{fundingData.percentFunded}%</Text>
          <Text style={styles.fundingAmount}>
            {formatCurrency(fundingData.funded)} of {formatCurrency(fundingData.fundingRequired)}
          </Text>
        </View>
        

        <View style={styles.progressBarContainer}>
          <View style={[
            styles.progressBarFill, 
            { width: `${fundingData.percentFunded}%` }
          ]} />
        </View>
        <View style={styles.fundingDetailsRow}>
          <Text style={styles.fundingDetailLabel}>Due: {fundingData.dueDate}</Text>
          <Text style={styles.fundingDetailValue}>{formatCurrency(fundingData.remaining)} remaining</Text>
        </View>
      </View>

      {/* Funding Status section - ALWAYS show for active services if we have member data */}
      {fundingData.isActive && fundingData.allHouseMembers.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Funding Status</Text>
          <View style={styles.participantsCard}>
            {/* Show all members with their status */}
            {fundingData.allHouseMembers.map((member) => {
              const isPaid = member.hasFunded;
              return (
                <View key={`member-${member.userId}`} style={styles.participantRow}>
                  <View style={styles.participantInfo}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantInitial}>
                        {member.username?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.participantDetails}>
                      <Text style={styles.participantName}>{member.username}</Text>
                      {isPaid && member.fundedDate && (
                        <Text style={styles.fundedDate}>
                          Paid {formatDate(new Date(member.fundedDate))}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusPill,
                      isPaid ? styles.paidPill : styles.unpaidPill
                    ]}>
                      <Text style={[
                        styles.statusText,
                        isPaid ? styles.paidText : styles.unpaidText
                      ]}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Show message if no members found (shouldn't happen now) */}
            {fundingData.allHouseMembers.length === 0 && (
              <View style={styles.emptyBillContainer}>
                <MaterialIcons name="people" size={40} color="#cbd5e1" />
                <Text style={styles.emptyBillText}>No house members found</Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Show approval status if not active */}
      {!fundingData.isActive && tasks.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Approval Status</Text>
          <View style={styles.participantsCard}>
            {tasks.map((task, index) => (
              <View key={task.id || `task-${index}`} style={styles.participantRow}>
                <View style={styles.participantInfo}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>
                      {task.user?.username?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <Text style={styles.participantName}>{task.user?.username || 'Unknown'}</Text>
                </View>
                <View style={[
                  styles.participantStatusBadge,
                  { backgroundColor: getStatusColor(task.response, task.paymentStatus) + '20' },
                ]}>
                  <Text style={[
                    styles.participantStatusText,
                    { color: getStatusColor(task.response, task.paymentStatus) },
                  ]}>
                    {task.paymentStatus ? 
                      (task.paymentStatus === 'authorized' ? 'CONSENTED' : 
                       task.paymentStatus === 'completed' ? 'PAID' :
                       task.paymentStatus === 'cancelled' ? 'CANCELLED' :
                       task.paymentStatus.toUpperCase()) :
                      (task.response?.toUpperCase() || 'PENDING')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Bill History */}
      <Text style={styles.sectionHeader}>Bill History</Text>
      <View style={styles.participantsCard}>
        {allLedgers.length > 0 ? (
          allLedgers.map((ledger, index) => (
            <View key={ledger.id || `ledger-${index}`} style={styles.billRow}>
              <View style={styles.billInfo}>
                <Text style={styles.billDate}>{formatDate(ledger.createdAt)}</Text>
                <View style={styles.billAmountRow}>
                  <Text style={styles.billAmount}>{formatCurrency(ledger.fundingRequired)}</Text>
                  
                  {ledger.metadata?.fundedUsers?.length > 0 && (
                    <Text style={styles.contributorCount}>
                      {ledger.metadata.fundedUsers.length} 
                      {ledger.metadata.fundedUsers.length === 1 ? ' contributor' : ' contributors'}
                    </Text>
                  )}
                </View>
              </View>
              <View style={[
                styles.billStatusBadge,
                { backgroundColor: getStatusColor(ledger.status) + '20' },
              ]}>
                <Text style={[
                  styles.billStatusText,
                  { color: getStatusColor(ledger.status) },
                ]}>
                  {ledger.status?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBillContainer}>
            <MaterialIcons name="receipt" size={40} color="#cbd5e1" />
            <Text style={styles.emptyBillText}>No bills yet</Text>
          </View>
        )}
      </View>

      {/* All-Time Contributions (if available from fundingSummary) */}
      {fundingSummary?.userContributions?.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>All-Time Contributions</Text>
          <View style={styles.participantsCard}>
            {fundingSummary.userContributions.map((contributor, index) => (
              <View key={`contributor-${contributor.userId || index}`} style={styles.participantRow}>
                <View style={styles.participantInfo}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>
                      {contributor.username?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>{contributor.username}</Text>
                    <Text style={styles.fundedDate}>
                      {contributor.lastContribution ? 
                        `Last: ${formatDate(new Date(contributor.lastContribution))}` : 
                        `${contributor.contributionCount} contributions`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.totalAmount}>{formatCurrency(contributor.totalContribution)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  subsectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fundingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  fundingPercentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fundingPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  fundingAmount: {
    fontSize: 14,
    color: '#64748b',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 4,
  },
  fundingDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fundingDetailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  fundingDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  participantsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidPill: {
    backgroundColor: '#34d399' + '20',
  },
  unpaidPill: {
    backgroundColor: '#f59e0b' + '20',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  paidText: {
    color: '#34d399',
  },
  unpaidText: {
    color: '#f59e0b',
  },
  participantInitial: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 14,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '500',
  },
  fundedDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  expectedAmount: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },
  fundedInfoContainer: {
    alignItems: 'flex-end',
  },
  fundedAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  participantStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantStatusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  billInfo: {
    flex: 1,
  },
  billDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  billAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  billAmount: {
    fontSize: 14,
    color: '#64748b',
  },
  contributorCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 6,
  },
  billStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  billStatusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyBillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyBillText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 15,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  noActiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noActiveTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 10,
    marginBottom: 8,
  },
  noActiveText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  historySummary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    width: '100%',
  },
  historySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  historySummaryText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
});

export default OverviewTab;