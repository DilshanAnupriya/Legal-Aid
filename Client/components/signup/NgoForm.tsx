import React from 'react';
import FormInput from './FormInput';
import DropdownInput from './DropdownInput';
import { RoleFormProps } from '../../types/signup';

const NgoForm: React.FC<RoleFormProps> = ({
  formData,
  errors,
  updateFormData,
  onCategoryPress,
}) => {
  return (
    <>
      <FormInput
        label="Organization Name *"
        value={formData.organizationName}
        placeholder="Enter organization name"
        error={errors.organizationName}
        onChangeText={(value) => updateFormData('organizationName', value)}
      />
      
      <FormInput
        label="Description *"
        value={formData.description}
        placeholder="Describe your organization's mission"
        error={errors.description}
        onChangeText={(value) => updateFormData('description', value)}
        multiline
      />
      
      <DropdownInput
        label="Category *"
        value={formData.category}
        placeholder="Select organization category"
        error={errors.category}
        onPress={onCategoryPress || (() => {})}
      />
      
      <FormInput
        label="Contact Information *"
        value={formData.contact}
        placeholder="Phone number or email"
        error={errors.contact}
        onChangeText={(value) => updateFormData('contact', value)}
      />
    </>
  );
};

export default NgoForm;