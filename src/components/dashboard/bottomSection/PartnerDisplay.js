import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42; // Slightly wider for better proportions
const CARD_HEIGHT = CARD_WIDTH * 0.75; // More rectangular, less square
const LOGO_SIZE = CARD_WIDTH * 0.22; // Proportional logo size

const PartnerDisplay = ({ partners = [], onPartnerPress, limit = 6, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#34d399" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (partners.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="store" size={48} color="#94a3b8" />
        <Text style={styles.emptyTitle}>Services Coming Soon</Text>
        <Text style={styles.emptyText}>We're working on bringing you amazing service providers.</Text>
        <Text style={styles.emptySubtext}>Check back soon for updates!</Text>
      </View>
    );
  }

  // Only take the first 'limit' partners
  const displayPartners = partners.slice(0, limit);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayPartners.map((partner, index) => (
          <View key={partner.id} style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => onPartnerPress(partner)}
              activeOpacity={0.95}
            >
              {/* Cover image container */}
              <View style={styles.coverContainer}>
                {partner.marketplace_cover ? (
                  <Image 
                    source={{ uri: partner.marketplace_cover }} 
                    style={styles.coverImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderCover}>
                    <MaterialIcons name="store" size={32} color="#94a3b8" />
                  </View>
                )}
                
                {/* Logo with enhanced styling */}
                <View style={styles.logoWrapper}>
                  <View style={styles.logoContainer}>
                    {partner.logo ? (
                      <Image 
                        source={{ uri: partner.logo }} 
                        style={styles.logo} 
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderLogo}>
                        <Text style={styles.placeholderText}>
                          {partner.name.substring(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Clean white bubble for name */}
            <View style={styles.nameBubble}>
              <Text 
                style={styles.partnerName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {partner.name}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 12,
  },
  cardContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    marginBottom: 8,
  },
  coverContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: LOGO_SIZE + 6,
    height: LOGO_SIZE + 6,
    borderRadius: (LOGO_SIZE + 6) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: LOGO_SIZE * 0.45,
    fontWeight: '700',
    fontFamily: 'System',
  },
  nameBubble: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    width: CARD_WIDTH,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  loadingContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  errorContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default PartnerDisplay;