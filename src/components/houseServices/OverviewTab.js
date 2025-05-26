import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../../config/api'; // Adjust path as needed

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
  
  // Load all ledgers for this service if not already provided
  useEffect(() => {
    const fetchLedgers = async () => {
      if (ledgers.length === 0 && displayService?.id) {
        setIsLoading(true);
        try {
          const response = await apiClient.get(`/api/house-service/${displayService.id}`);
          if (response.data?.ledgers?.length > 0) {
            setAllLedgers(response.data.ledgers);
            
            // Find the active ledger if not provided
            if (!activeLedger) {
              const active = response.data.ledgers.find(l => l.status === 'active');
              if (active) {
                setLocalActiveLedger(active);
              }
            }
          }
        } catch (error) {
          console.log('Error fetching ledgers:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchLedgers();
  }, [displayService?.id, ledgers, activeLedger]);
  
  // Use local state or props
  const currentActiveLedger = localActiveLedger || activeLedger;
  
  const isActive = displayService.status === 'active';
  const pendingTasks = tasks.filter(t => !t.status);

  const fundingRequired = Number(currentActiveLedger?.fundingRequired || displayService.amount || 0);
  const funded = Number(currentActiveLedger?.funded || 0);
  const progress = fundingRequired > 0 ? funded / fundingRequired : 0;
  const percentFunded = Math.min(100, Math.round(progress * 100));
  const remaining = Math.max(0, fundingRequired - funded);
  const dueDate = formatDate(currentActiveLedger?.dueDate || displayService.dueDate || new Date(Date.now() + 15 * 86400000));
  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

  // Check if ledger has funded users
  const hasFundedUsers = !!(currentActiveLedger?.metadata?.fundedUsers?.length > 0);
  
  // Log debug info
  console.log('DEBUG ServiceID:', displayService.id);
  console.log('DEBUG ActiveLedger:', currentActiveLedger?.id);
  console.log('DEBUG Has funded users:', hasFundedUsers); 
  if (hasFundedUsers) {
    console.log('DEBUG Funded users:', JSON.stringify(currentActiveLedger.metadata.fundedUsers));
  }

  // Get funding data from activeLedger metadata - this should always work even without the enhanced API
  const getFundingData = () => {
    // Use activeLedger metadata as primary source - should always be available
    if (currentActiveLedger?.metadata?.fundedUsers) {
      return {
        fundedUsers: currentActiveLedger.metadata.fundedUsers.map(fu => ({
          userId: fu.userId,
          amount: fu.amount,
          lastUpdated: fu.lastUpdated || fu.timestamp,
          contributionCount: 1
        })),
        allTimeContributors: []
      };
    }
    
    // Fall back to fundingSummary if available (has the most data, but might not be available yet)
    if (fundingSummary?.activeLedger) {
      return {
        fundedUsers: fundingSummary.userContributions?.filter(u => {
          // For the current ledger, only show users with contributions in the active ledger
          // This ensures we're only showing people who funded THIS bill, not previous ones
          if (currentActiveLedger?.metadata?.fundedUsers) {
            return currentActiveLedger.metadata.fundedUsers.some(fu => 
              String(fu.userId) === String(u.userId)
            );
          }
          return false;
        }) || [],
        allTimeContributors: fundingSummary.userContributions || []
      };
    }
    
    // Default empty values
    return {
      fundedUsers: [],
      allTimeContributors: []
    };
  };

  const { fundedUsers, allTimeContributors } = getFundingData();
  
  // Create a map of userIds to their task data for quick lookup
  const userTaskMap = {};
  tasks.forEach(task => {
    if (task.user && task.user.id) {
      userTaskMap[task.user.id] = task;
    }
  });
  
  // Helper function to determine if a user has funded
  const getUserHasFunded = (userId) => {
    // Direct metadata check
    if (currentActiveLedger?.metadata?.fundedUsers) {
      return currentActiveLedger.metadata.fundedUsers.some(fu => String(fu.userId) === String(userId));
    }
    
    // Check fundedUsers from our computed data
    return fundedUsers.some(fu => String(fu.userId) === String(userId));
  };

  // Combine funding data with task data
  const fundingStatuses = tasks.map(task => {
    const userId = task.user?.id;
    if (!userId) return {
      userId: null,
      username: task.user?.username || 'Unknown',
      hasFunded: false,
      fundedAmount: 0,
      task
    };
    
    // Check if user has funded the current bill
    const hasFunded = getUserHasFunded(userId);
    const currentFundingData = fundedUsers.find(f => String(f.userId) === String(userId));
    
    // Get all-time contribution data - may not be available yet
    const allTimeData = allTimeContributors.find(c => String(c.userId) === String(userId));
    
    return {
      userId,
      username: task.user?.username || 'Unknown',
      hasFunded: hasFunded, // Use our helper function
      fundedAmount: Number(currentFundingData?.amount || 0),
      fundedDate: currentFundingData?.timestamp || currentFundingData?.lastUpdated || null,
      totalContribution: Number(allTimeData?.totalContribution || 0),
      contributionCount: allTimeData?.contributionCount || 0,
      task
    };
  });

  // Get users who haven't funded yet
  const unfundedUsers = fundingStatuses.filter(status => !status.hasFunded && status.userId);
  
  // Get users who have funded
  const usersFunded = fundingStatuses.filter(status => status.hasFunded);

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
  if (!currentActiveLedger && fundingSummary && isActive) {
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
  if (!currentActiveLedger && isActive) {
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
          <Text style={styles.fundingPercentage}>{percentFunded}%</Text>
          <Text style={styles.fundingAmount}>
            {formatCurrency(funded)} of {formatCurrency(fundingRequired)}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${percentFunded}%` }]} />
        </View>
        <View style={styles.fundingDetailsRow}>
          <Text style={styles.fundingDetailLabel}>Due: {dueDate}</Text>
          <Text style={styles.fundingDetailValue}>{formatCurrency(remaining)} remaining</Text>
        </View>
      </View>

      {/* Funding Status section to show both funded and unfunded users */}
      {isActive && (
        <>
          <Text style={styles.sectionHeader}>Funding Status</Text>
          <View style={styles.participantsCard}>
            {/* Show users who have funded */}
            {usersFunded.length > 0 && (
              <>
                {usersFunded.map((status, index) => (
                  <View key={`funded-${status.userId || index}`} style={styles.participantRow}>
                    <View style={styles.participantInfo}>
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantInitial}>
                          {status.username?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.participantName}>{status.username}</Text>
                        {status.fundedDate && (
                          <Text style={styles.fundedDate}>
                            {formatDate(new Date(status.fundedDate))}
                          </Text>
                        )}
                        {status.contributionCount > 1 && (
                          <Text style={styles.totalContributions}>
                            {status.contributionCount} total contributions
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.fundedInfoContainer}>
                      {status.fundedAmount > 0 && (
                        <Text style={styles.fundedAmount}>{formatCurrency(status.fundedAmount)}</Text>
                      )}
                      <View
                        style={[
                          styles.participantStatusBadge,
                          { backgroundColor: '#dcfce7' },
                        ]}
                      >
                        <Text style={[
                          styles.participantStatusText,
                          { color: '#166534' },
                        ]}>
                          Funded
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Show users who haven't funded */}
            {unfundedUsers.length > 0 && (
              <>
                {unfundedUsers.map((status, index) => (
                  <View key={`unfunded-${status.userId || index}`} style={styles.participantRow}>
                    <View style={styles.participantInfo}>
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantInitial}>
                          {status.username?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.participantName}>{status.username}</Text>
                        {status.totalContribution > 0 && (
                          <Text style={styles.totalContributions}>
                            {formatCurrency(status.totalContribution)} total contributed
                          </Text>
                        )}
                      </View>
                    </View>
                    <View
                      style={[
                        styles.participantStatusBadge,
                        { backgroundColor: '#fde68a' },
                      ]}
                    >
                      <Text style={[
                        styles.participantStatusText,
                        { color: '#b45309' },
                      ]}>
                        Not Funded
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Show message if no users or all tasks without users */}
            {fundingStatuses.length === 0 && (
              <View style={styles.emptyBillContainer}>
                <MaterialIcons name="people" size={40} color="#cbd5e1" />
                <Text style={styles.emptyBillText}>No participants found</Text>
              </View>
            )}

            {/* Show debug message in development */}
            {__DEV__ && !hasFundedUsers && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info</Text>
                <Text style={styles.debugText}>ServiceID: {displayService.id}</Text>
                <Text style={styles.debugText}>
                  Active Ledger ID: {currentActiveLedger?.id || "None"}
                </Text>
                <Text style={styles.debugText}>
                  Metadata: {currentActiveLedger?.metadata ? 
                    JSON.stringify(currentActiveLedger.metadata) : "None"}
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Show approval status if not active */}
      {!isActive && tasks.length > 0 && (
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
                  { backgroundColor: getStatusColor(task.response) + '20' },
                ]}>
                  <Text style={[
                    styles.participantStatusText,
                    { color: getStatusColor(task.response) },
                  ]}>
                    {task.response?.toUpperCase() || 'PENDING'}
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

      {/* All-Time Contributions (only if we have data from fundingSummary) */}
      {fundingSummary && fundingSummary.userContributions && fundingSummary.userContributions.length > 0 && (
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
                  <View>
                    <Text style={styles.participantName}>{contributor.username}</Text>
                    <Text style={styles.fundedDate}>
                      {contributor.lastContribution ? 
                        `Last contributed: ${formatDate(new Date(contributor.lastContribution))}` : 
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
  // Existing styles
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
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
    marginBottom: 12,
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
    fontSize: 14,
    color: '#64748b',
  },
  fundingDetailValue: {
    fontSize: 14,
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
    paddingVertical: 12,
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
  participantInitial: {
    color: '#1e293b',
    fontWeight: '600',
  },
  participantName: {
    color: '#1e293b',
    fontSize: 15,
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
    paddingVertical: 12,
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
    padding: 24,
  },
  emptyBillText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 16,
  },
  // Existing funding status styles
  fundedInfoContainer: {
    alignItems: 'flex-end',
  },
  fundedAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  fundedDate: {
    fontSize: 12,
    color: '#64748b',
  },
  totalContributions: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  
  // New styles for improved UI
  noActiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 24,
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
    marginTop: 12,
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
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  // Debug styles
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fdba74',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c2d12',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#7c2d12',
    marginBottom: 4,
  }
});

export default OverviewTab;