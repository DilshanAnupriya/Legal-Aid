import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SignUpFormData, FormErrors, UserRole } from '../../types/signup';
import StepIndicator from './StepIndicator';
import CommonForm from './CommonForm';
import UserForm from './UserForm';
import LawyerForm from './LawyerForm';
import NgoForm from './NgoForm';

interface RegistrationFormProps {
  selectedRole: UserRole | null;
  formData: SignUpFormData;
  errors: FormErrors;
  isLoading: boolean;
  updateFormData: (field: string, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  onLoginPress: () => void;
  onGenderPress: () => void;
  onCategoryPress: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedRole,
  formData,
  errors,
  isLoading,
  updateFormData,
  onBack,
  onSubmit,
  onLoginPress,
  onGenderPress,
  onCategoryPress,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    formContainer: {
      width: '100%',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 20,
      ...(Platform.OS === 'web' ? {
        maxWidth: 600, // Limit width on web for better UX
        alignSelf: 'center',
      } : {}),
    } as any,
    header: {
      marginBottom: 32,
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      alignSelf: 'flex-start',
    },
    backButtonText: {
      fontSize: 16,
      color: colors.accent,
      marginLeft: 8,
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
    loginLink: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 20, // Add bottom margin for better scrolling
    },
    loginLinkText: {
      fontSize: 16,
      color: colors.secondary,
    },
    loginLinkButton: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.accent,
      marginLeft: 4,
    },
  });

  const getRoleTitle = () => {
    switch (selectedRole) {
      case 'user':
        return 'User';
      case 'lawyer':
        return 'Lawyer';
      case 'ngo':
        return 'NGO';
      default:
        return '';
    }
  };

  const renderRoleSpecificForm = () => {
    switch (selectedRole) {
      case 'user':
        return (
          <UserForm
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onGenderPress={onGenderPress}
          />
        );
      case 'lawyer':
        return (
          <LawyerForm
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        );
      case 'ngo':
        return (
          <NgoForm
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onCategoryPress={onCategoryPress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.accent} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{getRoleTitle()} Registration</Text>
        <Text style={styles.subtitle}>Complete your profile information</Text>
        <StepIndicator currentStep={2} totalSteps={2} />
      </View>

      <CommonForm
        formData={formData}
        errors={errors}
        updateFormData={updateFormData}
      />

      {renderRoleSpecificForm()}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          isLoading && styles.primaryButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Create Account"
        accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginLink}>
        <Text style={styles.loginLinkText}>Already have an account?</Text>
        <TouchableOpacity onPress={onLoginPress}>
          <Text style={styles.loginLinkButton}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegistrationForm;