import React from 'react';
import FormInput from './FormInput';
import DropdownInput from './DropdownInput';
import { RoleFormProps } from '../../types/signup';

const UserForm: React.FC<RoleFormProps> = ({
  formData,
  errors,
  updateFormData,
  onGenderPress,
}) => {
  return (
    <>
      <FormInput
        label="Birthday *"
        value={formData.birthday}
        placeholder="MM/DD/YYYY or DD/MM/YYYY"
        error={errors.birthday}
        onChangeText={(value) => updateFormData('birthday', value)}
        keyboardType="numeric"
      />
      
      <DropdownInput
        label="Gender *"
        value={formData.genderSpectrum}
        placeholder="Select your gender"
        error={errors.genderSpectrum}
        onPress={onGenderPress || (() => {})}
      />
    </>
  );
};

export default UserForm;