import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        {/* Enhanced Top Section - Remodeled */}
        <View style={styles.topContainer}>
          <View style={styles.topContent}>
            <Image 
              source={require('../../assets/billtakeover.png')}
              style={styles.gloriousImage}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <Text style={[styles.titleText, styles.titleFirst]}>Bill</Text>
              <Text style={[styles.titleText, styles.titleSecond]}>Take</Text>
              <Text style={[styles.titleText, styles.titleThird]}>Over</Text>
            </View>
          </View>
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
    backgroundColor: '#34d399',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  gloriousImage: {
    width: width * 0.5,
    height: width * 0.5,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    lineHeight: 36,
  },
  titleFirst: {
    marginLeft: 0,
  },
  titleSecond: {
    marginLeft: 20,
  },
  titleThird: {
    marginLeft: 40,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1e293b',
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
