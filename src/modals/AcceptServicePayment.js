import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../config/api';
import BundleStatusOverview from '../components/BundleStatusOverview';

const AcceptServicePayment = ({ visible, onClose, taskData, onSuccess, onAddPaymentMethod }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [bundleDetails, setBundleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upfront pledge required (the amount the user must pay now)
  const effectivePaymentAmount = taskData?.paymentAmount != null
    ? Number(taskData.paymentAmount)
    : 0;

  // Monthly ownership amount (the recurring amount the user claims)
  const effectiveMonthlyAmount = taskData?.monthlyAmount != null
    ? Number(taskData.monthlyAmount)
    : 0;

  // Determine if payment methods should be shown
  // For consent-based flow: Don't show payment methods for staged requests (marketplace_onetime)
  // Users give consent instead of selecting payment methods
  const shouldShowPaymentMethods = () => {
    if (!bundleDetails) return false;
    
    const isOneTimeService = bundleDetails.type === 'marketplace_onetime';
    const hasUpfrontPayment = effectivePaymentAmount > 0;
    
    // For staged requests (marketplace_onetime), users give consent instead of selecting payment methods
    if (isOneTimeService) return false;
    
    // Only show payment methods for non-staged requests with upfront payments
    return hasUpfrontPayment;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const serviceRequestBundleId = taskData?.serviceRequestBundleId || taskData?.bundleId;
        if (!serviceRequestBundleId) {
          throw new Error('Missing service request data');
        }

        // Fetch bundle details first
        const bundleResponse = await apiClient.get(`/api/service-request-bundles/${serviceRequestBundleId}`);
        const bundleData = bundleResponse.data?.serviceRequestBundle;
        if (!bundleData) throw new Error('Failed to load service details');
        setBundleDetails(bundleData);
        
        // Only fetch payment methods if they'll be needed
        if (bundleData.type === 'marketplace_onetime' || 
            (taskData?.paymentAmount != null && Number(taskData.paymentAmount) > 0)) {
          console.log('🔄 Fetching payment methods in AcceptServicePayment');
          const methodsResponse = await apiClient.get('/api/payment-methods');
          const methods = methodsResponse.data?.paymentMethods || [];
          console.log('✅ AcceptServicePayment payment methods:', methods.map(m => ({ id: m.id, isDefault: m.isDefault, last4: m.last4 })));
          
          setPaymentMethods(methods);
          if (methods.length > 0) {
            // Select the default method first, then fallback to first method
            const defaultMethod = methods.find(m => m.isDefault);
            const methodToSelect = defaultMethod ? defaultMethod.id : methods[0]?.id;
            setSelectedMethod(methodToSelect);
            console.log('🎯 Selected payment method in AcceptServicePayment:', methodToSelect);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (visible && taskData) fetchData();
  }, [visible, taskData]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      // Use id from either property
      const taskId = taskData?.id || taskData?.taskId;
      if (!taskId) {
        throw new Error('Task ID is missing. Cannot proceed with acceptance.');
      }

      // For staged requests (consent flow), check if user has valid payment method for consent
      const isStaged = bundleDetails?.type === 'marketplace_onetime';
      if (isStaged && effectivePaymentAmount > 0 && paymentMethods.length === 0) {
        Alert.alert(
          'Payment Method Required',
          'You need to add a payment method before giving consent to pay. Would you like to add one now?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add Payment Method', 
              onPress: () => {
                if (onAddPaymentMethod) {
                  onAddPaymentMethod();
                } else {
                  Alert.alert('Error', 'Unable to add payment method at this time.');
                }
              }
            }
          ]
        );
        return;
      }
  
      if (effectivePaymentAmount > 0) {
        // For consent flow: Don't require specific payment method selection
        // Backend will handle payment method validation during consent
        const acceptData = {
          taskId,
          amount: effectivePaymentAmount,
        };
        
        // Only include paymentMethod if a specific one is selected (for non-staged requests)
        if (selectedMethod && !isStaged) {
          acceptData.paymentMethod = selectedMethod;
        }
        
        await onSuccess(acceptData);
      } else {
        if (onSuccess) {
          await onSuccess({
            taskId,
            response: 'accepted'
          });
        } else {
          throw new Error('Accept function not available');
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Acceptance failed:', error);
      
      let errorMessage = error.message || 'Failed to accept task';
      
      // Enhanced error handling for new backend error messages
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Handle specific new backend error messages
        if (errorMessage.includes('No payment method provided and no default payment method found')) {
          Alert.alert(
            "No Default Payment Method",
            "Please set a default payment method or add a payment method to continue.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Add Payment Method", onPress: onAddPaymentMethod }
            ]
          );
          return;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getStatusColor = (status, paymentStatus) => {
    // Handle combined status display for consent-based payments
    if (paymentStatus) {
      switch (paymentStatus?.toLowerCase()) {
        case 'authorized': return '#3b82f6'; // Blue for consent given
        case 'completed': return '#34d399'; // Green for payment completed
        case 'cancelled': return '#dc2626'; // Red for payment cancelled
        case 'pending': return '#f59e0b'; // Orange for pending consent
        default: break;
      }
    }
    
    // Fallback to regular status colors
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#34d399';
      case 'rejected': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getStatusDisplayText = (status, paymentStatus) => {
    // Handle combined status display for consent-based payments
    if (paymentStatus) {
      switch (paymentStatus?.toLowerCase()) {
        case 'authorized': return 'CONSENTED';
        case 'completed': return 'PAID';
        case 'cancelled': return 'CANCELLED';
        case 'pending': return 'PENDING';
        default: break;
      }
    }
    
    // Fallback to regular status text
    switch (status?.toLowerCase()) {
      case 'pending': return 'PENDING';
      case 'accepted': return 'ACCEPTED';
      case 'rejected': return 'REJECTED';
      default: return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    if (!method) return 'Select payment method';
    return method.type === 'card'
      ? `${method.brand} •••• ${method.last4}${method.isDefault ? ' (Default)' : ''}`
      : `Bank Account •••• ${method.last4}${method.isDefault ? ' (Default)' : ''}`;
  };

  const getMethodIcon = (type) => {
    return type === 'card' ? 'credit-card' : 'account-balance';
  };

  // Get the payment method that will be used for this payment
  const getEffectivePaymentMethod = () => {
    if (selectedMethod) {
      return paymentMethods.find(m => m.id === selectedMethod);
    }
    // If no method is selected, find the default method
    return paymentMethods.find(m => m.isDefault);
  };

  if (loading) return <LoadingModal visible={visible} />;
  if (error) return <ErrorModal visible={visible} error={error} onClose={onClose} />;
  if (!bundleDetails) return null;

  // Ensure these properties exist before using them
  const request = bundleDetails.stagedRequest || bundleDetails.takeOverRequest || {};
  const isRecurring = bundleDetails.takeOverRequest != null || 
                     bundleDetails.type === 'fixed_recurring' || 
                     bundleDetails.type === 'variable_recurring';
  const isVariableRecurring = bundleDetails.type === 'variable_recurring';
  const tasks = bundleDetails.tasks || [];
  const creator = bundleDetails.creator || {};
  const acceptedCount = tasks.filter(t => t.response === 'accepted').length || 0;
  const totalParticipants = tasks.length || 1;
  const pendingParticipants = tasks.filter(task => task.response === 'pending') || [];

  // Check if accept button should be disabled
  // For consent flow: Only disable if processing or if non-staged request needs payment methods
  const isAcceptButtonDisabled = isProcessing || 
                              (shouldShowPaymentMethods() && effectivePaymentAmount > 0 && paymentMethods.length === 0);

  const effectivePaymentMethod = getEffectivePaymentMethod();

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {bundleDetails.type === 'marketplace_onetime' 
              ? "One-time Service Request" 
              : bundleDetails.type === 'fixed_recurring'
                ? "Fixed Monthly Expense" 
                : "Variable Monthly Expense"
            }
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Service Details Card */}
          {request && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{request.serviceName || ''}</Text>
              <Text style={styles.cardSubtitle}>
                {request.partnerName ? `Provider: ${request.partnerName}` : ''}
              </Text>
              
              {/* Organized by */}
              <View style={styles.organizedBy}>
                <MaterialIcons name="person" size={18} color="#64748b" />
                <Text style={styles.organizedByText}>Request by {creator?.username || 'Unknown'}</Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Roommate Approvals: {acceptedCount}/{totalParticipants}</Text>
                <View style={styles.progressTrack}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(acceptedCount/totalParticipants) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Payment details */}
              <View style={styles.paymentSection}>
                {/* Upfront Payment - Only show if there's an amount > 0 */}
                {effectivePaymentAmount > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <View style={styles.titleWithHelp}>
                      <Text style={styles.paymentTitle}>
                        {bundleDetails.type === 'marketplace_onetime' ? "One-time Payment" : "Upfront Pledge Required"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => alert(bundleDetails.type === 'marketplace_onetime' 
                          ? "This is your share of the one-time service cost. Payment will only process after all roommates approve."
                          : "This is your portion of the initial setup fee or security deposit required to start the service."
                        )}
                      >
                        <MaterialIcons name="help-outline" size={18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Your Amount</Text>
                      <Text style={styles.paymentAmount}>${effectivePaymentAmount.toFixed(2)}</Text>
                    </View>
                  </View>
                )}

                {/* Monthly Ownership - Only for recurring services */}
                {(bundleDetails.type === 'fixed_recurring' || bundleDetails.type === 'variable_recurring') && (
                  <View>
                    <View style={styles.titleWithHelp}>
                      <Text style={styles.paymentTitle}>
                        {bundleDetails.type === 'fixed_recurring' 
                          ? "Monthly Share" 
                          : "Variable Monthly Share"
                        }
                      </Text>
                      <TouchableOpacity
                        onPress={() => alert(bundleDetails.type === 'fixed_recurring'
                          ? "This is your portion of the fixed monthly bill that will be split between roommates."
                          : "This is your estimated share of the monthly expense. The actual amount may vary month to month."
                        )}
                      >
                        <MaterialIcons name="help-outline" size={18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Monthly Amount</Text>
                      {isVariableRecurring && effectiveMonthlyAmount === 0 ? (
                        <Text style={styles.paymentAmount}>Variable</Text>
                      ) : (
                        <Text style={styles.paymentAmount}>
                          {effectiveMonthlyAmount > 0 
                            ? `$${effectiveMonthlyAmount.toFixed(2)}/mo`
                            : isVariableRecurring 
                              ? "Variable" 
                              : "Pending"
                          }
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Payment Method Section - Only show for one-time services or when upfront payment is required */}
          {shouldShowPaymentMethods() && (
            <View style={styles.paymentMethodSection}>
              <Text style={styles.paymentMethodTitle}>Payment Method</Text>
              
              {paymentMethods.length === 0 ? (
                <View style={styles.noPaymentMethodsContainer}>
                  <Text style={styles.noPaymentMethodsText}>No payment methods available</Text>
                  <TouchableOpacity 
                    style={styles.addMethodButton}
                    onPress={onAddPaymentMethod}
                  >
                    <Text style={styles.addMethodButtonText}>Add Payment Method</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Enhanced payment method display */}
                  {effectivePaymentMethod ? (
                    <View style={styles.paymentMethodContainer}>
                      <View style={[
                        styles.paymentMethodDisplay,
                        effectivePaymentMethod.isDefault && styles.defaultPaymentMethodDisplay
                      ]}>
                        <View style={styles.paymentMethodLeft}>
                          <MaterialIcons
                            name={getMethodIcon(effectivePaymentMethod.type)}
                            size={24}
                            color={effectivePaymentMethod.isDefault ? "#34d399" : "#64748b"}
                            style={styles.methodIcon}
                          />
                          <View style={styles.paymentMethodDetails}>
                            <Text style={styles.paymentMethodName}>
                              {getPaymentMethodDisplay(effectivePaymentMethod)}
                            </Text>
                            {effectivePaymentMethod.isDefault && (
                              <Text style={styles.defaultMethodNote}>
                                Your default payment method will be used
                              </Text>
                            )}
                          </View>
                        </View>
                        {effectivePaymentMethod.isDefault && (
                          <MaterialIcons name="check-circle" size={20} color="#34d399" />
                        )}
                      </View>
                      
                      {/* Payment method options */}
                      {paymentMethods.length > 1 && (
                        <TouchableOpacity
                          style={styles.changePaymentMethod}
                          onPress={() => setShowPaymentOptions(!showPaymentOptions)}
                        >
                          <Text style={styles.changePaymentMethodText}>
                            Change payment method
                          </Text>
                          <MaterialIcons
                            name={showPaymentOptions ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={20}
                            color="#34d399"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View style={styles.noPaymentMethodsContainer}>
                      <Text style={styles.noPaymentMethodsText}>
                        No default payment method found
                      </Text>
                      <TouchableOpacity 
                        style={styles.addMethodButton}
                        onPress={onAddPaymentMethod}
                      >
                        <Text style={styles.addMethodButtonText}>Add Payment Method</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Payment options dropdown */}
                  {showPaymentOptions && paymentMethods.length > 1 && (
                    <View style={styles.paymentOptionsContainer}>
                      {paymentMethods.map(method => (
                        <TouchableOpacity
                          key={method.id}
                          style={[
                            styles.paymentMethodOption,
                            selectedMethod === method.id ? styles.selectedPaymentMethod : styles.unselectedPaymentMethod
                          ]}
                          onPress={() => {
                            setSelectedMethod(method.id);
                            setShowPaymentOptions(false);
                          }}
                        >
                          <View style={styles.paymentMethodInfo}>
                            <MaterialIcons
                              name={getMethodIcon(method.type)}
                              size={24}
                              color={selectedMethod === method.id ? "#34d399" : "#64748b"}
                              style={styles.methodIcon}
                            />
                            <View style={styles.paymentMethodDetails}>
                              <Text style={[
                                styles.paymentMethodName,
                                method.isDefault && styles.defaultPaymentMethodName
                              ]}>
                                {getPaymentMethodDisplay(method)}
                              </Text>
                              {method.isDefault && (
                                <Text style={styles.paymentMethodDefaultLabel}>Default</Text>
                              )}
                            </View>
                          </View>
                          {selectedMethod === method.id && (
                            <MaterialIcons name="check-circle" size={20} color="#34d399" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={22} color="#34d399" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {bundleDetails.type === 'marketplace_onetime'
                ? "You'll give consent to be charged when all roommates accept. No payment will be taken until everyone agrees."
                : effectivePaymentAmount > 0
                  ? "By accepting, you consent to be charged when all roommates accept. You'll also claim responsibility for the monthly expense."
                  : "By accepting, you're claiming responsibility for your portion of this recurring expense."
              }
            </Text>
          </View>

          {/* Bundle Status Overview */}
          <BundleStatusOverview 
            tasks={tasks}
            bundleType={bundleDetails?.type}
            onPress={() => {}}
          />

          {/* Participants List */}
          <View style={styles.participantsCard}>
            <Text style={styles.participantsTitle}>Individual Status</Text>
            
            {tasks.map(task => (
              <View 
                key={task.id || Math.random().toString()} 
                style={styles.participantRow}
              >
                <View style={styles.participantInfo}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>{task.user?.username?.[0]?.toUpperCase() || "?"}</Text>
                  </View>
                  <Text style={styles.participantName}>{task.user?.username || "Unknown"}</Text>
                </View>
                <View style={[styles.participantStatusBadge, { backgroundColor: getStatusColor(task.response, task.paymentStatus) + '20' }]}>
                  <Text style={[styles.participantStatusText, { color: getStatusColor(task.response, task.paymentStatus) }]}>
                    {getStatusDisplayText(task.response, task.paymentStatus)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer with buttons */}
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 16 }}>
              {bundleDetails?.type === 'marketplace_onetime'
                ? "Consent Amount"
                : isRecurring && effectivePaymentAmount > 0 
                  ? "Upfront Consent" 
                  : isRecurring 
                    ? "Monthly Ownership" 
                    : "Payment Amount"}
            </Text>
            {isVariableRecurring && effectiveMonthlyAmount === 0 ? (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Variable</Text>
            ) : (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {(effectivePaymentAmount > 0 || effectiveMonthlyAmount > 0) ? (
                  isRecurring && effectivePaymentAmount > 0 
                    ? `$${effectivePaymentAmount.toFixed(2)}` 
                    : isRecurring && effectiveMonthlyAmount > 0
                      ? `$${effectiveMonthlyAmount.toFixed(2)}/mo`
                      : isRecurring
                        ? "Pending"
                        : `$${effectivePaymentAmount.toFixed(2)}`
                ) : (
                  "Pending"
                )}
              </Text>
            )}
          </View>
          
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity 
              style={{ 
                flex: 1, 
                backgroundColor: "#f1f5f9", 
                padding: 16, 
                borderRadius: 12, 
                alignItems: "center",
                marginRight: 8
              }}
              onPress={onClose}
            >
              <Text style={{ fontWeight: "bold", color: "#475569" }}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                { 
                  flex: 1,
                  flexDirection: "row", 
                  backgroundColor: "#34d399", 
                  padding: 16, 
                  borderRadius: 12, 
                  alignItems: "center", 
                  justifyContent: "center",
                  marginLeft: 8
                },
                isAcceptButtonDisabled && { opacity: 0.7, backgroundColor: "#94e0c4" }
              ]}
              onPress={handleAccept}
              disabled={isAcceptButtonDisabled}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ fontWeight: "bold", color: "white" }}>
                    {bundleDetails?.type === 'marketplace_onetime' 
                      ? "Accept & Consent to Pay" 
                      : effectivePaymentAmount > 0 
                        ? "Accept & Consent to Pay" 
                        : "Accept Ownership"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const LoadingModal = ({ visible }) => (
  <Modal transparent visible={visible}>
    <View style={styles.modalOverlay}>
      <ActivityIndicator size="large" color="#34d399" />
    </View>
  </Modal>
);

const ErrorModal = ({ visible, error, onClose }) => (
  <Modal transparent visible={visible}>
    <View style={styles.modalOverlay}>
      <View style={styles.errorCard}>
        <MaterialIcons name="error-outline" size={40} color="#dc2626" style={styles.errorIcon} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={onClose}
        >
          <Text style={styles.errorButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    backgroundColor: "#dff6f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  closeButton: {
    padding: 8,
  },
  
  // Content and cards
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: "#dff6f0",
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,

  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  
  // Organized by section
  organizedBy: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  organizedByText: {
    marginLeft: 8,
    color: "#64748b",
    fontSize: 14,
  },
  
  // Status
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusLabel: {
    color: "#64748b",
    fontSize: 14,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  
  // Progress
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginTop: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34d399",
  },
  
  // Payment sections
  paymentSection: {
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  paymentLabel: {
    color: "#0f172a",
  },
  paymentAmount: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  titleWithHelp: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  
  // Payment method section
  paymentMethodSection: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,

  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
  },
  noPaymentMethodsContainer: {
    alignItems: "center",
    padding: 16,
  },
  noPaymentMethodsText: {
    color: "#64748b",
    marginBottom: 12,
  },
  addMethodButton: {
    backgroundColor: "#34d399",
    padding: 12,
    borderRadius: 8,
  },
  addMethodButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  paymentMethodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentDescription: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    lineHeight: 20,
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  paymentMethodDefaultLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  paymentMethodOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: "#34d399",
    backgroundColor: "#f0fdf4",
  },
  unselectedPaymentMethod: {
    borderColor: "#e2e8f0",
    backgroundColor: "white",
  },
  
  // Info Card
  infoCard: {
    flexDirection: "row",
    margin: 16,
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    borderColor: "#dcfce7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
 
  },
  infoIcon: {
    marginRight: 12,
    alignSelf: "flex-start",
    paddingTop: 2,
  },
  infoText: {
    flex: 1,
    color: "#0f172a",
    lineHeight: 20,
  },
  
  // Participants list
  participantsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,

  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantInitial: {
    color: "#0f172a",
    fontWeight: "600",
  },
  participantName: {
    color: "#0f172a",
  },
  participantStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  methodIcon: {
    marginRight: 12,
  },
  
  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#dff6f0",
  },
  footerAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  footerAmountLabel: {
    fontSize: 16,
    color: "#0f172a",
  },
  footerAmountValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  buttonRow: {
    flexDirection: "row",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  declineButtonText: {
    fontWeight: "bold",
    color: "#475569",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#34d399",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  participantStatusText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  acceptButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledAcceptButton: {
    backgroundColor: "#94e0c4",
  },
  acceptButtonText: {
    fontWeight: "bold",
    color: "white",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
   
  },
  acceptButtonIcon: {
    marginRight: 8,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 22,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fecaca",
    borderRadius: 12,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorButtonText: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  // New styles for enhanced payment method display
  paymentMethodContainer: {
    marginBottom: 16,
  },
  paymentMethodDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
  },
  defaultPaymentMethodDisplay: {
    borderColor: "#34d399",
    borderWidth: 2,
    borderRadius: 8,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  changePaymentMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  changePaymentMethodText: {
    color: "#34d399",
    fontSize: 14,
    fontWeight: "600",
  },
  paymentOptionsContainer: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  defaultMethodNote: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  defaultPaymentMethodName: {
    fontWeight: "600",
    color: "#34d399",
  },
});

export default AcceptServicePayment;