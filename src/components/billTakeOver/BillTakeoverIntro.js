import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const BUTTON_HEIGHT = 90;

const BillTakeoverIntro = ({ onSubmit }) => {
  const serviceProviders = [
    { name: 'AT&T', logo: require('../../../assets/merchant-logos/ATT.jpg'), color: '#0057b8' },
    { name: 'Spectrum', logo: require('../../../assets/merchant-logos/spectrum.webp'), color: '#0076ce' },
    { name: 'City of Austin', logo: require('../../../assets/merchant-logos/cityofaustin.jpg'), color: '#006b3c' },
    { name: 'Texas Gas', logo: require('../../../assets/merchant-logos/texasgasservice.jpeg'), color: '#ff6b00' },
  ];
  
  return (
    <View style={styles.rootContainer}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>
              Link a recurring expense to HouseTabz
            </Text>
            <Text style={styles.headerSubtitle}>
              Enter details about your expense to request roommates to claim ownership and spread financial responsibility.
            </Text>
          </View>
          
          {/* Providers */}
          <Text style={styles.sectionHeader}>Frequently used for</Text>
          <View style={styles.providersGrid}>
            {serviceProviders.map(p => (
              <View key={p.name} style={styles.providerItem}>
                <View style={[styles.providerCircle, { backgroundColor: p.color }]}>
                  <Image source={p.logo} style={styles.providerLogo} resizeMode="cover" />
                </View>
                <Text style={styles.providerName}>{p.name}</Text>
              </View>
            ))}
          </View>
          
          {/* Benefits */}
          <Text style={styles.sectionHeader}>Benefits</Text>
          {[
            {
              icon: 'group',
              title: 'Shared Financial Responsibility',
              desc: 'Each roommate claims ownership and accepts financial responsibility for their portion of the bill.'
            },
            {
              icon: 'content-copy',
              title: 'Mirrored Bills',
              desc: 'HouseTabz creates mirrored versions of the bill that each roommate has equal ownership over.'
            },
            {
              icon: 'credit-score',
              title: 'HouseTabz Handles Payment',
              desc: 'HouseTabz sends payments to the service provider.'
            },
          ].map((b, i) => (
            <View key={i} style={styles.benefitItem}>
              <View style={styles.benefitRow}>
                <View style={styles.benefitIconContainer}>
                  <MaterialIcons name={b.icon} size={24} color="#34d399" />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitDescription}>{b.desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Button at bottom */}
      <View style={styles.buttonFooter}>
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>Submit an Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: { 
    flex: 1,
    backgroundColor: '#dff6f0',
    position: 'relative',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 0, paddingBottom: 0 },
  container: { 
    flex: 1,
    backgroundColor: '#dff6f0',
    overflow: 'hidden',
  },
  
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  providerItem: {
    alignItems: 'center',
    width: '22%',
  },
  providerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  providerLogo: {
    width: '100%',
    height: '100%',
  },
  providerName: {
    fontSize: 12,
    color: '#1e293b',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  benefitItem: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },

  submitButton: {
    backgroundColor: '#34d399',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonFooter: {
    backgroundColor: '#dff6f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BillTakeoverIntro;
