import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { formatRentAmount } from '../../services/rentProposalService';

const COLORS = {
  primary: '#34d399',
  primaryDark: '#10b981',
  background: '#dff6f0',
  cardBackground: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  whiteCardBorder: '#34d399',
};

const RentProposalCards = ({ 
  rentProposals = [], 
  onRentProposalPress, 
  processingRentProposals = new Set(), 
  recentlyCompletedRentProposals = new Set() 
}) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });
  
  // Filter rent proposals that need user action
  const pendingRentProposals = rentProposals.filter(proposal => {
    const needsAction = proposal.status === 'pending_approval' || proposal.status === 'draft';
    const isRecentlyCompleted = recentlyCompletedRentProposals.has(proposal.id);
    return needsAction && !isRecentlyCompleted;
  });
  
  console.log('✅ RentProposalCards - Filtered data:', {
    'Rent proposals count': pendingRentProposals.length,
    'Rent proposal IDs': pendingRentProposals.map(r => r.id)
  });
  
  // Check if we have any content to show
  const hasContent = pendingRentProposals && pendingRentProposals.length > 0;
  
  if (!hasContent) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <MaterialIcons name="home" size={20} color={COLORS.primary} />
          <Text style={[styles.headerText, { fontFamily: fontsLoaded ? 'Poppins-SemiBold' : 'System' }]}>
            Rent Proposals
          </Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {pendingRentProposals.slice(0, 3).map((proposal, index) => (
          <RentProposalCard
            key={proposal.id}
            proposal={proposal}
            isAlternate={index % 2 === 1}
            onPress={onRentProposalPress}
            fontsLoaded={fontsLoaded}
            isProcessing={processingRentProposals.has(proposal.id)}
          />
        ))}
      </View>
    </View>
  );
};

// Separate RentProposalCard component
const RentProposalCard = ({ proposal, isAlternate, onPress, fontsLoaded, isProcessing = false }) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isProcessing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isProcessing, pulseAnim]);

  const getProposalTitle = () => {
    switch (proposal.status) {
      case 'draft':
        return 'Draft Rent Proposal';
      case 'pending_approval':
        return 'Rent Proposal Approval';
      case 'approved':
        return 'Rent Allocation Approved';
      case 'declined':
        return 'Rent Proposal Declined';
      default:
        return 'Rent Proposal';
    }
  };

  const getProposalDescription = () => {
    const userAllocation = proposal.allocations?.find(allocation => allocation.userId === proposal.currentUserId);
    const userAmount = userAllocation?.amount || 0;
    const totalAmount = proposal.totalRentAmount || 0;

    switch (proposal.status) {
      case 'draft':
        return `Complete and submit your rent proposal for $${formatRentAmount(totalAmount)}/month`;
      case 'pending_approval':
        if (userAllocation?.approvalStatus === 'pending') {
          return `Approve your ${formatRentAmount(userAmount)}/month allocation`;
        } else {
          return `Waiting for other tenants to approve`;
        }
      case 'approved':
        return `Monthly rent: ${formatRentAmount(userAmount)} (your share)`;
      case 'declined':
        return `Proposal was declined - create a new one`;
      default:
        return 'View rent proposal details';
    }
  };

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'draft':
        return '#f59e0b';
      case 'pending_approval':
        return '#3b82f6';
      case 'approved':
        return '#10b981';
      case 'declined':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (proposal.status) {
      case 'draft':
        return 'edit';
      case 'pending_approval':
        return 'schedule';
      case 'approved':
        return 'check-circle';
      case 'declined':
        return 'cancel';
      default:
        return 'home';
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          isAlternate ? styles.alternateCard : styles.primaryCard,
          isProcessing && styles.processingCard
        ]}
        onPress={() => onPress && onPress(proposal)}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <MaterialIcons 
                name={getStatusIcon()} 
                size={16} 
                color={getStatusColor()} 
                style={styles.statusIcon}
              />
              <Text 
                style={[
                  styles.cardTitle, 
                  { fontFamily: fontsLoaded ? 'Poppins-SemiBold' : 'System' },
                  isAlternate && styles.alternateCardTitle
                ]}
                numberOfLines={1}
              >
                {getProposalTitle()}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={[styles.statusText, { fontFamily: fontsLoaded ? 'Poppins-Medium' : 'System' }]}>
                {proposal.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text 
            style={[
              styles.cardDescription, 
              { fontFamily: fontsLoaded ? 'Poppins-Regular' : 'System' },
              isAlternate && styles.alternateCardDescription
            ]}
            numberOfLines={2}
          >
            {getProposalDescription()}
          </Text>

          <View style={styles.cardFooter}>
            <Text 
              style={[
                styles.cardFooterText, 
                { fontFamily: fontsLoaded ? 'Poppins-Regular' : 'System' },
                isAlternate && styles.alternateCardFooterText
              ]}
            >
              Tap to {proposal.status === 'draft' ? 'continue' : 'view details'}
            </Text>
            <MaterialIcons 
              name="arrow-forward" 
              size={16} 
              color={isAlternate ? COLORS.primary : COLORS.textSecondary} 
            />
          </View>
        </View>

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <MaterialIcons name="hourglass-empty" size={20} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.whiteCardBorder,
  },
  alternateCard: {
    backgroundColor: COLORS.primary,
  },
  processingCard: {
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusIcon: {
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  alternateCardTitle: {
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  alternateCardDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  alternateCardFooterText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  processingOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
});

export default RentProposalCards;



