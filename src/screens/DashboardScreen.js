import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { scrollEmitter } from '../utils/eventEmitter';
import apiClient, { 
  getAppUserInfo,
  getDashboardInitialData, // DEPRECATED - keeping for fallback
  getDashboardPrefetchData, // DEPRECATED - keeping for fallback
  getDashboardData, // DEPRECATED - keeping for fallback
  getHouseTabsData,
  invalidateCache, 
  clearUserCache,
  getPerformanceMetrics
} from '../config/api';
import { startBackgroundPrefetch, getPrefetchStatus } from '../services/PrefetchService';
import FinancialWebSocket from '../services/FinancialWebSocket';


import DashboardTopSection from '../components/dashboard/DashboardTopSection';
import DashboardPopupSection from '../components/dashboard/DashboardPopupSection';
import DashboardMiddleSection from '../components/dashboard/DashboardMiddleSection';
import DashboardBottomSection from '../components/dashboard/DashboardBottomSection';
import HowToUseCard from '../components/dashboard/middleSection/HowToUseCard';
import AcceptServicePayment from '../modals/AcceptServicePayment';
import ConsentConfirmationModal from '../modals/ConsentConfirmationModal';
import UrgentMessageModal from '../modals/UrgentMessageModal';
import BillSubmissionModal from '../modals/BillSubmissionModal';


// Import the new skeleton component
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

const ErrorScreen = ({ error = 'Something went wrong', onRetry }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={48} color="#ef4444" />
      <Text style={styles.errorText}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  </SafeAreaView>
);

// ✅ BACKEND HANDLES FILTERING: Backend now properly filters tasks by user and includes userId field
// No frontend filtering needed - trust the backend to send the correct data

