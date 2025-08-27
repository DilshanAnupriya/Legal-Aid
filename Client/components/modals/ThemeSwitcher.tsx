import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ThemeSwitcherProps {
  style?: any;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  style, 
  showLabel = false, 
  size = 'medium' 
}) => {
  const { theme, colors, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;
  const containerPadding = size === 'small' ? 8 : size === 'large' ? 12 : 10;

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.container, { padding: containerPadding }, style]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
        size={iconSize}
        color={colors.primary}
      />
      {showLabel && (
        <Text style={[styles.label, { color: colors.primary }]}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  label: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeSwitcher;