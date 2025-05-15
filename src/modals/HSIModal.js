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
        <Text style={styles.headerTitle}>House Status Index (HSI)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="trending-up" size={56} color="#14B8A6" />
        </View>
        
        <View style={styles.divider} />

        <Text style={styles.paragraph}>
          The HSI reflects your household's financial responsibility. It determines how much HouseTabz is willing to front on behalf of your house and influences the service fees your house pays to balance risk.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="schedule" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>On-Time Payments Impact</Text>
            <Text style={styles.infoText}>
              When everyone pays on time, your HSI goes up. Late payments cause it to go down.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="credit-card" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Better Fronting Terms</Text>
            <Text style={styles.infoText}>
              A higher HSI means HouseTabz can offer larger fronting amounts with lower service fees.
            </Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons name="group" size={24} color="#14B8A6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Collective Responsibility</Text>
            <Text style={styles.infoText}>
              Every roommate's payment behavior affects the entire household's HSI score.
            </Text>
          </View>
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
});

export default HSIModal;