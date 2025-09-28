import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types/signup';
import StepIndicator from './StepIndicator';
import RoleCard from './RoleCard';

interface RoleSelectionProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  onContinue: () => void;
  error?: string;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({
  selectedRole,
  onRoleSelect,
  onContinue,
  error,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    header: {
      marginBottom: 32,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginVertical: 12,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    primaryButtonDisabled: {
      backgroundColor: colors.darkgray,
      elevation: 0,
      shadowOpacity: 0,
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.white,
    },
    errorText: {
      fontSize: 14,
      color: colors.orange,
      marginTop: 6,
      marginLeft: 4,
      textAlign: 'center',
    },
  });

  const roleData = [
    {
      role: 'user' as UserRole,
      title: 'User',
      description: 'Get legal help and access resources for your legal needs',
      iconName: 'person',
    },
    {
      role: 'lawyer' as UserRole,
      title: 'Lawyer',
      description: 'Provide legal assistance to those in need and build your practice',
      iconName: 'school',
    },
    {
      role: 'ngo' as UserRole,
      title: 'NGO',
      description: 'Manage and coordinate community support programs',
      iconName: 'people',
    },
  ];

  return (
    <View style={{ 
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 20,
      ...(Platform.OS === 'web' ? {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
      } : {})
    }}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose how you want to use our platform</Text>
        <StepIndicator currentStep={1} totalSteps={2} />
      </View>

      {roleData.map((item) => (
        <RoleCard
          key={item.role}
          role={item.role}
          title={item.title}
          description={item.description}
          iconName={item.iconName}
          isSelected={selectedRole === item.role}
          onPress={onRoleSelect}
        />
      ))}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          !selectedRole && styles.primaryButtonDisabled,
        ]}
        onPress={onContinue}
        disabled={!selectedRole}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Next Step"
        accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoleSelection;