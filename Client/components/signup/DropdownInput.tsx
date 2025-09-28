import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DropdownInputProps } from '../../types/signup';

const DropdownInput: React.FC<DropdownInputProps> = ({
  label,
  value,
  placeholder,
  error,
  onPress,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
      marginBottom: 8,
    },
    dropdownButton: {
      borderWidth: 1.5,
      borderColor: error ? colors.orange : colors.darkgray,
      borderRadius: 12,
      padding: 16,
      backgroundColor: colors.white,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownText: {
      fontSize: 16,
      color: colors.primary,
    },
    dropdownPlaceholder: {
      fontSize: 16,
      color: colors.darkgray,
    },
    errorText: {
      fontSize: 14,
      color: colors.orange,
      marginTop: 6,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
        <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.darkgray} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default DropdownInput;