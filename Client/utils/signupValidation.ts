import { SignUpFormData, FormErrors, UserRole } from '../types/signup';

export const validateEmail = (email: string): string => {
  if (!email) {
    return 'Email is required';
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return 'Email is invalid';
  }
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return '';
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

export const validateRequired = (value: string, fieldName: string): string => {
  if (!value) {
    return `${fieldName} is required`;
  }
  return '';
};

export const validateUserFields = (formData: SignUpFormData): FormErrors => {
  const errors: FormErrors = {};
  
  const birthdayError = validateRequired(formData.birthday, 'Birthday');
  if (birthdayError) errors.birthday = birthdayError;
  
  const genderError = validateRequired(formData.genderSpectrum, 'Gender');
  if (genderError) errors.genderSpectrum = genderError;
  
  return errors;
};

export const validateLawyerFields = (formData: SignUpFormData): FormErrors => {
  const errors: FormErrors = {};
  
  const firstNameError = validateRequired(formData.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateRequired(formData.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const specializationError = validateRequired(formData.specialization, 'Specialization');
  if (specializationError) errors.specialization = specializationError;
  
  const contactError = validateRequired(formData.contactNumber, 'Contact number');
  if (contactError) errors.contactNumber = contactError;
  
  return errors;
};

export const validateNgoFields = (formData: SignUpFormData): FormErrors => {
  const errors: FormErrors = {};
  
  const organizationError = validateRequired(formData.organizationName, 'Organization name');
  if (organizationError) errors.organizationName = organizationError;
  
  const descriptionError = validateRequired(formData.description, 'Description');
  if (descriptionError) errors.description = descriptionError;
  
  const categoryError = validateRequired(formData.category, 'Category');
  if (categoryError) errors.category = categoryError;
  
  const contactError = validateRequired(formData.contact, 'Contact');
  if (contactError) errors.contact = contactError;
  
  return errors;
};

export const validateSignUpForm = (
  formData: SignUpFormData, 
  selectedRole: UserRole | null
): { errors: FormErrors; isValid: boolean } => {
  const errors: FormErrors = {};

  // Common validations
  if (!selectedRole) {
    errors.role = 'Please select your role';
    return { errors, isValid: false };
  }

  // Email validation
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  // Password validation
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  // Confirm password validation
  const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  // Role-specific validations
  if (selectedRole === 'user') {
    Object.assign(errors, validateUserFields(formData));
  } else if (selectedRole === 'lawyer') {
    Object.assign(errors, validateLawyerFields(formData));
  } else if (selectedRole === 'ngo') {
    Object.assign(errors, validateNgoFields(formData));
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};