// Animated Loading Component
const AnimatedLoadingScreen = ({ visible, type = 'task' }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Pulsing animation for the dots
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Rotation animation for the spinner
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      pulseAnimation.start();
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [visible, pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Dynamic text based on type
  const getLoadingText = () => {
    switch (type) {
      case 'bill':
        return {
          title: 'Bill Submitted!',
          text: 'Processing your submission...',
          subtext: 'Updating balances and syncing with your housemates'
        };
      case 'task':
      default:
        return {
          title: 'Task Accepted!',
          text: 'Processing your request...',
          subtext: 'Updating balances and syncing with your housemates'
        };
    }
  };

  const loadingText = getLoadingText();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          {/* Cool animated icon */}
          <View style={styles.loadingIconContainer}>
            <MaterialIcons name="check-circle" size={48} color="#34d399" />
            <Animated.View 
              style={[
                styles.loadingSpinner,
                { transform: [{ rotate: spin }, { scale: 1.5 }] }
              ]}
            >
              <ActivityIndicator size="large" color="#34d399" />
            </Animated.View>
          </View>
          
          <Text style={styles.loadingTitle}>{loadingText.title}</Text>
          <Text style={styles.loadingText}>{loadingText.text}</Text>
          <Text style={styles.loadingSubtext}>{loadingText.subtext}</Text>
          
          {/* Animated progress dots */}
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <Animated.View 
              style={[
                styles.dot, 
                styles.dotPulse,
                { transform: [{ scale: pulseAnim }] }
              ]} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user, token } = useAuth();
  const navigation = useNavigation();
  
  // Scroll animation value
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // ✅ NEW: Unified Dashboard Data State (replaces all individual states)
  const [dashboardData, setDashboardData] = useState({
    userFinance: { balance: '0.00', credit: '0.00' },
    houseFinance: { balance: '0.00' },
    house: { id: null, name: '', city: '', state: '' },
    userCharges: [],
    unpaidBills: [],
    tasks: [],
    billSubmissions: [],
    urgentMessages: [],
    houseUsers: [], // ✅ NEW: House users for urgent message modal
    rentAllocationRequest: null,
    rentProposals: [],
    partners: [],
    houseServices: [], // ✅ NEW: House services included in unified endpoint
    notifications: [], // ✅ NEW: Notifications included in unified endpoint
    meta: { hasLandlord: false, houseServicesCount: 0 }
  });

  // ✅ DEPRECATED: Legacy individual states (kept for backward compatibility during transition)
  const [userFinance, setUserFinance] = useState({ balance: 0, credit: 0, points: 0 });
  const [houseFinance, setHouseFinance] = useState({ balance: 0, ledger: 0 });
  const [tasks, setTasks] = useState([]);
  const [billSubmissions, setBillSubmissions] = useState([]);
  const [rentProposals, setRentProposals] = useState([]);
  const [rentAllocationRequest, setRentAllocationRequest] = useState(null);
  const [hasLandlord, setHasLandlord] = useState(false);
  const [userCharges, setUserCharges] = useState([]);
  const [urgentMessages, setUrgentMessages] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [partners, setPartners] = useState([]);
  const [house, setHouse] = useState(null);
  const [houseServicesCount, setHouseServicesCount] = useState(0);
  const [houseUsers, setHouseUsers] = useState([]); // ✅ NEW: Store house users for urgent messages
  
  // ✅ NEW: Simplified UI States (unified endpoint approach)
  const [isLoading, setIsLoading] = useState(true); // Single loading state for unified endpoint
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ NEW: Real-time WebSocket for Financial Updates
  const [financialSocket, setFinancialSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // ✅ DEPRECATED: Progressive Loading States (no longer needed with unified endpoint)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [prefetchDataLoaded, setPrefetchDataLoaded] = useState(false);
  const [prefetchLoading, setPrefetchLoading] = useState(false);
  const [prefetchRetryCount, setPrefetchRetryCount] = useState(0);
  
  // ✅ NEW: Performance monitoring state
  const [performanceData, setPerformanceData] = useState(null);

  
  // Modal states
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentTask, setSelectedPaymentTask] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  
  // Add state for BillSubmissionModal
  const [isBillSubmissionModalVisible, setIsBillSubmissionModalVisible] = useState(false);
  const [selectedBillSubmission, setSelectedBillSubmission] = useState(null);

  // Consent confirmation modal states
  const [isConsentModalVisible, setIsConsentModalVisible] = useState(false);

  // ✅ NEW: Real-time WebSocket Event Handlers
  const handleFinancialUpdate = (data) => {
    console.log('💰 Processing financial update:', data);
    
    // Show immediate feedback
    console.log(`💰 Balance updated: ${data.transactionType}`);
    
    // Clear cache and refresh dashboard data to get latest balances
    setTimeout(() => {
      // Clear all relevant caches before refreshing
      clearUserCache(user.id);
      invalidateCache('dashboard');
      invalidateCache('house');
      invalidateCache('user');
      
      loadDashboardData();
    }, 500);
  };

  const handleHouseFinancialUpdate = (data) => {
    console.log('🏠 Processing house financial update:', data);
    
    // Show immediate feedback
    console.log('🏠 House balance updated');
    
    // Clear cache and refresh dashboard data to get latest house balance
    setTimeout(() => {
      // Clear all relevant caches before refreshing
      clearUserCache(user.id);
      invalidateCache('dashboard');
      invalidateCache('house');
      invalidateCache('user');
      
      loadDashboardData();
    }, 500);
  };

  const handleBillUpdate = (data) => {
    console.log('📄 Processing bill update:', data);
    
    // Clear cache and refresh dashboard data to get updated bills
    setTimeout(() => {
      // Clear all relevant caches before refreshing
      clearUserCache(user.id);
      invalidateCache('dashboard');
      invalidateCache('house');
      invalidateCache('user');
      
      loadDashboardData();
    }, 500);
  };

  const handleChargeUpdate = (data) => {
    console.log('💳 Processing charge update:', data);
    
    // Clear cache and refresh dashboard data to get updated charges
    setTimeout(() => {
      // Clear all relevant caches before refreshing
      clearUserCache(user.id);
      invalidateCache('dashboard');
      invalidateCache('house');
      invalidateCache('user');
      
      loadDashboardData();
    }, 500);
  };

  const handleSocketConnectionChange = (connected) => {
    console.log(`🔌 WebSocket connection: ${connected ? 'connected' : 'disconnected'}`);
    setIsSocketConnected(connected);
  };

  // ✅ NEW: Unified Dashboard Data Loading Function
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 UNIFIED: Loading complete dashboard data...');
      
      const response = await getAppUserInfo(user.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load dashboard data');
      }
      
      // Update unified dashboard data
      setDashboardData(response.data);
      
      // ✅ BACKWARD COMPATIBILITY: Update legacy individual states
      const data = response.data;
      setUserFinance(data.userFinance || { balance: '0.00', credit: '0.00' });
      setHouseFinance(data.houseFinance || { balance: '0.00' });
      setHouse(data.house || null);
      setUserCharges(data.userCharges || []);
      setUnpaidBills(data.unpaidBills || []);
      setTasks(data.tasks || []);
      setBillSubmissions(data.billSubmissions || []);
      const urgentMsgs = data.urgentMessages || [];
      console.log('📨 LOADING URGENT MESSAGES:', {
        count: urgentMsgs.length,
        messages: urgentMsgs.map(m => ({
          id: m.id,
          type: m.type,
          title: m.title,
          hasMetadata: !!m.metadata,
          metadataType: typeof m.metadata,
          metadataTotalAmount: m.metadata?.totalAmount,
          billId: m.billId,
          hasBill: !!m.bill,
          hasCharge: !!m.charge,
          metadataKeys: Object.keys(m.metadata || {}),
          keys: Object.keys(m)
        })),
        fullMessages: JSON.stringify(urgentMsgs, null, 2)
      });
      setUrgentMessages(urgentMsgs);
      setRentAllocationRequest(data.rentAllocationRequest || null);
      setRentProposals(data.rentProposals || []);
      setPartners(data.partners || []);
      setHasLandlord(data.meta?.hasLandlord || false);
      setHouseServicesCount(data.meta?.houseServicesCount || 0);
      
      console.log('✅ UNIFIED: Dashboard data loaded successfully:', {
        userBalance: data.userFinance?.balance,
        houseBalance: data.houseFinance?.balance,
        tasksCount: data.tasks?.length || 0,
        partnersCount: data.partners?.length || 0,
        userChargesCount: data.userCharges?.length || 0,
        unpaidBillsCount: data.unpaidBills?.length || 0,
        hasLandlord: data.meta?.hasLandlord,
        houseServicesCount: data.meta?.houseServicesCount
      });
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ UNIFIED: Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      setIsLoading(false);
      
      // Show user-friendly error
      Alert.alert(
        'Connection Error',
        'Unable to load dashboard. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: loadDashboardData },
          { text: 'Cancel' }
        ]
      );
    }
  };

  const [consentData, setConsentData] = useState(null);
  // Removed processingTasks - now using loading screen instead
  const [isTaskProcessing, setIsTaskProcessing] = useState(false); // Show loading screen during task processing
  const [processingType, setProcessingType] = useState('task'); // Track what type of processing is happening
  const [recentlyCompletedTasks, setRecentlyCompletedTasks] = useState(new Set()); // Track recently completed tasks
  const [recentlyCompletedBillSubmissions, setRecentlyCompletedBillSubmissions] = useState(new Set()); // Track recently completed bill submissions
  const [recentlyCompletedRentProposals, setRecentlyCompletedRentProposals] = useState(new Set()); // Track recently completed rent proposals

  // Add focus effect to refresh data when screen comes into view
  const lastFocusTime = useRef(0);
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime.current;
      
      // Only refresh if it's been more than 2 seconds since last focus
      // This prevents the infinite loop while still allowing legitimate refreshes
      if (!isLoading && user?.id && timeSinceLastFocus > 2000) {
        console.log('🔄 Dashboard screen focused - refreshing data');
        lastFocusTime.current = now;
        fetchDashboardData();
      }
      
      // Restore scroll position when returning to dashboard
      const restoreScrollPosition = () => {
        const currentScrollPosition = scrollEmitter.getDashboardScrollPosition();
        const scrollThreshold = height * 0.15;
        const scrollY = currentScrollPosition * scrollThreshold;
        
        console.log('📍 Dashboard: Restoring scroll position:', {
          scrollProgress: currentScrollPosition,
          scrollY: scrollY,
          scrollThreshold: scrollThreshold
        });
        
        if (scrollViewRef.current && scrollY > 0) {
          // Small delay to ensure the ScrollView is ready
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: scrollY, animated: false });
          }, 100);
        }
      };
      
      restoreScrollPosition();
    }, [user?.id, isLoading])
  );




  // ✅ NEW: Progressive Loading - Phase 1: Instant Initial Load (300ms)
  const fetchInitialDashboardData = async () => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      setError(null);
      if (!refreshing) setIsLoading(true);

      console.log('🚀 PHASE 1: Fetching initial dashboard data for user:', user.id);
      console.log('🔐 User auth status:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email
      });

      // ✅ NEW: Phase 1 - Fast initial load
      const data = await getDashboardInitialData(user.id);
      
      // Handle nested data structure first
      const responseData = data.data || data;

      
      console.log('📊 Phase 1 Initial Data Received:', {
        loadingStrategy: responseData.meta?.loadingStrategy,
        backgroundPrefetch: responseData.meta?.backgroundPrefetch,
        partnersCount: Array.isArray(responseData.partners) ? responseData.partners.length : 0,
        pendingChargesCount: Array.isArray(responseData.pendingCharges) ? responseData.pendingCharges.length : 0,
        summaryKeys: Object.keys(responseData.summary || {}),
        hasHouse: !!responseData.house,
        hasUser: !!responseData.user,
      });
      

      
      // ✅ PHASE 1: Set essential data immediately (user, house, charges, partners)
      
      // Set user finance data
      if (responseData.user?.finance) {
        console.log('💰 Phase 1: Setting userFinance:', responseData.user.finance);
        setUserFinance(responseData.user.finance);
      }
      
      // Set house finance data  
      if (responseData.house?.finance) {
        console.log('🏠 Phase 1: Setting houseFinance:', responseData.house.finance);
        setHouseFinance(responseData.house.finance);
      }

      // Set house data
      if (responseData.house) {
        console.log('🏡 Phase 1: Setting house data');
        setHouse(responseData.house);
        setHouseServicesCount(responseData.house.houseServicesCount || 0);
        
        const hasLandlordValue = !!(responseData.house.landlord_id || responseData.house.landlordId || responseData.house.landlord);
        setHasLandlord(hasLandlordValue);
        
        const rentRequest = responseData.house.rentAllocationRequest;
        setTimeout(() => {
          setRentAllocationRequest(rentRequest || null);
        }, 0);
      }

      // Set pending charges (immediate priority)
      if (Array.isArray(responseData.pendingCharges)) {
        console.log('💳 Phase 1: Setting pending charges:', responseData.pendingCharges.length);
        setUserCharges(responseData.pendingCharges);
      }

      // Set partners data (immediate for merchants screen)
      console.log('🏪 Phase 1: Partners data check:', {
        hasPartners: !!responseData.partners,
        isArray: Array.isArray(responseData.partners),
        partnersType: typeof responseData.partners,
        partnersLength: responseData.partners?.length,
        partnersData: responseData.partners
      });
      
      if (Array.isArray(responseData.partners) && responseData.partners.length > 0) {
        console.log('🏪 Phase 1: Setting partners:', responseData.partners.length);
        setPartners(responseData.partners);
      } else {
        console.log('⚠️ Phase 1: Partners data is missing or empty - backend issue');
        console.log('🔧 Frontend: Setting empty array, Services section will show empty state');
        setPartners([]); // Set empty array as fallback
        
        // Log this as a backend issue for monitoring
        if (typeof window !== 'undefined' && window.analytics) {
          window.analytics.track('Backend Issue', {
            issue: 'Missing Partners Data',
            endpoint: '/api/dashboard/user/{userId}',
            expectedData: 'partners array',
            receivedData: typeof responseData.partners,
            timestamp: new Date().toISOString()
          });
        }
      }

      // ✅ RESTORED: Set arrays with fallbacks for immediate display
      const pendingTasks = Array.isArray(responseData.pendingTasks) ? 
        responseData.pendingTasks.filter(task => {
          const isPending = task.response === 'pending';
          const isRecentlyCompleted = recentlyCompletedTasks.has(task.id);
          return isPending && !isRecentlyCompleted;
        }) : [];

      const pendingBillSubmissions = Array.isArray(responseData.billSubmissions) ? 
        responseData.billSubmissions.filter(submission => {
          const isPending = submission.status === 'pending';
          const isRecentlyCompleted = recentlyCompletedBillSubmissions.has(submission.id);
          return isPending && !isRecentlyCompleted;
        }) : [];

      const pendingRentProposals = Array.isArray(responseData.rentProposals) ? 
        responseData.rentProposals.filter(proposal => {
          const isPending = proposal.status === 'pending';
          const isRecentlyCompleted = recentlyCompletedRentProposals.has(proposal.id);
          return isPending && !isRecentlyCompleted;
        }) : [];

      // Set state with filtered data (Phase 1 may include this data)
      setTasks(pendingTasks);
      setBillSubmissions(pendingBillSubmissions);
      setRentProposals(pendingRentProposals);
      setUrgentMessages(Array.isArray(responseData.urgentMessages) ? responseData.urgentMessages : []);
      setUnpaidBills(Array.isArray(responseData.unpaidBills) ? responseData.unpaidBills : []);



      // 🔍 DEBUG: Check the structure of unpaidCharges from dashboard endpoint
      console.log('🔍 Dashboard unpaidCharges structure:', {
        chargesCount: Array.isArray(responseData.unpaidCharges) ? responseData.unpaidCharges.length : 0,
        firstChargeStructure: responseData.unpaidCharges?.[0] ? {
          id: responseData.unpaidCharges[0].id,
          name: responseData.unpaidCharges[0].name,
          amount: responseData.unpaidCharges[0].amount,
          status: responseData.unpaidCharges[0].status,
          dueDate: responseData.unpaidCharges[0].dueDate,
          hasUser: !!responseData.unpaidCharges[0].User,
          hasBill: !!responseData.unpaidCharges[0].Bill,
          hasLowerBill: !!responseData.unpaidCharges[0].bill,
          allKeys: Object.keys(responseData.unpaidCharges[0])
        } : null,
        chargesWithDueDates: Array.isArray(responseData.unpaidCharges) ? 
          responseData.unpaidCharges.filter(c => c.dueDate).length : 0,
        sampleDueDates: Array.isArray(responseData.unpaidCharges) ? 
          responseData.unpaidCharges.slice(0, 3).map(c => ({
            id: c.id,
            name: c.name,
            dueDate: c.dueDate
          })) : []
      });

      console.log('✅ Dashboard data loaded successfully:', {
        userBalance: responseData.user?.finance?.balance,
        houseBalance: responseData.house?.finance?.balance,
        houseBalanceFromHouse: responseData.house?.houseBalance,
        houseServicesCount: responseData.house?.houseServicesCount || 0,
        tasksCount: Array.isArray(responseData.pendingTasks) ? responseData.pendingTasks.length : 0,
        messagesCount: Array.isArray(responseData.urgentMessages) ? responseData.urgentMessages.length : 0,
        unpaidBillsCount: Array.isArray(responseData.unpaidBills) ? responseData.unpaidBills.length : 0,
        availableDataKeys: Object.keys(responseData),
        shouldShowHowToUseCard: (responseData.house?.houseServicesCount || 0) === 0,
      });

      // ✅ Backend now provides complete data with unpaidBills - no fallback needed
      console.log('✅ Received dashboard data:', {
        hasUnpaidBills: Array.isArray(responseData.unpaidBills) && responseData.unpaidBills.length > 0,
        unpaidBillsCount: Array.isArray(responseData.unpaidBills) ? responseData.unpaidBills.length : 0,
        hasUserCharges: Array.isArray(responseData.unpaidCharges) && responseData.unpaidCharges.length > 0,
        userChargesCount: Array.isArray(responseData.unpaidCharges) ? responseData.unpaidCharges.length : 0,
        houseBalance: responseData.house?.houseBalance,
        houseFinanceBalance: responseData.house?.finance?.balance
      });

      // 🆕 START BACKGROUND PREFETCH after successful dashboard load
      if (!refreshing) { // Only on initial load, not on refresh
        console.log('🚀 Starting background prefetch...');
        try {
          // Start prefetching other screens in background
          startBackgroundPrefetch(user);
          
          // Log prefetch status after a short delay
          setTimeout(() => {
            const prefetchStatus = getPrefetchStatus();
            console.log('📊 Prefetch status:', prefetchStatus);
          }, 2000);
        } catch (prefetchError) {
          console.log('⚠️ Background prefetch failed to start:', prefetchError.message);
          // Don't show error to user - prefetch is background operation
        }
      }

      // ✅ PHASE 1: Mark initial data as loaded and start Phase 2
      setInitialDataLoaded(true);
      console.log('✅ Phase 1 Complete: Initial dashboard data loaded');
      
      
      // ✅ PHASE 2: Start background prefetch immediately
      setPrefetchRetryCount(0); // Reset retry count for new prefetch
      fetchPrefetchData();

    } catch (error) {
      console.log('❌ Phase 1 Dashboard data fetch failed:', error.message);
      
      // Better error handling for timeouts
      if (error.message.includes('timeout')) {
        setError('Dashboard is loading slowly. Please check your connection and try again.');
        console.log('⏱️ Timeout detected - backend may be slow');
      } else {
        setError(`Failed to load dashboard: ${error.message}`);
      }
      
      // Clear cache on error and retry
      try {
        clearUserCache(user?.id);
        console.log('🧹 Cleared user cache due to error');
      } catch (cacheError) {
        console.log('⚠️ Failed to clear cache:', cacheError.message);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ NEW: Progressive Loading - Phase 2: Background Prefetch Data
  const fetchPrefetchData = async () => {
    try {
      if (!user?.id) return;
      
      setPrefetchLoading(true);
      console.log('🔄 PHASE 2: Starting background prefetch...');

      const data = await getDashboardPrefetchData(user.id);
      const responseData = data.data || data;

      console.log('📊 Phase 2 Prefetch Data Received:', {
        metaStatus: responseData.meta?.status,
        tasksCount: Array.isArray(responseData.pendingTasks) ? responseData.pendingTasks.length : 0,
        billSubmissionsCount: Array.isArray(responseData.billSubmissions) ? responseData.billSubmissions.length : 0,
        messagesCount: Array.isArray(responseData.urgentMessages) ? responseData.urgentMessages.length : 0,
        transactionsCount: Array.isArray(responseData.recentTransactions) ? responseData.recentTransactions.length : 0,
        notificationsCount: Array.isArray(responseData.unreadNotifications) ? responseData.unreadNotifications.length : 0,
      });

      // ✅ PHASE 2: Set detailed data from prefetch
      // Fix: Backend may not include meta.status, so check if we have actual data
      const hasValidData = responseData && (
        Array.isArray(responseData.pendingTasks) || 
        Array.isArray(responseData.billSubmissions) || 
        Array.isArray(responseData.urgentMessages) ||
        responseData.meta?.status === 'cached' || 
        responseData.meta?.status === 'ready'
      );
      
      if (hasValidData) {
        // Set tasks with filtering
        const pendingTasks = Array.isArray(responseData.pendingTasks) ? 
          responseData.pendingTasks.filter(task => {
            const isPending = task.response === 'pending';
            const isRecentlyCompleted = recentlyCompletedTasks.has(task.id);
            return isPending && !isRecentlyCompleted;
          }) : [];

        // Set bill submissions with filtering
        const pendingBillSubmissions = Array.isArray(responseData.billSubmissions) ? 
          responseData.billSubmissions.filter(submission => {
            const isPending = submission.status === 'pending';
            const isRecentlyCompleted = recentlyCompletedBillSubmissions.has(submission.id);
            return isPending && !isRecentlyCompleted;
          }) : [];

        // Set rent proposals with filtering
        const pendingRentProposals = Array.isArray(responseData.rentProposals) ? 
          responseData.rentProposals.filter(proposal => {
            const isPending = proposal.status === 'pending';
            const isRecentlyCompleted = recentlyCompletedRentProposals.has(proposal.id);
            return isPending && !isRecentlyCompleted;
          }) : [];

        // Update state with prefetch data
        setTasks(pendingTasks);
        setBillSubmissions(pendingBillSubmissions);
        setRentProposals(pendingRentProposals);
        setUrgentMessages(Array.isArray(responseData.urgentMessages) ? responseData.urgentMessages : []);
        setUnpaidBills(Array.isArray(responseData.unpaidBills) ? responseData.unpaidBills : []);

        console.log('✅ Phase 2 Complete: Prefetch data loaded and applied');
        setPrefetchDataLoaded(true);
        setPrefetchRetryCount(0); // Reset retry count on success
      } else if (prefetchRetryCount < 3) {
        console.log(`🔄 Phase 2: Data still prefetching, will retry... (${prefetchRetryCount + 1}/3)`);
        setPrefetchRetryCount(prev => prev + 1);
        // Retry after a short delay if data is still being prefetched
        setTimeout(() => fetchPrefetchData(), 2000);
      } else {
        console.log('⚠️ Phase 2: Max retries reached, stopping prefetch attempts');
        setPrefetchDataLoaded(true); // Mark as loaded to stop skeleton screens
        setPrefetchRetryCount(0); // Reset for next time
      }

    } catch (error) {
      console.error('❌ Phase 2 Prefetch failed:', error.message);
      // Don't show error to user - prefetch failure shouldn't break the app
      // Initial data is already loaded and functional
    } finally {
      setPrefetchLoading(false);
    }
  };

  // ✅ LEGACY: Keep old function name for compatibility
  const fetchDashboardData = fetchInitialDashboardData;

  // ✅ NEW: Simplified Refresh Handler for Unified Endpoint
  const handleRefresh = async () => {
    console.log('🔄 REFRESH: User initiated pull-to-refresh');
    setRefreshing(true);
    
    // Clear unified endpoint cache to force fresh data
    invalidateCache('app');
    if (user?.id) {
      clearUserCache(user.id);
    }
    
    console.log('🔄 REFRESH: Cleared unified cache, fetching fresh data...');
    
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('❌ REFRESH: Failed to refresh dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ NEW: Unified Dashboard Data Loading on Mount
  useEffect(() => { 
    if (user?.id) {
      loadDashboardData(); 
    }
  }, [user?.id]);

  // ✅ NEW: WebSocket Initialization for Real-time Updates
  useEffect(() => {
    // WebSocket enabled - testing connection to api.housetabz.com
    const WEBSOCKET_ENABLED = true;
    
    if (!WEBSOCKET_ENABLED) {
      console.log('📡 WebSocket disabled - waiting for backend server to be ready');
      return;
    }
    
    if (user?.id && token) {
      console.log('🚀 Initializing financial WebSocket...');
      
      if (!token) {
        console.warn('⚠️ No auth token found for WebSocket connection');
        return;
      }

      // Create and configure WebSocket
      const socket = new FinancialWebSocket(token);
      
      // Set event handlers
      socket.setFinancialUpdateHandler(handleFinancialUpdate);
      socket.setHouseFinancialUpdateHandler(handleHouseFinancialUpdate);
      socket.setBillUpdateHandler(handleBillUpdate);
      socket.setChargeUpdateHandler(handleChargeUpdate);
      socket.setConnectionChangeHandler(handleSocketConnectionChange);
      
      // Connect
      socket.connect();
      
      // Store socket reference
      setFinancialSocket(socket);
      
      // Cleanup on unmount
      return () => {
        console.log('🔌 Cleaning up financial WebSocket...');
        socket.disconnect();
        setFinancialSocket(null);
        setIsSocketConnected(false);
      };
    }
  }, [user?.id, token]);

  // Handle message press
  const handleMessagePress = async (message) => {
    try {
      console.log('🔍 URGENT MESSAGE CLICKED:', {
        messageId: message?.id,
        messageType: message?.type,
        title: message?.title,
        body: message?.body,
        hasMetadata: !!message?.metadata,
        metadataType: typeof message?.metadata,
        metadata: message?.metadata,
        billId: message?.billId,
        allKeys: Object.keys(message || {}),
        fullMessage: JSON.stringify(message, null, 2)
      });
      
      // Show message details immediately (don't wait for API call)
      setSelectedMessage(message);
      setIsMessageModalVisible(true);
      
      // Mark the message as read in the background
      if (message?.id) {
      await apiClient.patch(`/api/urgent-messages/${message.id}/read`);
      
      // Update the local state to mark the message as read
      setUrgentMessages(currentMessages =>
        currentMessages.map(msg => 
          msg.id === message.id ? { ...msg, isRead: true } : msg
        )
      );
      }
    } catch (error) {
      console.error('Error in handleMessagePress:', error);
      // Still show the modal even if marking as read fails
      setSelectedMessage(message);
      setIsMessageModalVisible(true);
    }
  };

  // Handle message actions (pay, remind)
  const handleMessageAction = async (action, id, customMessage) => {
    try {
      if (action === 'pay') {
        // Find the charge related to this bill
        const charge = userCharges.find(c => c.billId === id);
        if (charge) {
          // Set up payment modal with this charge
          setSelectedPaymentTask({
            id: charge.id,
            amount: charge.amount || charge.baseAmount,
            name: charge.name,
            dueDate: charge.dueDate
          });
          setIsMessageModalVisible(false);
          setIsPaymentModalVisible(true);
        } else {
          console.error('No charge found for bill', id);
        }
      } else if (action === 'remind') {
        // The UrgentMessageModal now handles all the reminder logic,
        // including checking cooldown status and sending the notification
        // So we just need to close the modal here
        setIsMessageModalVisible(false);
      }
    } catch (error) {
      console.error(`Error handling message action (${action}):`, error);
    }
  };
  
  // Handle task action with cache invalidation
  const handleTaskAction = (task, action) => {
    if (action === 'view') {
      setSelectedPaymentTask(task);
        setIsPaymentModalVisible(true);
    } else if (action === 'complete') {
      // Invalidate cache when task is completed
      invalidateCache('dashboard');
      fetchDashboardData();
      }
  };

  // Handle successful payment and invalidate cache
  const handlePaymentSuccess = async (taskData) => {
    console.log('💰 Task payment successful:', taskData);
    
    try {
      // STEP 1: Show loading screen immediately
      setProcessingType('task');
      setIsTaskProcessing(true);
      console.log('🔄 LOADING: Task processing started - showing loading screen for instant feedback');
      
      // Close payment modal
      setIsPaymentModalVisible(false);
      setSelectedPaymentTask(null);
      
      // STEP 2: Update task response to "accepted" using correct endpoint
      console.log('🔄 Updating task response to accepted:', taskData);
      
      if (taskData.taskId) {
        // CORRECT: Use the documented endpoint PATCH /api/tasks/{taskId}
        const taskUpdateResponse = await apiClient.patch(`/api/tasks/${taskData.taskId}`, {
          response: taskData.response || 'accepted'
        });
        
        console.log('✅ Task response updated successfully:', taskUpdateResponse.data);
        
        // Check if payment consent was given or payment is required
        const taskResult = taskUpdateResponse.data;
        
        if (taskResult.paymentAuthorized) {
          console.log('✅ Payment consent authorized for task:', {
            taskId: taskData.taskId,
            paymentIntentId: taskResult.paymentIntentId,
            message: taskResult.message
          });
          
          // Show consent confirmation modal
          setConsentData({
            taskData: taskData,
            paymentIntentId: taskResult.paymentIntentId,
            message: taskResult.message
          });
          setIsConsentModalVisible(true);
        } else if (taskResult.requiresPayment) {
          console.log('💳 Immediate payment required for task:', {
            taskId: taskData.taskId,
            paymentAmount: taskResult.paymentAmount
          });
          
          // Handle immediate payment requirement (non-staged requests)
          Alert.alert(
            'Payment Required',
            `This task requires a payment of $${taskResult.paymentAmount}.`,
            [{ text: 'OK' }]
          );
        } else {
          console.log('✅ Task completed without payment required');
        }
      }
      
      // STEP 3: Add immediate UI feedback, then refresh data quickly
      // Remove the task from local state immediately for instant feedback
      if (taskData.taskId) {
        // Track this task as recently completed
        setRecentlyCompletedTasks(prev => new Set([...prev, taskData.taskId]));
        
        setTasks(prev => {
          const updated = prev.filter(task => task.id !== taskData.taskId);
          console.log('📋 IMMEDIATE: Removed task from local state:', {
            originalCount: prev.length,
            newCount: updated.length,
            removedTaskId: taskData.taskId
          });
          return updated;
        });
      }
      
      // Wait briefly for backend to process, then refresh data
      setTimeout(async () => {
        try {
          console.log('🔄 LOADING: Refreshing dashboard data...');
          
          // AGGRESSIVE CACHE CLEARING - make sure we get fresh data
          invalidateCache('dashboard');
          invalidateCache('house');
          invalidateCache('user');
          
          // Clear ALL user-specific cache
          if (user?.id) {
            clearUserCache(user.id);
          }
          
          // Force a direct API call bypassing all caches
          console.log('🔄 LOADING: Making direct API call to bypass cache...');
          const response = await apiClient.get(`/api/dashboard/user/${user.id}?nocache=${Date.now()}`);
          const responseData = response.data.data || response.data;
          
          // Update all state immediately with fresh data
          if (responseData.user?.finance) {
            console.log('💰 LOADING: Updating userFinance from fresh API:', responseData.user.finance);
            setUserFinance(responseData.user.finance);
          }
          
          if (responseData.house?.finance) {
            console.log('🏠 LOADING: Updating houseFinance from fresh API:', responseData.house.finance);
            setHouseFinance(responseData.house.finance);
          }

          if (responseData.house) {
            console.log('🏡 LOADING: Updating house data from fresh API');
            setHouse(responseData.house);
            setHouseServicesCount(responseData.house.houseServicesCount || 0);
          }

          // Update tasks - the completed task should no longer be in pending tasks
          if (responseData.pendingTasks) {
            const pendingTasks = Array.isArray(responseData.pendingTasks) ? 
              responseData.pendingTasks.filter(task => task.response === 'pending') : [];
            console.log('📋 LOADING: Updating tasks from fresh API:', {
              'Backend tasks': responseData.pendingTasks.length,
              'Pending tasks': pendingTasks.length,
              'Task IDs': pendingTasks.map(t => t.id)
            });
            setTasks(pendingTasks);
          }

          // Update bill submissions - backend handles user filtering
          if (responseData.billSubmissions) {
            const billSubmissions = Array.isArray(responseData.billSubmissions) ? 
              responseData.billSubmissions : [];
            console.log('📄 LOADING: Updating billSubmissions from fresh API:', {
              'Bill submissions': billSubmissions.length
            });
            setBillSubmissions(billSubmissions);
          }

          if (responseData.unpaidCharges) {
            console.log('💳 LOADING: Updating userCharges from fresh API:', responseData.unpaidCharges.length);
            setUserCharges(responseData.unpaidCharges);
          }

          if (responseData.urgentMessages) {
            console.log('📨 LOADING: Updating urgentMessages from fresh API:', responseData.urgentMessages.length);
            setUrgentMessages(responseData.urgentMessages);
          }

          if (responseData.unpaidBills) {
            console.log('🧾 LOADING: Updating unpaidBills from fresh API:', responseData.unpaidBills.length);
            setUnpaidBills(responseData.unpaidBills);
          }
          
          // Update partners data from fresh API
          if (responseData.partners) {
            console.log('🏪 LOADING: Updating partners from fresh API:', responseData.partners.length);
            setPartners(responseData.partners);
          }
          
          console.log('✅ LOADING: Dashboard data refreshed successfully with direct API call');
          
        } catch (error) {
          console.error('❌ LOADING: Failed to refresh dashboard data:', error);
          // Fallback to regular refresh if direct API call fails
          try {
            await fetchDashboardData();
          } catch (fallbackError) {
            console.error('❌ LOADING: Fallback refresh also failed:', fallbackError);
          }
        } finally {
          // STEP 4: Hide loading screen
          setIsTaskProcessing(false);
          console.log('✅ LOADING: Task processing completed - hiding loading screen');
          
          // Clear recently completed tasks after 2 minutes to prevent permanent filtering
          setTimeout(() => {
            if (taskData.taskId) {
              setRecentlyCompletedTasks(prev => {
                const updated = new Set(prev);
                updated.delete(taskData.taskId);
                console.log('🧹 CLEANUP: Removed task from recently completed list:', taskData.taskId);
                return updated;
              });
            }
          }, 120000); // 2 minutes
        }
      }, 1000); // 1 second delay to ensure backend processing is complete + immediate UI feedback
      
    } catch (error) {
      console.error('❌ Task acceptance failed:', error);
      
      // Hide loading screen on error
      setIsTaskProcessing(false);
      
      // Show detailed error information
      let errorMessage = 'Failed to accept task. Please try again.';
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Handle specific error cases
        if (error.response.status === 400) {
          errorMessage = 'Invalid task response. Please try again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to accept this task.';
        } else if (error.response.status === 404) {
          errorMessage = 'Task not found. It may have been completed by someone else.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Task Update Failed', errorMessage, [{ text: 'OK' }]);
    }
  };
  
  // Handle bill submission success
  // Handle bill submission success - same pattern as task completion
  const handleBillSubmissionSuccess = async (result) => {
    console.log('💰 Bill submission successful:', result);
    
    try {
      // STEP 1: Show loading screen immediately
      setProcessingType('bill');
      setIsTaskProcessing(true);
      console.log('🔄 LOADING: Bill submission processing started - showing loading screen for instant feedback');
      
      // Close bill submission modal
      setIsBillSubmissionModalVisible(false);
      
      // STEP 2: Update finances immediately if available in the response
      if (result?.billSubmission?.Bill) {
        const newBill = result.billSubmission.Bill;
        const billTotal = newBill.totalAmount || newBill.amount || 0;
        
        console.log('💰 IMMEDIATE: Updating finances with bill data:', {
          billTotal,
          billId: newBill.id
        });
        
        // Update house finance immediately (subtract the bill amount)
        setHouseFinance(prev => ({
          ...prev,
          balance: prev.balance - billTotal
        }));
        
        // If there are charges for the current user, update user finance
        if (result.charges) {
          const userCharge = result.charges.find(charge => charge.userId === user.id);
          if (userCharge) {
            setUserFinance(prev => ({
              ...prev,
              balance: prev.balance - userCharge.amount
            }));
            console.log('💰 IMMEDIATE: Updated user finance with charge:', userCharge.amount);
          }
        }
      }
      
      // STEP 3: Add immediate UI feedback, then refresh data quickly
      // Remove the bill submission from local state immediately for instant feedback
      if (selectedBillSubmission?.id) {
        // Track this bill submission as recently completed
        setRecentlyCompletedBillSubmissions(prev => new Set([...prev, selectedBillSubmission.id]));
        
        setBillSubmissions(prev => {
          const updated = prev.filter(submission => submission.id !== selectedBillSubmission.id);
          console.log('📄 IMMEDIATE: Removed bill submission from local state:', {
            originalCount: prev.length,
            newCount: updated.length,
            removedSubmissionId: selectedBillSubmission.id
          });
          return updated;
        });
      }
      
      // Clear selected bill submission
      setSelectedBillSubmission(null);
      
      // Wait briefly for backend to process, then refresh data
      setTimeout(async () => {
        try {
          console.log('🔄 LOADING: Refreshing dashboard data after bill submission...');
          
          // AGGRESSIVE CACHE CLEARING - make sure we get fresh data
          invalidateCache('dashboard');
          invalidateCache('house');
          invalidateCache('user');
          
          // Clear ALL user-specific cache
          if (user?.id) {
            clearUserCache(user.id);
          }
          
          // Force a direct API call bypassing all caches
          console.log('🔄 LOADING: Making direct API call to bypass cache...');
          const response = await apiClient.get(`/api/dashboard/user/${user.id}?nocache=${Date.now()}`);
          const responseData = response.data.data || response.data;
          
          // Update all state immediately with fresh data
          if (responseData.user?.finance) {
            console.log('💰 LOADING: Updating userFinance from fresh API:', responseData.user.finance);
            setUserFinance(responseData.user.finance);
          }
          
          if (responseData.house?.finance) {
            console.log('🏠 LOADING: Updating houseFinance from fresh API:', responseData.house.finance);
            setHouseFinance(responseData.house.finance);
          }

          if (responseData.house) {
            console.log('🏡 LOADING: Updating house data from fresh API');
            setHouse(responseData.house);
            setHouseServicesCount(responseData.house.houseServicesCount || 0);
          }

          // Update tasks - filter by pending status and recently completed
          if (responseData.pendingTasks) {
            const pendingTasks = Array.isArray(responseData.pendingTasks) ? 
              responseData.pendingTasks.filter(task => {
                const isPending = task.response === 'pending';
                const isRecentlyCompleted = recentlyCompletedTasks.has(task.id);
                return isPending && !isRecentlyCompleted;
              }) : [];
            console.log('📋 LOADING: Updating tasks from fresh API:', {
              'Backend tasks': responseData.pendingTasks.length,
              'Pending tasks': pendingTasks.length,
              'Task IDs': pendingTasks.map(t => t.id)
            });
            setTasks(pendingTasks);
          }

          // Update bill submissions - the completed submission should no longer be pending
          if (responseData.billSubmissions) {
            const pendingBillSubmissions = Array.isArray(responseData.billSubmissions) ? 
              responseData.billSubmissions.filter(submission => {
                const isPending = submission.status === 'pending';
                const isRecentlyCompleted = recentlyCompletedBillSubmissions.has(submission.id);
                return isPending && !isRecentlyCompleted;
              }) : [];
            console.log('📄 LOADING: Updating bill submissions from fresh API:', {
              'Backend bill submissions': responseData.billSubmissions.length,
              'Pending bill submissions': pendingBillSubmissions.length,
              'Bill submission IDs': pendingBillSubmissions.map(b => b.id)
            });
            setBillSubmissions(pendingBillSubmissions);
          }

          if (responseData.unpaidCharges) {
            console.log('💳 LOADING: Updating userCharges from fresh API:', responseData.unpaidCharges.length);
            setUserCharges(responseData.unpaidCharges);
          }

          if (responseData.urgentMessages) {
            console.log('📨 LOADING: Updating urgentMessages from fresh API:', responseData.urgentMessages.length);
            setUrgentMessages(responseData.urgentMessages);
          }

                    if (responseData.unpaidBills) {
            console.log('🧾 LOADING: Updating unpaidBills from fresh API:', responseData.unpaidBills.length);
            setUnpaidBills(responseData.unpaidBills);
          }
          
          // Update partners data from fresh API
          if (responseData.partners) {
            console.log('🏪 LOADING: Updating partners from fresh API:', responseData.partners.length);
            setPartners(responseData.partners);
          }

          console.log('✅ LOADING: Dashboard data refreshed successfully after bill submission');
          
        } catch (error) {
          console.error('❌ LOADING: Failed to refresh dashboard data after bill submission:', error);
          // Fallback to regular refresh if direct API call fails
          try {
            await fetchDashboardData();
          } catch (fallbackError) {
            console.error('❌ LOADING: Fallback refresh also failed:', fallbackError);
          }
        } finally {
          // STEP 4: Hide loading screen
          setIsTaskProcessing(false);
          console.log('✅ LOADING: Bill submission processing completed - hiding loading screen');
          
          // Clear recently completed bill submissions after 2 minutes to prevent permanent filtering
          setTimeout(() => {
            if (selectedBillSubmission?.id) {
              setRecentlyCompletedBillSubmissions(prev => {
                const updated = new Set(prev);
                updated.delete(selectedBillSubmission.id);
                console.log('🧹 CLEANUP: Removed bill submission from recently completed list:', selectedBillSubmission.id);
                return updated;
              });
            }
          }, 120000); // 2 minutes
        }
      }, 1000); // 1 second delay to ensure backend processing is complete + immediate UI feedback
      
    } catch (error) {
      console.error('❌ Bill submission processing failed:', error);
      
      // Hide loading screen on error
      setIsTaskProcessing(false);
      
      // Show error message
      Alert.alert('Bill Submission Failed', 'Failed to process bill submission. Please try again.', [{ text: 'OK' }]);
    }
  };

  // ENHANCED: Handle task press based on type
  const handleTaskPress = (task) => {
    console.log('handleTaskPress called with task:', task);
    
    // NEW: Use positive identification based on reliable fields from enhanced backend API
    // Bill submissions will have: status + houseServiceId + service_name
    // Service requests will have: serviceRequestBundleId + response + type
    const isBillSubmission = task.status !== undefined && task.houseServiceId !== undefined;
    const isServiceRequest = task.serviceRequestBundleId !== undefined && task.response !== undefined;
    
    console.log('✅ Enhanced Task Classification:', {
      taskId: task.id,
      classification: isBillSubmission ? 'BILL_SUBMISSION' : isServiceRequest ? 'SERVICE_REQUEST' : 'UNKNOWN',
      // Bill submission indicators
      hasStatus: !!task.status,
      hasHouseServiceId: !!task.houseServiceId,
      serviceName: task.service_name,
      serviceType: task.service_type,
      dueDate: task.dueDate,
      // Service request indicators  
      hasServiceRequestBundleId: !!task.serviceRequestBundleId,
      hasResponse: !!task.response,
      taskType: task.type,
      paymentRequired: task.paymentRequired,
      paymentAmount: task.paymentAmount,
      // Bundle details from enhanced API
      bundleId: task.bundle_id,
      takeoverServiceName: task.takeover_service_name,
      stagedServiceName: task.staged_service_name,
      virtualCardServiceName: task.virtual_card_service_name
    });
      
    if (isBillSubmission) {
      console.log('🧾 Opening bill submission modal for:', {
        id: task.id,
        serviceName: task.service_name,
        dueDate: task.dueDate,
        status: task.status
      });
      setSelectedBillSubmission(task);
      setIsBillSubmissionModalVisible(true);
    } else if (isServiceRequest) {
      console.log('⚡ Opening service payment modal for:', {
        id: task.id,
        bundleId: task.serviceRequestBundleId,
        response: task.response,
        paymentAmount: task.paymentAmount,
        serviceType: task.takeover_service_name || task.staged_service_name || task.virtual_card_service_name
      });
      handleTaskAction(task, 'view');
    } else {
      // This should not happen with the enhanced backend API
      console.error('❌ Unknown task type - missing classification fields:', {
        taskId: task.id,
        availableFields: Object.keys(task),
        hasStatus: !!task.status,
        hasHouseServiceId: !!task.houseServiceId,
        hasServiceRequestBundleId: !!task.serviceRequestBundleId,
        hasResponse: !!task.response
      });
      Alert.alert(
        'Classification Error', 
        `Unable to determine task type. Task ID: ${task.id}\n\nThis may indicate a backend data issue.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Handle rent proposal press
  const handleRentProposalPress = (proposal) => {
    console.log('handleRentProposalPress called with proposal:', proposal);
    
    if (proposal.status === 'draft') {
      // Navigate to edit proposal
      navigation.navigate('CreateRentProposal', {
        houseId: proposal.houseId,
        rentConfigurationId: proposal.rentConfigurationId,
        totalRentAmount: proposal.totalRentAmount,
        existingProposalId: proposal.id
      });
    } else {
      // Navigate to view proposal details
      navigation.navigate('ViewRentProposal', {
        rentProposalId: proposal.id
      });
    }
  };

  // Handle rent allocation request claim
  const handleRentAllocationClaim = () => {
    console.log('Rent allocation request claimed - refreshing dashboard data');
    // Refresh dashboard data to remove the claimed request
    fetchDashboardData();
  };

  // Handle navigation to rent proposal creation
  const handleNavigateToProposal = (params) => {
    console.log('Navigating to rent proposal creation with params:', params);
    navigation.navigate('CreateRentProposal', params);
  };

  // Handle rent allocation request creation
  const handleCreateRentProposal = () => {
    if (!rentAllocationRequest?.canCreateProposal || !house?.id) {
      Alert.alert(
        'Cannot Create Proposal',
        'Unable to create proposal at this time. Please try again.'
      );
      return;
    }

    // Navigate directly to proposal creation
    navigation.navigate('CreateRentProposal', {
      houseId: house.id,
      rentConfigurationId: rentAllocationRequest.rentConfiguration.id,
      totalRentAmount: rentAllocationRequest.rentConfiguration.monthlyRentAmount
    });
  };
  
  const handleViewAllTasks = () => {
    // Handle view all tasks (implement as needed)
    console.log('View all tasks pressed');
  };
  
  const handleViewAllMessages = () => {
    // Handle view all messages (implement as needed)
    console.log('View all messages pressed');
  };

  // Show skeleton while loading (not refreshing)
  if (isLoading && !refreshing) {
    return <DashboardSkeleton />;
  }

  // ✅ NEW: Simple loading screen for unified endpoint
  if (isLoading && !dashboardData.house.id) {
    return <DashboardSkeleton />;
  }

  // Show error screen if there's an error
  if (error && !dashboardData.house.id) {
    return <ErrorScreen error={error} onRetry={loadDashboardData} />;
  }

  // Calculate scroll-based gradient colors
  const scrollThreshold = height * 0.15; // 15% of screen height
  
  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, scrollThreshold],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic gradient overlay that fades based on scroll */}
      <Animated.View style={[styles.gradientOverlay, { opacity: gradientOpacity }]}>
        <LinearGradient
          colors={['#34d399', 'rgba(52, 211, 153, 0.7)', 'rgba(52, 211, 153, 0.3)', '#dff6f0']}
          style={styles.gradient}
          pointerEvents="none"
        />
      </Animated.View>
      
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: false,
            listener: (event) => {
              const scrollValue = event.nativeEvent.contentOffset.y;
              const progress = Math.max(0, Math.min(scrollValue / scrollThreshold, 1));
              scrollEmitter.emit('dashboardScroll', progress);
            }
          }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor="#ffffff" 
          />
        }
      >
        
        <View style={styles.topSectionContainer}>
          <DashboardTopSection
            userFinance={userFinance}
            houseFinance={houseFinance}
            userCharges={userCharges}
            house={house}
            unpaidBills={unpaidBills}
          />
        </View>

        <View style={styles.sectionContainer}>

          
          <DashboardPopupSection
            urgentMessages={urgentMessages}
            tasks={tasks}
            billSubmissions={billSubmissions}
            rentProposals={rentProposals}
            rentAllocationRequest={rentAllocationRequest}
            rentAllocationLoading={isLoading}
            houseId={house?.id}
            hasLandlord={hasLandlord}
            onTaskPress={handleTaskPress}
            onMessagePress={handleMessagePress}
            onRentProposalPress={handleRentProposalPress}
            onCreateRentProposal={handleCreateRentProposal}
            onViewAllTasks={handleViewAllTasks}
            onViewAllMessages={handleViewAllMessages}
            recentlyCompletedTasks={recentlyCompletedTasks}
            recentlyCompletedBillSubmissions={recentlyCompletedBillSubmissions}
            recentlyCompletedRentProposals={recentlyCompletedRentProposals}
            prefetchDataLoaded={prefetchDataLoaded}
            prefetchLoading={prefetchLoading}
          />
        </View>

        {/* Show HowToUseCard for new users (no services) after popup section */}
        {houseServicesCount === 0 && (
          <View style={styles.sectionContainer}>
            <HowToUseCard />
          </View>
        )}

        <View style={styles.sectionContainer}>
          <DashboardMiddleSection 
            tasks={tasks}
            billSubmissions={billSubmissions}
            onTaskAction={handleTaskAction}
            onDataChange={fetchDashboardData}
          />
        </View>

        <View style={styles.sectionContainer}>
          <DashboardBottomSection 
            userData={user}
            partners={partners}
            partnersLoading={isLoading}
            partnersError={error}
          />
        </View>

        {/* Show HowToUseCard for experienced users (have services) under services section */}
        {houseServicesCount > 0 && (
          <View style={styles.sectionContainer}>
            <HowToUseCard />
          </View>
        )}
      </Animated.ScrollView>

      {/* Payment Modal */}
      <AcceptServicePayment
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
        taskData={selectedPaymentTask}
      />

      {/* Message Detail Modal */}
      <UrgentMessageModal
        visible={isMessageModalVisible}
        message={selectedMessage}
        onClose={() => {
          setIsMessageModalVisible(false);
          setSelectedMessage(null);
        }}
        onAction={handleMessageAction}
      />
      
      {/* Bill Submission Modal - Added */}
      <BillSubmissionModal
        visible={isBillSubmissionModalVisible}
        onClose={() => setIsBillSubmissionModalVisible(false)}
        billSubmission={selectedBillSubmission}
        onSuccess={handleBillSubmissionSuccess}
      />

      {/* Consent Confirmation Modal */}
      <ConsentConfirmationModal
        visible={isConsentModalVisible}
        onClose={() => {
          setIsConsentModalVisible(false);
          setConsentData(null);
        }}
        taskData={consentData?.taskData}
        paymentIntentId={consentData?.paymentIntentId}
        message={consentData?.message}
      />

      {/* Task Processing Loading Screen */}
      <AnimatedLoadingScreen visible={isTaskProcessing} type={processingType} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dff6f0' },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    zIndex: -1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: { paddingTop: 0, paddingBottom: 12 },
  topSectionContainer: { /* No margin to allow seamless gradient flow */ },
  sectionContainer: { marginBottom: 8 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  errorText: { marginTop: 16, marginBottom: 24, fontSize: 16, color: '#ef4444', textAlign: 'center' },
  retryButton: { backgroundColor: '#34d399', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  // Loading screen styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#34d399',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    minWidth: 280,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  loadingIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingSpinner: {
    position: 'absolute',
    transform: [{ scale: 1.5 }],
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#e5e7eb',
  },
  dotActive: {
    backgroundColor: '#34d399',
  },
  dotPulse: {
    backgroundColor: '#34d399',
    transform: [{ scale: 1.2 }],
  },
});

export default DashboardScreen;