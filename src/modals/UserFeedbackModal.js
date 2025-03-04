import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const UserFeedbackModal = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 500;
  const CATEGORIES = [
    { id: 'bug', icon: 'bug', label: 'Report Issue' },
    { id: 'suggestion', icon: 'lightbulb-on', label: 'Suggestion' },
    { id: 'praise', icon: 'star', label: 'Compliment' },
    { id: 'general', icon: 'message', label: 'General' },
  ];

  const handleSubmit = async () => {
    if (!feedback.trim() || feedback.length < 10) {
      Alert.alert('Help Us Understand', 'Please write at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      Alert.alert('Thank You!', 'Your feedback makes us better', [
        { text: 'OK', onPress: () => setFeedback('') }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Feedback</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.content}>
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              We're all ears! How can we improve your experience?
            </Text>

            {/* Category Pills */}
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    category === cat.id && styles.activeCategoryPill
                  ]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.6}
                >
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={16}
                    color={category === cat.id ? '#fff' : '#34d399'}
                  />
                  <Text style={[
                    styles.categoryText,
                    category === cat.id && styles.activeCategoryText
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="What's on your mind..."
                placeholderTextColor="#94a3b8"
                value={feedback}
                onChangeText={(text) => {
                  setFeedback(text);
                  setCharCount(text.length);
                }}
                maxLength={MAX_CHARS}
                editable={!isSubmitting}
              />
              <Text style={styles.charCount}>
                {charCount}/{MAX_CHARS}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Send Feedback
                </Text>
              )}
            </TouchableOpacity>

            {/* Peeking Image */}
            <Image
              source={require('../../assets/feedback-guy.png')}
              style={styles.peekingImage}
              resizeMode="contain"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  headerContainer: {
    backgroundColor: "#dff6f0",
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
  },
  closeButton: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 28,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeCategoryPill: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  categoryText: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  textInput: {
    height: 140,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    padding: 16,
    paddingTop: 0,
    fontSize: 12,
    color: '#94a3b8',
  },
  submitButton: {
    backgroundColor: '#34d399',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  peekingImage: {
    width: 120,
    height: 180,
    position: 'absolute',
    bottom: -30,
    right: -20,
    opacity: 0.9,
    transform: [{ rotate: '-8deg' }],
  },
});

export default UserFeedbackModal;