import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pollData: any) => void;
  editingPoll?: any;
  isEditMode?: boolean;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingPoll,
  isEditMode = false,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [numberOfOptions, setNumberOfOptions] = useState(2);
  const [options, setOptions] = useState(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Family Law');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showOptionCountModal, setShowOptionCountModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Legal categories with translations
  const getLegalCategories = () => [
    { id: 2, name: 'Family Law', translatedName: t('categories.familyLaw'), icon: '👨‍👩‍👧‍👦' },
    { id: 3, name: 'Property Law', translatedName: t('categories.propertyLaw'), icon: '🏠' },
    { id: 4, name: 'Employment Law', translatedName: t('categories.employmentLaw'), icon: '💼' },
    { id: 5, name: 'Civil Law', translatedName: t('categories.civilLaw'), icon: '⚖️' },
    { id: 6, name: 'Criminal Law', translatedName: t('categories.criminalLaw'), icon: '🚔' },
  ];
  
  const legalCategories = getLegalCategories();

  const optionCounts = [2, 3, 4, 5, 6];

  // Populate form when editing or reset when creating new
  useEffect(() => {
    console.log('CreatePollModal useEffect triggered:', {
      isEditMode,
      editingPoll,
      visible
    });
    
    if (isEditMode && editingPoll) {
      console.log('Setting form data from editing poll:', editingPoll);
      setTopic(editingPoll.topic || '');
      setSelectedCategory(editingPoll.category || 'Family Law');
      setIsAnonymous(editingPoll.isAnonymous || false);
      
      // For editing, we don't allow changing options since votes might exist
      if (editingPoll.options && editingPoll.options.length > 0) {
        setNumberOfOptions(editingPoll.options.length);
        setOptions([...editingPoll.options]);
      } else {
        setNumberOfOptions(2);
        setOptions(['', '']);
      }
    } else if (visible) {
      // Reset form when creating new poll
      console.log('Resetting form for new poll');
      setTopic('');
      setNumberOfOptions(2);
      setOptions(['', '']);
      setSelectedCategory('Family Law');
      setIsAnonymous(false);
    }
  }, [isEditMode, editingPoll, visible]);

  // Update options array when number of options changes
  useEffect(() => {
    const newOptions = Array(numberOfOptions).fill('').map((_, index) => 
      options[index] || ''
    );
    setOptions(newOptions);
  }, [numberOfOptions]);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!topic.trim()) {
        Alert.alert(t('common.error'), t('createPoll.validation.topicRequired', { defaultValue: 'Please enter a poll topic' }));
        setIsSubmitting(false);
        return;
      }
      if (topic.trim().length < 10) {
        Alert.alert(t('common.error'), t('createPoll.validation.topicTooShort', { defaultValue: 'Poll topic must be at least 10 characters long' }));
        setIsSubmitting(false);
        return;
      }

    // Get user name for author field
    const getUserDisplayName = () => {
      if (isAnonymous) {
        return t('createPoll.anonymousUser', { defaultValue: 'Anonymous User' });
      }
      
      if (user?.email) {
        // Extract name part from email (before @ symbol) and capitalize
        const emailName = user.email.split('@')[0];
        const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        console.log('Created poll author name:', displayName);
        return displayName;
      }
      
      return t('createPoll.defaultUser', { defaultValue: 'User' }); // Fallback if no user info
    };

    let pollData;
    
    if (isEditMode) {
      // For editing, only send updatable fields
      pollData = {
        topic: topic.trim(),
        category: selectedCategory,
        isAnonymous,
      };
    } else {
      // Validate options only for new polls
      const filledOptions = options.filter(option => option.trim().length > 0);
      if (filledOptions.length < 2) {
        Alert.alert(t('common.error'), t('createPoll.validation.optionsRequired', { defaultValue: 'Please provide at least 2 poll options' }));
        setIsSubmitting(false);
        return;
      }

      for (let i = 0; i < options.length; i++) {
        if (options[i].trim().length > 0 && options[i].trim().length < 2) {
          Alert.alert(t('common.error'), t('createPoll.validation.optionTooShort', { number: i + 1, defaultValue: `Option ${i + 1} must be at least 2 characters long` }));
          setIsSubmitting(false);
          return;
        }
      }

      // For creating new poll, send full data structure
      pollData = {
        topic: topic.trim(),
        options: filledOptions,
        isAnonymous,
        author: getUserDisplayName(),
        authorEmail: user?.email, // Add email for notifications
        category: selectedCategory,
        votes: new Array(filledOptions.length).fill(0),
        voters: [], // Array to track who voted to prevent duplicate voting
        totalVotes: 0,
      };
    }
    
      console.log('Submitting poll data:', pollData, 'Edit mode:', isEditMode);
      await onSubmit(pollData);
      
      // Reset form only if not in edit mode
      if (!isEditMode) {
        setTopic('');
        setNumberOfOptions(2);
        setOptions(['', '']);
        setIsAnonymous(false);
        setSelectedCategory('Family Law');
      }
      
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? t('createPoll.editPoll', { defaultValue: 'Edit Poll' }) : t('createPoll.title', { defaultValue: 'Create New Poll' })}
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
            disabled={isSubmitting}
          >
            <Text style={styles.postButtonText}>
              {isSubmitting 
                ? (isEditMode 
                  ? t('createPoll.updating', { defaultValue: 'Updating...' }) 
                  : t('createPoll.creating', { defaultValue: 'Creating...' })) 
                : (isEditMode 
                  ? t('common.update', { defaultValue: 'Update' }) 
                  : t('common.create', { defaultValue: 'Create' }))}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Poll Topic */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('createPoll.pollTopic', { defaultValue: 'Poll Topic' })}</Text>
            <TextInput
              style={styles.titleInput}
              placeholder={t('createPoll.topicPlaceholder', { defaultValue: 'What question would you like to ask the community?' })}
              placeholderTextColor="#999999"
              value={topic}
              onChangeText={setTopic}
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          {/* Number of Options */}
          {!isEditMode && (
            <View style={styles.section}>
              <Text style={styles.label}>{t('createPoll.numberOfOptions', { defaultValue: 'Number of Options' })}</Text>
              <TouchableOpacity
                style={styles.optionCountDropdown}
                onPress={() => setShowOptionCountModal(true)}>
                <Text style={styles.optionCountText}>
                  {t('createPoll.optionsCount', { count: numberOfOptions, defaultValue: `${numberOfOptions} options` })}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dynamic Options */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('createPoll.pollOptions', { defaultValue: 'Poll Options' })}</Text>
            {options.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                <Text style={styles.optionLabel}>{t('createPoll.option', { number: index + 1, defaultValue: `Option ${index + 1}` })}</Text>
                <TextInput
                  style={[styles.optionInput, isEditMode && styles.readOnlyInput]}
                  placeholder={t('createPoll.optionPlaceholder', { number: index + 1, defaultValue: `Enter option ${index + 1}` })}
                  placeholderTextColor="#999999"
                  value={option}
                  onChangeText={isEditMode ? undefined : (value) => handleOptionChange(index, value)}
                  editable={!isEditMode}
                />
              </View>
            ))}
          </View>

          {/* Legal Categories */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('createPoll.legalCategories', { defaultValue: 'Legal Categories' })}</Text>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setShowCategoryModal(true)}>
              <View style={styles.selectedCategoryContainer}>
                <Text style={styles.selectedCategoryIcon}>
                  {legalCategories.find(cat => cat.name === selectedCategory)?.icon}
                </Text>
                <Text style={styles.selectedCategoryText}>
                  {legalCategories.find(cat => cat.name === selectedCategory)?.translatedName || selectedCategory}
                </Text>
              </View>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Anonymous Option */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsAnonymous(!isAnonymous)}>
              <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>{t('createPoll.submitAnonymously', { defaultValue: 'Submit Anonymously' })}</Text>
            </TouchableOpacity>
          </View>

          {/* Guidelines */}
          <View style={styles.section}>
            <Text style={styles.guidelinesText}>
              {t('createPoll.guidelines', { defaultValue: 'Create meaningful polls that encourage community discussion. Keep options clear and concise.' })}
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting 
                ? (isEditMode 
                  ? t('createPoll.updatingPoll', { defaultValue: 'Updating Poll...' })
                  : t('createPoll.creatingPoll', { defaultValue: 'Creating Poll...' }))
                : (isEditMode 
                  ? t('createPoll.updatePoll', { defaultValue: 'Update Poll' }) 
                  : t('createPoll.createPoll', { defaultValue: 'Create Poll' }))}
            </Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Option Count Selection Modal - Only show if not in edit mode */}
      {!isEditMode && (
        <Modal
          visible={showOptionCountModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptionCountModal(false)}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowOptionCountModal(false)}>
            <View style={styles.optionCountModalContent}>
              <Text style={styles.optionCountModalTitle}>{t('createPoll.selectNumberOfOptions', { defaultValue: 'Select Number of Options' })}</Text>
              {optionCounts.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.optionCountOption,
                    numberOfOptions === count && styles.optionCountOptionSelected
                  ]}
                  onPress={() => {
                    setNumberOfOptions(count);
                    setShowOptionCountModal(false);
                  }}>
                  <Text style={[
                    styles.optionCountOptionText,
                    numberOfOptions === count && styles.optionCountOptionTextSelected
                  ]}>{t('createPoll.optionsCount', { count: count, defaultValue: `${count} options` })}</Text>
                  {numberOfOptions === count && (
                    <Text style={styles.optionCountSelectedIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowCategoryModal(false)}>
          <View style={styles.categoryModalContent}>
            <Text style={styles.categoryModalTitle}>{t('createPoll.selectCategory', { defaultValue: 'Select Legal Category' })}</Text>
            {legalCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  selectedCategory === category.name && styles.categoryOptionSelected
                ]}
                onPress={() => {
                  setSelectedCategory(category.name);
                  setShowCategoryModal(false);
                }}>
                <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryOptionText,
                  selectedCategory === category.name && styles.categoryOptionTextSelected
                ]}>{category.translatedName}</Text>
                {selectedCategory === category.name && (
                  <Text style={styles.categorySelectedIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  postButton: {
    backgroundColor: '#ff7100',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 20,
  },
  titleInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    maxHeight: 120,
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 5,
  },
  optionInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readOnlyInput: {
    backgroundColor: '#F8F9FA',
    color: '#7F8C8D',
  },
  optionCountDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10,
  },
  optionCountText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10,
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCategoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#ff7100',
    borderColor: '#ff7100',
  },
  checkmark: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  guidelinesText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#ff7100',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#ff7100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
    shadowColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal Overlay Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Option Count Modal Styles
  optionCountModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  optionCountModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionCountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionCountOptionSelected: {
    backgroundColor: '#ff7100',
    borderColor: '#ff7100',
  },
  optionCountOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  optionCountOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  optionCountSelectedIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // Category Modal Styles
  categoryModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryOptionSelected: {
    backgroundColor: '#ff7100',
    borderColor: '#ff7100',
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
  },
  categoryOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  categorySelectedIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default CreatePollModal;
