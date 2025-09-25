import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { 
  SignUpScreenProps, 
  SignUpFormData, 
  FormErrors, 
  UserRole,
  GENDER_OPTIONS,
  NGO_CATEGORIES 
} from '../../../types/signup';
import { validateSignUpForm } from '../../../utils/signupValidation';
import RoleSelection from '../../signup/RoleSelection';
import RegistrationForm from '../../signup/RegistrationForm';
import ModalSelection from '../../signup/ModalSelection';

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState<SignUpFormData>({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    // User fields
    birthday: '',
    genderSpectrum: '',
    // Lawyer fields
    firstName: '',
    lastName: '',
    specialization: '',
    contactNumber: '',
    // NGO fields
    organizationName: '',
    description: '',
    category: '',
    contact: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { register } = useAuth();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.light,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 50,
    },
  });

  const handleSignUp = async () => {
    const { errors: validationErrors, isValid } = validateSignUpForm(formData, selectedRole);
    setErrors(validationErrors);
    
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      const { email, password } = formData;
      let registrationData: any = {
        email,
        password,
        role: selectedRole!,
      };

      // Add role-specific data
      if (selectedRole === 'user') {
        registrationData = {
          ...registrationData,
          birthday: formData.birthday,
          genderSpectrum: formData.genderSpectrum,
        };
      } else if (selectedRole === 'lawyer') {
        registrationData = {
          ...registrationData,
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialization: formData.specialization,
          contactNumber: formData.contactNumber,
        };
      } else if (selectedRole === 'ngo') {
        registrationData = {
          ...registrationData,
          organizationName: formData.organizationName,
          description: formData.description,
          category: formData.category,
          contact: formData.contact,
        };
      }

      await register(registrationData);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLoginPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Login');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Clear role error if it exists
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleContinue = () => {
    if (selectedRole) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleGenderSelect = (gender: string) => {
    updateFormData('genderSpectrum', gender);
    setShowGenderModal(false);
  };

  const handleCategorySelect = (category: string) => {
    updateFormData('category', category);
    setShowCategoryModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 ? (
          <RoleSelection
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            onContinue={handleContinue}
            error={errors.role}
          />
        ) : (
          <RegistrationForm
            selectedRole={selectedRole}
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            updateFormData={updateFormData}
            onBack={handleBack}
            onSubmit={handleSignUp}
            onLoginPress={handleLoginPress}
            onGenderPress={() => setShowGenderModal(true)}
            onCategoryPress={() => setShowCategoryModal(true)}
          />
        )}
      </ScrollView>

      {/* Gender Selection Modal */}
      <ModalSelection
        visible={showGenderModal}
        title="Select Gender"
        options={GENDER_OPTIONS}
        onSelect={handleGenderSelect}
        onClose={() => setShowGenderModal(false)}
      />

      {/* NGO Category Selection Modal */}
      <ModalSelection
        visible={showCategoryModal}
        title="Select Category"
        options={NGO_CATEGORIES}
        onSelect={handleCategorySelect}
        onClose={() => setShowCategoryModal(false)}
      />
    </View>
  );
};

export default SignUpScreen;