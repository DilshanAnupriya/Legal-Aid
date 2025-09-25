import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { RoleCardProps } from '../../types/signup';

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  title, 
  description, 
  iconName, 
  isSelected, 
  onPress 
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    roleCard: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 20,
      marginVertical: 8,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 2,
      borderColor: isSelected ? colors.accent : 'transparent',
    },
    roleCardSelected: {
      backgroundColor: colors.accent + '10',
    },
    roleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    roleIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    roleTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    roleDescription: {
      fontSize: 14,
      color: colors.secondary,
      marginLeft: 52,
      lineHeight: 20,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.roleCard, isSelected && styles.roleCardSelected]}
      onPress={() => onPress(role)}
      activeOpacity={0.8}
    >
      <View style={styles.roleHeader}>
        <View style={styles.roleIcon}>
          <Ionicons name={iconName as any} size={20} color={colors.white} />
        </View>
        <Text style={styles.roleTitle}>{title}</Text>
      </View>
      <Text style={styles.roleDescription}>{description}</Text>
    </TouchableOpacity>
  );
};

export default RoleCard;