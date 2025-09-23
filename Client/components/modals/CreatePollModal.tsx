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
import { useAuth } from '../../context/AuthContext';

interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pollData: any) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [numberOfOptions, setNumberOfOptions] = useState(2);
  const [options, setOptions] = useState(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Family Law');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showOptionCountModal, setShowOptionCountModal] = useState(false);

  // Legal categories from ForumScreen (excluding 'All' as it's not a specific category)
  const legalCategories = [
    { id: 2, name: 'Family Law', icon: '👨‍👩‍👧‍👦' },
    { id: 3, name: 'Property Law', icon: '🏠' },
    { id: 4, name: 'Employment Law', icon: '💼' },
    { id: 5, name: 'Civil Law', icon: '⚖️' },
    { id: 6, name: 'Criminal Law', icon: '🚔' },
  ];

  const optionCounts = [2, 3, 4, 5, 6];

  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      setTopic('');
      setNumberOfOptions(2);
      setOptions(['', '']);
      setSelectedCategory('Family Law');
      setIsAnonymous(false);
    }
  }, [visible]);

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

  const handleSubmit = () => {
    // Basic validation
    if (!topic.trim()) {
      Alert.alert('Validation Error', 'Please enter a poll topic');
      return;
    }
    if (topic.trim().length < 10) {
      Alert.alert('Validation Error', 'Poll topic must be at least 10 characters long');
      return;
    }

    // Validate options
    const filledOptions = options.filter(option => option.trim().length > 0);
    if (filledOptions.length < 2) {
      Alert.alert('Validation Error', 'Please provide at least 2 poll options');
      return;
    }

    for (let i = 0; i < options.length; i++) {
      if (options[i].trim().length > 0 && options[i].trim().length < 2) {
        Alert.alert('Validation Error', `Option ${i + 1} must be at least 2 characters long`);
        return;
      }
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

    const pollData = {
      topic: topic.trim(),
      options: filledOptions,
      isAnonymous,
      author: getUserDisplayName(),
      category: selectedCategory,
      votes: new Array(filledOptions.length).fill(0),
      voters: [], // Array to track who voted to prevent duplicate voting
      totalVotes: 0,
    };
    
    onSubmit(pollData);
    
    // Reset form
    setTopic('');
    setNumberOfOptions(2);
    setOptions(['', '']);
    setIsAnonymous(false);
    setSelectedCategory('Family Law');
    
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
          <Text style={styles.headerTitle}>Create New Poll</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.postButton}>
            <Text style={styles.postButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Poll Topic */}
          <View style={styles.section}>
            <Text style={styles.label}>Poll Topic</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What question would you like to ask the community?"
              placeholderTextColor="#999999"
              value={topic}
              onChangeText={setTopic}
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          {/* Number of Options */}
          <View style={styles.section}>
            <Text style={styles.label}>Number of Options</Text>
            <TouchableOpacity
              style={styles.optionCountDropdown}
              onPress={() => setShowOptionCountModal(true)}>
              <Text style={styles.optionCountText}>{numberOfOptions} options</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Options */}
          <View style={styles.section}>
            <Text style={styles.label}>Poll Options</Text>
            {options.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                <Text style={styles.optionLabel}>Option {index + 1}</Text>
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Enter option ${index + 1}`}
                  placeholderTextColor="#999999"
                  value={option}
                  onChangeText={(value) => handleOptionChange(index, value)}
                />
              </View>
            ))}
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
              Create meaningful polls that encourage community discussion. Keep options clear and concise.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Poll</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Option Count Selection Modal */}
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
            <Text style={styles.optionCountModalTitle}>Select Number of Options</Text>
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
                ]}>{count} options</Text>
                {numberOfOptions === count && (
                  <Text style={styles.optionCountSelectedIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
    backgroundColor: '#ff7100',
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
