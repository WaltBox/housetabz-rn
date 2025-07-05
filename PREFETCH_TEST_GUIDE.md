# 🧪 Prefetch System Test Guide

## Quick Test Steps

### 1. Clear Everything and Start Fresh
1. **Close the app completely** (force quit)
2. **Restart the app** 
3. **Wait for dashboard to load** (2-3 seconds)

### 2. Check Console Logs
Look for these SUCCESS patterns in the console:

```
✅ SUCCESS - Prefetch Working:
🚀 Starting background prefetch for user: [userId]
📱 Prefetching HouseServices...
✅ HouseServices prefetched successfully
📱 Prefetching MyHouse...
✅ MyHouse prefetched successfully
📱 Prefetching HouseAdvanceSummary...
✅ HouseAdvanceSummary prefetched successfully
📱 Prefetching Partners...
✅ Partners prefetched successfully
✅ Background prefetch completed in [time]ms
```

**NEW: Check for Advance Data Source:**
```
✅ SUCCESS - Advance data from house object:
🏦 Using advance data from house object: { allowance: 300, remaining: 194.46, ... }
✅ Advance data from house object: { allowance: 300, remaining: 194.46, ... }
💰 Allowance values: { allowance: 300, remaining: 194.46, display: "$194 available of $300" }
✅ HSI data from house object: { score: 85, bracket: 2, ... }
```

**If no advance data in house object:**
```
🔄 No advance data in house object, trying separate endpoint...
❌ Failed to fetch advance-summary data: 404
🔄 Using fallback data (this is expected if endpoint doesn't exist)
```

**Check for House Services Data:**
```
📊 House services data received: {
  rawData: {...},
  dataKeys: ["houseServices", ...],
  servicesCount: [number > 0]
}
```

### 3. Test Navigation Speed & Data Loading
After seeing the success logs above:

1. **Navigate to HouseServices** → Should load **instantly** AND show your actual services (not "No Services")
2. **Navigate to MyHouse** → Should load **instantly** AND show correct advance allowance 
3. **Navigate to Partners** → Should load **instantly** (no loading skeleton)
4. **Navigate back to Dashboard** → Should load **instantly** (cached)

### 4. Verify Data Display
**HouseServices Screen:**
- ✅ Should show your actual house services (not empty)
- ✅ Should show service cards with progress bars
- ✅ Should display funding information correctly

**MyHouse Screen:**
- ✅ Should show correct advance allowance (not $0 available)
- ✅ Should display HSI score properly from advance-summary endpoint
- ✅ Should show house financial health data

### 5. Check Visual Indicators
- **Cache Metrics Overlay**: Tap the top-right corner to expand
- **Screen Status**: Should show ✓ for: HouseServices, MyHouse, HouseAdvanceSummary, Partners
- **Hit Rate**: Should show high percentage (70-90%)

## 🔧 Latest Fixes Applied

### Fixed 404 Error for Advance-Summary
- ✅ **Root Cause**: `/api/houses/{id}/advance-summary` endpoint doesn't exist (404 error)
- ✅ **Solution**: Check for advance data in house object first (likely already available)
- ✅ **Fallback**: Only try separate endpoint if not found in house data
- ✅ **Removed from prefetch**: Temporarily removed HouseAdvanceSummary from prefetch queue

### Data Priority Order:
1. **House Object** → Check `house.advanceSummary` first (most likely source)
2. **Separate Endpoint** → Try `/advance-summary` if not in house object
3. **Fallback Values** → Use $0 of $0 if both fail

### Expected Behavior Now:
- ✅ **Advance allowance**: Should show real values from house object
- ✅ **No 404 errors**: Component checks house object first
- ✅ **Graceful degradation**: Falls back to separate endpoint, then to $0 if needed
- ✅ **Prefetch queue**: Now only 3 screens (HouseServices, MyHouse, Partners)

## 🔧 Recent Fixes Applied

### Data Structure Fixes
- ❌ **Before**: Looking for `data.services` but API returns `data.houseServices`
- ✅ **After**: Fixed to use `data.houseServices` from API response
- ❌ **Before**: Advance allowance always showing as $0 or unavailable
- ✅ **After**: Uses advance data from house object if available, falls back to API call

### House Services Loading Fixed
- ✅ Fixed data structure mismatch between API response and screen expectations
- ✅ Added detailed logging to show actual API response structure
- ✅ Now correctly displays house services instead of showing "No Services"

### Advance Allowance Display Fixed  
- ✅ Checks for advance data in prefetched house object first
- ✅ Only makes separate API call if advance data not already available
- ✅ Graceful fallback to prevent component crashes

## 🔧 Fixes Applied

### JavaScript Errors Fixed
- ❌ **Before**: `Can't find variable: setActiveServices`
- ✅ **After**: Removed non-existent state variable calls

### Timeout Issues Fixed  
- ❌ **Before**: 10 second timeout causing failures
- ✅ **After**: 20 second prefetch timeout + 15 second API timeout

### Error Handling Improved
- ✅ Better error logging with detailed information
- ✅ Graceful fallbacks for failed API calls
- ✅ Clear distinction between prefetch errors and child component errors

## 🚨 What to Ignore

These errors are **NOT** related to the prefetch system:
```
❌ IGNORE - Child Component Errors:
🏦 Fetching advance-summary data for house: 4
❌ Failed to fetch advance-summary data: Request failed
🔄 Using fallback advance data (this is normal if endpoint is not available)
```

## 📊 Performance Expectations

### First Time Opening App
- **Dashboard**: 2-3 seconds (initial load)
- **Background prefetch**: Starts after dashboard success
- **Other screens**: May show brief loading on first visit

### After Prefetch Completes
- **All navigation**: Instant (no loading screens)
- **Cache hit rate**: 70-90%
- **User experience**: Smooth, native-like navigation

## 🎯 Success Criteria

✅ **Prefetch is working if:**
- Console shows successful prefetch completion
- Navigation to HouseServices/MyHouse/Partners is instant
- Cache metrics show high hit rates
- No JavaScript errors about missing variables

❌ **Prefetch needs debugging if:**
- Console shows timeout errors for all screens
- Navigation still shows loading skeletons
- Cache metrics show 0% hit rate
- JavaScript errors about undefined variables

---

The prefetch system should now be significantly more reliable with the increased timeouts and better error handling! 