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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
  editingPost?: any;
  isEditMode?: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingPost,
  isEditMode = false,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Family Law');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Validation error states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Legal categories from ForumScreen (excluding 'All' as it's not a specific category)
  const legalCategories = [
    { id: 2, name: 'Family Law', icon: '👨‍👩‍👧‍👦' },
    { id: 3, name: 'Property Law', icon: '🏠' },
    { id: 4, name: 'Employment Law', icon: '💼' },
    { id: 5, name: 'Civil Law', icon: '⚖️' },
    { id: 6, name: 'Criminal Law', icon: '🚔' },
  ];

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingPost) {
      setTitle(editingPost.title || '');
      setDescription(editingPost.description || '');
      setSelectedCategory(editingPost.category || 'Family Law');
      setIsAnonymous(editingPost.isAnonymous || false);
    } else {
      // Reset form when not editing
      setTitle('');
      setDescription('');
      setSelectedCategory('Family Law');
      setIsAnonymous(false);
    }
    // Clear validation errors when modal opens/closes
    setTitleError('');
    setDescriptionError('');
  }, [isEditMode, editingPost, visible]);

  // Clear errors when user starts typing
  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (titleError) setTitleError('');
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (descriptionError) setDescriptionError('');
  };



  const handleSubmit = () => {
    // Clear previous errors
    setTitleError('');
    setDescriptionError('');

    let hasErrors = false;

    // Basic validation
    if (!title.trim()) {
      setTitleError('Please enter a title');
      hasErrors = true;
    } else if (title.trim().length < 10) {
      setTitleError('Title must be at least 10 characters long');
      hasErrors = true;
    }

    if (!description.trim()) {
      setDescriptionError('Please enter a description');
      hasErrors = true;
    } else if (description.trim().length < 20) {
      setDescriptionError('Description must be at least 20 characters long');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Get user name for author field
    const getUserDisplayName = () => {
      if (isAnonymous) {
        return 'Anonymous User';
      }
      
      if (user?.email) {
        // Extract name part from email (before @ symbol) and capitalize
        const emailName = user.email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
      
      return 'User'; // Fallback if no user info
    };

    const postData = {
      title: title.trim(),
      description: description.trim(),

      isAnonymous,
      author: getUserDisplayName(),
      category: selectedCategory, // Use selected category
      priority: 'medium', // Default priority
    };
    
    onSubmit(postData);
    
    // Reset form only if not in edit mode
    if (!isEditMode) {
      setTitle('');
      setDescription('');

      setIsAnonymous(false);
      setSelectedCategory('Family Law');
    }
    onClose();
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
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Post' : 'Create New Post'}</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.postButton}>
            <Text style={styles.postButtonText}>{isEditMode ? 'Update' : 'Post'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Post Title</Text>
            <TextInput
              style={[styles.titleInput, titleError && styles.inputError]}
              placeholder="Share your thoughts!"
              placeholderTextColor="#999999"
              value={title}
              onChangeText={handleTitleChange}
              multiline={false}
            />
            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.descriptionInput, descriptionError && styles.inputError]}
              placeholder="Elaborate on your post here..."
              placeholderTextColor="#999999"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline={true}
              textAlignVertical="top"
            />
            {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
          </View>

          {/* Legal Categories */}
          <View style={styles.section}>
            <Text style={styles.label}>Legal Categories</Text>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setShowCategoryModal(true)}>
              <View style={styles.selectedCategoryContainer}>
                <Text style={styles.selectedCategoryIcon}>
                  {legalCategories.find(cat => cat.name === selectedCategory)?.icon}
                </Text>
                <Text style={styles.selectedCategoryText}>{selectedCategory}</Text>
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
              <Text style={styles.checkboxLabel}>Submit Anonymously</Text>
            </TouchableOpacity>
          </View>

          {/* Guidelines */}
          <View style={styles.section}>
            <Text style={styles.guidelinesText}>
              Remember to be respectful and follow our community guidelines. Offensive content will be removed.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{isEditMode ? 'Update Post' : 'Submit Post'}</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

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
            <Text style={styles.categoryModalTitle}>Select Legal Category</Text>
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
                ]}>{category.name}</Text>
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
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    minHeight: 50,
  },
  descriptionInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
    maxHeight: 200,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: '500',
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
    backgroundColor: '#667eea',
    borderColor: '#667eea',
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
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  // Category Dropdown Styles
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
  // Category Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    backgroundColor: '#667eea',
    borderColor: '#667eea',
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

export default CreatePostModal;
