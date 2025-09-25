import React from 'react';
import FormInput from './FormInput';
import { RoleFormProps } from '../../types/signup';

const LawyerForm: React.FC<RoleFormProps> = ({
  formData,
  errors,
  updateFormData,
}) => {
  return (
    <>
      <FormInput
        label="First Name *"
        value={formData.firstName}
        placeholder="Enter your first name"
        error={errors.firstName}
        onChangeText={(value) => updateFormData('firstName', value)}
      />
      
      <FormInput
        label="Last Name *"
        value={formData.lastName}
        placeholder="Enter your last name"
        error={errors.lastName}
        onChangeText={(value) => updateFormData('lastName', value)}
      />
      
      <FormInput
        label="Specialization *"
        value={formData.specialization}
        placeholder="e.g., Family Law, Criminal Law"
        error={errors.specialization}
        onChangeText={(value) => updateFormData('specialization', value)}
      />
      
      <FormInput
        label="Contact Number *"
        value={formData.contactNumber}
        placeholder="Enter your contact number"
        error={errors.contactNumber}
        onChangeText={(value) => updateFormData('contactNumber', value)}
        keyboardType="phone-pad"
      />
    </>
  );
};

export default LawyerForm;