import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors"; // Atualize o caminho conforme necessário

interface ComboBoxItem {
  id: number;
  label: string;
  comparativeId: number;
}

interface ComboBoxProps {
  label: string;
  data: ComboBoxItem[];
  onSelect: (value: ComboBoxItem) => void;
  placeholder: string;
  value: string;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  data,
  onSelect,
  placeholder,
  value,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(value);

  const handleSelectItem = (item: ComboBoxItem) => {
    setSelectedValue(item.label);
    onSelect(item);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.inputText}>{selectedValue || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.gray_1} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <FlatList
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectItem(item)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    color: colors.white,
    marginBottom: 5,
    fontSize: 14,
    width: 320,
    borderColor: colors.white,
  },
  input: {
    backgroundColor: colors.gray_2,
    padding: 10,
    borderRadius: 5,
    borderColor: colors.white,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    color: colors.white,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: colors.gray_2,
    width: 300,
    borderRadius: 10,
    padding: 20,
    borderColor: colors.white,
    borderWidth: 2,
  },
  modalItem: {
    paddingVertical: 15,
  },
  modalItemText: {
    color: colors.white,
    fontSize: 14,
  },
});

export default ComboBox;
