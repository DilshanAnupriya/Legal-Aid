import React from 'react';
import FormInput from './FormInput';
import { RoleFormProps } from '../../types/signup';

const CommonForm: React.FC<RoleFormProps> = ({
  formData,
  errors,
  updateFormData,
}) => {
  return (
    <>
      <FormInput
        label="Email *"
        value={formData.email}
        placeholder="Enter your email"
        error={errors.email}
        onChangeText={(value) => updateFormData('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <FormInput
        label="Password *"
        value={formData.password}
        placeholder="Enter your password"
        error={errors.password}
        onChangeText={(value) => updateFormData('password', value)}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <FormInput
        label="Confirm Password *"
        value={formData.confirmPassword}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        onChangeText={(value) => updateFormData('confirmPassword', value)}
        secureTextEntry
        autoCapitalize="none"
      />
    </>
  );
};

export default CommonForm;