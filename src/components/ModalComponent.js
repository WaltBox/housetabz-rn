import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Text,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from 'expo-font';

const { height: screenHeight } = Dimensions.get("window");

const ModalComponent = ({ 
  visible, 
  onClose, 
  children, 
  title,
  hideCloseButton = false,
  fullScreen = false,
  backgroundColor = "#f5f7fa",
  useBackArrow = true
}) => {
  // Load the Poppins font family
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={!fullScreen}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[
        styles.wrapper,
        fullScreen && styles.fullscreen,
        { backgroundColor: backgroundColor }
      ]}>
        <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />

        {title && (
          <View style={styles.header}>
            {!hideCloseButton && useBackArrow && (
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
              </TouchableOpacity>
            )}
            <Text style={[
              styles.title,
              fontsLoaded && { fontFamily: 'Poppins-SemiBold' }
            ]}>
              {title}
            </Text>
            <View style={{ width: 24 }} />
          </View>
        )}

        <View style={[styles.content, fullScreen && styles.fullscreenContent]}>
          {children}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  fullscreen: {
    justifyContent: "flex-start",
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    flex: 1,
    marginLeft: -24, // visually center title between back + placeholder
  },
  content: {
    flex: 1,
  },
  fullscreenContent: {
    paddingHorizontal: 0,
  }
});

export default ModalComponent;