import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop
} from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');

const HSIComponent = ({ house, onInfoPress }) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
  });

  const score = house?.statusIndex?.score ?? house?.hsi ?? 0;
  const pct = score / 100;

  // Colors based on score - using more fintech-friendly gradients
  const colors = 
    score >= 80
      ? ['#0C98E2', '#3BBCF7'] // Blue gradient for high scores
      : score >= 60
      ? ['#45C486', '#78E0A7'] // Green gradient for good scores
      : score >= 40
      ? ['#F7AF3C', '#FAC864'] // Amber gradient for medium scores
      : ['#F76F40', '#FF9B71']; // Orange gradient for low scores (less alarming than red)

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
    <View style={styles.wrapper}>
      <Text style={[
        styles.title,
        fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
      ]}>
        House Status Index
      </Text>
      
      <TouchableOpacity 
        style={styles.card}
        onPress={onInfoPress}
        activeOpacity={0.8}
      >
        <View style={styles.mainContent}>
          <View style={styles.gaugeWrapper}>
            <Svg width={150} height={90} viewBox="0 0 100 60">
              <Defs>
                <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={colors[0]} />
                  <Stop offset="100%" stopColor={colors[1]} />
                </SvgLinearGradient>
              </Defs>
              
              {/* Background track with more subtle color */}
              <Path d={arc(1)} stroke="#E5E7EB" strokeWidth={12} fill="none" strokeLinecap="round" />
              
              {/* Foreground track with gradient */}
              <Path
                d={arc(pct)}
                stroke="url(#grad)"
                strokeWidth={12}
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Add subtle tick markers */}
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
        </View>
        
        <View style={styles.viewMoreFooter}>
          <Text style={[
            styles.viewMoreText,
            fontsLoaded && { fontFamily: 'Poppins-Medium' }
          ]}>
            Learn about HSI
          </Text>
          <MaterialIcons name="chevron-right" size={24} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
  
      },
    }),
  },
  mainContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
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
  }
});

export default HSIComponent;