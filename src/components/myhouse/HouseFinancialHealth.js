// HouseFinancialHealth.js - Aesthetic redesign, no massive white containers

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useFonts } from 'expo-font';
import apiClient, { getHouseAdvanceSummaryData } from '../../config/api';
import { isScreenPrefetched } from '../../services/PrefetchService';

const { width } = Dimensions.get('window');

const HouseFinancialHealth = ({ house, onInfoPress }) => {
  const [advanceData, setAdvanceData] = useState(null);
  const [hsiData, setHsiData] = useState(null);
  
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Montserrat-Black': require('../../../assets/fonts/Montserrat-Black.ttf'),
  });

  // Fetch advance allowance and HSI data from advance-summary endpoint
  useEffect(() => {
    const fetchAdvanceSummaryData = async () => {
      try {
        if (house?.id) {
          
          // FIRST: Check if advance data is already included in house object
          if (house?.advanceSummary) {
            console.log('🏦 Using advance data from house object:', house.advanceSummary);
            
            // Parse the advance data from house object
            const advanceInfo = {
              allowance: house.advanceSummary.totalAllowance || house.advanceSummary.allowance || 0,
              remaining: house.advanceSummary.remainingAvailable || house.advanceSummary.remaining || 0,
              outstandingAdvanced: house.advanceSummary.currentlyAdvanced || house.advanceSummary.outstandingAdvanced || 0,
              utilizationPercentage: house.advanceSummary.utilizationPercentage || 0
            };
            
            setAdvanceData(advanceInfo);
            console.log('✅ Advance data from house object:', advanceInfo);
            console.log('💰 Allowance values:', {
              allowance: advanceInfo.allowance,
              remaining: advanceInfo.remaining,
              display: `$${advanceInfo.remaining?.toFixed(0) || '0'} available of $${advanceInfo.allowance?.toFixed(0) || '0'}`
            });
            
            // Also check for HSI data in house object
            if (house.hsi || house.statusIndex) {
              setHsiData(house.hsi || house.statusIndex);
              console.log('✅ HSI data from house object:', house.hsi || house.statusIndex);
            }
            
            return; // Exit early if we have the data
          }
          
          // FALLBACK: Try the separate advance-summary endpoint if data not in house object
          console.log('🔄 No advance data in house object, trying separate endpoint...');
          
          // Check if advance summary has been prefetched
          const isPrefetched = isScreenPrefetched('HouseAdvanceSummary');
          
          if (isPrefetched) {
            console.log('⚡ HouseAdvanceSummary already prefetched - loading from cache');
          } else {
            console.log('🔄 HouseAdvanceSummary not prefetched - fetching from API');
          }
          
          console.log('🏦 Fetching advance-summary data for house:', house.id);
          
          // Use cached function that integrates with prefetch system
          const data = await getHouseAdvanceSummaryData(house.id);
          
          console.log('📊 Advance-summary response:', data);
          
          // Extract advance data from response
          if (data?.advance) {
            const advanceInfo = {
              allowance: data.advance.totalAllowance || 0,
              remaining: data.advance.remainingAvailable || 0,
              outstandingAdvanced: data.advance.currentlyAdvanced || 0,
              utilizationPercentage: data.advance.utilizationPercentage || 0
            };
            setAdvanceData(advanceInfo);
            console.log('✅ Advance data parsed:', advanceInfo);
            console.log('💰 Allowance values:', {
              allowance: advanceInfo.allowance,
              remaining: advanceInfo.remaining,
              display: `$${advanceInfo.remaining?.toFixed(0) || '0'} available of $${advanceInfo.allowance?.toFixed(0) || '0'}`
            });
          } else {
            console.log('⚠️ No advance data in response');
            const fallbackData = {
              allowance: 0,
              remaining: 0,
              outstandingAdvanced: 0,
              utilizationPercentage: 0
            };
            setAdvanceData(fallbackData);
            console.log('🔄 Using fallback advance data:', fallbackData);
          }
          
          // Extract HSI data from response
          if (data?.hsi) {
            setHsiData(data.hsi);
            console.log('✅ HSI data from advance-summary:', data.hsi);
          } else {
            console.log('⚠️ No HSI data in advance-summary response, using fallback');
          }
        }
      } catch (error) {
        console.log('❌ Failed to fetch advance-summary data:', error.response?.status || error.message);
        console.log('🔄 Using fallback data (this is expected if endpoint doesn\'t exist)');
        
        // Set fallback data
        const fallbackData = {
          allowance: 0,
          remaining: 0,
          outstandingAdvanced: 0,
          utilizationPercentage: 0
        };
        setAdvanceData(fallbackData);
        console.log('🔄 Error fallback advance data:', fallbackData);
      }
    };

    fetchAdvanceSummaryData();
  }, [house?.id, house?.advanceSummary]);

  // Use HSI data from advance-summary if available, otherwise fall back to house data
  const score = hsiData?.score ?? house?.statusIndex?.score ?? house?.hsi ?? 0;
  const pct = score / 100;

  // Debug logging for render values
  console.log('🏠 HouseFinancialHealth render values:', {
    advanceData: advanceData,
    score: score,
    hsiData: hsiData,
    houseId: house?.id
  });

  if (advanceData) {
    console.log('💰 Displaying advance allowance:', {
      remaining: advanceData.remaining,
      allowance: advanceData.allowance,
      displayText: `$${advanceData.remaining?.toFixed(0) || '0'} available of $${advanceData.allowance?.toFixed(0) || '0'}`
    });
  } else {
    console.log('⚠️ No advance data to display');
  }

  // HSI Colors
  const colors = 
    score >= 80
      ? ['#0C98E2', '#3BBCF7'] // Blue gradient for high scores
      : score >= 60
      ? ['#45C486', '#78E0A7'] // Green gradient for good scores
      : score >= 40
      ? ['#F7AF3C', '#FAC864'] // Amber gradient for medium scores
      : ['#F76F40', '#FF9B71']; // Orange gradient for low scores

  const polar = (cx, cy, r, deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arc = (p) => {
    const start = polar(50, 50, 40, 180);
    const end = polar(50, 50, 40, 180 + 180 * p);
    const large = p > 0.5 ? 1 : 0;
    return `M ${start.x} ${start.y} A 40 40 0 ${large} 1 ${end.x} ${end.y}`;
  };

  return (
    <View style={styles.container}>
      {/* HSI Card - matches original design */}
      <View style={styles.wrapper}>
        <Text style={[
          styles.title,
          fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
        ]}>
          Financial Health
        </Text>
        
        <TouchableOpacity 
          style={styles.hsiCard}
          onPress={onInfoPress}
          activeOpacity={0.8}
        >
          <View style={styles.mainContent}>
            <View style={styles.topSection}>
              <View style={styles.gaugeWrapper}>
                <Text style={[
                  styles.hsiLabel,
                  fontsLoaded && { fontFamily: 'Poppins-Medium' }
                ]}>
                  HSI
                </Text>
                <Svg width={120} height={75} viewBox="0 0 100 60">
                  <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor={colors[0]} />
                      <Stop offset="100%" stopColor={colors[1]} />
                    </LinearGradient>
                  </Defs>
                  
                  <Path d={arc(1)} stroke="#E5E7EB" strokeWidth={12} fill="none" strokeLinecap="round" />
                  <Path
                    d={arc(pct)}
                    stroke="url(#grad)"
                    strokeWidth={12}
                    fill="none"
                    strokeLinecap="round"
                  />
                  
                  {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
                    <Circle 
                      key={i}
                      cx={polar(50, 50, 40, 180 + 180 * tick).x} 
                      cy={polar(50, 50, 40, 180 + 180 * tick).y} 
                      r="1.5" 
                      fill="#D1D5DB" 
                    />
                  ))}
                </Svg>
                
                <View style={styles.valueOverlay}>
                  <Text style={[
                    styles.scoreText,
                    fontsLoaded && { fontFamily: 'Poppins-Bold' }
                  ]}>
                    {score}
                  </Text>
                </View>
              </View>

              {/* Advance Allowance Info - compact on the right */}
                <View style={styles.allowanceInfo}>
                  <Text style={[
                    styles.allowanceLabel,
                    fontsLoaded && { fontFamily: 'Poppins-Medium' }
                  ]}>
                    Advance Allowance
                  </Text>
                  <Text style={[
                    styles.allowanceAmount,
                    fontsLoaded && { fontFamily: 'Poppins-Bold' }
                  ]}>
                  ${(advanceData?.remaining || 0).toFixed(0)} available
                  </Text>
                  <Text style={[
                    styles.allowanceTotal,
                    fontsLoaded && { fontFamily: 'Poppins-Medium' }
                  ]}>
                  of ${(advanceData?.allowance || 0).toFixed(0)}
                  </Text>
                  <View style={styles.allowanceBar}>
                    <View 
                      style={[
                        styles.allowanceProgress,
                        { 
                        width: `${Math.min(advanceData?.utilizationPercentage || 0, 100)}%`,
                        backgroundColor: (advanceData?.utilizationPercentage || 0) > 70 ? '#f59e0b' : colors[0]
                        }
                      ]}
                    />
                  </View>
                </View>
            </View>
          </View>
          
          <View style={styles.viewMoreFooter}>
            <Text style={[
              styles.viewMoreText,
              fontsLoaded && { fontFamily: 'Poppins-Medium' }
            ]}>
              What does this mean?
            </Text>
            <MaterialIcons name="chevron-right" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  // HSI Section - original design
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  hsiCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  mainContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  hsiLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  valueOverlay: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 5,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  allowanceInfo: {
    alignItems: 'flex-end',
    paddingLeft: 20,
  },
  allowanceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  allowanceAmount: {
    fontSize: 16,
    color: '#34d399',
    marginBottom: 2,
  },
  allowanceTotal: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  allowanceBar: {
    width: 60,
    height: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  allowanceProgress: {
    height: '100%',
    borderRadius: 2,
  },
  viewMoreFooter: {
    height: 48,
    backgroundColor: '#34d399',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  viewMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },


});

export default HouseFinancialHealth;