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
const CARD_SIZE = width * 0.38; // Square cards
const LOGO_SIZE = CARD_SIZE * 0.25; // Small circular logo

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
            <TouchableOpacity
              key={partner.id}
              style={styles.card}
              onPress={() => onPartnerPress(partner)}
              activeOpacity={0.9}
            >
            {/* Cover image as background */}
            <View style={styles.coverContainer}>
              {partner.marketplace_cover ? (
                <Image 
                  source={{ uri: partner.marketplace_cover }} 
                  style={styles.coverImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderCover}>
                  <MaterialIcons name="image" size={40} color="#999" />
                </View>
              )}
              
              {/* Logo circle in bottom left with white border */}
              <View style={styles.logoOuterBorder}>
                <View style={styles.logoContainer}>
                  {partner.logo ? (
                    <Image 
                      source={{ uri: partner.logo }} 
                      style={styles.logo} 
                      resizeMode="cover" // Changed to cover for perfect fill
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
            
            {/* Name section - white sliver at bottom */}
            <View style={styles.nameContainer}>
              <Text 
                style={styles.partnerName}
                numberOfLines={1}
              >
                {partner.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE + 36, // Square plus the name section
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

  },
  coverContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#f5f5f5',
    position: 'relative', // For logo positioning
  },
  coverImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoOuterBorder: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: LOGO_SIZE + 4, // Slightly larger to create border
    height: LOGO_SIZE + 4,
    borderRadius: (LOGO_SIZE + 4) / 2,
    backgroundColor: 'white', // White border
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden', // Ensure logo stays within circle
    backgroundColor: 'white',
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
    fontSize: LOGO_SIZE * 0.5,
    fontWeight: '700',
  },
  nameContainer: {
    height: 36,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  loadingContainer: {
    height: CARD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: CARD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#34d399',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    height: CARD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptySubtext: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default PartnerDisplay;