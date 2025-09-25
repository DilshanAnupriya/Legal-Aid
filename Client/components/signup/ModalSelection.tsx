import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ModalSelectionProps } from '../../types/signup';

const ModalSelection: React.FC<ModalSelectionProps> = ({
  visible,
  title,
  options,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 300,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalOption: {
      padding: 16,
      borderRadius: 8,
      marginVertical: 4,
      backgroundColor: colors.light,
    },
    modalOptionText: {
      fontSize: 16,
      color: colors.primary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => onSelect(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ModalSelection;