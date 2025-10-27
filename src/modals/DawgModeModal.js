import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated,
  Easing,
  Platform,
  Dimensions,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Pulsing text component
const PulsingText = ({ text, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    ]);
    
    Animated.loop(pulse).start();
  }, []);
  
  return (
    <Animated.Text 
      style={[
        style, 
        { 
          transform: [{ scale: scaleAnim }],
          textShadowColor: 'rgba(0, 0, 0, 0.4)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4
        }
      ]}
    >
      {text}
    </Animated.Text>
  );
};

// Static particles
const FloatingParticles = () => {
  // Create static particles positioned throughout the screen
  const particles = Array(20).fill(0).map((_, i) => ({
    id: i,
    size: 3 + (i % 5),
    left: `${(i * 13) % 100}%`,
    top: `${(i * 7) % 100}%`,
  }));
  
  return (
    <View style={styles.particlesContainer}>
      {particles.map((particle) => (
        <View
          key={particle.id}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: particle.size,
            left: particle.left,
            top: particle.top,
          }}
        />
      ))}
    </View>
  );
};

// Animated dog icon
const AnimatedDogIcon = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Subtle wiggle effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg']
  });
  
  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotate: rotation }
          ]
        }}
      >
        <MaterialIcons name="pets" size={100} color="#ffffff" style={styles.dogIcon} />
      </Animated.View>
    </View>
  );
};

// Main Component - NOT a modal itself, just the content
const DawgModeModal = ({ house, onClose }) => {
  const isActive = (house?.statusIndex?.score || house?.hsi || 0) >= 42;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.wrapper}>
      <LinearGradient
        colors={['#ff8c42', '#ff7a3d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1.1 }} // Extend gradient beyond bottom edge
        style={styles.container}
      >
        {/* Close/Back Button */}
        {onClose && (
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
        )}
        
        <FloatingParticles />
        
        <View style={styles.contentContainer}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
              width: '100%'
            }}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.congratsText}>Congrats! Your house has</Text>
              <View style={styles.dawgModeContainer}>
                <MaterialIcons name="pets" size={24} color="#ffffff" style={styles.titleIcon} />
                <PulsingText text="DAWG MODE" style={styles.title} />
              </View>
            </View>
            
            <AnimatedDogIcon />
            
            <View style={styles.divider} />
            
            <View style={styles.infoContainer}>
              <Text style={styles.body}>
                With <Text style={styles.highlight}>Dawg Mode</Text> active, your entire house enjoys a{' '}
                <Text style={styles.highlight}>waived service fee</Text>{' '}
                as long as your HSI remains at or above 42.
              </Text>
            </View>
            
            <View style={styles.tipContainer}>
              <MaterialIcons name="lightbulb" size={20} color="#ffcd1f" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>Pro tip:</Text> Encourage your roommates to pay bills on time to keep your HSI high and maintain your Dawg Mode benefits!
              </Text>
            </View>
            
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                Thank you for being a Dawg!
              </Text>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    width: '100%', 
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 30, // Add extra padding to extend gradient
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 60, // Increase bottom padding
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dawgModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  congratsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  iconContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dogIcon: {
    opacity: 0.9,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 20,
  },
  infoContainer: {
    marginBottom: 16,
    width: '100%',
  },
  body: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  highlight: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#ffcd1f',
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  tipBold: {
    color: '#ffcd1f',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  messageContainer: {
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  messageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
});

export default DawgModeModal;