import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HSIModal = ({ onClose }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <MaterialIcons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Health</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="account-balance" size={56} color="#14B8A6" />
        </View>
        
        <View style={styles.divider} />

        <Text style={styles.paragraph}>
          House Status Index affects both Advance Allowance and service fees. Better payment history = higher score = more coverage and lower fees.
        </Text>

        {/* HSI Section */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="trending-up" size={20} color="#14B8A6" />
          <Text style={styles.sectionTitle}>House Status Index (HSI)</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="schedule" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Payment History</Text>
            <Text style={styles.infoText}>
              On-time payments raise HSI. Late payments lower it.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="percent" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Affects Service Fees</Text>
            <Text style={styles.infoText}>
              Higher HSI = lower service fees.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Affects Advance Allowance</Text>
            <Text style={styles.infoText}>
              Higher HSI = more coverage available.
            </Text>
          </View>
        </View>

        {/* Advance Allowance Section */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="account-balance-wallet" size={20} color="#14B8A6" />
          <Text style={styles.sectionTitle}>Advance Allowance</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="paid" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>We Cover Missed Payments</Text>
            <Text style={styles.infoText}>
              HouseTabz advances missed individual payments to keep services active.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="sync" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Higher HSI = More Coverage</Text>
            <Text style={styles.infoText}>
              Better payment history means higher allowance.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="refresh" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Repay When Ready</Text>
            <Text style={styles.infoText}>
              Pay back advances on your schedule.
            </Text>
          </View>
        </View>

        {/* Connection Callout */}
        <View style={styles.connectionCard}>
          <MaterialIcons name="link" size={24} color="#0891b2" style={styles.connectionIcon} />
          <Text style={styles.connectionTitle}>The Connection</Text>
          <Text style={styles.connectionText}>
            Higher HSI = more coverage + lower fees. Keep paying on time to improve your house's financial health.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#34d399',
    backgroundColor: '#dff6f0',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    height: 96,
    width: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(52, 211, 153, 0.4)',
    width: '40%',
    marginVertical: 20,
    borderRadius: 2,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 28,
    marginHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  infoIconWrapper: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderRadius: 8,
    height: 42,
    width: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  connectionCard: {
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    width: '100%',
    borderWidth: 2,
    borderColor: '#0891b2',
    alignItems: 'center',
  },
  connectionIcon: {
    marginBottom: 8,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0891b2',
    marginBottom: 8,
    textAlign: 'center',
  },
  connectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#0f172a',
    textAlign: 'center',
  },
});

export default HSIModal;