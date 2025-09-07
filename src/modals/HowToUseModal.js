import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ModalComponent from '../components/ModalComponent';
import { useFonts } from 'expo-font';

const HowToUseModal = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showBillTakeoverNote, setShowBillTakeoverNote] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
      setActiveTab(0); // Reset to first tab when modal closes
    }
  }, [visible]);

  useEffect(() => {
    // Animate tab content changes with slide and fade
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, [activeTab]);

  const tabs = [
    { id: 0, title: 'How it Works', icon: 'settings' },
    { id: 1, title: 'House Status Index', icon: 'shield' },
    { id: 2, title: 'Getting Started', icon: 'rocket-launch' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <View style={styles.tabContent}>
            <View style={styles.processFlow}>
              <View style={styles.flowStep}>
                <View style={styles.flowNumber}>
                  <Text style={[styles.flowNumberText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>01</Text>
                </View>
                <View style={styles.flowContent}>
                  <MaterialIcons name="credit-card" size={20} color="#34d399" />
                  <Text style={[styles.flowTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                    Link Account
                  </Text>
                  <Text style={[styles.flowDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                    HouseTabz becomes your payment method for each service.
                  </Text>
                </View>
              </View>

              <View style={styles.flowStep}>
                <View style={styles.flowNumber}>
                  <Text style={[styles.flowNumberText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>02</Text>
                </View>
                <View style={styles.flowContent}>
                  <MaterialIcons name="content-copy" size={20} color="#3b82f6" />
                  <Text style={[styles.flowTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                    Mirror Service
                  </Text>
                  <Text style={[styles.flowDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                    Financial responsibility is spread through our mirrored agreements.
                  </Text>
                </View>
              </View>

              <View style={styles.flowStep}>
                <View style={styles.flowNumber}>
                  <Text style={[styles.flowNumberText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>03</Text>
                </View>
                <View style={styles.flowContent}>
                  <MaterialIcons name="people" size={20} color="#f59e0b" />
                  <Text style={[styles.flowTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                    Everyone Pays
                  </Text>
                  <Text style={[styles.flowDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                    Fund the service together through HouseTabz.
                  </Text>
                </View>
              </View>

              <View style={styles.flowStep}>
                <View style={styles.flowNumber}>
                  <Text style={[styles.flowNumberText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>04</Text>
                </View>
                <View style={styles.flowContent}>
                  <MaterialIcons name="check-circle" size={20} color="#10b981" />
                  <Text style={[styles.flowTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                    We Pay Provider
                  </Text>
                  <Text style={[styles.flowDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                    You're no longer responsible for payments.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.tabContent}>
            <View style={styles.hsiMainCard}>
              <View style={styles.hsiCardHeader}>
                <MaterialIcons name="shield" size={24} color="#34d399" />
                <Text style={[styles.hsiCardTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                  Advance Protection
                </Text>
              </View>
              <Text style={[styles.hsiCardSubtitle, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                We front missed payments so services stay active
              </Text>
            </View>

            <View style={styles.hsiMetrics}>
              <View style={styles.hsiMetricItem}>
                <View style={styles.hsiMetricIcon}>
                  <MaterialIcons name="trending-up" size={24} color="#10b981" />
                </View>
                <Text style={[styles.hsiMetricTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                  HSI Score
                </Text>
                <Text style={[styles.hsiMetricDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                  Based on payment history
                </Text>
              </View>

              <View style={styles.hsiMetricItem}>
                <View style={styles.hsiMetricIcon}>
                  <MaterialIcons name="account-balance-wallet" size={24} color="#3b82f6" />
                </View>
                <Text style={[styles.hsiMetricTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                  $100 Default
                </Text>
                <Text style={[styles.hsiMetricDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                  Starting allowance
                </Text>
              </View>
            </View>

            <View style={styles.hsiFactors}>
              <View style={styles.hsiFactorItem}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={[styles.hsiFactorText, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                  On-time payments increase allowance
                </Text>
              </View>
              <View style={styles.hsiFactorItem}>
                <MaterialIcons name="schedule" size={20} color="#f59e0b" />
                <Text style={[styles.hsiFactorText, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                  Early payments boost HSI score
                </Text>
              </View>
              <View style={styles.hsiFactorItem}>
                <MaterialIcons name="warning" size={20} color="#ef4444" />
                <Text style={[styles.hsiFactorText, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                  Missed payments decrease allowance
                </Text>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.tabContent}>
            <View style={styles.startingMethods}>
              <TouchableOpacity 
                style={styles.startingMethod}
                onPress={() => setShowBillTakeoverNote(!showBillTakeoverNote)}
                activeOpacity={0.7}
              >
                <View style={styles.methodRow}>
                  <View style={styles.methodIcon}>
                    <MaterialIcons name="swap-horiz" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.methodContent}>
                    <View style={styles.methodTitleRow}>
                      <Text style={[styles.methodTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                        Bill Takeover
                      </Text>
                      <View style={styles.infoIndicator}>
                        <MaterialIcons name="info-outline" size={16} color="#3b82f6" />
                      </View>
                    </View>
                    <Text style={[styles.methodDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                      Submit account details. We create a mirrored agreement and make payments on your behalf.
                    </Text>
                    <Text style={[styles.tapHint, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                      Tap for details
                    </Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <Text style={[styles.methodBadgeText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                      POPULAR
                    </Text>
                  </View>
                  <View style={styles.tapIndicator}>
                    <MaterialIcons 
                      name={showBillTakeoverNote ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={20} 
                      color="#34d399" 
                    />
                  </View>
                </View>
                
                {showBillTakeoverNote && (
                  <View style={styles.methodNote}>
                    <View style={styles.noteExpenseType}>
                      <View style={styles.expenseCard}>
                        <View style={styles.expenseIcon}>
                          <MaterialIcons name="autorenew" size={20} color="#ffffff" />
                        </View>
                        <View style={styles.expenseContent}>
                          <Text style={[styles.expenseTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                            Fixed Expenses
                          </Text>
                          <Text style={[styles.expenseDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                            Auto-created • Internet, utilities, subscriptions
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.expenseCard}>
                        <View style={[styles.expenseIcon, { backgroundColor: '#f59e0b' }]}>
                          <MaterialIcons name="edit" size={20} color="#ffffff" />
                        </View>
                        <View style={styles.expenseContent}>
                          <Text style={[styles.expenseTitle, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
                            Variable Expenses
                          </Text>
                          <Text style={[styles.expenseDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                            Manual entry • Account owner enters amount
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.startingMethod}>
                <View style={styles.methodRow}>
                  <View style={[styles.methodIcon, { backgroundColor: '#3b82f6' }]}>
                    <MaterialIcons name="storefront" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={[styles.methodTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                      Pay with HouseTabz
                    </Text>
                    <Text style={[styles.methodDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                      At partner sites, select HouseTabz during checkout. Automatic mirroring for shared ownership.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.startingMethod}>
                <View style={styles.methodRow}>
                  <View style={[styles.methodIcon, { backgroundColor: '#8b5cf6' }]}>
                    <MaterialIcons name="credit-card" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={[styles.methodTitle, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                      Virtual Cards
                    </Text>
                    <Text style={[styles.methodDesc, fontsLoaded && { fontFamily: 'Poppins-Regular' }]}>
                      HouseTabz virtual cards for shared expenses anywhere. Use for any service provider.
                    </Text>
                  </View>
                  <View style={[styles.methodBadge, { backgroundColor: '#8b5cf6' }]}>
                    <Text style={[styles.methodBadgeText, fontsLoaded && { fontFamily: 'Poppins-Bold' }]}>
                      SOON
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ModalComponent
      visible={visible}
      title="How to use HouseTabz"
      onClose={onClose}
      backgroundColor="#dff6f0"
      fullScreen={true}
      hideCloseButton={false}
      useBackArrow={true}
    >
      <View style={styles.container}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
                             <MaterialIcons 
                 name={tab.icon} 
                 size={22} 
                 color={activeTab === tab.id ? '#34d399' : '#9ca3af'} 
               />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
                fontsLoaded && { fontFamily: 'Poppins-Medium' }
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[{ 
            opacity: fadeAnim, 
            transform: [{ translateX: slideAnim }] 
          }]}>
            {renderTabContent()}
          </Animated.View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.getStartedButton} onPress={onClose}>
            <MaterialIcons name="check" size={20} color="#ffffff" />
            <Text style={[styles.getStartedButtonText, fontsLoaded && { fontFamily: 'Poppins-SemiBold' }]}>
              Got it!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff6f0',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 70,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 14,
  },
  activeTabText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  tabContent: {
    minHeight: 300,
  },
  // How it Works Styles
  processFlow: {
    gap: 16,
  },
  flowStep: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#34d399',
  },
  flowNumber: {
    backgroundColor: '#34d399',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flowNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  flowContent: {
    flex: 1,
  },
  flowTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 4,
  },
  flowDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  // HSI Styles
  hsiMainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  hsiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hsiCardTitle: {
    fontSize: 18,
    color: '#1f2937',
    marginLeft: 12,
  },
  hsiCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  hsiMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  hsiMetricItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  hsiMetricIcon: {
    marginBottom: 8,
  },
  hsiMetricTitle: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  hsiMetricDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  hsiFactors: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
    borderRadius: 12,
  },
  hsiFactorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hsiFactorText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
    marginLeft: 12,
  },
  // Method Card Styles
  startingMethods: {
    gap: 16,
  },
  startingMethod: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#34d399',
    padding: 16,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  methodIcon: {
    backgroundColor: '#34d399',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodBadge: {
    backgroundColor: '#34d399',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  methodBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  methodTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '700',
    marginBottom: 6,
  },
  methodDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIndicator: {
    marginLeft: 8,
  },
  tapHint: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  tapIndicator: {
    position: 'absolute',
    top: -5,
    right: 8,
  },
  methodNote: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#34d399',
    borderRadius: 12,
    padding: 16,
  },
  noteExpenseType: {
    gap: 12,
  },
  expenseCard: {
    borderWidth: 1,
    borderColor: '#34d399',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    backgroundColor: '#10b981',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseContent: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 13,
    color: '#1f2937',
    marginBottom: 2,
  },
  expenseDesc: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
  },
  bottomContainer: {
    padding: 24,
    paddingTop: 16,
  },
  getStartedButton: {
    backgroundColor: '#34d399',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HowToUseModal; 