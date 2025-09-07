import { 
  getAppUserInfo,
  getHouseServicesData, // DEPRECATED - keeping for fallback
  getHouseTabsData, 
  getHouseAdvanceSummaryData,
  getCacheMetrics,
  invalidateCache
} from '../config/api';

// Prefetch configuration
const PREFETCH_CONFIG = {
  enabled: true,
  delayBetweenRequests: 1500, // 1.5 seconds between each prefetch
  maxRetries: 2,
  timeoutDuration: 20000, // 20 seconds timeout per request (increased from 10s)
};

// Track prefetch status
let prefetchStatus = {
  isRunning: false,
  completedScreens: [],
  failedScreens: [],
  startTime: null,
  endTime: null,
};

// ✅ NEW: Simplified prefetch queue - HouseServices now included in unified endpoint
const PREFETCH_QUEUE = [
  // ✅ REMOVED: HouseServices - now included in unified /api/app/userinfo endpoint
  {
    name: 'MyHouse', 
    fetchFunction: getHouseTabsData,
    requiresHouseId: true,
    priority: 1,
  },
  // {
  //   name: 'HouseAdvanceSummary',
  //   fetchFunction: getHouseAdvanceSummaryData,
  //   requiresHouseId: true,
  //   priority: 2,
  // },
  // ✅ REMOVED: Partners - now included in unified endpoint
  // ✅ REMOVED: HouseServices - now included in unified endpoint
];

/**
 * Main prefetch service - starts background loading after dashboard success
 */
export const startBackgroundPrefetch = async (user) => {
  if (!PREFETCH_CONFIG.enabled) {
    console.log('🚫 Background prefetch disabled');
    return;
  }

  if (prefetchStatus.isRunning) {
    console.log('🔄 Background prefetch already running');
    return;
  }

  if (!user?.id) {
    console.log('❌ Cannot prefetch: No user data');
    return;
  }

  console.log('🚀 Starting background prefetch for user:', user.id);
  
  prefetchStatus = {
    isRunning: true,
    completedScreens: [],
    failedScreens: [],
    startTime: Date.now(),
    endTime: null,
  };

  try {
    await runPrefetchQueue(user);
  } catch (error) {
    console.log('❌ Background prefetch failed:', error.message);
  } finally {
    prefetchStatus.isRunning = false;
    prefetchStatus.endTime = Date.now();
    
    const duration = prefetchStatus.endTime - prefetchStatus.startTime;
    console.log(`✅ Background prefetch completed in ${duration}ms`, {
      completed: prefetchStatus.completedScreens,
      failed: prefetchStatus.failedScreens,
    });
  }
};

/**
 * Execute prefetch queue with delays and error handling
 */
const runPrefetchQueue = async (user) => {
  for (const screen of PREFETCH_QUEUE) {
    try {
      console.log(`📱 Prefetching ${screen.name}...`);
      
      // Check if user has required data for this screen
      if (screen.requiresHouseId && !user.houseId) {
        console.log(`⚠️ Skipping ${screen.name}: No house ID`);
        continue;
      }

      // Execute prefetch with timeout
      await Promise.race([
        prefetchScreen(screen, user),
        createTimeout(PREFETCH_CONFIG.timeoutDuration)
      ]);

      prefetchStatus.completedScreens.push(screen.name);
      console.log(`✅ ${screen.name} prefetched successfully`);

      // Delay before next prefetch (except for last item)
      const isLastItem = PREFETCH_QUEUE.indexOf(screen) === PREFETCH_QUEUE.length - 1;
      if (!isLastItem) {
        await delay(PREFETCH_CONFIG.delayBetweenRequests);
      }

    } catch (error) {
      console.log(`❌ Failed to prefetch ${screen.name}:`, error.message);
      console.log(`📊 Error details:`, {
        screenName: screen.name,
        errorType: error.name,
        message: error.message,
        isTimeout: error.message.includes('timeout'),
        isNetworkError: error.message.includes('Network') || error.message.includes('fetch'),
        timestamp: new Date().toISOString()
      });
      
      prefetchStatus.failedScreens.push({
        name: screen.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Continue with next screen even if one fails
      continue;
    }
  }
};

/**
 * Prefetch individual screen with retry logic
 */
const prefetchScreen = async (screen, user, retryCount = 0) => {
  try {
    const startTime = Date.now();
    
    // Determine parameters based on screen requirements
    let result;
    if (screen.requiresHouseId) {
      result = await screen.fetchFunction(user.houseId);
    } else {
      result = await screen.fetchFunction();
    }

    const duration = Date.now() - startTime;
    console.log(`📊 ${screen.name} loaded in ${duration}ms`);
    
    return result;
  } catch (error) {
    if (retryCount < PREFETCH_CONFIG.maxRetries) {
      console.log(`🔄 Retrying ${screen.name} (attempt ${retryCount + 1}/${PREFETCH_CONFIG.maxRetries})`);
      await delay(1000 * (retryCount + 1)); // Progressive delay
      return prefetchScreen(screen, user, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Get current prefetch status
 */
export const getPrefetchStatus = () => {
  return {
    ...prefetchStatus,
    cacheMetrics: getCacheMetrics(),
    isComplete: prefetchStatus.endTime !== null,
    duration: prefetchStatus.endTime ? 
      prefetchStatus.endTime - prefetchStatus.startTime : 
      Date.now() - prefetchStatus.startTime,
  };
};

/**
 * Check if a specific screen has been prefetched
 */
export const isScreenPrefetched = (screenName) => {
  return prefetchStatus.completedScreens.includes(screenName);
};

/**
 * Force prefetch a specific screen
 */
export const prefetchSpecificScreen = async (screenName, user) => {
  const screen = PREFETCH_QUEUE.find(s => s.name === screenName);
  if (!screen) {
    throw new Error(`Screen ${screenName} not found in prefetch queue`);
  }

  console.log(`🎯 Force prefetching ${screenName}...`);
  return await prefetchScreen(screen, user);
};

/**
 * Stop background prefetch if running
 */
export const stopBackgroundPrefetch = () => {
  if (prefetchStatus.isRunning) {
    console.log('🛑 Stopping background prefetch');
    prefetchStatus.isRunning = false;
  }
};

/**
 * Clear prefetch status and cache
 */
export const clearPrefetchData = () => {
  console.log('🧹 Clearing prefetch data');
  prefetchStatus = {
    isRunning: false,
    completedScreens: [],
    failedScreens: [],
    startTime: null,
    endTime: null,
  };
  
  // Optionally clear related caches
  invalidateCache('house');
  invalidateCache('partners');
};

/**
 * Update prefetch configuration
 */
export const updatePrefetchConfig = (newConfig) => {
  Object.assign(PREFETCH_CONFIG, newConfig);
  console.log('⚙️ Updated prefetch config:', PREFETCH_CONFIG);
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createTimeout = (ms) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
);

// Development helpers
export const getPrefetchConfig = () => PREFETCH_CONFIG;
export const getPrefetchQueue = () => PREFETCH_QUEUE;

export default {
  startBackgroundPrefetch,
  getPrefetchStatus,
  isScreenPrefetched,
  prefetchSpecificScreen,
  stopBackgroundPrefetch,
  clearPrefetchData,
  updatePrefetchConfig,
  getPrefetchConfig,
  getPrefetchQueue,
}; 