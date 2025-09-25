export type UserRole = 'user' | 'lawyer' | 'ngo';

export interface SignUpFormData {
  // Common fields
  email: string;
  password: string;
  confirmPassword: string;
  // User fields
  birthday: string;
  genderSpectrum: string;
  // Lawyer fields
  firstName: string;
  lastName: string;
  specialization: string;
  contactNumber: string;
  // NGO fields
  organizationName: string;
  description: string;
  category: string;
  contact: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface SignUpScreenProps {
  navigation?: any;
}

export interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  iconName: string;
  isSelected: boolean;
  onPress: (role: UserRole) => void;
}

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export interface FormInputProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

export interface DropdownInputProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
}

export interface ModalSelectionProps {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (option: string) => void;
  onClose: () => void;
}

export interface RoleFormProps {
  formData: SignUpFormData;
  errors: FormErrors;
  updateFormData: (field: string, value: string) => void;
  onGenderPress?: () => void;
  onCategoryPress?: () => void;
}

export interface RegistrationData {
  email: string;
  password: string;
  role: UserRole;
  [key: string]: any;
}

export const GENDER_OPTIONS = [
  'Male',
  'Female', 
  'Non-binary',
  'Prefer not to say',
  'Other'
];

export const NGO_CATEGORIES = [
  'Human Rights & Civil Liberties',
  'Women\'s Rights & Gender Justice',
  'Child Protection',
  'Labor & Employment Rights',
  'Refugee & Migrant Rights',
  'LGBTQ+ Rights'
];