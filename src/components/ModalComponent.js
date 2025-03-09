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
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { height: screenHeight, width } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight;

const ModalComponent = ({ 
  visible, 
  onClose, 
  children, 
  title,
  hideCloseButton = false,
  fullScreen = false,
  backgroundColor = "#dff6f0",
  useBackArrow = true
}) => {
  // Ensure onClose is a function
  const handleClose = () => {
    console.log("Modal close button pressed");
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  // Ensure background color is applied consistently
  const bgColor = fullScreen ? backgroundColor : "white";
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <SafeAreaView style={[
        styles.modalContainer, 
        { backgroundColor: fullScreen ? backgroundColor : "rgba(0, 0, 0, 0.4)" }
      ]}>
        <View style={[
          styles.modalContent, 
          fullScreen && styles.fullScreenModal,
          { backgroundColor: bgColor }
        ]}>
          {title && (
            <View style={[
              styles.header,
              { backgroundColor: bgColor }
            ]}>
              {!hideCloseButton && useBackArrow && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
              )}
              <Text style={[
                styles.headerTitle,
                useBackArrow && styles.headerWithBackButton
              ]}>{title}</Text>
              <View style={styles.placeholder} />
            </View>
          )}
          
          {!hideCloseButton && !useBackArrow && (
            <TouchableOpacity
              style={[
                styles.closeButton,
                fullScreen && styles.fullScreenCloseButton
              ]}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialIcons name="close" size={24} color="#34d399" />
            </TouchableOpacity>
          )}

          {/* Modal Content */}
          <View style={[
            styles.childrenContainer,
            title && styles.childrenWithTitle,
            { backgroundColor: bgColor }
          ]}>
            {children}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 40,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
  },
  fullScreenModal: {
    height: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bfeee8',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'Quicksand-Bold',
    textAlign: 'center',
    flex: 1,
  },
  headerWithBackButton: {
    textAlign: 'center',
    marginLeft: -24, // Offsets the back button width to center the title properly
  },
  backButton: {
    padding: 8,
    zIndex: 10,
  },
  placeholder: {
    width: 40, // Same width as backButton for balanced spacing
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullScreenCloseButton: {
    top: 12,
    right: 12,
  },
  childrenContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  childrenWithTitle: {
    paddingTop: 10,
  }
});

export default ModalComponent;