import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { height: screenHeight } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight * 0.94;

const ModalComponent = ({ visible, onClose, children }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Modal Content */}
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)", // Semi-transparent black background
  },
  modalContent: {
    height: MODAL_HEIGHT,
    backgroundColor: "white", // Match `ViewCompanyCard` background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd", // Match `ViewCompanyCard` border style
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    padding: 5,
  },
});

export default ModalComponent;
