import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FormInputProps } from '../../types/signup';

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  placeholder,
  error,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
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
    textInput: {
      borderWidth: 1.5,
      borderColor: error ? colors.orange : colors.darkgray,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: colors.white,
      color: colors.primary,
    },
    textInputMultiline: {
      height: 100,
      textAlignVertical: 'top',
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
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.darkgray}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default FormInput;