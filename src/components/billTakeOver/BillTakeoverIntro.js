import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BillTakeoverIntro = ({ onSubmit }) => {
  const serviceProviders = [
    { name: 'AT&T', logo: require('../../../assets/merchant-logos/ATT.jpg'), color: '#0057b8' },
    { name: 'Spectrum', logo: require('../../../assets/merchant-logos/spectrum.webp'), color: '#0076ce' },
    { name: 'City of Austin', logo: require('../../../assets/merchant-logos/cityofaustin.jpg'), color: '#006b3c' },
    { name: 'Texas Gas', logo: require('../../../assets/merchant-logos/texasgasservice.jpeg'), color: '#ff6b00' },
  ];
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>
          Submit a recurring expense for Bill Takeover
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

]
.map((b, i) => (
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
      
      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={onSubmit} activeOpacity={0.8}>
        <Text style={styles.submitButtonText}>Submit an Expense</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dff6f0' },

  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 28,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-black' : 'Montserrat-Black',
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },

  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  providerItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',       // ← mask the Image into a circle
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  providerLogo: {
    width: '100%',            // ← fill entire circle
    height: '100%',
    borderRadius: 30,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center',
  },

  benefitItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center' },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: { flex: 1 },
  benefitTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  benefitDescription: { fontSize: 12, color: '#64748b', marginTop: 2 },

  submitButton: {
    backgroundColor: '#34d399',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    margin: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BillTakeoverIntro;
