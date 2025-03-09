import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ProfileModal from '../modals/ProfileModal';

const { width, height } = Dimensions.get('window');

const TakeOverScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const handleOpenProfile = () => setIsProfileModalVisible(true);
  const handleStartTakeover = () => navigation.navigate('BillTakeover');

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Top Section */}
        <View style={styles.topContainer}>
          <LinearGradient 
            colors={['#059669', '#34d399']}
            style={styles.gradientContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.topContent}>
              <View style={styles.textContainer}>
                <Text style={styles.titleLine}>Bill</Text>
                <Text style={styles.titleLine}>Take Over</Text>
              </View>
              
              <View style={styles.imageContainer}>
                {/* Light Beam Effect */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'transparent']}
                  style={styles.lightBeam}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                />
                <Image 
                  source={require('../../assets/chess-piece.png')}
                  style={styles.knightImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </LinearGradient>
          <View style={styles.bottomBorder} />
        </View>

        {/* Content Section */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            Take your card off file for shared expenses.
          </Text>
          <Text style={styles.subIntroText}>
            Submit your shared bill info. Each roommate claims their portion. HouseTabz becomes the new payment method for the expense. No more fronting, no more chasing reimbursements.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed CTA Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartTakeover}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#34d399', '#10b981']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.startButtonText}>Start Bill Takeover</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      <ProfileModal 
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for fixed CTA button
  },
  topContainer: {
    height: height / 3.5,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  topContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    zIndex: 1,
  },
  titleLine: {
    fontSize: 30,
    fontWeight: '900',
    color: 'white',
    lineHeight: 42,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.5,
  },
  imageContainer: {
    width: width * 0.4,
    height: width * 0.4,
    position: 'relative',
    marginRight: -20,
  },
  knightImage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  lightBeam: {
    position: 'absolute',
    width: '160%',
    height: '160%',
    left: '-30%',
    top: '-30%',
    transform: [{ rotate: '-25deg' }],
    opacity: 0.7,
    zIndex: 1,
    borderRadius: 100,
  },
  introContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
  },
  introText: {
    fontSize: 30,
    color: 'black',
    textAlign: 'left',
    lineHeight: 50,
    fontWeight: '800',
    fontFamily: 'Quicksand-Bold',
    marginRight: 25,
  },
  subIntroText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'left',
    lineHeight: 24,
    marginTop: 16,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  startButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default TakeOverScreen;